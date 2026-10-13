import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null) as {
    serviceCode?: string;
    interest?: string;
    message?: string;
  } | null;

  if (!body?.serviceCode || !['courses', 'internships'].includes(body.serviceCode) || !body.interest?.trim()) {
    return NextResponse.json({ error: 'Service and interest are required' }, { status: 400 });
  }

  const { error } = await supabase.from('service_enquiries').insert({
    user_id: user.id,
    service_code: body.serviceCode,
    interest: body.interest.trim(),
    message: body.message?.trim() || null,
  });

  if (error) {
    console.error('Unable to create service enquiry:', error);
    return NextResponse.json({ error: 'Could not submit enquiry' }, { status: 500 });
  }

  return NextResponse.json({ submitted: true });
}
