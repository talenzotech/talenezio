'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import FeatureBottomNav from '@/components/FeatureBottomNav'
import { cleanupUnlockEvidence, getSubmissionStatus, submitUnlockEvidence } from './actions'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  MessageCircle,
  Send,
  Upload,
  X,
} from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const REQUIRED_SCREENSHOTS = 8
type EvidenceGroup = 'linkedin_post' | 'friend_shares' | 'group_shares'
type EvidenceFiles = Record<EvidenceGroup, File[]>
type EvidencePreviews = Record<EvidenceGroup, string[]>
type SubmissionStatus = 'idle' | 'pending' | 'approved' | 'rejected'

const evidenceGroups: { id: EvidenceGroup; label: string; count: number }[] = [
  { id: 'linkedin_post', label: 'LinkedIn post proof', count: 1 },
  { id: 'friend_shares', label: 'WhatsApp friend chats', count: 5 },
  { id: 'group_shares', label: 'Student WhatsApp group shares', count: 2 },
]
const emptyFiles: EvidenceFiles = { linkedin_post: [], friend_shares: [], group_shares: [] }
const emptyPreviews: EvidencePreviews = { linkedin_post: [], friend_shares: [], group_shares: [] }

export default function UnlockProgramClient() {
  const [files, setFiles] = useState<EvidenceFiles>(emptyFiles)
  const [previews, setPreviews] = useState<EvidencePreviews>(emptyPreviews)
  const [contactEmail, setContactEmail] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [reviewerNote, setReviewerNote] = useState<string | null>(null)
  const [statusLoadError, setStatusLoadError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const previewUrls = useRef<string[]>([])
  const inputRefs = useRef<Partial<Record<EvidenceGroup, HTMLInputElement | null>>>({})
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const totalFiles = evidenceGroups.reduce((total, group) => total + files[group.id].length, 0)

  useEffect(() => () => previewUrls.current.forEach(URL.revokeObjectURL), [])

  useEffect(() => {
    let cancelled = false
    async function loadStatus() {
      try {
        const submission = await getSubmissionStatus()
        if (cancelled) return
        if (submission) {
          if (submission.status === 'pending' || submission.status === 'approved' || submission.status === 'rejected') setStatus(submission.status)
          setReviewerNote(submission.reviewer_note)
          setContactEmail(submission.contact_email ?? '')
          setWhatsappPhone(submission.whatsapp_phone ?? '')
        }
      } catch (statusError) {
        if (!cancelled) {
          console.error('Could not load LinkedIn Optimization request status:', statusError)
          setStatusLoadError(true)
        }
      }
    }
    void loadStatus()
    return () => { cancelled = true }
  }, [])

  const shareOnWhatsApp = () => {
    const shareUrl = new URL('https://api.whatsapp.com/send')
    shareUrl.searchParams.set('text', `Try Talenzo for career tools and skill tests: ${window.location.origin}`)
    window.location.assign(shareUrl.toString())
  }

  const addFiles = (group: EvidenceGroup, event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    const limit = evidenceGroups.find(item => item.id === group)!.count
    const available = limit - files[group].length
    const valid = selected.filter(file => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && file.size <= MAX_FILE_SIZE)
    if (valid.length !== selected.length) setError('Choose PNG, JPG, or WEBP screenshots no larger than 5MB each.')
    else if (selected.length > available) setError(`You can add ${available} more screenshot${available === 1 ? '' : 's'} to this proof group.`)
    else setError(null)
    const accepted = valid.slice(0, available)
    const urls = accepted.map(file => URL.createObjectURL(file))
    previewUrls.current.push(...urls)
    setFiles(current => ({ ...current, [group]: [...current[group], ...accepted] }))
    setPreviews(current => ({ ...current, [group]: [...current[group], ...urls] }))
  }

  const removeFile = (group: EvidenceGroup, index: number) => {
    const url = previews[group][index]
    URL.revokeObjectURL(url)
    previewUrls.current = previewUrls.current.filter(item => item !== url)
    setFiles(current => ({ ...current, [group]: current[group].filter((_, itemIndex) => itemIndex !== index) }))
    setPreviews(current => ({ ...current, [group]: current[group].filter((_, itemIndex) => itemIndex !== index) }))
  }

  const downloadChecklist = () => {
    const content = [
      'Talenzo Free Access Pathway — LinkedIn Optimization',
      '',
      '1. Complete a free skill test and share your certificate on LinkedIn, mentioning Talenzo.',
      '2. Share Talenzo with 5 friends and in 2 student WhatsApp groups.',
      '3. Upload 8 screenshots: 1 LinkedIn post, 5 friend chats, and 2 group shares.',
      '',
      'Accepted formats: PNG, JPG, WEBP. Maximum 5MB per screenshot.',
    ].join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'talenzo-free-access-proof-checklist.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (files.linkedin_post.length !== 1 || files.friend_shares.length !== 5 || files.group_shares.length !== 2) {
      setError('Upload 1 LinkedIn post, 5 friend chats, and 2 student group shares.')
      return
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(contactEmail.trim())) {
      setError('Enter a valid email address.')
      return
    }
    const digits = whatsappPhone.replace(/\D/g, '')
    if (digits.length < 8 || digits.length > 15) {
      setError('Enter a WhatsApp number with 8 to 15 digits.')
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
        router.push(`/login?next=${encodeURIComponent('/unlock-program/linkedin-optimization')}`)
        return
      }

      const orderedFiles = [...files.linkedin_post, ...files.friend_shares, ...files.group_shares]
      for (const [index, file] of orderedFiles.entries()) {
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

      const result = await submitUnlockEvidence(uploadedPaths, contactEmail.trim(), whatsappPhone.trim(), 'linkedin_optimization')
      if (result.error) throw new Error(result.error)
      setStatus('pending')
      previewUrls.current.forEach(URL.revokeObjectURL)
      previewUrls.current = []
      setFiles(emptyFiles)
      setPreviews(emptyPreviews)
    } catch (submitError) {
      if (uploadedPaths.length) await cleanupUnlockEvidence(uploadedPaths)
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your free-access request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-32 text-slate-900 sm:px-6 sm:py-10 sm:pb-32">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-5">
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Link href="/unlock-program" className="text-sm font-semibold text-blue-700 hover:underline">← All free access options</Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-900">Free Access Request</span>
              <span className="text-sm text-slate-500">LinkedIn Optimization</span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Request LinkedIn Optimization for Free</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">Complete the steps and submit your evidence. The team will review your request; submitting proof does not grant access automatically.</p>
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Complete these 3 steps:</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <StepCard number={1} title="Take any free test and share your certificate on LinkedIn, mentioning Talenzo." accessory={
                <Link href="/tests?type=free" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-blue-700 hover:underline">Take Free Test <ArrowRight className="h-4 w-4" /></Link>
              }>
                <p className="mt-2 text-sm leading-5 text-slate-500">Post your certificate to your LinkedIn feed with a mention of @Talenzo.</p>
              </StepCard>
              <StepCard number={2} title="Share the Talenzo app with 5 friends and in 2 student WhatsApp groups." accessory={
                <button type="button" onClick={shareOnWhatsApp} className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                  <MessageCircle className="h-4 w-4" /> Share WhatsApp
                </button>
              }>
                <p className="mt-2 text-sm leading-5 text-slate-500">Send the platform link to 5 student friends and post in 2 active groups.</p>
              </StepCard>
              <div className="sm:col-span-2">
                <StepCard number={3} title="Submit 8 screenshots as proof." accessory={
                  <div className="shrink-0 rounded-md bg-slate-100 px-3 py-1.5 text-center text-xs font-semibold text-slate-600">{totalFiles} / 8<br />Uploaded</div>
                }>
                  <p className="mt-2 text-sm leading-5 text-slate-500">1 LinkedIn post proof + 5 friend chats + 2 group shares.</p>
                  <button type="button" onClick={downloadChecklist} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white">
                    <Download className="h-4 w-4" /> Download Proof Checklist
                  </button>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {evidenceGroups.map(group => (
                      <ProofUpload
                        key={group.id}
                        group={group.id}
                        label={group.label}
                        limit={group.count}
                        files={files[group.id]}
                        previews={previews[group.id]}
                        inputRef={element => { inputRefs.current[group.id] = element }}
                        onChoose={() => inputRefs.current[group.id]?.click()}
                        onChange={event => addFiles(group.id, event)}
                        onRemove={index => removeFile(group.id, index)}
                      />
                    ))}
                  </div>
                </StepCard>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {status === 'approved' ? (
              <StatusPanel icon={<CheckCircle className="h-12 w-12 text-emerald-600" />} title="Request Approved" text="Your LinkedIn Optimization request has been approved." />
            ) : status === 'pending' ? (
              <StatusPanel icon={<Clock className="h-12 w-12 text-amber-600" />} title="Review Pending" text="Your proof was submitted. The team will review your request and email you with an update." />
            ) : (
              <>
                <h2 className="mb-5 text-xl font-bold text-slate-900">Your Request</h2>
                {statusLoadError && <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Could not load your previous request status. The submission form is still available.</p>}
                {status === 'rejected' && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><strong>Previous submission rejected.</strong><p className="mt-1">{reviewerNote || 'Please check your proof screenshots and submit again.'}</p></div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Your Email Address (for confirmation):
                    <input type="email" required value={contactEmail} onChange={event => setContactEmail(event.target.value)} placeholder="name@example.com" className="mt-2 block h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-base font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    WhatsApp Phone Number:
                    <input type="tel" required value={whatsappPhone} onChange={event => setWhatsappPhone(event.target.value)} placeholder="+91 98765 43210" className="mt-2 block h-12 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-base font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <p className="border-t border-slate-100 pt-4 text-center text-sm text-slate-500">Our team reviews submissions within 24 hours.</p>
                  {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                  <button type="submit" disabled={isSubmitting || totalFiles !== REQUIRED_SCREENSHOTS} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-base font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading {uploadProgress}/{REQUIRED_SCREENSHOTS}…</> : <>Submit 8 Proof Screenshots <Send className="h-4 w-4" /></>}
                  </button>
                </form>
              </>
            )}
        </section>
      </div>
      <FeatureBottomNav />
    </main>
  )
}

function StepCard({ number, title, accessory, children }: { number: number; title: string; accessory?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{number}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-bold leading-5 text-slate-900">{title}</h3>{accessory}</div>
          {children}
        </div>
      </div>
    </article>
  )
}

function ProofUpload({ group, label, limit, files, previews, inputRef, onChoose, onChange, onRemove }: {
  group: EvidenceGroup
  label: string
  limit: number
  files: File[]
  previews: string[]
  inputRef: (element: HTMLInputElement | null) => void
  onChoose: () => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-700">{label}</span><span className="text-xs text-slate-500">{files.length} / {limit} uploaded</span></div>
      <button type="button" onClick={onChoose} disabled={files.length >= limit} className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Upload className="h-3.5 w-3.5" /> Select Screenshot Files</button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple={limit > 1} onChange={onChange} className="sr-only" aria-label={`Upload ${label}`} />
      {files.length > 0 && <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">{files.map((file, index) => (
        <div key={`${group}-${file.name}-${index}`} className="relative overflow-hidden rounded border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previews[index]} alt={`${label} ${index + 1}`} className="aspect-video w-full object-cover" />
          <button type="button" aria-label={`Remove ${file.name}`} onClick={() => onRemove(index)} className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white hover:bg-black"><X className="h-3 w-3" /></button>
        </div>
      ))}</div>}
    </div>
  )
}

function StatusPanel({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex min-h-64 flex-col items-center justify-center text-center">{icon}<h2 className="mt-4 text-2xl font-bold">{title}</h2><p className="mt-2 max-w-sm text-base leading-6 text-slate-600">{text}</p></div>
}
