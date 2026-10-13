import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { ResumeData } from '@/components/resume/types';

const MAX_DRAFT_BYTES = 100_000;

function isResumeData(value: unknown): value is ResumeData {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<ResumeData>;
  return (
    ['classic', 'modern', 'minimalist'].includes(draft.layout as string) &&
    typeof draft.personalInfo === 'object' && draft.personalInfo !== null &&
    typeof draft.summary === 'string' &&
    Array.isArray(draft.experience) &&
    Array.isArray(draft.education) &&
    typeof draft.skills === 'string' &&
    Array.isArray(draft.projects)
  );
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { data, error } = await supabase
    .from('resume_drafts')
    .select('resume_data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Unable to load resume draft:', error);
    return NextResponse.json({ error: 'Could not load resume draft' }, { status: 500 });
  }

  return NextResponse.json({ draft: data?.resume_data ?? null, updatedAt: data?.updated_at ?? null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null) as { draft?: unknown } | null;
  if (!isResumeData(body?.draft)) {
    return NextResponse.json({ error: 'Invalid resume draft' }, { status: 400 });
  }

  if (JSON.stringify(body.draft).length > MAX_DRAFT_BYTES) {
    return NextResponse.json({ error: 'Resume draft is too large' }, { status: 413 });
  }

  const { data, error } = await supabase
    .from('resume_drafts')
    .upsert({ user_id: user.id, resume_data: body.draft }, { onConflict: 'user_id' })
    .select('updated_at')
    .single();

  if (error) {
    console.error('Unable to save resume draft:', error);
    return NextResponse.json({ error: 'Could not save resume draft' }, { status: 500 });
  }

  return NextResponse.json({ saved: true, updatedAt: data.updated_at });
}
