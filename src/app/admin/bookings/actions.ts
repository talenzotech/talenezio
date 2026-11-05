'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/auth/admin';

export async function updateBooking(
  bookingId: string, 
  data: { status?: string; scheduled_for?: string | null; meeting_url?: string | null }
) {
  const user = await getAdminUser();
  if (!user) return { error: 'Unauthorized admin' };

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient
    .from('bookings')
    .update(data)
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking:', error);
    return { error: 'Failed to update booking' };
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}

export async function createBooking(data: { email: string; service_code: string; domain?: string; scheduled_for: string; meeting_url?: string }) {
  const user = await getAdminUser();
  if (!user) return { error: 'Unauthorized admin' };

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Look up user ID by email
  const { data: targetProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .single();

  if (profileError || !targetProfile) {
    return { error: 'User not found with that email address.' };
  }

  // 2. Create the booking
  const { error: insertError } = await adminClient
    .from('bookings')
    .insert({
      user_id: targetProfile.id,
      service_code: data.service_code,
      domain: data.domain || null,
      scheduled_for: new Date(data.scheduled_for).toISOString(),
      meeting_url: data.meeting_url || null,
      status: 'confirmed'
    });

  if (insertError) {
    console.error('Error creating booking:', insertError);
    return { error: 'Failed to create booking' };
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}
