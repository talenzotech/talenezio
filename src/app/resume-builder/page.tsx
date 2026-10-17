'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, ChevronLeft, ChevronRight, Download,
  Eye, FileText, LayoutTemplate, Plus, Settings2, Trash2, X,
} from 'lucide-react'
import ResumePreview from '@/components/resume/ResumePreview'
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
  const [hydrated, setHydrated] = useState(false)
  const [screen, setScreen] = useState<'edit' | 'preview' | 'final'>('edit')
  const [manageOpen, setManageOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [resumeName, setResumeName] = useState('')
  const [error, setError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [printing, setPrinting] = useState(false)
  const [expandedEducation, setExpandedEducation] = useState<string[]>([])
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resumeName.trim() || 'Resume',
    pageStyle: '@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }',
    onBeforePrint: () => {
      setPrinting(true)
      setError('')
      return Promise.resolve()
    },
    onAfterPrint: () => setPrinting(false),
    onPrintError: (_location, printError) => {
      setPrinting(false)
      setError(`Could not prepare the PDF: ${printError.message}`)
    },
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed: Partial<ResumeData> = JSON.parse(saved)
          setData(normalizeResumeData(parsed))
        }
      } catch (storageReadError) {
        console.error('Unable to restore the saved resume.', storageReadError)
        setStorageError('We could not restore your saved resume from this browser.')
      } finally {
        setHydrated(true)
      }
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (storageWriteError) {
      console.error('Unable to save the resume in this browser.', storageWriteError)
      const timeout = window.setTimeout(() => setStorageError('Your changes could not be saved in this browser. Check available storage and try again.'), 0)
      return () => window.clearTimeout(timeout)
    }
  }, [data, hydrated])

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
    setExpandedEducation(current => [...current, id])
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
    const hasValidURL = (url: string) => {
      if (!url.trim()) return true
      try {
        const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`
        new URL(normalizedUrl)
        return true
      } catch {
        return false
      }
    }
    const invalidLink = data.links.find(link => !hasValidURL(link.url))
    if (invalidLink) {
      setError(`Check the URL for ${invalidLink.label || 'your link'} and try again.`)
      setActiveSection('personal')
      setScreen('edit')
      return false
    }
    const invalidProject = data.projects.find(project => !hasValidURL(project.link))
    if (invalidProject) {
      setError(`Check the project URL for ${invalidProject.title || 'your project'} and try again.`)
      setActiveSection('projects')
      setScreen('edit')
      return false
    }
    setError('')
    return true
  }

  const finalizeResume = () => {
    if (!validateResume()) return
    setResumeName(current => current.trim() || `${data.personalInfo.fullName.trim()} Resume`)
    setScreen('final')
  }

  const goToOffsetSection = (offset: -1 | 1) => {
    const index = visibleSections.indexOf(activeSection)
    const next = visibleSections[index + offset]
    if (next) setActiveSection(next)
  }

  const sectionHeading = data.sectionLabels[activeSection]
  const fieldClass = 'h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
  const labelClass = 'mb-1.5 block text-xs font-medium text-gray-600'
  const actionClass = 'inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40'
  const greenButtonClass = 'inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60'

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-semibold text-gray-800">{completion.count} / 6</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${completion.count / 6 * 100}%` }} />
            </div>
          </div>
        </div>

        {storageError && <p role="alert" className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{storageError}</p>}
        {error && <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        <nav aria-label="Resume sections" className="mb-4 flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-2 pt-2">
          {visibleSections.map(id => (
            <button
              key={id}
              type="button"
              aria-current={activeSection === id && screen === 'edit' ? 'step' : undefined}
              onClick={() => { setActiveSection(id); setScreen('edit'); setError('') }}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${activeSection === id && screen === 'edit' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <span className="text-xs" aria-hidden="true">{SECTION_ICONS[id]}</span>
              {data.sectionLabels[id]}
              {completion.completed[id] && <Check className="h-3.5 w-3.5 text-emerald-600" aria-label="Complete" />}
            </button>
          ))}
        </nav>

        <div className={`grid gap-4 ${screen === 'final' ? 'lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]' : 'lg:grid-cols-[210px_minmax(330px,0.9fr)_minmax(360px,1.1fr)]'}`}>
          {screen !== 'final' && (
            <aside className="space-y-4">
              <section className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">Resume Sections</h2>
                  <button type="button" onClick={() => setManageOpen(true)} className="text-xs font-medium text-emerald-700 hover:underline">Edit</button>
                </div>
                <p className="mb-2 text-xs text-gray-500">{completion.count} of 6 complete</p>
                <div className="space-y-1">
                  {visibleSections.map(id => (
                    <button key={id} type="button" onClick={() => { setActiveSection(id); setScreen('edit') }} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs ${activeSection === id && screen === 'edit' ? 'bg-emerald-700 font-semibold text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <span aria-hidden="true">{SECTION_ICONS[id]}</span>
                      <span className="min-w-0 flex-1 truncate">{data.sectionLabels[id]}</span>
                      {completion.completed[id] && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
                {data.customSections.map(section => (
                  <div key={section.id} className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2 text-xs text-gray-600">
                    <FileText className="h-3.5 w-3.5 text-emerald-700" />
                    <span className="truncate">{section.title}</span>
                  </div>
                ))}
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-3">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Resume Actions</h2>
                <div className="space-y-1">
                  <button type="button" onClick={finalizeResume} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><Check className="h-4 w-4 text-emerald-700" /> Finalize Resume</button>
                  <button type="button" onClick={() => { setError(''); setScreen('preview') }} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><Eye className="h-4 w-4 text-emerald-700" /> Preview Resume</button>
                  <button type="button" onClick={() => setTemplatesOpen(true)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><LayoutTemplate className="h-4 w-4 text-emerald-700" /> Change Template <span className="ml-auto text-gray-400">{data.layout}</span></button>
                  <button type="button" onClick={() => setManageOpen(true)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"><Settings2 className="h-4 w-4 text-emerald-700" /> Add / Edit Sections</button>
                </div>
              </section>
            </aside>
          )}

          <section className={`min-w-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 ${screen === 'preview' ? 'lg:col-span-2' : ''}`}>
            {screen === 'final' ? (
              <div className="mx-auto max-w-md py-10">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white"><Check className="h-7 w-7" /></div>
                <h2 className="text-center text-xl font-bold">Resume Created Successfully!</h2>
                <p className="mt-1 text-center text-sm text-gray-500">Your resume is ready to preview or download.</p>
                <label className={`${labelClass} mt-7`} htmlFor="resume-file-name">Resume name</label>
                <div className="flex items-center gap-2">
                  <input id="resume-file-name" className={fieldClass} value={resumeName} onChange={event => setResumeName(event.target.value)} />
                  <span className="shrink-0 text-sm text-gray-500">.pdf</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setScreen('preview')} className={actionClass}><Eye className="h-4 w-4" /> Preview</button>
                  <button type="button" onClick={() => handlePrint()} disabled={printing} className={greenButtonClass}><Download className="h-4 w-4" /> {printing ? 'Preparing…' : 'Download PDF'}</button>
                </div>
                <p className="mt-3 text-center text-xs text-gray-500">Your browser will open its print dialog. Choose “Save as PDF” to download the A4 resume.</p>
                {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
                <button type="button" onClick={() => { setScreen('edit'); setActiveSection('personal') }} className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft className="h-4 w-4" /> Back to editor</button>
              </div>
            ) : screen === 'preview' ? (
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div><h2 className="font-semibold">Resume Preview</h2><p className="text-xs text-gray-500">Updates as you edit your resume.</p></div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTemplatesOpen(true)} className={actionClass}><LayoutTemplate className="h-4 w-4" /> Template</button>
                    <button type="button" onClick={finalizeResume} className={greenButtonClass}><Check className="h-4 w-4" /> Finalize</button>
                    <button type="button" onClick={() => setScreen('edit')} className={actionClass}><ArrowLeft className="h-4 w-4" /> Edit</button>
                  </div>
                </div>
                <div className="max-h-[75vh] overflow-auto rounded-md bg-gray-100 p-3 sm:p-6">
                  <ResumePreview ref={printRef} data={data} />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{sectionHeading}</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {activeSection === 'personal' && 'Your basic information, links, and professional summary.'}
                      {activeSection === 'education' && 'Add your education history, coursework, and scores.'}
                      {activeSection === 'experience' && 'Describe your roles, responsibilities, and impact.'}
                      {activeSection === 'projects' && 'Showcase projects that demonstrate your skills.'}
                      {activeSection === 'skills' && 'List relevant skills, separated by commas or lines.'}
                      {activeSection === 'awards' && 'Add awards, certifications, and achievements.'}
                    </p>
                  </div>
                  {activeSection === 'education' && <button type="button" onClick={addEducation} className={`${actionClass} border-emerald-200 text-emerald-700`}><Plus className="h-4 w-4" /> Add Education</button>}
                  {activeSection === 'experience' && <button type="button" onClick={addExperience} className={`${actionClass} border-emerald-200 text-emerald-700`}><Plus className="h-4 w-4" /> Add Experience</button>}
                  {activeSection === 'projects' && <button type="button" onClick={addProject} className={`${actionClass} border-emerald-200 text-emerald-700`}><Plus className="h-4 w-4" /> Add Project</button>}
                  {activeSection === 'awards' && <button type="button" onClick={addAward} className={`${actionClass} border-emerald-200 text-emerald-700`}><Plus className="h-4 w-4" /> Add Award</button>}
                </div>

                {activeSection === 'personal' && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label><span className={labelClass}>Full Name</span><input autoComplete="name" className={fieldClass} placeholder="Jane Doe" value={data.personalInfo.fullName} onChange={event => updatePersonalInfo('fullName', event.target.value)} /></label>
                      <label><span className={labelClass}>Job Title</span><input className={fieldClass} placeholder="Senior Software Engineer" value={data.personalInfo.jobTitle} onChange={event => updatePersonalInfo('jobTitle', event.target.value)} /></label>
                      <label><span className={labelClass}>Email</span><input type="email" autoComplete="email" className={fieldClass} placeholder="jane@example.com" value={data.personalInfo.email} onChange={event => updatePersonalInfo('email', event.target.value)} /></label>
                      <label><span className={labelClass}>Phone</span><input type="tel" autoComplete="tel" className={fieldClass} placeholder="+1 (555) 123-4567" value={data.personalInfo.phone} onChange={event => updatePersonalInfo('phone', event.target.value)} /></label>
                    </div>
                    <label className="block"><span className={labelClass}>Location</span><input autoComplete="address-level2" className={fieldClass} placeholder="New York, NY" value={data.personalInfo.location} onChange={event => updatePersonalInfo('location', event.target.value)} /></label>
                    <label className="block"><span className={labelClass}>Professional Summary</span><textarea rows={4} className={`${fieldClass} h-auto min-h-24 py-2.5`} placeholder="A concise introduction highlighting your experience and strengths." value={data.summary} onChange={event => setData(current => ({ ...current, summary: event.target.value }))} /></label>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div><h3 className="text-sm font-semibold">Links</h3><p className="mt-0.5 text-xs text-gray-500">Portfolio, GitHub, LinkedIn, or other professional links.</p></div>
                        <button type="button" onClick={addLink} className="text-xs font-semibold text-emerald-700 hover:underline"><Plus className="mr-1 inline h-3.5 w-3.5" />Add link</button>
                      </div>
                      {data.links.map(link => (
                        <div key={link.id} className="mb-2 grid gap-2 sm:grid-cols-[0.7fr_1.3fr_auto]">
                          <input aria-label="Link label" className={fieldClass} placeholder="GitHub" value={link.label} onChange={event => setData(current => ({ ...current, links: current.links.map(item => item.id === link.id ? { ...item, label: event.target.value } : item) }))} />
                          <input aria-label="Link URL" type="url" className={fieldClass} placeholder="https://example.com" value={link.url} onChange={event => setData(current => ({ ...current, links: current.links.map(item => item.id === link.id ? { ...item, url: event.target.value } : item) }))} />
                          <button type="button" aria-label="Remove link" onClick={() => setData(current => ({ ...current, links: current.links.filter(item => item.id !== link.id) }))} className={actionClass}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="space-y-3">
                    {data.education.map((item, index) => (
                      <details
                        key={item.id}
                        open={expandedEducation.includes(item.id)}
                        onToggle={event => {
                          const isOpen = event.currentTarget.open
                          setExpandedEducation(current => {
                          return isOpen
                            ? current.includes(item.id) ? current : [...current, item.id]
                            : current.filter(id => id !== item.id)
                          })
                        }}
                        className="rounded-md border border-gray-200"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3">
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.degree || item.institution || `Education ${index + 1}`}</span>
                          <button type="button" aria-label="Move education up" disabled={index === 0} onClick={event => { event.preventDefault(); setData(current => ({ ...current, education: moveItem(current.education, index, -1) })) }} className="text-gray-400 hover:text-emerald-700 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" aria-label="Move education down" disabled={index === data.education.length - 1} onClick={event => { event.preventDefault(); setData(current => ({ ...current, education: moveItem(current.education, index, 1) })) }} className="text-gray-400 hover:text-emerald-700 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                          <button type="button" aria-label="Remove education" onClick={event => { event.preventDefault(); removeItem('education', item.id) }} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </summary>
                        <div className="grid gap-3 border-t border-gray-100 p-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Institution</span><input className={fieldClass} placeholder="University of California, Berkeley" value={item.institution} onChange={event => updateItem('education', item.id, 'institution', event.target.value)} /></label>
                          <label><span className={labelClass}>Degree</span><input className={fieldClass} placeholder="Bachelor of Science in Electronics" value={item.degree} onChange={event => updateItem('education', item.id, 'degree', event.target.value)} /></label>
                          <label><span className={labelClass}>Location</span><input className={fieldClass} placeholder="New York, NY" value={item.location} onChange={event => updateItem('education', item.id, 'location', event.target.value)} /></label>
                          <label><span className={labelClass}>Score</span><input className={fieldClass} placeholder="GPA 3.8 / 4.0" value={item.score || item.gpa} onChange={event => updateItem('education', item.id, 'score', event.target.value)} /></label>
                          <label className="sm:col-span-2"><span className={labelClass}>Courses</span><input className={fieldClass} placeholder="Type a course and press enter to add" value={item.courses} onChange={event => updateItem('education', item.id, 'courses', event.target.value)} /></label>
                          <label><span className={labelClass}>Start Date</span><input className={fieldClass} placeholder="Sep 2020" value={item.startDate} onChange={event => updateItem('education', item.id, 'startDate', event.target.value)} /></label>
                          <label><span className={labelClass}>End Date</span><input className={fieldClass} placeholder="May 2024" value={item.endDate} onChange={event => updateItem('education', item.id, 'endDate', event.target.value)} /></label>
                        </div>
                      </details>
                    ))}
                    {data.education.length === 0 && <EmptyState message="Add your schools, degrees, and relevant coursework." />}
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="space-y-3">
                    {data.experience.map((item, index) => (
                      <details key={item.id} open className="rounded-md border border-gray-200">
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3">
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title || item.company || `Experience ${index + 1}`}</span>
                          <button type="button" aria-label="Remove experience" onClick={event => { event.preventDefault(); removeItem('experience', item.id) }} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </summary>
                        <div className="grid gap-3 border-t border-gray-100 p-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Job Title</span><input className={fieldClass} value={item.title} onChange={event => updateItem('experience', item.id, 'title', event.target.value)} /></label>
                          <label><span className={labelClass}>Company</span><input className={fieldClass} value={item.company} onChange={event => updateItem('experience', item.id, 'company', event.target.value)} /></label>
                          <label><span className={labelClass}>Location</span><input className={fieldClass} value={item.location} onChange={event => updateItem('experience', item.id, 'location', event.target.value)} /></label>
                          <div className="grid grid-cols-2 gap-2">
                            <label><span className={labelClass}>From</span><input className={fieldClass} value={item.startDate} onChange={event => updateItem('experience', item.id, 'startDate', event.target.value)} /></label>
                            <label><span className={labelClass}>To</span><input className={fieldClass} value={item.endDate} onChange={event => updateItem('experience', item.id, 'endDate', event.target.value)} /></label>
                          </div>
                          <label className="sm:col-span-2"><span className={labelClass}>Responsibilities and achievements</span><textarea rows={4} className={`${fieldClass} h-auto py-2.5`} value={item.description} onChange={event => updateItem('experience', item.id, 'description', event.target.value)} /></label>
                        </div>
                      </details>
                    ))}
                    {data.experience.length === 0 && <EmptyState message="Add your work experience and accomplishments." />}
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div className="space-y-3">
                    {data.projects.map((item, index) => (
                      <div key={item.id} className="rounded-md border border-gray-200 p-3">
                        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">{item.title || `Project ${index + 1}`}</h3><button type="button" aria-label="Remove project" onClick={() => removeItem('projects', item.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Project name</span><input className={fieldClass} value={item.title} onChange={event => updateItem('projects', item.id, 'title', event.target.value)} /></label>
                          <label><span className={labelClass}>Project URL</span><input type="url" className={fieldClass} value={item.link} onChange={event => updateItem('projects', item.id, 'link', event.target.value)} /></label>
                          <label className="sm:col-span-2"><span className={labelClass}>Description</span><textarea rows={3} className={`${fieldClass} h-auto py-2.5`} value={item.description} onChange={event => updateItem('projects', item.id, 'description', event.target.value)} /></label>
                        </div>
                      </div>
                    ))}
                    {data.projects.length === 0 && <EmptyState message="Add projects that highlight your work." />}
                  </div>
                )}

                {activeSection === 'skills' && <label className="block"><span className={labelClass}>Skills</span><textarea rows={8} className={`${fieldClass} h-auto py-2.5`} placeholder="Type skills separated by commas or lines" value={data.skills} onChange={event => setData(current => ({ ...current, skills: event.target.value }))} /></label>}

                {activeSection === 'awards' && (
                  <div className="space-y-3">
                    {data.awards.map((item, index) => (
                      <div key={item.id} className="rounded-md border border-gray-200 p-3">
                        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">{item.title || `Award ${index + 1}`}</h3><button type="button" aria-label="Remove award" onClick={() => removeItem('awards', item.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label><span className={labelClass}>Award or achievement</span><input className={fieldClass} value={item.title} onChange={event => updateItem('awards', item.id, 'title', event.target.value)} /></label>
                          <label><span className={labelClass}>Issuer</span><input className={fieldClass} value={item.issuer} onChange={event => updateItem('awards', item.id, 'issuer', event.target.value)} /></label>
                          <label><span className={labelClass}>Date</span><input className={fieldClass} value={item.date} onChange={event => updateItem('awards', item.id, 'date', event.target.value)} /></label>
                          <label><span className={labelClass}>Description</span><input className={fieldClass} value={item.description} onChange={event => updateItem('awards', item.id, 'description', event.target.value)} /></label>
                        </div>
                      </div>
                    ))}
                    {data.awards.length === 0 && <EmptyState message="Add awards, certifications, or other achievements." />}
                  </div>
                )}
              </>
            )}
          </section>

          {screen === 'edit' && (
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div><h2 className="text-sm font-semibold">Live Preview</h2><p className="text-xs text-gray-500">A4 page · {data.layout} template</p></div>
                <button type="button" aria-label="Open full preview" onClick={() => setScreen('preview')} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-emerald-700"><Eye className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[75vh] overflow-auto bg-gray-100 p-3">
                <div className="origin-top-left scale-[0.52] min-[1200px]:scale-[0.63]" style={{ width: '210mm' }}>
                  <ResumePreview ref={printRef} data={data} />
                </div>
              </div>
            </section>
          )}
          {screen === 'final' && (
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3"><h2 className="text-sm font-semibold">Final Resume Preview</h2><p className="text-xs text-gray-500">{data.layout} template · A4 page</p></div>
              <div className="max-h-[75vh] overflow-auto bg-gray-100 p-3">
                <div className="origin-top-left scale-[0.52] min-[1200px]:scale-[0.63]" style={{ width: '210mm' }}>
                  <ResumePreview ref={printRef} data={data} />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <footer className="sticky bottom-0 z-20 mt-auto border-t border-gray-200 bg-white px-3 py-2">
        <nav aria-label="Resume builder navigation" className="mx-auto flex max-w-3xl items-center justify-between gap-1">
          <button type="button" onClick={() => { goToOffsetSection(-1); setScreen('edit') }} disabled={visibleSections.indexOf(activeSection) <= 0} className="flex items-center gap-1 rounded px-2 py-2 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Prev</button>
          <button type="button" onClick={() => setManageOpen(true)} className="flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"><Settings2 className="h-4 w-4" />Manage</button>
          <button type="button" onClick={() => { setError(''); setScreen('preview') }} className={`flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-xs ${screen === 'preview' ? 'text-emerald-700' : 'text-gray-600 hover:bg-gray-100'}`}><Eye className="h-4 w-4" />Preview</button>
          <button type="button" onClick={finalizeResume} className="flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"><Check className="h-4 w-4" />Finalize</button>
          <button type="button" onClick={() => { goToOffsetSection(1); setScreen('edit') }} disabled={visibleSections.indexOf(activeSection) >= visibleSections.length - 1} className="flex items-center gap-1 rounded px-2 py-2 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
        </nav>
      </footer>

      {manageOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setManageOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="manage-sections-heading" className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 id="manage-sections-heading" className="font-bold">Manage Resume Sections</h2><p className="mt-1 text-xs text-gray-500">Rename, reorder, or hide sections. Hidden sections keep their saved content.</p></div>
              <button type="button" aria-label="Close section manager" onClick={() => setManageOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2">
              {data.sectionOrder.map((id, index) => (
                <div key={id} className="grid items-center gap-2 rounded-md border border-gray-100 p-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
                  <span className="w-5 text-center text-xs text-gray-400">{SECTION_ICONS[id]}</span>
                  <input aria-label={`Rename ${data.sectionLabels[id]}`} className={`${fieldClass} h-9`} value={data.sectionLabels[id]} onChange={event => setData(current => ({ ...current, sectionLabels: { ...current.sectionLabels, [id]: event.target.value || defaultSectionLabels[id] } }))} />
                  <div className="flex gap-1">
                    <button type="button" aria-label="Move section up" disabled={index === 0} onClick={() => updateOrder(id, -1)} className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" aria-label="Move section down" disabled={index === data.sectionOrder.length - 1} onClick={() => updateOrder(id, 1)} className="rounded p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                  <button type="button" onClick={() => {
                    const isHidden = data.hiddenSections.includes(id)
                    if (!isHidden && !window.confirm(`Hide “${data.sectionLabels[id]}” from your resume? Your entered information will be kept.`)) return
                    setData(current => ({ ...current, hiddenSections: isHidden ? current.hiddenSections.filter(item => item !== id) : [...current.hiddenSections, id] }))
                    if (!isHidden && activeSection === id) {
                      setActiveSection(data.sectionOrder.find(section => section !== id && !data.hiddenSections.includes(section)) ?? id)
                    }
                  }} className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">{data.hiddenSections.includes(id) ? 'Restore' : 'Hide'}</button>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <div><h3 className="text-sm font-semibold">Custom Sections</h3><p className="mt-1 text-xs text-gray-500">Add content such as volunteering or publications.</p></div>
                <button type="button" onClick={() => setData(current => ({ ...current, customSections: [...current.customSections, { id: crypto.randomUUID(), title: 'New Section', content: '' }] }))} className={`${actionClass} text-emerald-700`}><Plus className="h-4 w-4" />Add Section</button>
              </div>
              {data.customSections.map(section => (
                <div key={section.id} className="mb-3 rounded-md border border-gray-100 p-3">
                  <div className="mb-2 flex gap-2">
                    <input aria-label="Custom section name" className={`${fieldClass} h-9`} value={section.title} onChange={event => setData(current => ({ ...current, customSections: current.customSections.map(item => item.id === section.id ? { ...item, title: event.target.value } : item) }))} />
                    <button type="button" aria-label={`Remove ${section.title}`} onClick={() => {
                      if (!window.confirm(`Remove “${section.title}” and its content?`)) return
                      setData(current => ({ ...current, customSections: current.customSections.filter(item => item.id !== section.id) }))
                    }} className="rounded px-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <textarea aria-label={`${section.title} content`} rows={3} className={`${fieldClass} h-auto py-2.5`} value={section.content} placeholder="Add details for this section" onChange={event => setData(current => ({ ...current, customSections: current.customSections.map(item => item.id === section.id ? { ...item, content: event.target.value } : item) }))} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end"><button type="button" onClick={() => setManageOpen(false)} className={greenButtonClass}>Done</button></div>
          </section>
        </div>
      )}

      {templatesOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setTemplatesOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="template-heading" className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between"><div><h2 id="template-heading" className="font-bold">Change Template</h2><p className="mt-1 text-xs text-gray-500">Your resume details stay the same when you switch.</p></div><button type="button" aria-label="Close templates" onClick={() => setTemplatesOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['classic', 'modern', 'minimalist'] as ResumeLayout[]).map(layout => (
                <button key={layout} type="button" onClick={() => { setData(current => ({ ...current, layout })); setTemplatesOpen(false) }} className={`rounded-md border p-3 text-left capitalize ${data.layout === layout ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 hover:border-emerald-300'}`}>
                  <LayoutTemplate className="mb-2 h-5 w-5" /><span className="text-sm font-semibold">{layout}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {printing && <div role="status" className="fixed right-4 top-4 z-50 rounded-md bg-gray-900 px-4 py-2 text-sm text-white">Preparing your print-ready PDF…</div>}
    </main>
  )
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">{message}</div>
}
