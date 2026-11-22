import { createAdminClient } from '@/lib/supabase/admin';
import ApplicationsClient, { type ApplicationItem } from './ApplicationsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching for real-time admin view

export default async function AdminApplicationsPage() {
  const admin = createAdminClient();

  let rawEnquiries: any[] = [];
  let rawPayments: any[] = [];

  try {
    const [enquiriesRes, paymentsRes] = await Promise.all([
      admin
        .from('service_enquiries')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .order('created_at', { ascending: false }),
      admin
        .from('payments')
        .select('id, provider_order_id, provider_payment_id, status, amount_paise, product_code, created_at')
        .order('created_at', { ascending: false })
        .limit(300),
    ]);

    if (enquiriesRes.error || !enquiriesRes.data) {
      console.warn('Notice: joined service_enquiries query fallback:', enquiriesRes.error?.message);
      const fallback = await admin
        .from('service_enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      rawEnquiries = fallback.data || [];
    } else {
      rawEnquiries = enquiriesRes.data;
    }

    rawPayments = paymentsRes.data || [];
  } catch (err) {
    console.warn('Notice: service_enquiries query exception:', err);
    const fallback = await admin
      .from('service_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    rawEnquiries = fallback.data || [];
  }

  // Create payment lookups by provider_order_id and payment id
  const paymentByOrderId = new Map<string, any>();
  const paymentById = new Map<string, any>();
  for (const pay of rawPayments) {
    if (pay.provider_order_id) paymentByOrderId.set(pay.provider_order_id, pay);
    if (pay.id) paymentById.set(pay.id, pay);
  }

  const applications: ApplicationItem[] = await Promise.all(
    rawEnquiries.map(async (enquiry) => {
      let parsed: Record<string, any> | null = null;
      let resumeSignedUrl: string | null = null;

      if (enquiry.message && typeof enquiry.message === 'string' && enquiry.message.trim().startsWith('{')) {
        try {
          parsed = JSON.parse(enquiry.message);
        } catch {
          parsed = null;
        }
      }

      const storagePath = parsed?.resumeStoragePath || null;
      if (storagePath) {
        try {
          const { data: signed } = await admin.storage
            .from('unlock_evidence')
            .createSignedUrl(storagePath, 3600); // 1-hour secure signed link
          resumeSignedUrl = signed?.signedUrl || null;
        } catch (storageErr) {
          console.warn('Notice: could not generate signed resume URL:', storageErr);
        }
      }

      // Associate payment record
      const matchedPayment =
        (parsed?.providerOrderId && paymentByOrderId.get(parsed.providerOrderId)) ||
        (parsed?.paymentId && paymentById.get(parsed.paymentId));

      let paymentStatus: string | undefined = undefined;
      let amountPaid: number | undefined = undefined;

      if (matchedPayment) {
        paymentStatus = matchedPayment.status;
        amountPaid = matchedPayment.amount_paise ? matchedPayment.amount_paise / 100 : undefined;
      } else if (parsed?.paymentStatus) {
        paymentStatus = parsed.paymentStatus;
      } else if (enquiry.service_code === 'internships') {
        paymentStatus = 'free';
      } else if (parsed?.fee || enquiry.service_code === 'courses' || enquiry.service_code === 'interview-prep') {
        paymentStatus = 'pending';
      }

      // Resolve applicant name: prioritize form-submitted name, then profile, then fallback
      const profile = Array.isArray(enquiry.profiles) ? enquiry.profiles[0] : enquiry.profiles;
      const applicantName =
        parsed?.fullName ||
        parsed?.name ||
        profile?.full_name ||
        'Anonymous Applicant';

      const applicantEmail = parsed?.email || '';
      const applicantPhone = parsed?.phone || '';
      const collegeOrCompany = parsed?.college || parsed?.collegeOrCompany || '';

      return {
        id: enquiry.id,
        userId: enquiry.user_id || null,
        serviceCode: enquiry.service_code || 'enquiries',
        interest: enquiry.interest || 'General Application',
        status: enquiry.status || 'new',
        adminNote: enquiry.admin_note || null,
        createdAt: enquiry.created_at,
        applicantName,
        applicantEmail,
        applicantPhone,
        collegeOrCompany,
        city: parsed?.city || undefined,
        age: parsed?.age || undefined,
        batch: parsed?.batch || undefined,
        domain: parsed?.domain || parsed?.role || undefined,
        qualification: parsed?.qualification || undefined,
        experience: parsed?.experience || undefined,
        fee: parsed?.fee || undefined,
        amount: amountPaid || (parsed?.amountPaise ? parsed.amountPaise / 100 : undefined),
        paymentStatus,
        paymentId: matchedPayment?.id || parsed?.paymentId || undefined,
        providerOrderId: matchedPayment?.provider_order_id || parsed?.providerOrderId || undefined,
        resumeFileName: parsed?.resumeFileName || undefined,
        resumeFileSize: parsed?.resumeFileSize || undefined,
        resumeStoragePath: storagePath || undefined,
        resumeSignedUrl,
        rawMessage: !parsed && enquiry.message ? enquiry.message : undefined,
      };
    })
  );

  return <ApplicationsClient applications={applications} />;
}
