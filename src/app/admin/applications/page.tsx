import { createAdminClient } from '@/lib/supabase/admin';
import ApplicationsClient, { type ApplicationItem } from './ApplicationsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching for real-time admin view

type Enquiry = {
  id: string;
  user_id: string | null;
  service_code: string | null;
  interest: string | null;
  status: string | null;
  admin_note: string | null;
  created_at: string;
  message: string | null;
  profiles?: { full_name: string | null; avatar_url: string | null } | { full_name: string | null; avatar_url: string | null }[] | null;
};

type ApplicationPayload = {
  resumeStoragePath?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  collegeOrCompany?: string;
  city?: string;
  age?: number | string;
  batch?: string;
  fee?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
};

export default async function AdminApplicationsPage() {
  const admin = createAdminClient();

  let rawEnquiries: Enquiry[] = [];
  try {
    const { data, error: fetchError } = await admin
      .from('service_enquiries')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (fetchError || !data) {
      console.warn('Notice: joined service_enquiries query fallback:', fetchError?.message);
      const fallback = await admin
        .from('service_enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      rawEnquiries = fallback.data || [];
    } else {
      rawEnquiries = data;
    }
  } catch (err) {
    console.warn('Notice: service_enquiries query exception:', err);
    const fallback = await admin
      .from('service_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    rawEnquiries = fallback.data || [];
  }

  const applications: ApplicationItem[] = await Promise.all(
    rawEnquiries.map(async (enquiry) => {
      let parsed: ApplicationPayload | null = null;
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
