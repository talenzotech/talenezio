export type ServiceCode =
  | 'interview-prep'
  | 'career-counseling'
  | 'linkedin-optimization'
  | 'career-starter-pack'
  | 'courses'
  | 'internships';

export type ServiceCatalogItem = {
  code: ServiceCode;
  title: string;
  description: string;
  pricePaise: number | null;
  currency: 'INR';
  paid: boolean;
  freeUnlock: boolean;
  fulfilment: 'session' | 'program' | 'digital' | 'enquiry';
  inclusions: string[];
};

export const SERVICE_CATALOG: Record<ServiceCode, ServiceCatalogItem> = {
  'interview-prep': {
    code: 'interview-prep',
    title: 'Interview Preparation',
    description: 'An 8-day guided preparation program for technical and behavioural interviews.',
    pricePaise: 39900,
    currency: 'INR',
    paid: true,
    freeUnlock: true,
    fulfilment: 'program',
    inclusions: ['3 live Google Meet sessions', '5 mock tests', 'Resume and interview preparation', 'Completion guidance'],
  },
  'career-counseling': {
    code: 'career-counseling',
    title: 'Career Counseling',
    description: 'A focused one-hour session with actionable guidance for your next career move.',
    pricePaise: 29900,
    currency: 'INR',
    paid: true,
    freeUnlock: false,
    fulfilment: 'session',
    inclusions: ['One-hour counselling session', 'Career direction review', 'Action plan', 'Participation certificate'],
  },
  'linkedin-optimization': {
    code: 'linkedin-optimization',
    title: 'LinkedIn Optimization',
    description: 'Improve your LinkedIn profile positioning and recruiter visibility.',
    pricePaise: 14900,
    currency: 'INR',
    paid: true,
    freeUnlock: true,
    fulfilment: 'digital',
    inclusions: ['Profile review', 'Headline and summary recommendations', 'Experience section guidance', 'Five-day access window'],
  },
  'career-starter-pack': {
    code: 'career-starter-pack',
    title: 'Career Starter Pack',
    description: 'A compact career launch package combining assessment, preparation, and resume review.',
    pricePaise: 29900,
    currency: 'INR',
    paid: true,
    freeUnlock: true,
    fulfilment: 'program',
    inclusions: ['10 total test attempts', 'Interview preparation', 'Resume review', 'Certificate of Completion'],
  },
  courses: {
    code: 'courses',
    title: 'Courses',
    description: 'Tell us what you want to learn and we will recommend the right guided course.',
    pricePaise: null,
    currency: 'INR',
    paid: false,
    freeUnlock: false,
    fulfilment: 'enquiry',
    inclusions: ['Course discovery', 'Learning-path guidance', 'Programme availability updates'],
  },
  internships: {
    code: 'internships',
    title: 'Internships',
    description: 'Submit your interests and receive information about relevant internship opportunities.',
    pricePaise: null,
    currency: 'INR',
    paid: false,
    freeUnlock: false,
    fulfilment: 'enquiry',
    inclusions: ['Interest registration', 'Opportunity matching', 'Application guidance'],
  },
};

export function getService(code: string): ServiceCatalogItem | null {
  return code in SERVICE_CATALOG ? SERVICE_CATALOG[code as ServiceCode] : null;
}

export function isServiceCode(value: string): value is ServiceCode {
  return getService(value) !== null;
}

export function serviceProductCode(code: ServiceCode): string {
  return `service:${code}`;
}
