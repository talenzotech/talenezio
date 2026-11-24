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

export async function updateCareerAcceleratorItem(
  id: string,
  source: 'booking' | 'enquiry' | 'payment',
  data: {
    status?: string;
    scheduled_for?: string | null;
    meeting_url?: string | null;
    admin_note?: string | null;
  }
) {
  const user = await getAdminUser();
  if (!user) return { error: 'Unauthorized admin' };

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (source === 'booking') {
    const bookingUpdate: Record<string, any> = {};
    if (data.status) bookingUpdate.status = data.status;
    if (data.scheduled_for !== undefined) bookingUpdate.scheduled_for = data.scheduled_for ? new Date(data.scheduled_for).toISOString() : null;
    if (data.meeting_url !== undefined) bookingUpdate.meeting_url = data.meeting_url || null;

    const { error } = await adminClient.from('bookings').update(bookingUpdate).eq('id', id);
    if (error) {
      console.error('Error updating booking item:', error);
      return { error: 'Failed to update booking' };
    }
  } else if (source === 'enquiry') {
    const { data: enquiry, error: fetchErr } = await adminClient
      .from('service_enquiries')
      .select('message, status, admin_note')
      .eq('id', id)
      .single();

    if (fetchErr) {
      console.error('Error fetching enquiry for update:', fetchErr);
      return { error: 'Enquiry not found' };
    }

    let parsedMessage: Record<string, any> = {};
    if (enquiry?.message) {
      try {
        parsedMessage = JSON.parse(enquiry.message);
      } catch {
        parsedMessage = { raw: enquiry.message };
      }
    }

    if (data.scheduled_for !== undefined) {
      parsedMessage.scheduledFor = data.scheduled_for ? new Date(data.scheduled_for).toISOString() : null;
    }
    if (data.meeting_url !== undefined) {
      parsedMessage.meetingUrl = data.meeting_url || null;
    }
    if (data.status) {
      parsedMessage.status = data.status;
    }

    const validEnquiryStatuses = ['new', 'contacted', 'closed'];
    let enquiryColumnStatus = data.status;
    if (enquiryColumnStatus && !validEnquiryStatuses.includes(enquiryColumnStatus)) {
      if (enquiryColumnStatus === 'confirmed') enquiryColumnStatus = 'contacted';
      else if (enquiryColumnStatus === 'completed' || enquiryColumnStatus === 'cancelled') enquiryColumnStatus = 'closed';
      else enquiryColumnStatus = 'new';
    }

    const enquiryUpdate: Record<string, any> = {
      message: JSON.stringify(parsedMessage),
    };
    if (enquiryColumnStatus) enquiryUpdate.status = enquiryColumnStatus;
    if (data.admin_note !== undefined) enquiryUpdate.admin_note = data.admin_note;

    const { error: updateErr } = await adminClient
      .from('service_enquiries')
      .update(enquiryUpdate)
      .eq('id', id);

    if (updateErr) {
      console.error('Error updating enquiry item:', updateErr);
      return { error: 'Failed to update enquiry' };
    }
  } else if (source === 'payment') {
    const { data: pay, error: payFetchErr } = await adminClient
      .from('payments')
      .select('metadata')
      .eq('id', id)
      .single();

    if (payFetchErr) {
      return { error: 'Payment not found' };
    }

    const metadata = (pay?.metadata && typeof pay.metadata === 'object' ? { ...pay.metadata } : {}) as Record<string, any>;
    const applicant = (metadata.applicant_details && typeof metadata.applicant_details === 'object' ? { ...metadata.applicant_details } : {}) as Record<string, any>;

    if (data.scheduled_for !== undefined) {
      applicant.scheduledFor = data.scheduled_for ? new Date(data.scheduled_for).toISOString() : null;
      applicant.bookingDate = data.scheduled_for || applicant.bookingDate;
    }
    if (data.meeting_url !== undefined) {
      applicant.meetingUrl = data.meeting_url || null;
    }
    if (data.status) {
      applicant.status = data.status;
    }
    if (data.admin_note !== undefined) {
      applicant.adminNote = data.admin_note;
    }
    metadata.applicant_details = applicant;

    const { error: payUpdateErr } = await adminClient
      .from('payments')
      .update({ metadata })
      .eq('id', id);

    if (payUpdateErr) {
      console.error('Error updating payment metadata:', payUpdateErr);
      return { error: 'Failed to update payment record' };
    }
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}
