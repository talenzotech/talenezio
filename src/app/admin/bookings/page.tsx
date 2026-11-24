import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import BookingsClient, { type CareerAcceleratorItem } from './BookingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching for real-time admin view

export default async function AdminBookingsPage() {
  const adminClient = createAdminClient();

  let rawEnquiries: any[] = [];
  let rawBookings: any[] = [];
  let rawPayments: any[] = [];

  try {
    const [enquiriesRes, bookingsRes, paymentsRes] = await Promise.all([
      adminClient
        .from('service_enquiries')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .in('service_code', ['career-guidance', 'career-counseling', 'linkedin-optimization', 'interview-prep'])
        .order('created_at', { ascending: false }),
      adminClient
        .from('bookings')
        .select('*, profiles:user_id(full_name)')
        .order('created_at', { ascending: false }),
      adminClient
        .from('payments')
        .select('*')
        .or('product_code.ilike.career:%,product_code.in.(service:career-counseling,service:interview-prep,service:career-starter-pack)')
        .order('created_at', { ascending: false }),
    ]);

    rawEnquiries = enquiriesRes.data || [];
    rawBookings = bookingsRes.data || [];
    rawPayments = paymentsRes.data || [];
  } catch (err) {
    console.error('Error querying Career Accelerators data:', err);
  }

  // Pre-index payments for quick lookups
  const paymentByOrderId = new Map<string, any>();
  const paymentById = new Map<string, any>();
  for (const pay of rawPayments) {
    if (pay.provider_order_id) paymentByOrderId.set(pay.provider_order_id, pay);
    if (pay.id) paymentById.set(pay.id, pay);
  }

  // Track matched payment and booking IDs to prevent duplicates
  const matchedPaymentIds = new Set<string>();
  const matchedBookingIds = new Set<string>();

  const items: CareerAcceleratorItem[] = [];

  // 1. Process Enquiries (Interview Prep, Career Guidance, LinkedIn Optimization)
  for (const enquiry of rawEnquiries) {
    let parsed: Record<string, any> = {};
    if (enquiry.message && typeof enquiry.message === 'string') {
      try {
        parsed = JSON.parse(enquiry.message);
      } catch {
        parsed = { raw: enquiry.message };
      }
    }

    // Generate signed resume URL if present
    let resumeSignedUrl: string | null = null;
    const storagePath = parsed.resumeStoragePath || null;
    if (storagePath) {
      try {
        const { data: signed } = await adminClient.storage
          .from('unlock_evidence')
          .createSignedUrl(storagePath, 3600);
        resumeSignedUrl = signed?.signedUrl || null;
      } catch (storageErr) {
        console.warn('Notice: could not generate signed resume URL:', storageErr);
      }
    }

    // Match payment
    const matchedPay =
      (parsed.providerOrderId && paymentByOrderId.get(parsed.providerOrderId)) ||
      (parsed.paymentId && paymentById.get(parsed.paymentId)) ||
      (parsed.orderId && paymentByOrderId.get(parsed.orderId)) ||
      null;

    if (matchedPay?.id) {
      matchedPaymentIds.add(matchedPay.id);
    }

    // Match booking (if scheduled)
    const matchedBooking = rawBookings.find((b) => {
      if (b.id && matchedBookingIds.has(b.id)) return false;
      if (matchedPay?.id && b.payment_id === matchedPay.id) return true;
      if (enquiry.user_id && b.user_id === enquiry.user_id) return true;
      return false;
    });

    if (matchedBooking?.id) {
      matchedBookingIds.add(matchedBooking.id);
    }

    // Normalize service code
    let serviceCode: CareerAcceleratorItem['serviceCode'] = 'career-guidance';
    let serviceTitle = 'Career Guidance';
    if (enquiry.service_code === 'interview-prep') {
      serviceCode = 'interview-prep';
      serviceTitle = 'Interview Preparation';
    } else if (enquiry.service_code === 'linkedin-optimization') {
      serviceCode = 'linkedin-optimization';
      serviceTitle = 'LinkedIn Optimization';
    } else {
      serviceCode = 'career-guidance';
      serviceTitle = 'Career Guidance';
    }

    const profile = Array.isArray(enquiry.profiles) ? enquiry.profiles[0] : enquiry.profiles;
    const applicantName =
      parsed.fullName ||
      parsed.name ||
      profile?.full_name ||
      'Anonymous Applicant';

    const applicantEmail = parsed.email || '';
    const applicantPhone = parsed.phone || parsed.contactNumber || '';

    let scheduledFor =
      matchedBooking?.scheduled_for ||
      parsed.scheduledFor ||
      parsed.bookingDate ||
      null;

    let meetingUrl =
      matchedBooking?.meeting_url ||
      parsed.meetingUrl ||
      null;

    let itemStatus = matchedBooking?.status || parsed.status || enquiry.status || 'new';

    items.push({
      id: enquiry.id,
      source: 'enquiry',
      serviceCode,
      serviceTitle,
      applicantName,
      applicantEmail,
      applicantPhone,
      status: itemStatus,
      scheduledFor,
      meetingUrl,
      adminNote: enquiry.admin_note || parsed.adminNote || null,
      createdAt: enquiry.created_at,
      domain: parsed.domain || matchedBooking?.domain || parsed.areaOfInterest || null,
      batch: parsed.batch || null,
      linkedinUrl: parsed.linkedinUrl || null,
      careerDetails: parsed.careerDetails || null,
      areaOfInterest: parsed.areaOfInterest || null,
      resumeFileName: parsed.resumeFileName || null,
      resumeFileSize: parsed.resumeFileSize || null,
      resumeStoragePath: storagePath,
      resumeSignedUrl,
      paymentStatus: matchedPay ? matchedPay.status : (parsed.paymentStatus || 'free'),
      amountPaise: matchedPay ? matchedPay.amount_paise : (parsed.amountPaise || null),
      paymentId: matchedPay?.id || parsed.paymentId || null,
      providerOrderId: matchedPay?.provider_order_id || parsed.providerOrderId || null,
    });
  }

  // 2. Process Bookings not already merged
  for (const booking of rawBookings) {
    if (matchedBookingIds.has(booking.id)) continue;

    const matchedPay =
      (booking.payment_id && paymentById.get(booking.payment_id)) ||
      null;

    if (matchedPay?.id) {
      matchedPaymentIds.add(matchedPay.id);
    }

    let serviceCode: CareerAcceleratorItem['serviceCode'] = 'career-guidance';
    let serviceTitle = 'Career Guidance';
    if (booking.service_code === 'interview-prep') {
      serviceCode = 'interview-prep';
      serviceTitle = 'Interview Preparation';
    } else if (booking.service_code === 'linkedin-optimization') {
      serviceCode = 'linkedin-optimization';
      serviceTitle = 'LinkedIn Optimization';
    }

    const payApplicant = matchedPay?.metadata?.applicant_details || {};
    const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;

    const applicantName =
      payApplicant.fullName ||
      payApplicant.name ||
      profile?.full_name ||
      'Registered User';

    const applicantEmail = payApplicant.email || '';
    const applicantPhone = payApplicant.phone || payApplicant.contactNumber || '';

    items.push({
      id: booking.id,
      source: 'booking',
      serviceCode,
      serviceTitle,
      applicantName,
      applicantEmail,
      applicantPhone,
      status: booking.status || 'pending',
      scheduledFor: booking.scheduled_for || null,
      meetingUrl: booking.meeting_url || null,
      adminNote: payApplicant.adminNote || null,
      createdAt: booking.created_at,
      domain: booking.domain || payApplicant.areaOfInterest || null,
      batch: payApplicant.batch || null,
      linkedinUrl: payApplicant.linkedinUrl || null,
      careerDetails: payApplicant.careerDetails || null,
      areaOfInterest: payApplicant.areaOfInterest || null,
      paymentStatus: matchedPay ? matchedPay.status : 'pending',
      amountPaise: matchedPay?.amount_paise || null,
      paymentId: matchedPay?.id || null,
      providerOrderId: matchedPay?.provider_order_id || null,
    });
  }

  // 3. Process Payments not already merged (e.g. earlier submissions before unified enquiry insertion)
  for (const pay of rawPayments) {
    if (matchedPaymentIds.has(pay.id)) continue;

    const applicant = (pay.metadata?.applicant_details || {}) as Record<string, any>;

    let serviceCode: CareerAcceleratorItem['serviceCode'] = 'career-guidance';
    let serviceTitle = 'Career Guidance';

    if (pay.product_code === 'career:linkedin-optimization') {
      serviceCode = 'linkedin-optimization';
      serviceTitle = 'LinkedIn Optimization';
    } else if (pay.product_code === 'career:interview-prep' || pay.product_code === 'service:interview-prep') {
      serviceCode = 'interview-prep';
      serviceTitle = 'Interview Preparation';
    } else {
      serviceCode = 'career-guidance';
      serviceTitle = 'Career Guidance';
    }

    const applicantName = applicant.fullName || applicant.name || 'Applicant';
    const applicantEmail = applicant.email || '';
    const applicantPhone = applicant.phone || applicant.contactNumber || '';

    items.push({
      id: pay.id,
      source: 'payment',
      serviceCode,
      serviceTitle,
      applicantName,
      applicantEmail,
      applicantPhone,
      status: applicant.status || (pay.status === 'paid' ? 'confirmed' : 'pending'),
      scheduledFor: applicant.scheduledFor || applicant.bookingDate || null,
      meetingUrl: applicant.meetingUrl || null,
      adminNote: applicant.adminNote || null,
      createdAt: pay.created_at,
      domain: applicant.areaOfInterest || null,
      batch: applicant.batch || null,
      linkedinUrl: applicant.linkedinUrl || null,
      careerDetails: applicant.careerDetails || null,
      areaOfInterest: applicant.areaOfInterest || null,
      paymentStatus: pay.status,
      amountPaise: pay.amount_paise,
      paymentId: pay.id,
      providerOrderId: pay.provider_order_id,
    });
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Career Accelerators</h2>
          <p className="text-gray-500 mt-1">
            Manage 1-on-1 career guidance sessions, LinkedIn optimization requests, and interview preparation cohorts.
          </p>
        </div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          View Trainings & Internships →
        </Link>
      </div>

      <BookingsClient items={items} />
    </div>
  );
}
