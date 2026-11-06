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
