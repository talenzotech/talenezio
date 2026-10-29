import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isLocalDemoSession } from '@/lib/auth/local-demo'
import { sendInternshipApplicationEmail } from '@/utils/email'

export async function POST(request: Request) {
  const localDemo = await isLocalDemoSession()
  const supabase = localDemo ? null : await createClient()
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  if (!user && !localDemo) {
    return NextResponse.json({ error: 'Authentication required. Please sign in to apply.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()

    const internshipId = String(formData.get('internshipId') || '').trim()
    const internshipTitle = String(formData.get('internshipTitle') || '').trim()
    const fullName = String(formData.get('fullName') || '').trim()
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const phone = String(formData.get('phone') || '').trim()
    const college = String(formData.get('college') || '').trim()
    const resumeFile = formData.get('resume') as File | null

    if (!internshipId || !internshipTitle) {
      return NextResponse.json({ error: 'Internship role is required.' }, { status: 400 })
    }

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    if (!phone || phone.length < 7) {
      return NextResponse.json({ error: 'A valid phone number is required.' }, { status: 400 })
    }

    if (!resumeFile || typeof resumeFile === 'string' || resumeFile.size === 0) {
      return NextResponse.json({ error: 'Please upload your resume (PDF, DOC, or DOCX up to 5MB).' }, { status: 400 })
    }

    // Validate resume file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (resumeFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Resume file size exceeds the 5MB limit.' }, { status: 400 })
    }

    // Validate resume file extension
    const allowedExts = ['pdf', 'doc', 'docx']
    const fileExt = (resumeFile.name.split('.').pop() || '').toLowerCase()
    if (!allowedExts.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Please upload a valid resume in PDF, DOC, or DOCX format.' },
        { status: 400 }
      )
    }

    // Convert file to Node Buffer for storage & email attachment
    const arrayBuffer = await resumeFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let resumePath: string | null = null
    let resumeStorageUrl: string | null = null

    // Attempt upload to Supabase storage if authenticated
    if (user) {
      try {
        const admin = createAdminClient()
        const safeName = `${Date.now()}_resume.${fileExt}`
        const storagePath = `internships/${user.id}/${safeName}`

        const { error: uploadError } = await admin.storage
          .from('unlock_evidence')
          .upload(storagePath, buffer, {
            contentType: resumeFile.type || 'application/pdf',
            upsert: true,
          })

        if (!uploadError) {
          resumePath = storagePath
          // Generate a 7-day signed link for convenience
          const { data: signed } = await admin.storage
            .from('unlock_evidence')
            .createSignedUrl(storagePath, 60 * 60 * 24 * 7)
          resumeStorageUrl = signed?.signedUrl || null
        } else {
          console.warn('Notice: resume upload to unlock_evidence bucket returned:', uploadError.message)
        }
      } catch (storageErr) {
        console.warn('Storage upload notice (falling back to record submission):', storageErr)
      }

      // Record application in service_enquiries
      try {
        const admin = createAdminClient()
        await admin.from('service_enquiries').insert({
          user_id: user.id,
          service_code: 'internships',
          interest: internshipTitle,
          message: JSON.stringify({
            internshipId,
            internshipTitle,
            fullName,
            email,
            phone,
            college,
            resumeFileName: resumeFile.name,
            resumeFileSize: resumeFile.size,
            resumeStoragePath: resumePath,
            appliedAt: new Date().toISOString(),
          }),
        })
      } catch (dbErr) {
        console.error('Error inserting internship enquiry into DB:', dbErr)
      }
    }

    // Dispatch email with complete application details and uploaded resume attachment
    try {
      await sendInternshipApplicationEmail({
        internshipTitle,
        fullName,
        email,
        phone,
        college,
        resumeFileName: resumeFile.name,
        resumeBuffer: buffer,
        resumeStorageUrl,
      })
    } catch (emailErr) {
      // Non-fatal error so application is still successfully recorded even if email service has limits
      console.error('Notice: error sending internship application notification email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! Our team will review your resume and reach out to you.',
    })
  } catch (error) {
    console.error('Unexpected error in internship apply route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your application. Please try again.' },
      { status: 500 }
    )
  }
}
