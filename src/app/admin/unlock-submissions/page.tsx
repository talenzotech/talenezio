import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import SubmissionsClient, { type Submission } from './SubmissionsClient';

export const dynamic = 'force-dynamic';

type RawEvidence = { id: string; storage_path: string; evidence_type: string };
type RawProfile = { full_name: string | null; avatar_url: string | null };
type RawSubmission = {
  id: string;
  status: string;
  created_at: string;
  reviewer_note: string | null;
  profiles: RawProfile | RawProfile[] | null;
  unlock_evidence: RawEvidence[] | null;
};

export default async function AdminUnlockSubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized.</div>;

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return <div>Unauthorized.</div>;
  
  // Fetch pending submissions along with evidence and user details
  const { data: submissions, error } = await admin
    .from('unlock_submissions')
    .select(`
      id, 
      status, 
      created_at,
      reviewer_note,
      profiles (full_name, avatar_url),
      unlock_evidence (id, storage_path, evidence_type)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    return <div>Error loading submissions.</div>;
  }

  // We need to generate signed URLs for the evidence so the admin can view them.
  // We can do this on the server.
  
  // Actually, since the admin has RLS access to the bucket, they can just use the public URL if it's public,
  // or we can generate signed URLs or use the client supabase to download.
  // It's easier to generate signed URLs here.
  
  const submissionsWithUrls: Submission[] = await Promise.all(
    ((submissions || []) as unknown as RawSubmission[]).map(async (sub) => {
      const evidence = await Promise.all((sub.unlock_evidence || []).map(async (ev) => {
        const { data } = await admin.storage
          .from('unlock_evidence')
          .createSignedUrl(ev.storage_path, 60 * 60); // 1 hour
        return {
          id: ev.id,
          storage_path: ev.storage_path,
          evidence_type: ev.evidence_type,
          url: data?.signedUrl || null
        };
      }));
      const profileData = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
      return {
        id: sub.id,
        status: sub.status,
        created_at: sub.created_at,
        reviewer_note: sub.reviewer_note ?? null,
        profiles: profileData ? {
          full_name: profileData.full_name ?? null,
          avatar_url: profileData.avatar_url ?? null,
        } : null,
        unlock_evidence: evidence,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unlock Program Submissions</h2>
          <p className="text-sm text-gray-500">Review user evidence to grant free access.</p>
        </div>
      </div>
      
      <SubmissionsClient initialSubmissions={submissionsWithUrls} />
    </div>
  );
}
