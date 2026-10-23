import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildCertificatePdf } from '@/lib/certificates/pdf';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const candidateName = url.searchParams.get('name') || 'Talenezio Learner';
  const topic = url.searchParams.get('topic') || 'Skill Assessment';

  // Demo session or local development certificate download
  if (id.startsWith('demo-') || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const pdfBytes = await buildCertificatePdf({
      candidateName,
      certificateNumber: id.toUpperCase(),
      topic,
      score: 18,
      totalQuestions: 20,
      issuedAt: new Date().toISOString(),
      performanceStatement: 'Demonstrated outstanding subject matter expertise and proficiency in Industry-Standard Skill Assessments.',
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${id}.pdf"`,
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
