import { after, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isLocalDemoSession } from '@/lib/auth/local-demo';
import { sendTrainingApplicationEmail } from '@/utils/email';
import { isValidResumeFile } from '@/lib/interview-prep/batches';
import { validateFullName, validatePhoneNumber } from '@/lib/validation/form-fields';

export async function POST(request: Request) {
  const localDemo = await isLocalDemoSession();
  const supabase = localDemo ? null : await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  try {
    const formData = await request.formData();

    const programTitle = String(formData.get('programTitle') || '').trim();
    const productCode = String(formData.get('productCode') || '').trim();
    const fee = String(formData.get('fee') || '').trim();
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const city = String(formData.get('city') || '').trim();
    const collegeOrCompany = String(formData.get('collegeOrCompany') || '').trim();
    const batch = String(formData.get('batch') || '').trim();
    const rawAge = formData.get('age');
    const parsedAge = rawAge ? parseInt(String(rawAge), 10) : undefined;
    const resumeFile = formData.get('resume') as File | null;

    if (!programTitle) {
      return NextResponse.json({ error: 'Program title is required.' }, { status: 400 });
    }

    const nameValidation = validateFullName(fullName, { minLength: 2, maxLength: 50, fieldName: 'Full name' });
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error || 'Please enter your full name (at least 2 characters).' }, { status: 400 });
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const phoneValidation = validatePhoneNumber(phone, { fieldName: 'Contact number' });
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Please enter a valid contact number (at least 10 digits).' },
        { status: 400 }
      );
    }

    if (!city || city.length < 2) {
      return NextResponse.json({ error: 'Please enter your city.' }, { status: 400 });
    }

    if (!collegeOrCompany) {
      return NextResponse.json({ error: 'Please enter your College Name or Company Name.' }, { status: 400 });
    }

    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 15 || parsedAge > 90)) {
      return NextResponse.json({ error: 'Please enter a valid age between 15 and 90.' }, { status: 400 });
    }

    let buffer: Buffer | undefined;
    let resumeFileName: string | undefined;
    let resumePath: string | null = null;
    let resumeStorageUrl: string | null = null;

    if (resumeFile && typeof resumeFile === 'object' && resumeFile.size > 0) {
      const validation = isValidResumeFile({ name: resumeFile.name, size: resumeFile.size });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      resumeFileName = resumeFile.name;
      const arrayBuffer = await resumeFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      const fileExt = (resumeFile.name.split('.').pop() || 'pdf').toLowerCase();

      try {
        const admin = createAdminClient();
        const safeName = `${Date.now()}_resume.${fileExt}`;
        const ownerFolder = user?.id || 'guest';
        const storagePath = `training/${ownerFolder}/${safeName}`;

        const { error: uploadError } = await admin.storage
          .from('unlock_evidence')
          .upload(storagePath, buffer, {
            contentType: resumeFile.type || 'application/pdf',
            upsert: true,
          });

        if (!uploadError) {
          resumePath = storagePath;
        }
      } catch (storageErr) {
        console.warn('Notice: resume upload to storage bypassed:', storageErr);
      }
    }

    // Record application in service_enquiries
    let enquiryId: string | undefined;
    try {
      const admin = createAdminClient();
      const { data: insertedEnquiry } = await admin.from('service_enquiries').insert({
        user_id: user?.id || null,
        service_code: 'courses',
        interest: `${programTitle} - ${batch || 'Upcoming Cohort'}`,
        message: JSON.stringify({
          type: 'training_application',
          productCode: productCode || 'training:graphic-designing',
          programTitle,
          fee: fee || '₹4,999 / month',
          fullName: nameValidation.normalized || fullName,
          email,
          phone: phoneValidation.normalized || phone,
          city,
          collegeOrCompany,
          age: parsedAge,
          batch: batch || 'Upcoming Cohort',
          resumeFileName: resumeFileName || null,
          resumeStoragePath: resumePath,
          paymentStatus: 'pending',
          appliedAt: new Date().toISOString(),
        }),
      }).select('id').single();
      enquiryId = insertedEnquiry?.id;
    } catch (dbErr) {
      console.warn('Notice: could not record training enquiry in DB:', dbErr);
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
        const emailResult = await sendTrainingApplicationEmail({
          programTitle,
          fee: fee || '₹4,999 / month',
          fullName: nameValidation.normalized || fullName,
          email,
          phone: phoneValidation.normalized || phone,
          city,
          collegeOrCompany,
          age: parsedAge,
          batch: batch || 'Upcoming Cohort',
          resumeFileName,
          resumeBuffer: buffer,
          resumeStorageUrl,
        });
        if (!emailResult.success) {
          console.error('Training application email delivery error:', emailResult.error);
        }
      } catch (error) {
        console.error('Training application notification failed:', error);
      }
    });

    return NextResponse.json({
      success: true,
      enquiryId,
      programTitle,
      productCode: productCode || 'training:graphic-designing',
      fee: fee || '₹4,999 / month',
      fullName,
      email,
      phone,
      message: `Your application for ${programTitle} has been submitted successfully!`,
    });
  } catch (error) {
    console.error('Unexpected error in /api/training/apply:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your application. Please try again.' },
      { status: 500 }
    );
  }
}

