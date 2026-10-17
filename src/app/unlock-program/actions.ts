'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const REQUIRED_EVIDENCE = 11;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

function validUserPath(path: string, userId: string): boolean {
  const prefix = `${userId}/`;
  const filename = path.startsWith(prefix) ? path.slice(prefix.length) : '';
  const extension = filename.split('.').pop()?.toLowerCase();
  return Boolean(
    filename &&
    !filename.includes('/') &&
    !filename.includes('..') &&
    /^[A-Za-z0-9._-]+$/.test(filename) &&
    extension &&
    IMAGE_EXTENSIONS.has(extension),
  );
}

function isImageContent(bytes: Uint8Array): boolean {
  const png = bytes.length >= 8 && bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const webp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return png || jpeg || webp;
}

async function removeUploadedEvidence(paths: string[], userId: string) {
  const safePaths = paths.filter((path) => validUserPath(path, userId));
  if (safePaths.length > 0) {
    await createAdminClient().storage.from('unlock_evidence').remove(safePaths);
  }
}

async function validateEvidence(paths: string[], userId: string): Promise<string | null> {
  if (paths.length !== REQUIRED_EVIDENCE) return `Exactly ${REQUIRED_EVIDENCE} screenshots are required.`;
  if (new Set(paths).size !== paths.length) return 'Each screenshot must be uploaded only once.';
  if (paths.some((path) => !validUserPath(path, userId))) return 'Evidence paths are invalid.';

  const admin = createAdminClient();
  const checks = await Promise.all(paths.map(async (path) => {
    const { data, error } = await admin.storage.from('unlock_evidence').download(path);
    if (error || !data) return 'One or more evidence files could not be found.';
    if (data.size > MAX_FILE_SIZE) return 'Each screenshot must be 5MB or smaller.';
    if (!isImageContent(new Uint8Array(await data.arrayBuffer()))) return 'Every evidence file must be a valid PNG, JPG, JPEG, or WEBP image.';
    return null;
  }));
  return checks.find(Boolean) ?? null;
}

export async function cleanupUnlockEvidence(paths: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await removeUploadedEvidence(paths, user.id);
  return { success: true };
}

export async function submitUnlockEvidence(paths: string[]) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'You must be logged in to submit.' };

  const validationError = await validateEvidence(paths, user.id);
  if (validationError) {
    await removeUploadedEvidence(paths, user.id);
    return { error: validationError };
  }

  const admin = createAdminClient();
  const { data: openSubmission } = await admin
    .from('unlock_submissions')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle();
  if (openSubmission) return { error: 'You already have a pending or approved submission.' };

  const { data: submission, error: submissionError } = await admin
    .from('unlock_submissions')
    .insert({ user_id: user.id, status: 'pending' })
    .select('id')
    .single();

  if (submissionError || !submission) {
    await removeUploadedEvidence(paths, user.id);
    console.error('Error creating unlock submission:', submissionError);
    return { error: 'Failed to create submission.' };
  }

  const { error: evidenceError } = await admin.from('unlock_evidence').insert(
    paths.map((path, position) => ({
      submission_id: submission.id,
      evidence_type: 'screenshot',
      storage_path: path,
      position,
    })),
  );

  if (evidenceError) {
    await admin.from('unlock_submissions').delete().eq('id', submission.id);
    await removeUploadedEvidence(paths, user.id);
    console.error('Error saving unlock evidence:', evidenceError);
    return { error: 'Failed to save evidence paths.' };
  }

  revalidatePath('/unlock-program');
  return { success: true };
}

export async function getSubmissionStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('unlock_submissions')
    .select('status, reviewer_note, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
