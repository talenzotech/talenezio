import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCertificatePdf } from '@/lib/certificates/pdf';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const candidateName = url.searchParams.get('name') || 'Talenezio Learner';
  const rawTopic = url.searchParams.get('topic') || 'Skill Assessment';

  const TOPIC_NAMES: Record<string, string> = {
    technology: 'Technology & Software',
    finance: 'Finance',
    'digital-marketing': 'Digital Marketing',
    ai: 'Artificial Intelligence',
  };
  const topic = TOPIC_NAMES[rawTopic] || rawTopic;

  const scoreParam = url.searchParams.get('score');
  const totalParam = url.searchParams.get('total');
  const score = scoreParam !== null && !isNaN(Number(scoreParam)) ? Number(scoreParam) : 0;
  const totalQuestions = totalParam !== null && !isNaN(Number(totalParam)) ? Number(totalParam) : 20;
  const percentage = Math.round((score / totalQuestions) * 100);

  const certPrefix = topic.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'TEST';
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || '001';
  const certificateNumber = id.startsWith('demo-')
    ? `TAL-2026-${certPrefix}-${cleanId}`
    : id.toUpperCase();

  // Demo session or local development certificate download
  if (process.env.NODE_ENV === 'development' && id.startsWith('demo-')) {
    const performanceStatement = percentage >= 75
      ? `Demonstrated outstanding subject matter expertise and proficiency in the ${topic} Industry-Standard Skill Assessment.`
      : percentage >= 50
      ? `Successfully demonstrated foundational knowledge and core competencies in the ${topic} Industry-Standard Skill Assessment.`
      : `Participated in the ${topic} Industry-Standard Skill Assessment and evaluated core conceptual competencies.`;

    const pdfBytes = await buildCertificatePdf({
      candidateName,
      certificateNumber,
      topic,
      score,
      totalQuestions,
      issuedAt: new Date().toISOString(),
      performanceStatement,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${certificateNumber}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const admin = createAdminClient();
  const { data: certificate } = await admin
    .from('certificates')
    .select('id, user_id, certificate_number, pdf_path')
    .eq('id', id)
    .maybeSingle();

  if (!certificate || certificate.user_id !== user.id) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }
  if (!certificate.pdf_path) {
    return NextResponse.json({ error: 'Certificate PDF is not ready yet' }, { status: 409 });
  }

  const { data: file, error } = await admin.storage.from('certificates').download(certificate.pdf_path);
  if (error || !file) {
    console.error('Unable to download certificate PDF:', error);
    return NextResponse.json({ error: 'Certificate PDF is unavailable' }, { status: 404 });
  }

  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${certificate.certificate_number}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
