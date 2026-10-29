import { createAdminClient } from '@/lib/supabase/admin';
import { updateEnquiry } from './actions';

export const revalidate = 0;

interface ParsedEnquiryDetails {
  fullName?: string;
  email?: string;
  phone?: string;
  college?: string;
  city?: string;
  collegeOrCompany?: string;
  age?: number | string;
  resumeFileName?: string;
  resumeFileSize?: number;
  resumeStoragePath?: string;
  appliedAt?: string;
  [key: string]: unknown;
}

export default async function AdminEnquiriesPage() {
  const admin = createAdminClient();
  const { data: rawEnquiries } = await admin
    .from('service_enquiries')
    .select('*, profiles:user_id(full_name)')
    .order('created_at', { ascending: false });

  const enquiries = await Promise.all(
    (rawEnquiries || []).map(async (enquiry) => {
      let parsedDetails: ParsedEnquiryDetails | null = null;
      let resumeSignedUrl: string | null = null;

      if (enquiry.message && enquiry.message.trim().startsWith('{')) {
        try {
          parsedDetails = JSON.parse(enquiry.message);
          if (parsedDetails?.resumeStoragePath) {
            const { data: signed } = await admin.storage
              .from('unlock_evidence')
              .createSignedUrl(parsedDetails.resumeStoragePath, 3600); // 1 hour link
            resumeSignedUrl = signed?.signedUrl || null;
          }
        } catch {
          parsedDetails = null;
        }
      }

      return {
        ...enquiry,
        parsedDetails,
        resumeSignedUrl,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course & Internship Enquiries</h1>
        <p className="mt-1 text-gray-500">Review catalogue enquiries, applications, resumes, and track follow-up.</p>
      </div>

      <div className="space-y-4">
        {enquiries.map((enquiry) => {
          const details = enquiry.parsedDetails;

          return (
            <form
              key={enquiry.id}
              action={updateEnquiry}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <input type="hidden" name="id" value={enquiry.id} />

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 uppercase tracking-wide">
                      {enquiry.service_code}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(enquiry.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {enquiry.interest}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Applicant:</span>{' '}
                    {details?.fullName || enquiry.profiles?.full_name || 'Unknown applicant'}
                    {details?.email && ` · ${details.email}`}
                    {details?.phone && ` · ${details.phone}`}
                    {details?.college && ` · College: ${details.college}`}
                    {details?.city && ` · City: ${details.city}`}
                    {details?.collegeOrCompany && ` · Institute/Org: ${details.collegeOrCompany}`}
                    {details?.age && ` · Age: ${details.age}`}
                  </p>

                  {/* Resume Download Link if uploaded */}
                  {enquiry.resumeSignedUrl ? (
                    <div className="pt-1">
                      <a
                        href={enquiry.resumeSignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download / View Resume ({details?.resumeFileName || 'Document'})
                      </a>
                    </div>
                  ) : details?.resumeFileName ? (
                    <p className="text-xs text-gray-500 italic">
                      Resume attached: {details.resumeFileName} (storage path: {details.resumeStoragePath || 'none'})
                    </p>
                  ) : null}

                  {/* Fallback raw message if not structured JSON */}
                  {!details && enquiry.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg mt-1">
                      {enquiry.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    name="status"
                    defaultValue={enquiry.status}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="closed">closed</option>
                  </select>
                  <input
                    name="note"
                    defaultValue={enquiry.admin_note || ''}
                    placeholder="Admin note"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          );
        })}

        {(!enquiries || enquiries.length === 0) && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-800">
            No enquiries or applications yet.
          </p>
        )}
      </div>
    </div>
  );
}
