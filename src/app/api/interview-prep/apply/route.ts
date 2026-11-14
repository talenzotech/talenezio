import { after, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isLocalDemoSession } from '@/lib/auth/local-demo';
import { sendInterviewPrepApplicationEmail } from '@/utils/email';
import {
  INTERVIEW_PREP_BATCHES,
  isValidPhoneNumber,
  isValidResumeFile,
} from '@/lib/interview-prep/batches';

export async function POST(request: Request) {
  const localDemo = await isLocalDemoSession();
  const supabase = localDemo ? null : await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  try {
    const formData = await request.formData();

    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const batch = String(formData.get('batch') || '').trim();
    const domain = String(formData.get('domain') || '').trim();
    const resumeFile = formData.get('resume') as File | null;

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!phone || !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid contact number (at least 10 digits).' },
        { status: 400 }
      );
    }

    if (!batch || !INTERVIEW_PREP_BATCHES.includes(batch as (typeof INTERVIEW_PREP_BATCHES)[number])) {
      return NextResponse.json(
        {
          error: `Please select a valid batch from: ${INTERVIEW_PREP_BATCHES.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    const fileValidation = isValidResumeFile(
      resumeFile ? { name: resumeFile.name, size: resumeFile.size } : null
    );
    if (!fileValidation.valid || !resumeFile) {
      return NextResponse.json({ error: fileValidation.error || 'Please upload your resume.' }, { status: 400 });
    }

    // Convert file to Node Buffer for email attachment & storage
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = (resumeFile.name.split('.').pop() || 'pdf').toLowerCase();

    let resumePath: string | null = null;
    let resumeStorageUrl: string | null = null;

    // Attempt backup upload to Supabase storage if credentials available
    try {
      const admin = createAdminClient();
      const safeName = `${Date.now()}_resume.${fileExt}`;
      const ownerFolder = user?.id || 'guest';
      const storagePath = `interview-prep/${ownerFolder}/${safeName}`;

      const { error: uploadError } = await admin.storage
        .from('unlock_evidence')
        .upload(storagePath, buffer, {
          contentType: resumeFile.type || (fileExt === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
          upsert: true,
        });

      if (!uploadError) {
        resumePath = storagePath;
      }
    } catch (storageErr) {
      console.warn('Notice: resume upload to storage bypassed:', storageErr);
    }

    // Record application in service_enquiries
    try {
      const admin = createAdminClient();
      await admin.from('service_enquiries').insert({
        user_id: user?.id || null,
        service_code: 'interview-prep',
        interest: `Interview Preparation - ${batch}`,
        message: JSON.stringify({
          serviceCode: 'interview-prep',
          serviceTitle: 'Interview Preparation',
          fullName,
          email,
          phone,
          batch,
          domain: domain || 'General',
          resumeFileName: resumeFile.name,
          resumeFileSize: resumeFile.size,
          resumeStoragePath: resumePath,
          appliedAt: new Date().toISOString(),
        }),
      });
    } catch (dbErr) {
      console.warn('Notice: could not record interview prep enquiry in DB:', dbErr);
    }

    after(async () => {
      try {
        if (resumePath) {
          const admin = createAdminClient();
          const { data: signed } = await admin.storage
            .from('unlock_evidence')
            .createSignedUrl(resumePath, 60 * 60 * 24 * 7);
          resumeStorageUrl = signed?.signedUrl || null;
        }
        const emailResult = await sendInterviewPrepApplicationEmail({
          fullName,
          email,
          phone,
          batch,
          domain,
          resumeFileName: resumeFile.name,
          resumeBuffer: buffer,
          resumeStorageUrl,
        });
        if (!emailResult.success) {
          console.error('Interview prep email dispatch error:', emailResult.error);
        }
      } catch (error) {
        console.error('Interview prep notification failed:', error);
      }
    });

    return NextResponse.json({
      success: true,
      message: `Your application for the ${batch} batch has been submitted successfully! Our team will review your resume and details.`,
      batch,
      fullName,
    });
  } catch (error) {
    console.error('Unexpected error in /api/interview-prep/apply:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your application. Please try again.' },
      { status: 500 }
    );
  }
}

