'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Clock, GraduationCap, Loader2, MessageCircle, Upload, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getSubmissionStatus, submitUnlockRequest, type UnlockFeature } from './actions'

const REQUIRED_SCREENSHOTS = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type SubmissionStatus = 'idle' | 'pending' | 'approved' | 'rejected'
type EvidenceGroup = 'paid_screenshots' | 'linkedin_post' | 'friend_shares' | 'group_shares'
type EvidenceFiles = Record<EvidenceGroup, File[]>
type EvidencePreviews = Record<EvidenceGroup, string[]>
type SubmissionInfo = {
  status: SubmissionStatus
  reviewer_note: string | null
  created_at: string
  feature_code: UnlockFeature | 'general_access'
  contact_email: string | null
  whatsapp_phone: string | null
}

const featureLabels: Record<UnlockFeature, string> = {
  skill_test_pro: 'Paid Skill Test',
  linkedin_optimization: 'LinkedIn Optimization',
}

const initialFiles: EvidenceFiles = {
  paid_screenshots: [],
  linkedin_post: [],
  friend_shares: [],
  group_shares: [],
}
const initialPreviews: EvidencePreviews = {
  paid_screenshots: [],
  linkedin_post: [],
  friend_shares: [],
  group_shares: [],
}

const linkedInEvidenceGroups: { id: EvidenceGroup; label: string; count: number }[] = [
  { id: 'linkedin_post', label: 'LinkedIn post', count: 1 },
  { id: 'friend_shares', label: 'WhatsApp chats with friends', count: 5 },
  { id: 'group_shares', label: 'Student WhatsApp group shares', count: 2 },
]

export default function UnlockProgramClient({
  initialFeature,
  showRequestForm,
}: {
  initialFeature: UnlockFeature
  showRequestForm: boolean
}) {
  const [files, setFiles] = useState<EvidenceFiles>(initialFiles)
  const [previews, setPreviews] = useState<EvidencePreviews>(initialPreviews)
  const [featureCode, setFeatureCode] = useState<UnlockFeature>(initialFeature)
  const [contactEmail, setContactEmail] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [submission, setSubmission] = useState<SubmissionInfo | null>(null)
  const [loadedFeature, setLoadedFeature] = useState<UnlockFeature | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRefs = useRef<Partial<Record<EvidenceGroup, HTMLInputElement | null>>>({})
  const previewUrls = useRef<string[]>([])
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const isLoadingStatus = loadedFeature !== featureCode
  const isRequestFormVisible = showRequestForm

  useEffect(() => () => previewUrls.current.forEach(URL.revokeObjectURL), [])

  useEffect(() => {
    let cancelled = false
    async function loadStatus() {
      try {
        const [data, authResult] = await Promise.all([
          getSubmissionStatus(featureCode),
          supabase.auth.getUser(),
        ])
        if (cancelled) return
        const info = data as SubmissionInfo | null
        setSubmission(info)
        if (info?.contact_email) setContactEmail(info.contact_email)
        else if (authResult.data.user?.email) setContactEmail(authResult.data.user.email)
        if (info?.whatsapp_phone) setWhatsappPhone(info.whatsapp_phone)
        setLoadedFeature(featureCode)
      } catch (statusError) {
        if (!cancelled) {
          setError(statusError instanceof Error ? statusError.message : 'Could not load your request status.')
          setLoadedFeature(featureCode)
        }
      }
    }
    void loadStatus()
    return () => { cancelled = true }
  }, [featureCode, supabase])

  const selectedFiles = featureCode === 'linkedin_optimization'
    ? [...files.linkedin_post, ...files.friend_shares, ...files.group_shares]
    : files.paid_screenshots

  const getGroupLimit = (group: EvidenceGroup) => {
    if (group === 'linkedin_post') return 1
    if (group === 'friend_shares') return 5
    if (group === 'group_shares') return 2
    return REQUIRED_SCREENSHOTS
  }

  const handleFileChange = (group: EvidenceGroup, event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selected.some(file => !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE)) {
      setError('Upload PNG, JPG, or WEBP images no larger than 5MB each.')
      return
    }

    const availableSlots = getGroupLimit(group) - files[group].length
    const accepted = selected.slice(0, availableSlots)
    const newPreviews = accepted.map(file => URL.createObjectURL(file))
    previewUrls.current.push(...newPreviews)
    setFiles(current => ({ ...current, [group]: [...current[group], ...accepted] }))
    setPreviews(current => ({ ...current, [group]: [...current[group], ...newPreviews] }))
    setError(null)
  }

  const removeFile = (group: EvidenceGroup, index: number) => {
    const preview = previews[group][index]
    if (preview) URL.revokeObjectURL(preview)
    previewUrls.current = previewUrls.current.filter(url => url !== preview)
    setFiles(current => ({ ...current, [group]: current[group].filter((_, fileIndex) => fileIndex !== index) }))
    setPreviews(current => ({ ...current, [group]: current[group].filter((_, fileIndex) => fileIndex !== index) }))
  }

  const selectFeature = (feature: UnlockFeature) => {
    setFeatureCode(feature)
    setError(null)
    router.replace(`/unlock-program?feature=${feature}`)
  }

  const getFilesInUploadOrder = () => featureCode === 'linkedin_optimization'
    ? [...files.linkedin_post, ...files.friend_shares, ...files.group_shares]
    : files.paid_screenshots

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submissionFiles = getFilesInUploadOrder()
    if (submissionFiles.length !== REQUIRED_SCREENSHOTS) {
      setError(`Please upload exactly ${REQUIRED_SCREENSHOTS} screenshots, including all required evidence types.`)
      return
    }
    if (featureCode === 'linkedin_optimization'
      && (files.linkedin_post.length !== 1 || files.friend_shares.length !== 5 || files.group_shares.length !== 2)) {
      setError('LinkedIn Optimization proof must include 1 LinkedIn post, 5 friend chats, and 2 group shares.')
      return
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(contactEmail.trim())) {
      setError('Enter a valid contact email address.')
      return
    }
    const phoneDigits = whatsappPhone.replace(/\D/g, '')
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setError('Enter a valid WhatsApp number with 8 to 15 digits.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setUploadProgress(0)
    const uploadedPaths: string[] = []
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/unlock-program?feature=${featureCode}&request=1`)}`)
        return
      }

      for (const [index, file] of submissionFiles.entries()) {
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('unlock_evidence').upload(path, file, {
          contentType: file.type,
          upsert: false,
        })
        if (uploadError) throw new Error(`Screenshot ${index + 1} could not be uploaded: ${uploadError.message}`)
        uploadedPaths.push(path)
        setUploadProgress(uploadedPaths.length)
      }

      const result = await submitUnlockRequest({ featureCode, contactEmail, whatsappPhone, paths: uploadedPaths })
      if (result.error) throw new Error(result.error)

      const info: SubmissionInfo = {
        status: 'pending',
        reviewer_note: null,
        created_at: new Date().toISOString(),
        feature_code: featureCode,
        contact_email: contactEmail.trim(),
        whatsapp_phone: whatsappPhone.trim(),
      }
      setSubmission(info)
      previewUrls.current.forEach(URL.revokeObjectURL)
      previewUrls.current = []
      setPreviews(initialPreviews)
      setFiles(initialFiles)
    } catch (submitError) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage.from('unlock_evidence').remove(uploadedPaths)
        if (cleanupError) console.error('Could not clean up incomplete free-access evidence uploads:', cleanupError)
      }
      setError(submitError instanceof Error ? submitError.message : 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const shareOnWhatsApp = () => {
    const message = `Try Talenzo for career tools and skill tests: ${window.location.origin}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const renderUploadGroup = (group: EvidenceGroup, label: string, limit: number) => (
    <div key={group} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{files[group].length} / {limit} uploaded</span>
      </div>
      <button
        type="button"
        onClick={() => fileInputRefs.current[group]?.click()}
        disabled={files[group].length >= limit}
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="h-4 w-4" /> Select Screenshot Files
      </button>
      <input
        ref={element => { fileInputRefs.current[group] = element }}
        type="file"
        multiple={limit > 1}
        onChange={event => handleFileChange(group, event)}
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
      />
      {files[group].length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {files[group].map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
              {previews[group][index] && <img src={previews[group][index]} alt={`${label} proof ${index + 1}`} className="aspect-video w-full object-cover" />}
              <p className="truncate px-2 py-1.5 text-xs text-gray-600">{file.name}</p>
              <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(group, index)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const currentSubmission = submission?.feature_code === featureCode ? submission : null
  const currentStatus = isLoadingStatus ? 'idle' : currentSubmission?.status ?? 'idle'
  const currentFeatureLabel = featureLabels[featureCode]

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-7 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {!isRequestFormVisible && (
          <>
            <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                Free Access Pathway
              </div>
              <span className="ml-2 text-sm text-gray-500">Access follows manual approval</span>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">How to Get Features for Free</h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">Choose one feature. Complete its steps and submit eight screenshots as proof. Your selected feature stays locked until your request is reviewed and approved.</p>
            </header>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">Choose one feature to unlock for free</h2>
              <div role="radiogroup" aria-label="Feature to unlock" className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => selectFeature('skill_test_pro')}
              role="radio"
              aria-checked={featureCode === 'skill_test_pro'}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition ${featureCode === 'skill_test_pro' ? 'border-blue-600 bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${featureCode === 'skill_test_pro' ? 'border-blue-600' : 'border-gray-400'}`}>
                {featureCode === 'skill_test_pro' && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
              </span>
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900">1. Paid Test (₹32 Value)</span>
                <span className="mt-1 block text-sm text-gray-500">Premium skill assessment with ten skill-specific questions and scored results.</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => selectFeature('linkedin_optimization')}
              role="radio"
              aria-checked={featureCode === 'linkedin_optimization'}
              className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition ${featureCode === 'linkedin_optimization' ? 'border-blue-600 bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${featureCode === 'linkedin_optimization' ? 'border-blue-600' : 'border-gray-400'}`}>
                {featureCode === 'linkedin_optimization' && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
              </span>
              <span aria-hidden="true" className="mt-0.5 font-bold text-blue-700">in</span>
              <span className="min-w-0">
                <span className="block font-semibold text-gray-900">2. LinkedIn Optimization (₹499 Value)</span>
                <span className="mt-1 block text-sm text-gray-500">Submit the requested sharing proof for review by the Talenzo team.</span>
              </span>
            </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {featureCode === 'skill_test_pro' ? (
              <>
                <Link href="/tests?type=pro" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                  Continue to Skill Tests
                </Link>
              </>
            ) : (
              <Link href="/unlock-program?feature=linkedin_optimization&request=1" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
                Continue to LinkedIn proof submission
              </Link>
            )}
              </div>
            </section>
          </>
        )}

        {isRequestFormVisible && (
          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <header>
              <Link href="/unlock-program" className="mb-4 inline-flex text-sm font-semibold text-blue-700 hover:underline">← Choose another feature</Link>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Free access request</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{currentFeatureLabel}</h2>
              <p className="mt-1 text-sm text-gray-600">The team will review your evidence. Uploading proof does not grant access automatically.</p>
            </header>

            {featureCode === 'linkedin_optimization' ? (
              <div className="space-y-3">
                <article className="rounded-xl bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900">1. Take a free test and share your result certificate</h3>
                  <p className="mt-1 text-sm text-gray-600">After completing a free assessment, download its certificate as a PDF, then mention Talenzo in your LinkedIn post.</p>
                  <Link href="/tests?type=free" className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline">Take a free test <span aria-hidden="true" className="ml-1">→</span></Link>
                </article>
                <article className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">2. Share Talenzo on WhatsApp</h3>
                    <p className="mt-1 text-sm text-gray-600">Share with 5 friends and in 2 student WhatsApp groups.</p>
                  </div>
                  <button type="button" onClick={shareOnWhatsApp} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                    <MessageCircle className="h-4 w-4" /> Share WhatsApp
                  </button>
                </article>
                <article className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">3. Submit 8 screenshots as proof</h3>
                    <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{selectedFiles.length} / {REQUIRED_SCREENSHOTS} uploaded</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">1 LinkedIn post + 5 friend chats + 2 group shares.</p>
                  <div className="mt-4 space-y-3">{linkedInEvidenceGroups.map(group => renderUploadGroup(group.id, group.label, group.count))}</div>
                </article>
              </div>
            ) : (
              <div className="space-y-3">
                <article className="rounded-xl bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900">1. Take a free test and share your result</h3>
                  <p className="mt-1 text-sm text-gray-600">Mention Talenzo when sharing the result on LinkedIn.</p>
                  <Link href="/tests" className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline">Take a free test <span aria-hidden="true" className="ml-1">→</span></Link>
                </article>
                <article className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">2. Share the Talenzo app</h3>
                    <p className="mt-1 text-sm text-gray-600">Share with 10 friends and in 3 student WhatsApp groups.</p>
                  </div>
                  <button type="button" onClick={shareOnWhatsApp} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                    <MessageCircle className="h-4 w-4" /> Share WhatsApp
                  </button>
                </article>
                <article className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900">3. Submit 8 screenshots as proof</h3>
                    <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">{selectedFiles.length} / {REQUIRED_SCREENSHOTS} uploaded</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Upload clear screenshots showing the completed steps.</p>
                  <div className="mt-4">{renderUploadGroup('paid_screenshots', 'Proof screenshots', REQUIRED_SCREENSHOTS)}</div>
                </article>
              </div>
            )}

            {isLoadingStatus ? (
              <div role="status" className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Checking request status…</div>
            ) : currentStatus === 'approved' ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="flex items-center gap-2 font-semibold"><CheckCircle className="h-5 w-5" /> Request approved</p>
                <p className="mt-1">{featureCode === 'skill_test_pro' ? 'Your premium test access is approved.' : 'Your LinkedIn Optimization request is approved. The review team will follow up using your contact details.'}</p>
                {featureCode === 'skill_test_pro' && <Link href="/tests" className="mt-3 inline-flex font-semibold text-emerald-800 hover:underline">Open Skill Tests</Link>}
              </div>
            ) : currentStatus === 'pending' ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="flex items-center gap-2 font-semibold"><Clock className="h-5 w-5" /> Request under review</p>
                <p className="mt-1">Your {currentFeatureLabel} evidence has been submitted. Access will be granted only after an administrator approves it.</p>
                {currentSubmission?.created_at && <p className="mt-1 text-xs">Submitted {new Date(currentSubmission.created_at).toLocaleString()}</p>}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-5">
                {currentStatus === 'rejected' && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{currentSubmission?.reviewer_note || 'Your previous request was rejected. Please review the requirements and submit updated evidence.'}</span>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700">
                  Your Email Address (for confirmation)
                  <input type="email" required autoComplete="email" value={contactEmail} onChange={event => setContactEmail(event.target.value)} placeholder="name@example.com" className="mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp Phone Number
                  <input type="tel" required autoComplete="tel" value={whatsappPhone} onChange={event => setWhatsappPhone(event.target.value)} placeholder="+91 98765 43210" className="mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                </label>
                <p className="text-center text-xs text-gray-500">Our team reviews submissions within 24 hours.</p>
                {isSubmitting && <p className="text-sm text-gray-600" role="status">Uploading screenshot {uploadProgress} of {REQUIRED_SCREENSHOTS}…</p>}
                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={isSubmitting || isLoadingStatus || selectedFiles.length !== REQUIRED_SCREENSHOTS} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300">
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting request…</> : <>Submit 8 Proof Screenshots <Upload className="h-4 w-4" /></>}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
