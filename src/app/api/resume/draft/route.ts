import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { ResumeData } from '@/components/resume/types';

const MAX_DRAFT_BYTES = 100_000;
const sectionIds = ['personal', 'education', 'experience', 'projects', 'skills', 'awards'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasStringFields(value: unknown, fields: string[]): boolean {
  return isRecord(value) && fields.every(field => typeof value[field] === 'string');
}

function hasStringEntries(value: unknown, fields: string[]): boolean {
  return Array.isArray(value) && value.every(entry => hasStringFields(entry, fields));
}

function isResumeData(value: unknown): value is ResumeData {
  if (!isRecord(value) || !isRecord(value.personalInfo) || !isRecord(value.sectionLabels)) return false;
  const sectionLabels = value.sectionLabels;
  return (
    ['classic', 'modern', 'minimalist'].includes(String(value.layout)) &&
    hasStringFields(value.personalInfo, ['fullName', 'jobTitle', 'email', 'phone', 'linkedin', 'location', 'portfolio']) &&
    typeof value.summary === 'string' &&
    hasStringEntries(value.links, ['id', 'label', 'url']) &&
    hasStringEntries(value.experience, ['id', 'title', 'company', 'location', 'startDate', 'endDate', 'description']) &&
    hasStringEntries(value.education, ['id', 'degree', 'institution', 'location', 'startDate', 'endDate', 'gpa', 'score', 'courses']) &&
    hasStringEntries(value.projects, ['id', 'title', 'link', 'description']) &&
    typeof value.skills === 'string' &&
    hasStringEntries(value.awards, ['id', 'title', 'issuer', 'date', 'description']) &&
    hasStringEntries(value.customSections, ['id', 'title', 'content']) &&
    Array.isArray(value.sectionOrder) &&
    value.sectionOrder.every(id => sectionIds.includes(id as typeof sectionIds[number])) &&
    Array.isArray(value.hiddenSections) &&
    value.hiddenSections.every(id => sectionIds.includes(id as typeof sectionIds[number])) &&
    sectionIds.every(id => typeof sectionLabels[id] === 'string')
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ draft: null, updatedAt: null, storage: 'local' });
    }

    const { data, error } = await supabase
      .from('resume_drafts')
      .select('resume_data, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Resume draft cloud storage unavailable, falling back to local storage:', error.message || error);
      return NextResponse.json({ draft: null, updatedAt: null, storage: 'local' });
    }

    return NextResponse.json({ draft: data?.resume_data ?? null, updatedAt: data?.updated_at ?? null, storage: 'cloud' });
  } catch (error) {
    console.warn('Unexpected error reading resume draft, falling back to local storage:', error);
    return NextResponse.json({ draft: null, updatedAt: null, storage: 'local' });
  }
}

export async function POST(request: Request) {
  let body: { draft?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }
  if (JSON.stringify(body).length > MAX_DRAFT_BYTES) {
    return NextResponse.json({ error: 'Resume draft exceeds maximum allowed size' }, { status: 413 });
  }
  if (!isResumeData(body?.draft)) {
    return NextResponse.json({ error: 'Invalid resume draft' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: true, storage: 'local' });
    }

    const { error } = await supabase.from('resume_drafts').upsert({
      user_id: user.id,
      resume_data: body.draft,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) {
      console.warn('Resume draft cloud storage unavailable, falling back to local storage:', error.message || error);
      return NextResponse.json({ success: true, storage: 'local', warning: error.message });
    }

    return NextResponse.json({ success: true, storage: 'cloud' });
  } catch (error) {
    console.warn('Unexpected error saving resume draft to cloud, falling back to local storage:', error);
    return NextResponse.json({ success: true, storage: 'local' });
  }
}
