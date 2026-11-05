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
      };
    } | null;

    const productCode = body?.category && isTestCategory(body.category)
      ? proTestProductCode(body.category)
      : body?.productCode;
    const product = productCode ? paidProductDetails(productCode) : null;
    if (!productCode || !product) {
      return NextResponse.json({ error: 'Invalid service or test product' }, { status: 400 });
    }

    // Handle Career Service email dispatch if career registration details are provided
    const isCareerRegistration = Boolean(
      body?.applicantDetails &&
      (body.applicantDetails.careerDetails || body.applicantDetails.serviceName || productCode.startsWith('career:'))
    );

    if (isCareerRegistration && body?.applicantDetails) {
      try {
        const serviceName =
          body.applicantDetails.serviceName ||
          (productCode === 'career:career-guidance'
            ? 'Career Guidance'
            : productCode === 'career:linkedin-optimization'
            ? 'LinkedIn Optimization'
            : productCode === 'career:interview-prep'
            ? 'Interview Preparation'
            : 'Career Service');
        const fullName = (body.applicantDetails.fullName || body.applicantDetails.name || '').trim();
        const careerDetails = (body.applicantDetails.careerDetails || '').trim();
        const areaOfInterest = (body.applicantDetails.areaOfInterest || '').trim();
        const email = user.email || body.applicantDetails.email;
        const phone = body.applicantDetails.phone;

        if (fullName && careerDetails && areaOfInterest) {
          await sendCareerServiceRegistrationEmail({
            serviceName,
            fullName,
            careerDetails,
            areaOfInterest,
            email,
            phone,
          });
        }
      } catch (emailErr) {
        console.error('Notice: could not dispatch career service registration email:', emailErr);
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
      });

      if (error) {
        console.error('Unable to create free service order:', error);
        return NextResponse.json({ error: 'Unable to request service' }, { status: 500 });
      }

      return NextResponse.json({ freeAccess: true });
    }

    const { data: existing } = await admin
      .from('payments')
      .select('provider_order_id, amount_paise, currency')
      .eq('user_id', user.id)
      .eq('product_code', productCode)
      .in('status', ['created', 'pending'])
      .not('provider_order_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.provider_order_id) {
      if (body?.applicantDetails) {
        await admin
          .from('payments')
          .update({
            metadata: {
              category: product.category ?? null,
              service_code: product.serviceCode ?? null,
              training_code: product.trainingCode ?? null,
              applicant_details: body.applicantDetails,
              receipt: `talenezio_${user.id.slice(0, 8)}_${Date.now()}`,
            },
          })
          .eq('provider_order_id', existing.provider_order_id);
      }

      return NextResponse.json({
        keyId: env.razorpayKeyId(),
        orderId: existing.provider_order_id,
        amount: existing.amount_paise,
        currency: existing.currency,
        productCode,
      });
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
        applicant_details: body?.applicantDetails ?? null,
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
            ...body.applicantDetails,
            appliedAt: new Date().toISOString(),
          }),
        });
      } catch (enquiryErr) {
        console.warn('Notice: could not record training enquiry:', enquiryErr);
      }
    }

    if (product.serviceCode) {
      const applicantDetails = body?.applicantDetails;
      const fulfilmentNote = applicantDetails
        ? `Name: ${applicantDetails.fullName || applicantDetails.name || ''} | Details: ${applicantDetails.careerDetails || ''} | Interest: ${applicantDetails.areaOfInterest || ''}`
        : null;

      const { error: serviceOrderError } = await admin.from('service_orders').insert({
        user_id: user.id,
        service_code: product.serviceCode,
        product_code: productCode,
        amount_paise: product.amountPaise,
        currency: product.currency,
        status: 'pending_payment',
        payment_id: payment?.id,
        fulfilment_note: fulfilmentNote,
      });

      if (serviceOrderError) {
        console.error('Unable to store service order:', serviceOrderError);
        return NextResponse.json({ error: 'Unable to store service order' }, { status: 500 });
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
