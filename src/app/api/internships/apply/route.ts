import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isLocalDemoSession } from '@/lib/auth/local-demo'

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

    let resumePath: string | null = null

    // Attempt upload to Supabase storage if not local demo
    if (user) {
      try {
        const admin = createAdminClient()
        const fileExt = resumeFile.name.split('.').pop() || 'pdf'
        const safeName = `${Date.now()}_resume.${fileExt}`
        const storagePath = `internships/${user.id}/${safeName}`

        const arrayBuffer = await resumeFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Try upload to unlock_evidence bucket (which exists in migrations)
        const { error: uploadError } = await admin.storage
          .from('unlock_evidence')
          .upload(storagePath, buffer, {
            contentType: resumeFile.type || 'application/pdf',
            upsert: true,
          })

        if (!uploadError) {
          resumePath = storagePath
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

