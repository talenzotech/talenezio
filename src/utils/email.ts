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
  if (process.env.MOCK_EMAIL === 'true') {
    return { success: true, data: { id: 'mock-internship-email-id' } };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'taleneziocontact@gmail.com';

  if (!apiKey) {
    console.warn(`Notice: RESEND_API_KEY is not configured. Email to ${recipient} could not be sent.`);
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

  const escapeHtml = (val: string) =>
    val
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const safeTitle = escapeHtml(internshipTitle);
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeCollege = escapeHtml(college && college.trim() ? college : 'Not provided');
  const safeResumeName = escapeHtml(resumeFileName);
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          Talenezio Recruitment
        </span>
        <h2 style="color: #1e3a8a; margin: 0; font-size: 22px; font-weight: 800;">
          New Internship Application: ${safeTitle}
        </h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">
          Talenezio Internship Program
        </p>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Position:</strong></td>
            <td style="padding: 6px 0; color: #1e40af; font-weight: 700;">${safeTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Candidate:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Contact Number:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="tel:${safePhone}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Email Address:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>College / Institute:</strong></td>
            <td style="padding: 6px 0; color: #111827;">${safeCollege}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Resume Attached:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">📎 ${safeResumeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Submitted At:</strong></td>
            <td style="padding: 6px 0; color: #64748b; font-size: 12px;">${submittedAt}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #475569;">
        📎 <strong>Attachment:</strong> The applicant's resume is attached to this email.
        ${resumeStorageUrl ? `<br/><br/>☁️ <strong>Backup Link:</strong> <a href="${resumeStorageUrl}" style="color: #2563eb;">Download from Cloud Storage</a>` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #94a3b8; text-align: center;">
        Talenezio Automated Recruitment • <a href="mailto:${recipient}" style="color: #94a3b8;">${recipient}</a>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: recipient,
      subject,
      text,
      html,
      attachments: [
        {
          filename: resumeFileName,
          content: resumeBuffer,
        },
      ],
    });

    console.log(`Internship application email sent successfully to ${recipient}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending internship application email to ${recipient}:`, error);
    return { success: false, error };
  }
}

export interface SendTrainingApplicationEmailProps {
  programTitle: string;
  fee: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  collegeOrCompany: string;
  age?: number | string;
  batch?: string;
  resumeFileName?: string;
  resumeBuffer?: Buffer;
  resumeStorageUrl?: string | null;
}

export async function sendTrainingApplicationEmail({
  programTitle,
  fee,
  fullName,
  email,
  phone,
  city,
  collegeOrCompany,
  age,
  batch,
  resumeFileName,
  resumeBuffer,
  resumeStorageUrl,
}: SendTrainingApplicationEmailProps) {
  if (process.env.MOCK_EMAIL === 'true') {
    return { success: true, data: { id: 'mock-training-email-id' } };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'taleneziocontact@gmail.com';

  if (!apiKey) {
    console.warn(`Notice: RESEND_API_KEY is not configured. Email to ${recipient} could not be sent.`);
    return { success: false, error: new Error('RESEND_API_KEY is not configured') };
  }

  const resend = new Resend(apiKey);
  const subject = `New Training Program Application: ${programTitle} - ${fullName}`;

  const textLines = [
    '========================================',
    ' TALENEZIO - TRAINING PROGRAM APPLICATION',
    '========================================',
    '',
    `Program: ${programTitle}`,
    `Fee: ${fee}`,
    `Candidate Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `City: ${city}`,
    `College / Company: ${collegeOrCompany}`,
    `Age: ${age || 'Not specified'}`,
    `Selected Batch: ${batch || 'Next Available Batch'}`,
    `Resume Attached: ${resumeFileName || 'None uploaded'}`,
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
  ];

  if (resumeStorageUrl) {
    textLines.push(`Cloud Storage Backup: ${resumeStorageUrl}`, '');
  }

  textLines.push(
    '----------------------------------------',
    resumeBuffer ? "The applicant's resume is attached to this email." : 'No resume was attached with this application.',
    '-- Talenezio Automated Notification'
  );

  const text = textLines.join('\n');

  const escapeHtml = (val: string) =>
    val
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const safeTitle = escapeHtml(programTitle);
  const safeFee = escapeHtml(fee);
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeCity = escapeHtml(city);
  const safeCollege = escapeHtml(collegeOrCompany);
  const safeAge = escapeHtml(String(age || ''));
  const safeBatch = escapeHtml(batch || 'Next Available Batch');
  const safeResumeName = resumeFileName ? escapeHtml(resumeFileName) : '';
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 14px; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #eef2ff; color: #4338ca; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          Talenezio Training Admissions
        </span>
        <h2 style="color: #312e81; margin: 0; font-size: 22px; font-weight: 800;">
          New Training Program Application: ${safeTitle}
        </h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">
          Talenezio Professional Training Cohort
        </p>
      </div>

      <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Program:</strong></td>
            <td style="padding: 6px 0; color: #4338ca; font-weight: 700; font-size: 15px;">${safeTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Program Fee:</strong></td>
            <td style="padding: 6px 0; color: #059669; font-weight: 700;">${safeFee}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Selected Batch:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeBatch}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Candidate:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Contact Number:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="tel:${safePhone}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Email Address:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="mailto:${safeEmail}" style="color: #4f46e5; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>City:</strong></td>
            <td style="padding: 6px 0; color: #111827;">${safeCity}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>College / Company:</strong></td>
            <td style="padding: 6px 0; color: #111827;">${safeCollege}</td>
          </tr>
          ${safeAge ? `<tr><td style="padding: 6px 0; color: #6b7280;"><strong>Age:</strong></td><td style="padding: 6px 0; color: #111827;">${safeAge}</td></tr>` : ''}
          ${safeResumeName ? `<tr><td style="padding: 6px 0; color: #6b7280;"><strong>Resume Attached:</strong></td><td style="padding: 6px 0; color: #111827; font-weight: 600;">📎 ${safeResumeName}</td></tr>` : ''}
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Submitted At:</strong></td>
            <td style="padding: 6px 0; color: #6b7280; font-size: 12px;">${submittedAt}</td>
          </tr>
        </table>
      </div>

      ${resumeBuffer ? `
      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #475569;">
        📎 <strong>Attachment:</strong> The applicant's resume is attached to this email.
        ${resumeStorageUrl ? `<br/><br/>☁️ <strong>Backup Link:</strong> <a href="${resumeStorageUrl}" style="color: #4f46e5;">Download from Cloud Storage</a>` : ''}
      </div>` : ''}

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #94a3b8; text-align: center;">
        Talenezio Automated Admissions • <a href="mailto:${recipient}" style="color: #94a3b8;">${recipient}</a>
      </div>
    </div>
  `;

  const attachments = resumeBuffer && resumeFileName ? [{ filename: resumeFileName, content: resumeBuffer }] : undefined;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: recipient,
      subject,
      text,
      html,
      attachments,
    });

    console.log(`Training application email sent successfully to ${recipient}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending training application email to ${recipient}:`, error);
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
  selectedBookingDate?: string;
  linkedinUrl?: string;
  price?: string;
}

export interface SendCareerGuidanceBookingEmailProps {
  fullName: string;
  email: string;
  phone: string;
  selectedBookingDate: string;
  careerDetails: string;
  areaOfInterest: string;
  price?: string;
}

export interface SendLinkedInOptimizationEmailProps {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  careerDetails: string;
  areaOfInterest: string;
  price?: string;
}

const escapeHtml = (val: string) =>
  (val || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export async function sendCareerGuidanceBookingEmail({
  fullName,
  email,
  phone,
  selectedBookingDate,
  careerDetails,
  areaOfInterest,
  price = '₹199',
}: SendCareerGuidanceBookingEmailProps) {
  if (process.env.MOCK_EMAIL === 'true') {
    return { success: true, data: { id: 'mock-career-guidance-email-id' } };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'taleneziocontact@gmail.com';

  if (!apiKey) {
    console.warn(`Notice: RESEND_API_KEY is not configured. Email to ${recipient} could not be sent.`);
    return { success: false, error: new Error('RESEND_API_KEY is not configured') };
  }

  const resend = new Resend(apiKey);
  const subject = `New Career Guidance (1:1) Booking: ${fullName} - ${selectedBookingDate}`;

  const textLines = [
    '========================================',
    ' TALENEZIO - NEW 1-ON-1 GUIDANCE BOOKING',
    '========================================',
    '',
    'Service: Career Guidance (1-on-1 Strategy & Resume Review)',
    `Session Fee: ${price}`,
    `Candidate Name: ${fullName}`,
    `Contact Number: ${phone}`,
    `Email: ${email && email.trim() ? email : 'Not provided'}`,
    `Selected Booking Date & Time: ${selectedBookingDate}`,
    `Area of Interest: ${areaOfInterest}`,
    `Career Details / Background: ${careerDetails}`,
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
    '----------------------------------------',
    'Booking submitted via Talenezio Career Guidance.',
    '-- Talenezio Automated Notification',
  ];

  const text = textLines.join('\n');

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email || 'Not provided');
  const safePhone = escapeHtml(phone);
  const safeDate = escapeHtml(selectedBookingDate);
  const safeArea = escapeHtml(areaOfInterest);
  const safeCareer = escapeHtml(careerDetails);
  const safePrice = escapeHtml(price);
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          Talenezio 1-on-1 Mentorship
        </span>
        <h2 style="color: #065f46; margin: 0; font-size: 22px; font-weight: 800;">
          New Career Guidance (1:1) Booking
        </h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">
          Strategy Session & Live Resume Review
        </p>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 150px;"><strong>Service:</strong></td>
            <td style="padding: 6px 0; color: #065f46; font-weight: 700;">Career Guidance (1:1)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Session Fee:</strong></td>
            <td style="padding: 6px 0; color: #047857; font-weight: 700;">${safePrice}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Candidate:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Contact Number:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="tel:${safePhone}" style="color: #059669; text-decoration: none; font-weight: 700;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Email Address:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="mailto:${safeEmail}" style="color: #059669; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr style="background-color: #dcfce7;">
            <td style="padding: 8px 6px; color: #14532d;"><strong>📅 Selected Booking Date:</strong></td>
            <td style="padding: 8px 6px; color: #14532d; font-weight: 800; font-size: 15px;">${safeDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Area of Interest:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeArea}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; vertical-align: top;"><strong>Career Details:</strong></td>
            <td style="padding: 6px 0; color: #374151; white-space: pre-wrap;">${safeCareer}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Submitted At:</strong></td>
            <td style="padding: 6px 0; color: #6b7280; font-size: 12px;">${submittedAt}</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 12px; color: #9ca3af; text-align: center;">
        Talenezio Automated Bookings Notification • <a href="mailto:${recipient}" style="color: #9ca3af;">${recipient}</a>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: recipient,
      subject,
      text,
      html,
    });

    console.log(`Career Guidance booking email sent successfully to ${recipient}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending Career Guidance booking email to ${recipient}:`, error);
    return { success: false, error };
  }
}

export async function sendLinkedInOptimizationEmail({
  fullName,
  email,
  phone,
  linkedinUrl,
  careerDetails,
  areaOfInterest,
  price = '₹499',
}: SendLinkedInOptimizationEmailProps) {
  if (process.env.MOCK_EMAIL === 'true') {
    return { success: true, data: { id: 'mock-linkedin-optimization-email-id' } };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'taleneziocontact@gmail.com';

  if (!apiKey) {
    console.warn(`Notice: RESEND_API_KEY is not configured. Email to ${recipient} could not be sent.`);
    return { success: false, error: new Error('RESEND_API_KEY is not configured') };
  }

  const resend = new Resend(apiKey);
  const subject = `New LinkedIn Optimization Registration: ${fullName}`;

  const textLines = [
    '========================================',
    ' TALENEZIO - LINKEDIN OPTIMIZATION REGISTRATION',
    '========================================',
    '',
    'Service: LinkedIn Optimization (Profile Boost & Content)',
    `Package Fee: ${price}`,
    `Candidate Name: ${fullName}`,
    `Contact Number: ${phone}`,
    `Email: ${email && email.trim() ? email : 'Not provided'}`,
    `LinkedIn Profile URL: ${linkedinUrl}`,
    `Target Area / Domain: ${areaOfInterest}`,
    `Current Career Details: ${careerDetails}`,
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
    '----------------------------------------',
    'Registration submitted via Talenezio LinkedIn Optimization.',
    '-- Talenezio Automated Notification',
  ];

  const text = textLines.join('\n');

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email || 'Not provided');
  const safePhone = escapeHtml(phone);
  const safeLinkedin = escapeHtml(linkedinUrl);
  const safeArea = escapeHtml(areaOfInterest);
  const safeCareer = escapeHtml(careerDetails);
  const safePrice = escapeHtml(price);
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="border-bottom: 2px solid #0284c7; padding-bottom: 14px; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #f0f9ff; color: #0369a1; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          Talenezio Branding Accelerators
        </span>
        <h2 style="color: #075985; margin: 0; font-size: 22px; font-weight: 800;">
          New LinkedIn Optimization Registration
        </h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">
          Executive Branding, Custom Banner & 30-Day Content Strategy
        </p>
      </div>

      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 150px;"><strong>Service:</strong></td>
            <td style="padding: 6px 0; color: #0284c7; font-weight: 700;">LinkedIn Optimization</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Package Fee:</strong></td>
            <td style="padding: 6px 0; color: #0369a1; font-weight: 700;">${safePrice}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Candidate:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Contact Number:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="tel:${safePhone}" style="color: #0284c7; text-decoration: none; font-weight: 700;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Email Address:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr style="background-color: #e0f2fe;">
            <td style="padding: 8px 6px; color: #0c4a6e;"><strong>🔗 LinkedIn Profile:</strong></td>
            <td style="padding: 8px 6px; color: #0369a1; font-weight: 700; word-break: break-all;">
              <a href="${safeLinkedin}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">
                ${safeLinkedin}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Target Domain:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeArea}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280; vertical-align: top;"><strong>Career Details:</strong></td>
            <td style="padding: 6px 0; color: #374151; white-space: pre-wrap;">${safeCareer}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Submitted At:</strong></td>
            <td style="padding: 6px 0; color: #6b7280; font-size: 12px;">${submittedAt}</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 12px; color: #9ca3af; text-align: center;">
        Talenezio Automated Registrations • <a href="mailto:${recipient}" style="color: #9ca3af;">${recipient}</a>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: recipient,
      subject,
      text,
      html,
    });

    console.log(`LinkedIn Optimization email sent successfully to ${recipient}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending LinkedIn Optimization email to ${recipient}:`, error);
    return { success: false, error };
  }
}

export async function sendCareerServiceRegistrationEmail({
  serviceName,
  fullName,
  careerDetails,
  areaOfInterest,
  email,
  phone,
  selectedBookingDate,
  linkedinUrl,
  price,
}: SendCareerServiceRegistrationEmailProps) {
  // If this is specifically Career Guidance with a booking date
  if (serviceName.toLowerCase().includes('guidance') || selectedBookingDate) {
    return sendCareerGuidanceBookingEmail({
      fullName,
      email: email || '',
      phone: phone || '',
      selectedBookingDate: selectedBookingDate || 'Not specified',
      careerDetails,
      areaOfInterest,
      price: price || '₹199',
    });
  }

  // If this is specifically LinkedIn Optimization
  if (serviceName.toLowerCase().includes('linkedin') || linkedinUrl) {
    return sendLinkedInOptimizationEmail({
      fullName,
      email: email || '',
      phone: phone || '',
      linkedinUrl: linkedinUrl || 'Not provided',
      careerDetails,
      areaOfInterest,
      price: price || '₹499',
    });
  }

  // Fallback for general career service
  if (process.env.MOCK_EMAIL === 'true') {
    return { success: true, data: { id: 'mock-career-general-email-id' } };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'taleneziocontact@gmail.com';

  if (!apiKey) {
    console.warn(`Notice: RESEND_API_KEY is not configured. Email to ${recipient} could not be sent.`);
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
    `Contact Number: ${phone || 'Not provided'}`,
    `Email: ${email && email.trim() ? email : 'Not provided'}`,
    `Career Details: ${careerDetails}`,
    `Area of Interest: ${areaOfInterest}`,
  ];

  if (selectedBookingDate) {
    textLines.push(`Booking Date: ${selectedBookingDate}`);
  }

  if (linkedinUrl) {
    textLines.push(`LinkedIn URL: ${linkedinUrl}`);
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
      to: recipient,
      subject,
      text,
    });

    console.log(`Career service registration email sent successfully to ${recipient} for ${serviceName}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending career service registration email to ${recipient} for ${serviceName}:`, error);
    return { success: false, error };
  }
}

export interface SendInterviewPrepApplicationEmailProps {
  fullName: string;
  email: string;
  phone: string;
  batch: string;
  domain?: string;
  resumeFileName: string;
  resumeBuffer: Buffer;
  resumeStorageUrl?: string | null;
}

export async function sendInterviewPrepApplicationEmail({
  fullName,
  email,
  phone,
  batch,
  domain,
  resumeFileName,
  resumeBuffer,
  resumeStorageUrl,
}: SendInterviewPrepApplicationEmailProps) {
  if (process.env.MOCK_EMAIL === 'true') {
    return { success: true, data: { id: 'mock-interview-prep-email-id' } };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'taleneziocontact@gmail.com';

  if (!apiKey) {
    console.warn(`Notice: RESEND_API_KEY is not configured. Email to ${recipient} could not be sent.`);
    return { success: false, error: new Error('RESEND_API_KEY is not configured') };
  }

  const resend = new Resend(apiKey);
  const subject = `New Interview Preparation Application: ${fullName} - ${batch}`;

  const textLines = [
    '==================================================',
    ' TALENEZIO - INTERVIEW PREPARATION APPLICATION   ',
    '==================================================',
    '',
    `Applicant Name: ${fullName}`,
    `Email: ${email}`,
    `Contact Number: ${phone}`,
    `Selected Batch: ${batch}`,
    `Domain / Track: ${domain && domain.trim() ? domain : 'Not specified'}`,
    `Resume Attached: ${resumeFileName}`,
    `Submitted At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '',
  ];

  if (resumeStorageUrl) {
    textLines.push(`Storage Backup: ${resumeStorageUrl}`, '');
  }

  textLines.push(
    '--------------------------------------------------',
    "The applicant's resume is attached to this email.",
    '-- Talenezio Automated Notification'
  );

  const text = textLines.join('\n');

  const escapeHtml = (val: string) =>
    val
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeBatch = escapeHtml(batch);
  const safeDomain = escapeHtml(domain && domain.trim() ? domain : 'Not specified');
  const safeResumeName = escapeHtml(resumeFileName);
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="border-bottom: 2px solid #9333ea; padding-bottom: 14px; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #f3e8ff; color: #7e22ce; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">
          Talenezio Admissions
        </span>
        <h2 style="color: #581c87; margin: 0; font-size: 22px; font-weight: 800;">
          New Interview Preparation Application
        </h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">
          8-Day Intensive Cohort Program
        </p>
      </div>

      <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #6b7280; width: 140px;"><strong>Selected Batch:</strong></td>
            <td style="padding: 6px 0; color: #6b21a8; font-weight: 700; font-size: 15px;">${safeBatch}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Applicant Name:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Contact Number:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="tel:${safePhone}" style="color: #9333ea; text-decoration: none; font-weight: 600;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Email Address:</strong></td>
            <td style="padding: 6px 0; color: #111827;"><a href="mailto:${safeEmail}" style="color: #9333ea; text-decoration: none;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Target Track:</strong></td>
            <td style="padding: 6px 0; color: #111827;">${safeDomain}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Resume Attached:</strong></td>
            <td style="padding: 6px 0; color: #111827; font-weight: 600;">📎 ${safeResumeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6b7280;"><strong>Submitted At:</strong></td>
            <td style="padding: 6px 0; color: #6b7280; font-size: 12px;">${submittedAt}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #4b5563;">
        📎 <strong>Attachment:</strong> The applicant's original resume file is attached to this email as a document.
        ${resumeStorageUrl ? `<br/><br/>☁️ <strong>Backup Link:</strong> <a href="${resumeStorageUrl}" style="color: #9333ea;">Download from Cloud Storage</a>` : ''}
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 12px; color: #9ca3af; text-align: center;">
        Talenezio Automated Admissions Notification • <a href="mailto:taleneziocontact@gmail.com" style="color: #9ca3af;">taleneziocontact@gmail.com</a>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Talenezio <onboarding@resend.dev>',
      to: recipient,
      subject,
      text,
      html,
      attachments: [
        {
          filename: resumeFileName,
          content: resumeBuffer,
        },
      ],
    });

    console.log(`Interview preparation email sent successfully to ${recipient}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`Error sending interview preparation email to ${recipient}:`, error);
    return { success: false, error };
  }
}
