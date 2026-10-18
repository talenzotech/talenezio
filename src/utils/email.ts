import { Resend } from 'resend';

interface SendUnlockEmailProps {
  to: string;
  name: string;
  status: 'approved' | 'rejected';
  note?: string;
}

export async function sendUnlockStatusEmail({ to, name, status, note }: SendUnlockEmailProps) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: new Error('RESEND_API_KEY is not configured') };

  const escapeHtml = (value: string) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  const safeName = escapeHtml(name);
  const safeNote = note ? escapeHtml(note) : '';
  const resend = new Resend(apiKey);
  const isApproved = status === 'approved';
  const subject = isApproved 
    ? 'Congratulations! Your Talenezio Free Unlock is Approved 🎉'
    : 'Update on your Talenezio Free Unlock Request';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: ${isApproved ? '#22c55e' : '#eab308'};">
        ${isApproved ? 'Free Unlock Approved!' : 'Submission Update'}
      </h2>
       <p>Hi ${safeName},</p>
      
      ${isApproved ? `
        <p>Great news! Your screenshots have been reviewed and approved. You now have full free access to Talenezio.</p>
        <p>Log in now to start exploring all features.</p>
      ` : `
        <p>We have reviewed your recent submission for the Free Unlock Program.</p>
        <p>Unfortunately, we could not approve it at this time.</p>
         ${safeNote ? `<div style="background: #f3f4f6; padding: 12px; border-left: 4px solid #eab308; margin: 16px 0;"><strong>Reviewer Note:</strong><br/>${safeNote}</div>` : ''}
        <p>Please feel free to submit again with the correct screenshots.</p>
      `}
      
      <p>Best regards,<br/>The Talenezio Team</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <no-reply@talenezio.app>',
      to,
      subject,
      html,
    });
    
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
