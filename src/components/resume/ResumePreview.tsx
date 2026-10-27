import { forwardRef, type ReactNode } from 'react'
import { ResumeData, ResumeSectionId } from './types'

interface Props {
  data: ResumeData;
}

const sectionContent: Record<ResumeSectionId, (data: ResumeData) => ReactNode> = {
  personal: data => data.summary ? (
    <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{data.summary}</p>
  ) : null,
  education: data => data.education
    .filter(education => [education.degree, education.institution, education.location, education.startDate, education.endDate, education.gpa, education.score, education.courses].some(value => value.trim()))
    .map(education => {
      const score = education.score || education.gpa
      return (
        <article key={education.id} className="mb-4 break-inside-avoid">
          <div className="flex flex-wrap justify-between gap-x-4">
            <h3 className="font-semibold">{education.degree}</h3>
            <span className="text-sm text-gray-500">{[education.startDate, education.endDate].filter(Boolean).join(' – ')}</span>
          </div>
          <p className="text-gray-700">{[education.institution, education.location].filter(Boolean).join(' · ')}</p>
          {score && <p className="text-sm text-gray-600">Score / GPA: {score}</p>}
          {education.courses && <p className="text-sm text-gray-600">Courses: {education.courses}</p>}
        </article>
      )
    }),
  experience: data => data.experience.filter(experience => [experience.title, experience.company, experience.location, experience.startDate, experience.endDate, experience.description].some(value => value.trim())).map(experience => (
    <article key={experience.id} className="mb-5 break-inside-avoid">
      <div className="flex flex-wrap justify-between gap-x-4">
        <h3 className="font-semibold">{experience.title}</h3>
        <span className="text-sm text-gray-500">{[experience.startDate, experience.endDate].filter(Boolean).join(' – ')}</span>
      </div>
      <p className="text-gray-700">{[experience.company, experience.location].filter(Boolean).join(' · ')}</p>
      {experience.description && <p className="mt-1 whitespace-pre-wrap leading-relaxed text-gray-600">{experience.description}</p>}
    </article>
  )),
  projects: data => data.projects.filter(project => [project.title, project.link, project.description].some(value => value.trim())).map(project => (
    <article key={project.id} className="mb-4 break-inside-avoid">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h3 className="font-semibold">{project.title}</h3>
        {project.link && <span className="text-sm text-gray-500">{project.link}</span>}
      </div>
      {project.description && <p className="mt-1 whitespace-pre-wrap leading-relaxed text-gray-600">{project.description}</p>}
    </article>
  )),
  skills: data => data.skills ? <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{data.skills}</p> : null,
  awards: data => data.awards.filter(award => [award.title, award.issuer, award.date, award.description].some(value => value.trim())).map(award => (
    <article key={award.id} className="mb-4 break-inside-avoid">
      <div className="flex flex-wrap justify-between gap-x-4">
        <h3 className="font-semibold">{award.title}</h3>
        {award.date && <span className="text-sm text-gray-500">{award.date}</span>}
      </div>
      {award.issuer && <p className="text-gray-700">{award.issuer}</p>}
      {award.description && <p className="mt-1 whitespace-pre-wrap leading-relaxed text-gray-600">{award.description}</p>}
    </article>
  )),
};

const sectionHasContent = (id: ResumeSectionId, data: ResumeData) => {
  if (id === 'personal') return Boolean(data.summary.trim());
  if (id === 'skills') return Boolean(data.skills.trim());
  if (id === 'education') return data.education.some(item => [item.degree, item.institution, item.location, item.startDate, item.endDate, item.gpa, item.score, item.courses].some(value => value.trim()));
  if (id === 'experience') return data.experience.some(item => [item.title, item.company, item.location, item.startDate, item.endDate, item.description].some(value => value.trim()));
  if (id === 'projects') return data.projects.some(item => [item.title, item.link, item.description].some(value => value.trim()));
  return data.awards.some(item => [item.title, item.issuer, item.date, item.description].some(value => value.trim()));
};

const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const modern = data.layout === 'modern';
  const minimalist = data.layout === 'minimalist';
  const contactLinks = [
    ...data.links.filter(link => link.label.trim() && link.url.trim()),
    ...(!data.links.some(link => link.label.toLowerCase() === 'linkedin') && data.personalInfo.linkedin
      ? [{ id: 'legacy-linkedin', label: 'LinkedIn', url: data.personalInfo.linkedin }]
      : []),
    ...(!data.links.some(link => link.label.toLowerCase() === 'portfolio') && data.personalInfo.portfolio
      ? [{ id: 'legacy-portfolio', label: 'Portfolio', url: data.personalInfo.portfolio }]
      : []),
  ];
  const wrapperClass = modern
    ? 'min-h-[297mm] w-[210mm] bg-white text-gray-900 shadow-xl'
    : 'min-h-[297mm] w-[210mm] bg-white px-[20mm] py-[18mm] text-gray-900 shadow-xl';

  return (
    <div
      ref={ref}
      className={`${wrapperClass} mx-auto`}
      style={{ boxSizing: 'border-box', fontFamily: modern ? 'Arial, Helvetica, sans-serif' : minimalist ? "'Helvetica Neue', Helvetica, Arial, sans-serif" : "'Times New Roman', Times, serif" }}
    >
      <header className={`${modern ? 'bg-purple-700 px-[18mm] py-[12mm] text-white' : 'mb-8 border-b border-gray-300 pb-5'} ${minimalist ? 'border-b-2 border-gray-900' : ''}`}>
        {data.personalInfo.fullName.trim() && <h1 className={`${modern ? 'text-4xl' : 'text-3xl'} font-bold tracking-tight`}>{data.personalInfo.fullName}</h1>}
        {data.personalInfo.jobTitle && <p className={`mt-1 ${modern ? 'text-lg text-purple-100' : 'text-lg text-gray-600'}`}>{data.personalInfo.jobTitle}</p>}
        <div className={`mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm ${modern ? 'text-purple-100' : 'text-gray-600'}`}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {contactLinks.map(link => <span key={link.id}>{link.label}: {link.url}</span>)}
        </div>
      </header>

      <div className={`${modern ? 'px-[18mm] py-[12mm]' : ''} ${modern ? '' : 'mt-6'}`}>
        {data.sectionOrder
          .filter(id => !data.hiddenSections.includes(id))
          .map(id => {
            if (!sectionHasContent(id, data)) return null;
            const title = id === 'personal' ? 'Professional Summary' : data.sectionLabels[id];
            return (
              <section key={id} className="mb-6 break-inside-avoid-page">
                <h2 className={`mb-3 border-b pb-1 text-sm font-bold uppercase tracking-wider ${modern ? 'border-purple-700 text-purple-800' : minimalist ? 'border-gray-300 text-gray-500' : 'border-gray-400 text-gray-900'}`}>
                  {title}
                </h2>
                <div className="text-sm">{sectionContent[id](data)}</div>
              </section>
            );
          })}
        {data.customSections.map(section => (
          section.content.trim() ? (
            <section key={section.id} className="mb-6 break-inside-avoid-page">
              <h2 className={`mb-3 border-b pb-1 text-sm font-bold uppercase tracking-wider ${modern ? 'border-purple-700 text-purple-800' : 'border-gray-400 text-gray-900'}`}>{section.title}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{section.content}</p>
            </section>
          ) : null
        ))}
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
