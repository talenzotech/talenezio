'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, ChevronLeft, ChevronRight, Download,
  Eye, FileText, LayoutTemplate, Plus, Settings2, Trash2, X,
} from 'lucide-react'
import ResumePreview from '@/components/resume/ResumePreview'
import { buildResumePdf } from '@/lib/resume/pdf'
import {
  defaultSectionLabels, defaultSectionOrder, initialResumeData, ResumeData,
  ResumeLayout, ResumeSectionId,
} from '@/components/resume/types'

const STORAGE_KEY = 'talenzo-resume-builder-v2'
const SECTION_ICONS: Record<ResumeSectionId, string> = {
  personal: '◉',
  education: '▤',
  experience: '▣',
  projects: '◇',
  skills: '⌘',
  awards: '☆',
}

const normalizeResumeData = (value: Partial<ResumeData>): ResumeData => ({
  ...initialResumeData,
  ...value,
  layout: value.layout ?? initialResumeData.layout,
  personalInfo: { ...initialResumeData.personalInfo, ...value.personalInfo },
  links: Array.isArray(value.links)
    ? value.links
    : [
      ...(value.personalInfo?.portfolio ? [{ id: 'legacy-portfolio', label: 'Portfolio', url: value.personalInfo.portfolio }] : []),
      ...(value.personalInfo?.linkedin ? [{ id: 'legacy-linkedin', label: 'LinkedIn', url: value.personalInfo.linkedin }] : []),
    ],
  summary: typeof value.summary === 'string' ? value.summary : '',
  experience: Array.isArray(value.experience) ? value.experience : [],
  education: Array.isArray(value.education)
    ? value.education.map(item => ({ ...item, score: item.score ?? '', courses: item.courses ?? '' }))
    : [],
  projects: Array.isArray(value.projects) ? value.projects : [],
  awards: Array.isArray(value.awards) ? value.awards : [],
  customSections: Array.isArray(value.customSections) ? value.customSections : [],
  sectionOrder: Array.isArray(value.sectionOrder)
    ? [...value.sectionOrder.filter((id): id is ResumeSectionId => defaultSectionOrder.includes(id)), ...defaultSectionOrder.filter(id => !value.sectionOrder?.includes(id))]
    : defaultSectionOrder,
  hiddenSections: Array.isArray(value.hiddenSections) ? value.hiddenSections : [],
  sectionLabels: { ...defaultSectionLabels, ...value.sectionLabels },
})

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isValidWebUrl = (value: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const updated = [...items]
  ;[updated[index], updated[target]] = [updated[target], updated[index]]
  return updated
}

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(initialResumeData)
  const [activeSection, setActiveSection] = useState<ResumeSectionId>('personal')
  const [collapsedEducation, setCollapsedEducation] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)
  const [screen, setScreen] = useState<'edit' | 'preview' | 'final'>('edit')
  const [manageOpen, setManageOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [resumeName, setResumeName] = useState('')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saved' | 'local' | 'saving' | 'error'>('idle')
  const [isFinalizing, setIsFinalizing] = useState(false)
  const lastSavedDraft = useRef<string>(JSON.stringify(initialResumeData))
  const saveQueue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false

    async function loadInitialDraft() {
      try {
        const response = await fetch('/api/resume/draft', { cache: 'no-store' })
        if (response.ok) {
          const result = await response.json() as { draft?: Partial<ResumeData> | null; storage?: 'cloud' | 'local' }
          if (!cancelled && result.draft) {
            const normalized = normalizeResumeData(result.draft)
            setData(normalized)
            lastSavedDraft.current = JSON.stringify(normalized)
            setDraftStatus(result.storage === 'cloud' ? 'saved' : 'local')
            setHydrated(true)
            return
          }
        }
      } catch (loadError) {
        console.warn('Could not load resume draft from account:', loadError)
      }

      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved && !cancelled) {
          const parsed = JSON.parse(saved)
          const normalized = normalizeResumeData(parsed)
          setData(normalized)
          setDraftStatus('local')
        }
      } catch (storageErr) {
        console.warn('Unable to restore saved resume from localStorage:', storageErr)
        if (!cancelled) setStorageError('Could not restore the resume saved in this browser.')
      } finally {
        if (!cancelled) setHydrated(true)
      }
    }

    void loadInitialDraft()
    return () => { cancelled = true }
  }, [])

  const saveDraft = useCallback(async (currentData: ResumeData, force = false): Promise<boolean> => {
    const persist = async (): Promise<boolean> => {
      const serialized = JSON.stringify(currentData)
      if (!force && serialized === lastSavedDraft.current) return true

      setDraftStatus('saving')
      let savedLocally = false
      try {
        window.localStorage.setItem(STORAGE_KEY, serialized)
        savedLocally = true
      } catch (storageErr) {
        console.warn('Could not save resume draft in this browser:', storageErr)
      }

      try {
        const res = await fetch('/api/resume/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ draft: currentData }),
        })
        if (res.ok) {
          const result = await res.json() as { success?: boolean; storage?: 'cloud' | 'local' }
          if (result.success) {
            lastSavedDraft.current = serialized
            setStorageError('')
            setDraftStatus(result.storage === 'cloud' ? 'saved' : 'local')
            return true
          }
        }

        if (savedLocally) {
          lastSavedDraft.current = serialized
          setStorageError('')
          setDraftStatus('local')
          return true
        }

        setStorageError('Resume could not be saved. Check your browser storage.')
        setDraftStatus('error')
        return false
      } catch (saveError) {
        if (savedLocally) {
          lastSavedDraft.current = serialized
          setStorageError('')
          setDraftStatus('local')
          return true
        }
        console.warn('Could not save resume draft to the account:', saveError)
        setStorageError('Resume could not be saved. Check your connection and try again.')
        setDraftStatus('error')
        return false
      }
    }

    const queuedSave = saveQueue.current.then(persist, persist)
    saveQueue.current = queuedSave.then(() => undefined, () => undefined)
    return queuedSave
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const timer = window.setTimeout(() => { void saveDraft(data) }, 800)
    return () => window.clearTimeout(timer)
  }, [data, hydrated, saveDraft])

  const visibleSections = useMemo(
    () => data.sectionOrder.filter(id => !data.hiddenSections.includes(id)),
    [data.hiddenSections, data.sectionOrder],
  )

  const completion = useMemo(() => {
    const completed = {
      personal: Boolean(data.personalInfo.fullName.trim()),
      education: data.education.some(item => item.institution.trim() || item.degree.trim()),
      experience: data.experience.some(item => item.title.trim() || item.company.trim()),
      projects: data.projects.some(item => item.title.trim()),
      skills: Boolean(data.skills.trim()),
      awards: data.awards.some(item => item.title.trim()),
    }
    return {
      count: Object.values(completed).filter(Boolean).length,
      completed,
    }
  }, [data])

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    setData(current => ({ ...current, personalInfo: { ...current.personalInfo, [field]: value } }))
  }

  const updateItem = <K extends 'education' | 'experience' | 'projects' | 'awards'>(
    collection: K,
    id: string,
    field: keyof ResumeData[K][number],
    value: string,
  ) => {
    setData(current => ({
      ...current,
      [collection]: current[collection].map(item =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const addEducation = () => {
    const id = crypto.randomUUID()
    setData(current => ({
      ...current,
      education: [...current.education, {
        id, degree: '', institution: '', location: '',
        startDate: '', endDate: '', gpa: '', score: '', courses: '',
      }],
    }))
  }

  const addExperience = () => setData(current => ({
    ...current,
    experience: [...current.experience, {
      id: crypto.randomUUID(), title: '', company: '', location: '',
      startDate: '', endDate: '', description: '',
    }],
  }))

  const addProject = () => setData(current => ({
    ...current,
    projects: [...current.projects, { id: crypto.randomUUID(), title: '', link: '', description: '' }],
  }))

  const addAward = () => setData(current => ({
    ...current,
    awards: [...current.awards, { id: crypto.randomUUID(), title: '', issuer: '', date: '', description: '' }],
  }))

  const addLink = () => setData(current => ({
    ...current,
    links: [...current.links, { id: crypto.randomUUID(), label: '', url: '' }],
  }))

  const addCustomSection = () => setData(current => ({
    ...current,
    customSections: [...current.customSections, {
      id: crypto.randomUUID(),
      title: 'Additional Section',
      content: '',
    }],
  }))

  const removeItem = (collection: 'education' | 'experience' | 'projects' | 'awards', id: string) => {
    setData(current => ({
      ...current,
      [collection]: current[collection].filter(item => item.id !== id),
    }))
  }

  const updateOrder = (id: ResumeSectionId, direction: -1 | 1) => {
    setData(current => ({ ...current, sectionOrder: moveItem(current.sectionOrder, current.sectionOrder.indexOf(id), direction) }))
  }

  const validateResume = () => {
    if (!data.personalInfo.fullName.trim()) {
      setError('Add your full name in Personal Information before finalizing.')
      setActiveSection('personal')
      setScreen('edit')
      return false
    }
    if (data.personalInfo.email && !isValidEmail(data.personalInfo.email)) {
      setError('Enter a valid email address before finalizing.')
      setActiveSection('personal')
      setScreen('edit')
      return false
    }
    if (data.links.some(link => Boolean(link.label.trim()) !== Boolean(link.url.trim()))) {
      setError('Enter both a label and URL for each profile link.')
      setActiveSection('personal')
      setScreen('edit')
      return false
    }
    if (data.links.some(link => link.url.trim() && !isValidWebUrl(link.url.trim()))) {
      setError('Use complete http:// or https:// URLs for portfolio and profile links.')
      setActiveSection('personal')
      setScreen('edit')
      return false
    }
    if (data.projects.some(project => project.link.trim() && !isValidWebUrl(project.link.trim()))) {
      setError('Use a complete http:// or https:// URL for each project link.')
      setActiveSection('projects')
      setScreen('edit')
      return false
    }
    if (data.customSections.some(section => section.content.trim() && !section.title.trim())) {
      setError('Add a title to each additional section that contains content.')
      setManageOpen(true)
      return false
    }
    if (visibleSections.some(section => !data.sectionLabels[section].trim())) {
      setError('Restore or name each visible resume section before finalizing.')
      setManageOpen(true)
      return false
    }
    setError('')
    return true
  }

  const finalizeResume = async () => {
    if (!validateResume()) return
    setIsFinalizing(true)
    const saved = await saveDraft(data, true)
    setIsFinalizing(false)
    if (!saved) {
      setError('Your resume could not be saved. Please fix the save issue before finalizing.')
      return
    }
    setResumeName(current => current.trim() || `${data.personalInfo.fullName.trim()} Resume`)
    setScreen('final')
  }

  const downloadResume = async () => {
    if (!validateResume()) return
    setDownloading(true)
    setError('')
    try {
      const saved = await saveDraft(data, true)
      if (!saved) {
        throw new Error('Your resume could not be saved. Fix the save issue and try again before downloading.')
      }

      const pdfBytes = await buildResumePdf(data)
      const safeName = (resumeName.trim() || `${data.personalInfo.fullName.trim()}_Resume`)
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
        .replace(/\s+/g, '_')
        .replace(/\.pdf$/i, '') || 'Resume'
      const blob = new Blob([Uint8Array.from(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${safeName}.pdf`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (downloadError) {
      console.warn('Could not generate resume PDF:', downloadError)
      setError(downloadError instanceof Error ? downloadError.message : 'Could not generate your PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const goToOffsetSection = (offset: -1 | 1) => {
    const index = visibleSections.indexOf(activeSection)
    const next = visibleSections[index + offset]
    if (next) setActiveSection(next)
  }

  const sectionHeading = data.sectionLabels[activeSection]
  const fieldClass = 'h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:border-purple-400 dark:focus:ring-purple-950/40'
  const labelClass = 'mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300'
  const actionClass = 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-purple-300 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:border-purple-600 dark:hover:text-purple-300'
  const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-wait disabled:opacity-60 shadow-sm'

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6">
        
        {/* Top Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xs text-gray-400">
              {draftStatus === 'saving' && 'Saving...'}
              {draftStatus === 'saved' && 'Saved to account'}
              {draftStatus === 'local' && 'Saved on this device'}
              {draftStatus === 'error' && 'Save failed'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{completion.count} / 6</span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-purple-100 dark:bg-gray-800">
              <div className="h-full rounded-full bg-purple-600 transition-all duration-300" style={{ width: `${Math.max(10, (completion.count / 6) * 100)}%` }} />
            </div>
          </div>
        </div>

        {storageError && <p role="alert" className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{storageError}</p>}
        {error && <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        {/* Horizontal Navigation Stepper Tabs */}
        <nav aria-label="Resume sections" className="mb-4 flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-2 pt-2 dark:border-gray-800 dark:bg-gray-900">
          {visibleSections.map(id => (
            <button
              key={id}
              type="button"
              aria-current={activeSection === id && screen === 'edit' ? 'step' : undefined}
              onClick={() => { setActiveSection(id); setScreen('edit'); setError('') }}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeSection === id && screen === 'edit' ? 'border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              <span className="text-xs" aria-hidden="true">{SECTION_ICONS[id]}</span>
              {data.sectionLabels[id]}
              {completion.completed[id] && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" aria-label="Complete" />}
            </button>
          ))}
        </nav>

        {/* 3-Column Main Body Grid */}
        <div className={`grid gap-4 ${screen === 'final' ? 'lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]' : 'lg:grid-cols-[220px_minmax(330px,1fr)_minmax(380px,1.1fr)]'}`}>
          
          {/* Left Column (Sections & Actions) */}
          {screen !== 'final' && (
            <aside className="space-y-4">
              <section className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Resume Sections</h2>
                  <button type="button" onClick={() => setManageOpen(true)} className="text-xs font-semibold text-purple-700 hover:underline dark:text-purple-400">Edit</button>
                </div>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{completion.count} of 6 complete</p>
                <div className="space-y-1.5">
                  {visibleSections.map(id => {
                    const isActive = activeSection === id && screen === 'edit'
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setActiveSection(id); setScreen('edit') }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-all ${isActive ? 'bg-purple-700 font-bold text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                      >
                        <span aria-hidden="true">{SECTION_ICONS[id]}</span>
                        <span className="min-w-0 flex-1 truncate">{data.sectionLabels[id]}</span>
                        {completion.completed[id] && <Check className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />}
                      </button>
                    )
                  })}
                </div>
                {data.customSections.map(section => (
                  <button key={section.id} type="button" onClick={() => setManageOpen(true)} className="mt-2 flex w-full items-center gap-2 border-t border-gray-100 pt-2 text-left text-xs text-gray-600 hover:text-purple-700 dark:border-gray-800 dark:text-gray-400 dark:hover:text-purple-300">
                    <FileText className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400" />
                    <span className="truncate">{section.title}</span>
                  </button>
                ))}
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">Resume Actions</h2>
                <div className="space-y-1.5">
                  <button type="button" onClick={() => void finalizeResume()} disabled={isFinalizing} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"><Check className="h-4 w-4 text-purple-700 dark:text-purple-400" /> {isFinalizing ? 'Saving Resume…' : 'Finalize Resume'}</button>
                  <button type="button" onClick={() => { setError(''); setScreen('preview') }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"><Eye className="h-4 w-4 text-purple-700 dark:text-purple-400" /> Preview Resume</button>
                  <button type="button" onClick={() => setTemplatesOpen(true)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"><LayoutTemplate className="h-4 w-4 text-purple-700 dark:text-purple-400" /> Change Template <span className="ml-auto capitalize text-gray-400">{data.layout}</span></button>
                  <button type="button" onClick={() => setManageOpen(true)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"><Settings2 className="h-4 w-4 text-purple-700 dark:text-purple-400" /> Manage Sections</button>
                </div>
              </section>
            </aside>
          )}

          {/* Middle Column: Form Editor */}
          <section className={`min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 ${screen === 'preview' ? 'lg:col-span-2' : ''}`}>
            {screen === 'final' ? (
              <div className="mx-auto max-w-md py-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-700 text-white"><Check className="h-7 w-7" /></div>
                <h2 className="text-center text-xl font-bold">Your Resume Is Ready</h2>
                <p className="mt-1 text-center text-sm text-gray-500">Your resume is ready to preview or download.</p>
                <label className={`${labelClass} mt-7`} htmlFor="resume-file-name">Resume file name</label>
                <div className="flex items-center gap-2">
                  <input id="resume-file-name" className={fieldClass} value={resumeName} onChange={event => setResumeName(event.target.value)} />
                  <span className="shrink-0 text-sm text-gray-500">.pdf</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setScreen('preview')} className={actionClass}><Eye className="h-4 w-4" /> Preview</button>
                  <button type="button" onClick={() => void downloadResume()} disabled={downloading} className={primaryButtonClass}><Download className="h-4 w-4" /> {downloading ? 'Generating PDF…' : 'Download Resume'}</button>
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">A formatted A4 PDF will be downloaded directly.</p>
                {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
                <button type="button" onClick={() => { setScreen('edit'); setActiveSection('personal') }} className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft className="h-4 w-4" /> Back to editor</button>
              </div>
            ) : screen === 'preview' ? (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div><h2 className="font-semibold text-lg">Resume Preview</h2><p className="text-xs text-gray-500">Live preview of your complete resume.</p></div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTemplatesOpen(true)} className={actionClass}><LayoutTemplate className="h-4 w-4" /> Template</button>
                    <button type="button" onClick={finalizeResume} className={primaryButtonClass}><Check className="h-4 w-4" /> Finalize</button>
                    <button type="button" onClick={() => setScreen('edit')} className={actionClass}><ArrowLeft className="h-4 w-4" /> Edit</button>
                  </div>
                </div>
                <div className="max-h-[75vh] overflow-auto rounded-lg bg-gray-100 p-3 sm:p-6 dark:bg-gray-950">
                  <ResumePreview data={data} />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{sectionHeading}</h2>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {activeSection === 'personal' && 'Your basic information, links, and professional summary.'}
                      {activeSection === 'education' && 'Add your education history, coursework, and scores.'}
                      {activeSection === 'experience' && 'Describe your roles, responsibilities, and impact.'}
                      {activeSection === 'projects' && 'Showcase projects that demonstrate your skills.'}
                      {activeSection === 'skills' && 'List relevant skills, separated by commas or lines.'}
                      {activeSection === 'awards' && 'Add awards, certifications, and achievements.'}
                    </p>
                  </div>
                  {activeSection === 'education' && <button type="button" onClick={addEducation} className={`${actionClass} border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300`}><Plus className="h-4 w-4" /> Add Education</button>}
                  {activeSection === 'experience' && <button type="button" onClick={addExperience} className={`${actionClass} border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300`}><Plus className="h-4 w-4" /> Add Role</button>}
                  {activeSection === 'projects' && <button type="button" onClick={addProject} className={`${actionClass} border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300`}><Plus className="h-4 w-4" /> Add Project</button>}
                  {activeSection === 'awards' && <button type="button" onClick={addAward} className={`${actionClass} border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300`}><Plus className="h-4 w-4" /> Add Award</button>}
                </div>

                {/* Personal Information */}
                {activeSection === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label><span className={labelClass}>Full Name</span><input autoComplete="name" className={fieldClass} placeholder="Enter your full name" value={data.personalInfo.fullName} onChange={event => updatePersonalInfo('fullName', event.target.value)} /></label>
                      <label><span className={labelClass}>Job Title</span><input className={fieldClass} placeholder="Enter your current or target title" value={data.personalInfo.jobTitle} onChange={event => updatePersonalInfo('jobTitle', event.target.value)} /></label>
                      <label><span className={labelClass}>Email Address</span><input type="email" autoComplete="email" className={fieldClass} placeholder="you@example.com" value={data.personalInfo.email} onChange={event => updatePersonalInfo('email', event.target.value)} /></label>
                      <label><span className={labelClass}>Phone Number</span><input type="tel" autoComplete="tel" className={fieldClass} placeholder="Enter your phone number" value={data.personalInfo.phone} onChange={event => updatePersonalInfo('phone', event.target.value)} /></label>
                    </div>
                    <label className="block"><span className={labelClass}>Location</span><input autoComplete="address-level2" className={fieldClass} placeholder="City, region" value={data.personalInfo.location} onChange={event => updatePersonalInfo('location', event.target.value)} /></label>
                    <label className="block"><span className={labelClass}>Professional Summary</span><textarea rows={4} className={`${fieldClass} h-auto min-h-24 py-2.5`} placeholder="Summarize your experience, strengths, and goals." value={data.summary} onChange={event => setData(current => ({ ...current, summary: event.target.value }))} /></label>

                    <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                      <div className="mb-2 flex items-center justify-between">
                        <div><h3 className="text-sm font-semibold">Links & Social Profiles</h3><p className="mt-0.5 text-xs text-gray-500">Portfolio, GitHub, LinkedIn, or personal website.</p></div>
                        <button type="button" onClick={addLink} className={`${actionClass} text-xs`}><Plus className="h-3.5 w-3.5" /> Add Link</button>
                      </div>
                      <div className="space-y-2">
                        {data.links.map(link => (
                          <div key={link.id} className="flex gap-2">
                            <input className={`${fieldClass} w-1/3`} placeholder="Label (e.g. GitHub)" value={link.label} onChange={event => setData(current => ({ ...current, links: current.links.map(item => item.id === link.id ? { ...item, label: event.target.value } : item) }))} />
                            <input type="url" className={`${fieldClass} flex-1`} placeholder="https://..." value={link.url} onChange={event => setData(current => ({ ...current, links: current.links.map(item => item.id === link.id ? { ...item, url: event.target.value } : item) }))} />
                            <button type="button" aria-label="Remove link" onClick={() => setData(current => ({ ...current, links: current.links.filter(item => item.id !== link.id) }))} className="rounded px-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Education */}
                {activeSection === 'education' && (
                  <div className="space-y-3">
                    {data.education.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            <button
                              type="button"
                              aria-label={`${collapsedEducation.has(item.id) ? 'Expand' : 'Collapse'} education entry`}
                              aria-expanded={!collapsedEducation.has(item.id)}
                              onClick={() => setCollapsedEducation(current => {
                                const next = new Set(current)
                                if (next.has(item.id)) next.delete(item.id)
                                else next.add(item.id)
                                return next
                              })}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            ><ChevronRight className={`h-4 w-4 transition-transform ${collapsedEducation.has(item.id) ? '' : 'rotate-90'}`} /></button>
                            <h3 className="truncate text-sm font-bold text-gray-800 dark:text-gray-200">{item.institution || item.degree || `Education ${index + 1}`}</h3>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button type="button" aria-label="Move education up" disabled={index === 0} onClick={() => setData(current => ({ ...current, education: moveItem(current.education, index, -1) }))} className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                            <button type="button" aria-label="Move education down" disabled={index === data.education.length - 1} onClick={() => setData(current => ({ ...current, education: moveItem(current.education, index, 1) }))} className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                            <button type="button" aria-label="Remove education" onClick={() => removeItem('education', item.id)} className="rounded p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        {!collapsedEducation.has(item.id) && <div className="grid gap-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Degree</span><input className={fieldClass} placeholder="Enter degree or qualification" value={item.degree} onChange={event => updateItem('education', item.id, 'degree', event.target.value)} /></label>
                          <label><span className={labelClass}>Institution / School</span><input className={fieldClass} placeholder="Enter institution name" value={item.institution} onChange={event => updateItem('education', item.id, 'institution', event.target.value)} /></label>
                          <label><span className={labelClass}>Location</span><input className={fieldClass} placeholder="City, region" value={item.location} onChange={event => updateItem('education', item.id, 'location', event.target.value)} /></label>
                          <div className="grid grid-cols-2 gap-2">
                            <label><span className={labelClass}>Start Date</span><input className={fieldClass} placeholder="Start date" value={item.startDate} onChange={event => updateItem('education', item.id, 'startDate', event.target.value)} /></label>
                            <label><span className={labelClass}>End Date</span><input className={fieldClass} placeholder="End date" value={item.endDate} onChange={event => updateItem('education', item.id, 'endDate', event.target.value)} /></label>
                          </div>
                          <label><span className={labelClass}>Score / GPA</span><input className={fieldClass} placeholder="Enter score, GPA, or grade" value={item.score || item.gpa} onChange={event => updateItem('education', item.id, 'score', event.target.value)} /></label>
                          <label><span className={labelClass}>Relevant Coursework</span><input className={fieldClass} placeholder="List relevant courses" value={item.courses} onChange={event => updateItem('education', item.id, 'courses', event.target.value)} /></label>
                        </div>}
                      </div>
                    ))}
                    {data.education.length === 0 && <EmptyState message="Add your degrees, universities, or relevant coursework." />}
                  </div>
                )}

                {/* Work Experience */}
                {activeSection === 'experience' && (
                  <div className="space-y-3">
                    {data.experience.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.title || item.company || `Experience ${index + 1}`}</h3>
                          <button type="button" aria-label="Remove experience" onClick={() => removeItem('experience', item.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Job Title</span><input className={fieldClass} placeholder="Enter job title" value={item.title} onChange={event => updateItem('experience', item.id, 'title', event.target.value)} /></label>
                          <label><span className={labelClass}>Company</span><input className={fieldClass} placeholder="Enter company or organization" value={item.company} onChange={event => updateItem('experience', item.id, 'company', event.target.value)} /></label>
                          <label><span className={labelClass}>Location</span><input className={fieldClass} placeholder="City or remote" value={item.location} onChange={event => updateItem('experience', item.id, 'location', event.target.value)} /></label>
                          <div className="grid grid-cols-2 gap-2">
                            <label><span className={labelClass}>From</span><input className={fieldClass} placeholder="Start date" value={item.startDate} onChange={event => updateItem('experience', item.id, 'startDate', event.target.value)} /></label>
                            <label><span className={labelClass}>To</span><input className={fieldClass} placeholder="End date" value={item.endDate} onChange={event => updateItem('experience', item.id, 'endDate', event.target.value)} /></label>
                          </div>
                          <label className="sm:col-span-2"><span className={labelClass}>Responsibilities & Achievements</span><textarea rows={4} className={`${fieldClass} h-auto py-2.5`} placeholder="Describe your responsibilities and measurable impact." value={item.description} onChange={event => updateItem('experience', item.id, 'description', event.target.value)} /></label>
                        </div>
                      </div>
                    ))}
                    {data.experience.length === 0 && <EmptyState message="Add your past roles, internships, or professional projects." />}
                  </div>
                )}

                {/* Projects */}
                {activeSection === 'projects' && (
                  <div className="space-y-3">
                    {data.projects.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.title || `Project ${index + 1}`}</h3>
                          <button type="button" aria-label="Remove project" onClick={() => removeItem('projects', item.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Project Name</span><input className={fieldClass} placeholder="Enter project name" value={item.title} onChange={event => updateItem('projects', item.id, 'title', event.target.value)} /></label>
                          <label><span className={labelClass}>Project URL / Demo</span><input type="url" className={fieldClass} placeholder="Add a project URL" value={item.link} onChange={event => updateItem('projects', item.id, 'link', event.target.value)} /></label>
                          <label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea rows={3} className={`${fieldClass} h-auto py-2.5`} placeholder="Describe the project and your contribution." value={item.description} onChange={event => updateItem('projects', item.id, 'description', event.target.value)} /></label>
                        </div>
                      </div>
                    ))}
                    {data.projects.length === 0 && <EmptyState message="Showcase projects that demonstrate your technical or professional skills." />}
                  </div>
                )}

                {/* Skills */}
                {activeSection === 'skills' && (
                  <div>
                    <label className="block">
                      <span className={labelClass}>Skills & Expertise</span>
                      <textarea rows={8} className={`${fieldClass} h-auto py-2.5`} placeholder="List your relevant skills, separated by commas or lines." value={data.skills} onChange={event => setData(current => ({ ...current, skills: event.target.value }))} />
                    </label>
                    <p className="mt-2 text-xs text-gray-400">Separate skills using commas or line breaks.</p>
                  </div>
                )}

                {/* Awards & Achievements (matching screenshot) */}
                {activeSection === 'awards' && (
                  <div className="space-y-4">
                    {data.awards.map((item, index) => (
                      <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4.5 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{`Award ${index + 1}`}</h3>
                          <button type="button" aria-label="Remove award" onClick={() => removeItem('awards', item.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="grid gap-3.5 sm:grid-cols-2">
                          <label><span className={labelClass}>Award or achievement</span><input className={fieldClass} placeholder="Enter award or achievement" value={item.title} onChange={event => updateItem('awards', item.id, 'title', event.target.value)} /></label>
                          <label><span className={labelClass}>Issuer</span><input className={fieldClass} placeholder="Enter issuing organization" value={item.issuer} onChange={event => updateItem('awards', item.id, 'issuer', event.target.value)} /></label>
                          <label><span className={labelClass}>Date</span><input className={fieldClass} placeholder="Date received" value={item.date} onChange={event => updateItem('awards', item.id, 'date', event.target.value)} /></label>
                          <label><span className={labelClass}>Description</span><input className={fieldClass} placeholder="Describe the recognition or achievement" value={item.description} onChange={event => updateItem('awards', item.id, 'description', event.target.value)} /></label>
                        </div>
                      </div>
                    ))}
                    {data.awards.length === 0 && <EmptyState message="Add awards, certifications, and achievements." />}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Right Column: Live Preview (A4 Page) */}
          {screen === 'edit' && (
            <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <div>
                  <h2 className="text-sm font-bold">Live Preview</h2>
                  <p className="text-xs text-gray-500 capitalize">A4 page · {data.layout} template</p>
                </div>
                <button type="button" aria-label="Open full preview" onClick={() => setScreen('preview')} className="rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-gray-800 dark:hover:text-purple-300"><Eye className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[75vh] overflow-auto bg-gray-100 p-4 dark:bg-gray-950">
                <div className="origin-top-left scale-[0.50] min-[1200px]:scale-[0.58] min-[1400px]:scale-[0.65]" style={{ width: '210mm' }}>
                  <ResumePreview data={data} />
                </div>
              </div>
            </section>
          )}

          {/* Final Screen Preview */}
          {screen === 'final' && (
            <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold">Final Resume Preview</h2>
                <p className="text-xs text-gray-500 capitalize">{data.layout} template · A4 page</p>
              </div>
              <div className="max-h-[75vh] overflow-auto bg-gray-100 p-4 dark:bg-gray-950">
                <div className="origin-top-left scale-[0.50] min-[1200px]:scale-[0.58]" style={{ width: '210mm' }}>
                  <ResumePreview data={data} />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Bottom Fixed Navigation Bar (matches screenshot) */}
      <footer className="sticky bottom-0 z-20 mt-auto border-t border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <nav aria-label="Resume builder navigation" className="mx-auto flex max-w-4xl items-center justify-between gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            T
          </div>
          <button
            type="button"
            onClick={() => { goToOffsetSection(-1); setScreen('edit') }}
            disabled={visibleSections.indexOf(activeSection) <= 0}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Settings2 className="h-4 w-4" /> Manage
          </button>
          <button
            type="button"
            onClick={() => { setError(''); setScreen(screen === 'preview' ? 'edit' : 'preview') }}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium ${screen === 'preview' ? 'text-purple-700 dark:text-purple-300 font-bold' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            type="button"
            onClick={() => void finalizeResume()}
            disabled={isFinalizing}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50 dark:text-purple-300 dark:hover:bg-purple-950/50"
          >
            <Check className="h-4 w-4" /> {isFinalizing ? 'Saving…' : 'Finalize'}
          </button>
          <button
            type="button"
            onClick={() => { goToOffsetSection(1); setScreen('edit') }}
            disabled={visibleSections.indexOf(activeSection) >= visibleSections.length - 1}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      </footer>

      {/* Manage Sections Modal */}
      {manageOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setManageOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="manage-sections-heading" className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="manage-sections-heading" className="text-lg font-bold">Manage Resume Sections</h2>
                <p className="mt-1 text-xs text-gray-500">Reorder, hide, or rename sections as needed.</p>
              </div>
              <button type="button" aria-label="Close section manager" onClick={() => setManageOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              {data.sectionOrder.map((id, index) => (
                <div key={id} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="w-5 text-center text-xs" aria-hidden="true">{SECTION_ICONS[id]}</span>
                  <input
                    aria-label={`Name for ${data.sectionLabels[id]}`}
                    className={`${fieldClass} h-8 text-xs font-medium`}
                    value={data.sectionLabels[id]}
                    onChange={event => {
                      const next = event.target.value
                      setData(current => ({ ...current, sectionLabels: { ...current.sectionLabels, [id]: next } }))
                    }}
                  />
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => updateOrder(id, -1)} className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label="Move down" disabled={index === data.sectionOrder.length - 1} onClick={() => updateOrder(id, 1)} className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const isHidden = data.hiddenSections.includes(id)
                      if (!isHidden && visibleSections.length <= 1) {
                        setError('At least one section must remain visible.')
                        return
                      }
                      if (!isHidden && !window.confirm(`Hide "${data.sectionLabels[id]}" from the resume preview? Its saved data will remain in the builder.`)) return
                      setData(current => ({ ...current, hiddenSections: isHidden ? current.hiddenSections.filter(item => item !== id) : [...current.hiddenSections, id] }))
                      if (!isHidden && activeSection === id) {
                        const nextVisibleSection = visibleSections.find(section => section !== id)
                        if (nextVisibleSection) setActiveSection(nextVisibleSection)
                      }
                    }}
                    className="rounded px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {data.hiddenSections.includes(id) ? 'Restore' : 'Hide'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Additional Sections</h3>
                <button type="button" onClick={addCustomSection} className={`${actionClass} text-xs`}><Plus className="h-3.5 w-3.5" /> Add Section</button>
              </div>
              {data.customSections.length === 0 ? (
                <p className="text-xs text-gray-500">Add optional sections such as publications, volunteering, or languages.</p>
              ) : (
                <div className="space-y-3">
                  {data.customSections.map((section, index) => (
                    <div key={section.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <input
                          aria-label="Additional section title"
                          className={`${fieldClass} h-9`}
                          value={section.title}
                          onChange={event => setData(current => ({
                            ...current,
                            customSections: current.customSections.map(item => item.id === section.id ? { ...item, title: event.target.value } : item),
                          }))}
                        />
                        <button type="button" aria-label="Move section up" disabled={index === 0} onClick={() => setData(current => ({ ...current, customSections: moveItem(current.customSections, index, -1) }))} className="rounded p-1 text-gray-500 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" aria-label="Move section down" disabled={index === data.customSections.length - 1} onClick={() => setData(current => ({ ...current, customSections: moveItem(current.customSections, index, 1) }))} className="rounded p-1 text-gray-500 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                        <button
                          type="button"
                          aria-label={`Remove ${section.title || 'additional section'}`}
                          onClick={() => {
                            if (window.confirm(`Remove the "${section.title || 'Additional Section'}" section and its content?`)) {
                              setData(current => ({ ...current, customSections: current.customSections.filter(item => item.id !== section.id) }))
                            }
                          }}
                          className="rounded p-1 text-gray-500 hover:text-red-600"
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <textarea
                        aria-label={`Content for ${section.title || 'additional section'}`}
                        rows={3}
                        className={`${fieldClass} mt-2 h-auto py-2.5`}
                        value={section.content}
                        onChange={event => setData(current => ({
                          ...current,
                          customSections: current.customSections.map(item => item.id === section.id ? { ...item, content: event.target.value } : item),
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={() => setManageOpen(false)} className={primaryButtonClass}>Done</button>
            </div>
          </section>
        </div>
      )}

      {/* Change Template Modal */}
      {templatesOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setTemplatesOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="template-heading" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="template-heading" className="text-lg font-bold">Choose a Resume Template</h2>
                <p className="mt-1 text-xs text-gray-500">Your content stays exactly the same across layouts.</p>
              </div>
              <button type="button" aria-label="Close templates" onClick={() => setTemplatesOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['classic', 'modern', 'minimalist'] as ResumeLayout[]).map(layout => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => { setData(current => ({ ...current, layout })); setTemplatesOpen(false) }}
                  className={`rounded-xl border p-4 text-left capitalize transition-all ${data.layout === layout ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 font-bold' : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'}`}
                >
                  <LayoutTemplate className="mb-2 h-6 w-6" />
                  <span className="text-sm font-semibold">{layout}</span>
                  <p className="mt-1 text-[11px] text-gray-400 font-normal">
                    {layout === 'classic' && 'Timeless, serif font style.'}
                    {layout === 'modern' && 'Clean accent header.'}
                    {layout === 'minimalist' && 'Sleek, monochrome.'}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {downloading && <div role="status" className="fixed right-4 top-4 z-50 rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-xl">Generating your PDF…</div>}
    </main>
  )
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">{message}</div>
}
