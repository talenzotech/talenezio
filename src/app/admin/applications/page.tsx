import { createAdminClient } from '@/lib/supabase/admin';
import ApplicationsClient, { type ApplicationItem } from './ApplicationsClient';

export const revalidate = 0; // Disable caching for real-time admin view

export default async function AdminApplicationsPage() {
  const admin = createAdminClient();

  let rawEnquiries: any[] = [];
  const { data, error: fetchError } = await admin
    .from('service_enquiries')
    .select('*, profiles:user_id(full_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.warn('Notice: joined service_enquiries query failed, falling back to direct select:', fetchError.message);
    const fallback = await admin
      .from('service_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    rawEnquiries = fallback.data || [];
  } else {
    rawEnquiries = data || [];
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
        fee: parsed?.fee || undefined,
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
