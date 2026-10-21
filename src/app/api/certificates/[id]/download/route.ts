import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
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
