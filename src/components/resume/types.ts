export type ResumeLayout = 'classic' | 'modern' | 'minimalist';

export type ResumeSectionId = 'personal' | 'education' | 'experience' | 'projects' | 'skills' | 'awards';

export interface ResumeData {
  layout: ResumeLayout;
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    portfolio: string;
  };
  links: {
    id: string;
    label: string;
    url: string;
  }[];
  summary: string;
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    score: string;
    courses: string;
  }[];
  skills: string;
  projects: {
    id: string;
    title: string;
    link: string;
    description: string;
  }[];
  awards: {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description: string;
  }[];
  customSections: {
    id: string;
    title: string;
    content: string;
  }[];
  sectionOrder: ResumeSectionId[];
  hiddenSections: ResumeSectionId[];
  sectionLabels: Record<ResumeSectionId, string>;
}

export const defaultSectionOrder: ResumeSectionId[] = [
  'personal',
  'education',
  'experience',
  'projects',
  'skills',
  'awards',
];

export const defaultSectionLabels: Record<ResumeSectionId, string> = {
  personal: 'Personal Information',
  education: 'Education',
  experience: 'Work Experience',
  projects: 'Projects',
  skills: 'Skills',
  awards: 'Awards & Achievements',
};

export const initialResumeData: ResumeData = {
  layout: 'classic',
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    portfolio: '',
  },
  links: [],
  summary: '',
  experience: [],
  education: [],
  skills: '',
  projects: [],
  awards: [],
  customSections: [],
  sectionOrder: defaultSectionOrder,
  hiddenSections: [],
  sectionLabels: defaultSectionLabels,
};
