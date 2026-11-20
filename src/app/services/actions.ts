'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function requestService(serviceCode: string, domain?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      service_code: serviceCode,
      domain: domain || null,
      status: 'pending'
    });

  if (error) {
    console.error('Failed to request service:', error);
  } else {
    revalidatePath('/dashboard');
  }

  redirect('/dashboard');
}
