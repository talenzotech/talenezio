import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isTestCategory,
  paidProductDetails,
  proTestProductCode,
} from '@/lib/payments/products';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { env } from '@/lib/env';
import { hasProTestAccess, hasServiceAccess } from '@/lib/payments/access';
import { getService } from '@/lib/services/catalog';
import { sendCareerServiceRegistrationEmail } from '@/utils/email';
import {
  isValidPhoneNumber,
  isValidLinkedInUrl,
  isValidBookingDate,
} from '@/lib/career/validation';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });

    const body = await request.json().catch(() => null) as {
      category?: string;
      productCode?: string;
      applicantDetails?: {
        name?: string;
        fullName?: string;
        city?: string;
        collegeOrCompany?: string;
        age?: string | number;
        careerDetails?: string;
        areaOfInterest?: string;
        serviceName?: string;
        email?: string;
        phone?: string;
        contactNumber?: string;
        bookingDate?: string;
        selectedBookingDate?: string;
        scheduledFor?: string;
        linkedinUrl?: string;
      };
    } | null;

    const productCode = body?.category && isTestCategory(body.category)
      ? proTestProductCode(body.category)
      : body?.productCode;
    const product = productCode ? paidProductDetails(productCode) : null;
    if (!productCode || !product) {
      return NextResponse.json({ error: 'Invalid service or test product' }, { status: 400 });
    }

    // Handle Career Service validations and email dispatch
    const isCareerRegistration = Boolean(
      body?.applicantDetails &&
      (body.applicantDetails.careerDetails || body.applicantDetails.serviceName || productCode.startsWith('career:'))
    );

    let validatedPhone: string | undefined;
    let validatedLinkedInUrl: string | undefined;
    let validatedBookingDateIso: string | undefined;
    let rawBookingDate: string | undefined;

    if (isCareerRegistration && body?.applicantDetails) {
      const details = body.applicantDetails;
      const fullName = (details.fullName || details.name || '').trim();
      const careerDetails = (details.careerDetails || '').trim();
      const areaOfInterest = (details.areaOfInterest || '').trim();
      const phoneInput = (details.phone || details.contactNumber || '').trim();

      if (!fullName || fullName.length < 2) {
        return NextResponse.json({ error: 'Please enter your full name (at least 2 characters).' }, { status: 400 });
      }

      if (!phoneInput) {
        return NextResponse.json({ error: 'Contact number is required.' }, { status: 400 });
      }

      const phoneValidation = isValidPhoneNumber(phoneInput);
      if (!phoneValidation.valid) {
        return NextResponse.json({ error: phoneValidation.error }, { status: 400 });
      }
      validatedPhone = phoneValidation.normalized;

      if (!careerDetails || careerDetails.length < 2) {
        return NextResponse.json({ error: 'Please provide your career details (current education, role, or background).' }, { status: 400 });
      }

      if (!areaOfInterest || areaOfInterest.length < 2) {
        return NextResponse.json({ error: 'Please provide your area of interest or target domain.' }, { status: 400 });
      }

      // 1. Career Guidance (1:1) specific validation: mandatory booking date
      const isGuidance = productCode === 'career:career-guidance' || (details.serviceName || '').toLowerCase().includes('guidance');
      if (isGuidance) {
        rawBookingDate = (details.bookingDate || details.selectedBookingDate || details.scheduledFor || '').trim();
        if (!rawBookingDate) {
          return NextResponse.json({ error: 'Please select a convenient date for your 1-on-1 session.' }, { status: 400 });
        }
        const dateValidation = isValidBookingDate(rawBookingDate);
        if (!dateValidation.valid) {
          return NextResponse.json({ error: dateValidation.error }, { status: 400 });
        }
        validatedBookingDateIso = dateValidation.normalized;
      }

      // 2. LinkedIn Optimization specific validation: mandatory LinkedIn Profile URL
      const isLinkedIn = productCode === 'career:linkedin-optimization' || (details.serviceName || '').toLowerCase().includes('linkedin');
      if (isLinkedIn) {
        const rawLinkedIn = (details.linkedinUrl || '').trim();
        if (!rawLinkedIn) {
          return NextResponse.json({ error: 'LinkedIn profile URL is required.' }, { status: 400 });
        }
        const linkedInValidation = isValidLinkedInUrl(rawLinkedIn);
        if (!linkedInValidation.valid) {
          return NextResponse.json({ error: linkedInValidation.error }, { status: 400 });
        }
        validatedLinkedInUrl = linkedInValidation.normalized;
      }
    }

    if (product.category && await hasProTestAccess(user.id, product.category)) {
      return NextResponse.json({ freeAccess: true, productCode });
    }

    const admin = createAdminClient();

    const service = product.serviceCode ? getService(product.serviceCode) : null;
    if (product.serviceCode && service?.freeUnlock && await hasServiceAccess(user.id, product.serviceCode)) {
      const { error } = await admin.from('service_orders').insert({
        user_id: user.id,
        service_code: product.serviceCode,
        product_code: productCode,
        amount_paise: product.amountPaise,
        currency: product.currency,
        status: 'requested',
        scheduled_for: validatedBookingDateIso || null,
      });

      if (error) {
        console.error('Unable to create free service order:', error);
        return NextResponse.json({ error: 'Unable to request service' }, { status: 500 });
      }

      return NextResponse.json({ freeAccess: true });
    }

    // Check for duplicate pending submission created recently (within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: existing } = await admin
      .from('payments')
      .select('provider_order_id, amount_paise, currency, created_at, metadata')
      .eq('user_id', user.id)
      .eq('product_code', productCode)
      .in('status', ['created', 'pending'])
      .not('provider_order_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.provider_order_id && existing.created_at && existing.created_at > twoMinutesAgo) {
      // Re-use active pending order to prevent duplicate submissions & spamming
      return NextResponse.json({
        keyId: env.razorpayKeyId(),
        orderId: existing.provider_order_id,
        amount: existing.amount_paise,
        currency: existing.currency,
        productCode,
        isExisting: true,
      });
    }

    // If this is a Career Service registration, dispatch and verify email notification to taleneziocontact@gmail.com
    if (isCareerRegistration && body?.applicantDetails) {
      const details = body.applicantDetails;
      const serviceName =
        details.serviceName ||
        (productCode === 'career:career-guidance'
          ? 'Career Guidance (1:1)'
          : productCode === 'career:linkedin-optimization'
          ? 'LinkedIn Optimization'
          : 'Career Service');
      const fullName = (details.fullName || details.name || '').trim();
      const careerDetails = (details.careerDetails || '').trim();
      const areaOfInterest = (details.areaOfInterest || '').trim();
      const email = details.email || user.email || 'Not provided';
      const phone = validatedPhone || details.phone || details.contactNumber || '';

      const emailResult = await sendCareerServiceRegistrationEmail({
        serviceName,
        fullName,
        careerDetails,
        areaOfInterest,
        email,
        phone,
        selectedBookingDate: rawBookingDate,
        linkedinUrl: validatedLinkedInUrl,
        price: productCode === 'career:career-guidance' ? '₹199' : '₹499',
      });

      if (!emailResult.success) {
        console.error('Notice: error sending career service registration email:', emailResult.error);
        const errText = emailResult.error instanceof Error ? emailResult.error.message : String(emailResult.error || '');
        const isConfigError = errText.includes('RESEND_API_KEY');
        const errorMessage = isConfigError
          ? 'Application could not be delivered by email because the email service is not configured. Please contact taleneziocontact@gmail.com directly.'
          : 'Failed to send your application notification email. Please try again or reach out to taleneziocontact@gmail.com.';

        return NextResponse.json({ error: errorMessage }, { status: 502 });
      }
    }

    const receipt = `talenezio_${user.id.slice(0, 8)}_${Date.now()}`;
    let order;
    try {
      order = await createRazorpayOrder({
        amount: product.amountPaise,
        currency: product.currency,
        receipt,
        notes: { user_id: user.id, product_code: productCode },
      });
    } catch (error) {
      console.error('Unable to create Razorpay order:', error);
      return NextResponse.json({ error: 'Unable to start payment gateway' }, { status: 502 });
    }

    // Prepare complete applicant details with validated contact number, LinkedIn URL, and booking date
    const consolidatedDetails = body?.applicantDetails
      ? {
          ...body.applicantDetails,
          phone: validatedPhone || body.applicantDetails.phone,
          contactNumber: validatedPhone || body.applicantDetails.contactNumber,
          linkedinUrl: validatedLinkedInUrl || body.applicantDetails.linkedinUrl,
          bookingDate: rawBookingDate || body.applicantDetails.bookingDate,
          scheduledFor: validatedBookingDateIso || body.applicantDetails.scheduledFor,
        }
      : null;

    const { data: payment, error } = await admin.from('payments').insert({
      user_id: user.id,
      product_code: productCode,
      amount_paise: product.amountPaise,
      currency: product.currency,
      provider: 'razorpay',
      provider_order_id: order.id,
      status: 'pending',
      metadata: {
        category: product.category ?? null,
        service_code: product.serviceCode ?? null,
        training_code: product.trainingCode ?? null,
        applicant_details: consolidatedDetails,
        receipt,
      },
    }).select('id').single();

    if (error) {
      console.error('Unable to store payment order:', error);
      return NextResponse.json({ error: 'Unable to store payment order' }, { status: 500 });
    }

    if (product.trainingCode && body?.applicantDetails) {
      try {
        await admin.from('service_enquiries').insert({
          user_id: user.id,
          service_code: 'courses',
          interest: productCode,
          message: JSON.stringify({
            type: 'training_application',
            productCode,
            ...consolidatedDetails,
            appliedAt: new Date().toISOString(),
          }),
        });
      } catch (enquiryErr) {
        console.warn('Notice: could not record training enquiry:', enquiryErr);
      }
    }

    if (product.serviceCode) {
      const applicantDetails = consolidatedDetails;
      const fulfilmentNoteParts = [
        `Candidate: ${applicantDetails?.fullName || applicantDetails?.name || user.email || 'N/A'}`,
        validatedPhone ? `Phone: ${validatedPhone}` : null,
        validatedLinkedInUrl ? `LinkedIn: ${validatedLinkedInUrl}` : null,
        rawBookingDate ? `Booking Date: ${rawBookingDate}` : null,
        applicantDetails?.areaOfInterest ? `Area: ${applicantDetails.areaOfInterest}` : null,
        applicantDetails?.careerDetails ? `Career: ${applicantDetails.careerDetails}` : null,
      ].filter(Boolean);

      const fulfilmentNote = fulfilmentNoteParts.join(' | ');

      const { error: serviceOrderError } = await admin.from('service_orders').insert({
        user_id: user.id,
        service_code: product.serviceCode,
        product_code: productCode,
        amount_paise: product.amountPaise,
        currency: product.currency,
        status: 'pending_payment',
        payment_id: payment?.id,
        scheduled_for: validatedBookingDateIso || null,
        fulfilment_note: fulfilmentNote,
      });

      if (serviceOrderError) {
        console.error('Unable to store service order:', serviceOrderError);
        return NextResponse.json({ error: 'Unable to store service order' }, { status: 500 });
      }

      // If this is a 1-on-1 counseling / guidance session with a booking date, record in bookings table
      if (product.serviceCode === 'career-counseling' && validatedBookingDateIso) {
        try {
          const { error: bookingError } = await admin.from('bookings').insert({
            user_id: user.id,
            service_code: 'career-counseling',
            domain: applicantDetails?.areaOfInterest || null,
            scheduled_for: validatedBookingDateIso,
            status: 'pending',
            payment_id: payment?.id,
          });

          if (bookingError) {
            console.warn('Notice: could not record booking row:', bookingError.message);
          }
        } catch (bookingErr) {
          console.warn('Notice: exception inserting into bookings table:', bookingErr);
        }
      }
    }

    return NextResponse.json({
      keyId: env.razorpayKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      productCode,
    });
  } catch (error) {
    console.error('Unexpected error in /api/payments/orders:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred while processing the payment order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
