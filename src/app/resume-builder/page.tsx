'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Plus, Trash2, Download, ChevronRight, ChevronLeft, LayoutTemplate } from 'lucide-react'
import ResumePreview from '@/components/resume/ResumePreview'
import { ResumeData, initialResumeData, ResumeLayout } from '@/components/resume/types'

const STEPS = [
  { id: 'layout', title: 'Layout' },
  { id: 'personal', title: 'Personal Info' },
  { id: 'summary', title: 'Summary' },
  { id: 'experience', title: 'Experience' },
  { id: 'education', title: 'Education' },
  { id: 'projects', title: 'Projects' },
  { id: 'skills', title: 'Skills' },
]

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(initialResumeData)
  const [currentStep, setCurrentStep] = useState(0)
  const printRef = useRef<HTMLDivElement>(null)
  const lastSavedDraft = useRef<ResumeData>(initialResumeData)
  const saveRequest = useRef(0)
  const [isDraftLoaded, setIsDraftLoaded] = useState(false)
  const [draftStatus, setDraftStatus] = useState<'loading' | 'saved' | 'saving' | 'error'>('loading')
  const [draftError, setDraftError] = useState<string | null>(null)

  const saveDraft = useCallback(async (draft: ResumeData) => {
    const requestId = ++saveRequest.current
    setDraftStatus('saving')
    setDraftError(null)

    try {
      const response = await fetch('/api/resume/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not save your draft')

      if (requestId === saveRequest.current) {
        lastSavedDraft.current = draft
        setDraftStatus('saved')
      }
    } catch (error) {
      if (requestId === saveRequest.current) {
        setDraftStatus('error')
        setDraftError(error instanceof Error ? error.message : 'Could not save your draft')
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDraft() {
      try {
        const response = await fetch('/api/resume/draft', { cache: 'no-store' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load your draft')

        if (!cancelled && result.draft) {
          lastSavedDraft.current = result.draft
          setData(result.draft)
        }
        if (!cancelled) setDraftStatus('saved')
      } catch (error) {
        if (!cancelled) {
          setDraftStatus('error')
          setDraftError(error instanceof Error ? error.message : 'Could not load your draft')
        }
      } finally {
        if (!cancelled) setIsDraftLoaded(true)
      }
    }

    loadDraft()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!isDraftLoaded || JSON.stringify(data) === JSON.stringify(lastSavedDraft.current)) return
    const timer = window.setTimeout(() => { void saveDraft(data) }, 800)
    return () => window.clearTimeout(timer)
  }, [data, isDraftLoaded, saveDraft])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${data.personalInfo.fullName || 'Resume'}_Talenzo`,
  })

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const updateLayout = (layout: ResumeLayout) => {
    setData(prev => ({ ...prev, layout }))
  }

  // --- Experience Handlers ---
  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: crypto.randomUUID(), title: '', company: '', location: '', startDate: '', endDate: '', description: '' }]
    }))
  }
  const updateExperience = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }))
  }
  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }))
  }

  // --- Education Handlers ---
  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: crypto.randomUUID(), degree: '', institution: '', location: '', startDate: '', endDate: '', gpa: '' }]
    }))
  }
  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }))
  }
  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }))
  }

  // --- Projects Handlers ---
  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: crypto.randomUUID(), title: '', link: '', description: '' }]
    }))
  }
  const updateProject = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    }))
  }
  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row">
      
      {/* LEFT PANE: Form Editor */}
      <div className="w-full md:w-[45%] h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        
        {/* Header & Progress */}
        <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Resume Builder</h1>
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}</p>
            <div className="text-right text-xs" aria-live="polite">
              {draftStatus === 'loading' && <span className="text-gray-400">Loading draft...</span>}
              {draftStatus === 'saving' && <span className="text-blue-600">Saving...</span>}
              {draftStatus === 'saved' && <span className="text-emerald-600">Saved</span>}
              {draftStatus === 'error' && (
                <button type="button" onClick={() => { void saveDraft(data) }} className="font-semibold text-red-600 underline">
                  {draftError || 'Save failed'} Retry
                </button>
              )}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {STEPS.map((s, i) => (
              <span key={s.id} className={i <= currentStep ? 'text-blue-500 hidden sm:inline' : 'hidden sm:inline'}>{s.title}</span>
            ))}
            <span className="sm:hidden text-blue-500">{STEPS[currentStep].title}</span>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          {currentStep === 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Choose a Layout</h2>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => updateLayout('classic')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${data.layout === 'classic' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <LayoutTemplate className={data.layout === 'classic' ? 'text-blue-500' : 'text-gray-400'} />
                    <h3 className="font-bold text-lg dark:text-white">Classic</h3>
                  </div>
                  <p className="text-sm text-gray-500">Traditional Times New Roman style, best for conservative industries.</p>
                </button>
                <button 
                  onClick={() => updateLayout('modern')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${data.layout === 'modern' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <LayoutTemplate className={data.layout === 'modern' ? 'text-blue-500' : 'text-gray-400'} />
                    <h3 className="font-bold text-lg dark:text-white">Modern</h3>
                  </div>
                  <p className="text-sm text-gray-500">Clean sans-serif typography with a distinct header color.</p>
                </button>
                <button 
                  onClick={() => updateLayout('minimalist')}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${data.layout === 'minimalist' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <LayoutTemplate className={data.layout === 'minimalist' ? 'text-blue-500' : 'text-gray-400'} />
                    <h3 className="font-bold text-lg dark:text-white">Minimalist</h3>
                  </div>
                  <p className="text-sm text-gray-500">Elegant layout with wide margins and structural lines.</p>
                </button>
              </div>
            </section>
          )}

          {currentStep === 1 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" className="form-input" value={data.personalInfo.fullName} onChange={e => updatePersonalInfo('fullName', e.target.value)} />
                <input type="email" placeholder="Email Address" className="form-input" value={data.personalInfo.email} onChange={e => updatePersonalInfo('email', e.target.value)} />
                <input type="tel" placeholder="Phone Number" className="form-input" value={data.personalInfo.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} />
                <input type="text" placeholder="Location (e.g. New York, NY)" className="form-input" value={data.personalInfo.location} onChange={e => updatePersonalInfo('location', e.target.value)} />
                <input type="url" placeholder="LinkedIn URL" className="form-input" value={data.personalInfo.linkedin} onChange={e => updatePersonalInfo('linkedin', e.target.value)} />
                <input type="url" placeholder="Portfolio/Website URL" className="form-input" value={data.personalInfo.portfolio} onChange={e => updatePersonalInfo('portfolio', e.target.value)} />
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Professional Summary</h2>
              <textarea 
                rows={6} 
                placeholder="A brief summary of your professional background and goals..." 
                className="form-input w-full"
                value={data.summary}
                onChange={e => setData({...data, summary: e.target.value})}
              />
            </section>
          )}

          {currentStep === 3 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Experience</h2>
                <button onClick={addExperience} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"><Plus className="w-4 h-4" /> Add Role</button>
              </div>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="p-5 bg-gray-50 dark:bg-gray-950 rounded-xl relative group border border-gray-100 dark:border-gray-800">
                    <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Job Title" className="form-input" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} />
                      <input type="text" placeholder="Company" className="form-input" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                      <input type="text" placeholder="Location" className="form-input" value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Start (e.g. Jan 2020)" className="form-input w-1/2" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                        <input type="text" placeholder="End (e.g. Present)" className="form-input w-1/2" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                      </div>
                    </div>
                    <textarea rows={4} placeholder="Describe your achievements..." className="form-input w-full" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} />
                  </div>
                ))}
                {data.experience.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">No experience added yet. Click &apos;Add Role&apos; to start.</p>}
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                <button onClick={addEducation} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"><Plus className="w-4 h-4" /> Add Education</button>
              </div>
              <div className="space-y-6">
                {data.education.map(edu => (
                  <div key={edu.id} className="p-5 bg-gray-50 dark:bg-gray-950 rounded-xl relative group border border-gray-100 dark:border-gray-800">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Degree (e.g. BS Computer Science)" className="form-input" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                      <input type="text" placeholder="Institution" className="form-input" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} />
                      <input type="text" placeholder="Location" className="form-input" value={edu.location} onChange={e => updateEducation(edu.id, 'location', e.target.value)} />
                      <input type="text" placeholder="GPA (Optional)" className="form-input" value={edu.gpa} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} />
                      <input type="text" placeholder="Start Date" className="form-input" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} />
                      <input type="text" placeholder="End Date" className="form-input" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} />
                    </div>
                  </div>
                ))}
                {data.education.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">No education added yet.</p>}
              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Projects</h2>
                <button onClick={addProject} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"><Plus className="w-4 h-4" /> Add Project</button>
              </div>
              <div className="space-y-6">
                {data.projects.map(proj => (
                  <div key={proj.id} className="p-5 bg-gray-50 dark:bg-gray-950 rounded-xl relative group border border-gray-100 dark:border-gray-800">
                    <button onClick={() => removeProject(proj.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Project Title" className="form-input" value={proj.title} onChange={e => updateProject(proj.id, 'title', e.target.value)} />
                      <input type="text" placeholder="Link (Optional)" className="form-input" value={proj.link} onChange={e => updateProject(proj.id, 'link', e.target.value)} />
                    </div>
                    <textarea rows={3} placeholder="Project Description..." className="form-input w-full" value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} />
                  </div>
                ))}
                {data.projects.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">No projects added yet.</p>}
              </div>
            </section>
          )}

          {currentStep === 6 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Skills</h2>
              <textarea 
                rows={5} 
                placeholder="React, TypeScript, Node.js, Python..." 
                className="form-input w-full"
                value={data.skills}
                onChange={e => setData({...data, skills: e.target.value})}
              />
            </section>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 shrink-0 flex justify-between bg-white dark:bg-gray-900">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${currentStep === 0 ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          
          <button 
            onClick={nextStep}
            disabled={currentStep === STEPS.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${currentStep === STEPS.length - 1 ? 'text-white bg-blue-400 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm'}`}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT PANE: Live Preview */}
      <div className="w-full md:w-[55%] h-screen overflow-y-auto bg-gray-200 dark:bg-gray-800 p-8 flex flex-col items-center custom-scrollbar">
        
        <div className="w-full max-w-4xl flex justify-between items-center mb-6">
          <h3 className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm">LIVE PREVIEW</h3>
          <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        <div className="origin-top transform scale-[0.6] sm:scale-75 md:scale-[0.55] lg:scale-75 xl:scale-90 transition-transform shadow-2xl">
          <ResumePreview ref={printRef} data={data} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          background-color: #f8fafc;
          color: #111827;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .form-input::placeholder {
          color: #6b7280;
          opacity: 1;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .dark .form-input {
          border-color: #374151;
          background-color: #111827;
          color: #f3f4f6;
        }
        .dark .form-input::placeholder {
          color: #9ca3af;
        }
        .dark .form-input:focus {
          border-color: #3b82f6;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
      `}} />
    </div>
  )
}
