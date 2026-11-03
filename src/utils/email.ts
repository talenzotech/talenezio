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

export interface SendInternshipApplicationEmailProps {
  internshipTitle: string;
  fullName: string;
  email: string;
  phone: string;
  college?: string;
  resumeFileName: string;
  resumeBuffer: Buffer;
  resumeStorageUrl?: string | null;
}

export async function sendInternshipApplicationEmail({
  internshipTitle,
  fullName,
  email,
  phone,
  college,
  resumeFileName,
  resumeBuffer,
  resumeStorageUrl,
}: SendInternshipApplicationEmailProps) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Notice: RESEND_API_KEY is not configured. Email to taleneziocontact@gmail.com could not be sent.');
    return { success: false, error: new Error('RESEND_API_KEY is not configured') };
  }

  const resend = new Resend(apiKey);
  const subject = `New Internship Application: ${internshipTitle} - ${fullName}`;

  const textLines = [
    '========================================',
    ' TALENEZIO - NEW INTERNSHIP APPLICATION ',
    '========================================',
    '',
    `Position: ${internshipTitle}`,
    `Candidate Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `College / Institute: ${college && college.trim() ? college : 'Not provided'}`,
    `Resume Attached: ${resumeFileName}`,
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
  ];

  if (resumeStorageUrl) {
    textLines.push(`Cloud Storage Backup: ${resumeStorageUrl}`, '');
  }

  textLines.push(
    '----------------------------------------',
    "The candidate's resume is attached to this email.",
    '-- Talenezio Automated Notification'
  );

  const text = textLines.join('\n');

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: 'taleneziocontact@gmail.com',
      subject,
      text,
      attachments: [
        {
          filename: resumeFileName,
          content: resumeBuffer,
        },
      ],
    });

    console.log('Internship application email sent successfully to taleneziocontact@gmail.com:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending internship application email to taleneziocontact@gmail.com:', error);
    return { success: false, error };
  }
}

export interface SendCareerServiceRegistrationEmailProps {
  serviceName: string;
  fullName: string;
  careerDetails: string;
  areaOfInterest: string;
  email?: string;
  phone?: string;
}

export async function sendCareerServiceRegistrationEmail({
  serviceName,
  fullName,
  careerDetails,
  areaOfInterest,
  email,
  phone,
}: SendCareerServiceRegistrationEmailProps) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Notice: RESEND_API_KEY is not configured. Email to taleneziocontact@gmail.com could not be sent.');
    return { success: false, error: new Error('RESEND_API_KEY is not configured') };
  }

  const resend = new Resend(apiKey);
  const subject = `New Career Service Registration: ${serviceName} - ${fullName}`;

  const textLines = [
    '========================================',
    ' TALENEZIO - NEW CAREER REGISTRATION ',
    '========================================',
    '',
    `Service Selected: ${serviceName}`,
    `Full Name: ${fullName}`,
    `Career Details: ${careerDetails}`,
    `Area of Interest: ${areaOfInterest}`,
    `Email: ${email && email.trim() ? email : 'Not provided'}`,
  ];

  if (phone && phone.trim()) {
    textLines.push(`Phone: ${phone}`);
  }

  textLines.push(
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
    '----------------------------------------',
    'Registration submitted via Talenezio Career Services.',
    '-- Talenezio Automated Notification'
  );

  const text = textLines.join('\n');

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: 'taleneziocontact@gmail.com',
      subject,
      text,
    });

    console.log(`Career service registration email sent successfully to taleneziocontact@gmail.com for ${serviceName}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending career service registration email to taleneziocontact@gmail.com for ${serviceName}:`, error);
    return { success: false, error };
  }
}
