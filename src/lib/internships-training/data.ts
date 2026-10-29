export interface InternshipOpportunity {
  id: string
  title: string
  type: 'internship'
  duration: string
  workMode: string
  aboutRole: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  tags: string[]
  shortDescription: string
  iconType: 'pen' | 'code' | 'chart' | 'megaphone'
  colorScheme: 'purple' | 'emerald' | 'amber' | 'indigo'
}

export interface TrainingProgram {
  id: string
  title: string
  type: 'training'
  productCode: string
  duration: string
  workMode: string
  aboutTraining: string
  whatYouWillLearn: string[]
  whoCanApply: string
  benefits: string[]
  fee: string
  pricePaise: number
  shortDescription: string
  iconType: 'laptop' | 'finance' | 'megaphone' | 'code' | 'lightbulb'
  colorScheme: 'blue' | 'emerald' | 'purple' | 'sky' | 'rose'
}

export const INTERNSHIP_OPPORTUNITIES: InternshipOpportunity[] = [
  {
    id: 'graphic-designing-intern',
    title: 'Graphic Designing Intern',
    type: 'internship',
    duration: '1 Month',
    workMode: 'Work From Home',
    shortDescription:
      'Create social media posts, banners and promotional creatives for various platforms.',
    tags: ['Creativity', 'Design Tools', 'Communication'],
    iconType: 'pen',
    colorScheme: 'purple',
    aboutRole:
      'We are looking for a creative Graphic Designing Intern to create visually appealing designs for social media platforms, website and promotional campaigns.',
    responsibilities: [
      'Create social media posts, banners and promotional creatives.',
      'Design graphics for Instagram and LinkedIn.',
      'Maintain consistent branding across designs.',
      'Collaborate with the marketing team on campaigns.',
      'Make design improvements based on feedback.',
    ],
    requirements: [
      'Basic knowledge of Canva or other graphic design tools.',
      'Creativity and attention to detail.',
      'Willingness to learn and experiment with new ideas.',
    ],
    benefits: [
      'Practical experience in graphic designing.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'website-development-intern',
    title: 'Website Development Intern',
    type: 'internship',
    duration: '1 Month',
    workMode: 'Work From Home',
    shortDescription:
      'Build and maintain responsive websites using modern technologies like HTML, CSS and JavaScript.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    iconType: 'code',
    colorScheme: 'emerald',
    aboutRole:
      'Join our team to help develop, improve and maintain the Talenezio website while gaining practical experience in website development.',
    responsibilities: [
      'Assist in developing and updating website pages.',
      'Improve website layout, responsiveness and user experience.',
      'Identify and fix website issues.',
      'Test website features and report bugs.',
      'Collaborate with the team to implement new features.',
    ],
    requirements: [
      'Basic knowledge of HTML, CSS and JavaScript.',
      'Understanding of responsive website design.',
      'Problem-solving skills and a willingness to learn.',
    ],
    benefits: [
      'Practical website development experience.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'business-development-intern',
    title: 'Business Development Intern',
    type: 'internship',
    duration: '2 Months',
    workMode: 'Work From Home',
    shortDescription:
      'Help with client outreach, market research and business growth strategies.',
    tags: ['Communication', 'Marketing', 'Research'],
    iconType: 'chart',
    colorScheme: 'amber',
    aboutRole:
      'We are looking for motivated individuals to help Talenezio build partnerships, explore business opportunities and expand its reach among students, colleges and professionals.',
    responsibilities: [
      'Identify potential partners, colleges and clients.',
      'Reach out to prospects through email, LinkedIn and other channels.',
      'Assist with partnership development and lead generation.',
      'Research market trends and competitors.',
      'Maintain records of leads and follow-ups.',
      'Support business growth initiatives.',
    ],
    requirements: [
      'Good communication and interpersonal skills.',
      'Interest in sales, networking and business strategy.',
      'Confidence in approaching potential partners.',
      'A proactive attitude and willingness to learn.',
    ],
    benefits: [
      'Practical business development experience.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'social-media-management-intern',
    title: 'Social Media Management Intern',
    type: 'internship',
    duration: '1–2 Months',
    workMode: 'Work From Home',
    shortDescription:
      'Plan and create content, manage social media channels and track performance.',
    tags: ['Content Creation', 'Social Media', 'Analytics'],
    iconType: 'megaphone',
    colorScheme: 'indigo',
    aboutRole:
      'Help manage Talenezio’s social media presence and build an engaging online community across platforms such as Instagram and LinkedIn.',
    responsibilities: [
      'Plan and schedule social media content.',
      'Manage content calendars and posting schedules.',
      'Monitor comments, messages and audience engagement.',
      'Track social media performance and prepare reports.',
      'Research trends and suggest new content ideas.',
      'Support audience growth and brand awareness campaigns.',
    ],
    requirements: [
      'Understanding of Instagram and LinkedIn.',
      'Good communication and organizational skills.',
      'Creativity and awareness of social media trends.',
      'Basic knowledge of content planning and analytics.',
    ],
    benefits: [
      'Hands-on social media management experience.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
]

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'graphic-designing-training',
    title: 'Graphic Designing Training',
    type: 'training',
    productCode: 'training:graphic-designing',
    duration: '1 Month',
    workMode: 'Online',
    fee: '₹5000 per month',
    pricePaise: 500000,
    shortDescription:
      'Build core technical design skills, master Canva and create real-world visual assets.',
    iconType: 'laptop',
    colorScheme: 'blue',
    aboutTraining:
      'Learn the fundamentals of graphic design and develop practical skills for creating professional digital content.',
    whatYouWillLearn: [
      'Design principles, colours and typography.',
      'Canva and essential design tools.',
      'Social media post and banner creation.',
      'Brand consistency and visual storytelling.',
      'Practical design assignments and feedback.',
    ],
    whoCanApply:
      'Students, beginners and anyone interested in learning graphic design.',
    benefits: [
      'Practical design assignments.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'marketing-training',
    title: 'Marketing Training',
    type: 'training',
    productCode: 'training:marketing',
    duration: '1 Month',
    workMode: 'Online',
    fee: '₹5000 per month',
    pricePaise: 500000,
    shortDescription:
      'Master digital marketing fundamentals, branding, positioning and growth strategies.',
    iconType: 'finance',
    colorScheme: 'emerald',
    aboutTraining:
      'Gain a practical understanding of marketing fundamentals, customer behaviour and strategies used to promote products and services.',
    whatYouWillLearn: [
      'Marketing fundamentals and target audience research.',
      'Branding and positioning.',
      'Digital marketing channels.',
      'Campaign planning and execution.',
      'Basic marketing analytics.',
      'Practical marketing assignments.',
    ],
    whoCanApply:
      'Students, freshers and beginners interested in marketing and business growth.',
    benefits: [
      'Practical marketing knowledge.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'social-media-marketing-training',
    title: 'Social Media Marketing Training',
    type: 'training',
    productCode: 'training:social-media-marketing',
    duration: '1 Month',
    workMode: 'Online',
    fee: '₹4999 per month',
    pricePaise: 499900,
    shortDescription:
      'Learn social media strategy, content calendars, reels, community engagement and viral growth.',
    iconType: 'megaphone',
    colorScheme: 'purple',
    aboutTraining:
      'Learn how to use social media platforms to build a brand, engage audiences and support business growth.',
    whatYouWillLearn: [
      'Instagram and LinkedIn marketing.',
      'Content strategy and content calendars.',
      'Reels, posts, captions and hashtags.',
      'Audience engagement and community building.',
      'Social media insights and performance tracking.',
      'Campaign planning and practical exercises.',
    ],
    whoCanApply:
      'Students, aspiring marketers, creators and beginners interested in social media.',
    benefits: [
      'Practical social media marketing skills.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'digital-marketing-training',
    title: 'Digital Marketing Training',
    type: 'training',
    productCode: 'training:digital-marketing',
    duration: '1 Month',
    workMode: 'Online',
    fee: '₹4999 per month',
    pricePaise: 499900,
    shortDescription:
      'Get hands-on with SEO, content marketing, email marketing and performance analytics.',
    iconType: 'code',
    colorScheme: 'sky',
    aboutTraining:
      'Understand how businesses use digital channels to reach potential customers and grow their online presence.',
    whatYouWillLearn: [
      'Introduction to digital marketing.',
      'Search engine optimization (SEO) basics.',
      'Social media and content marketing.',
      'Email marketing fundamentals.',
      'Digital campaign planning.',
      'Performance measurement and reporting.',
    ],
    whoCanApply:
      'Students, freshers and anyone interested in digital marketing.',
    benefits: [
      'Practical digital marketing knowledge.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
  {
    id: 'business-development-training',
    title: 'Business Development Training',
    type: 'training',
    productCode: 'training:business-development',
    duration: '1 Month',
    workMode: 'Online',
    fee: '₹4999 per month',
    pricePaise: 499900,
    shortDescription:
      'Master client outreach, prospect research, sales fundamentals and business partnerships.',
    iconType: 'lightbulb',
    colorScheme: 'rose',
    aboutTraining:
      'Develop essential business development skills to identify opportunities, communicate with prospects and build professional relationships.',
    whatYouWillLearn: [
      'Lead generation and prospect research.',
      'Professional communication and outreach.',
      'Sales fundamentals and negotiation.',
      'Partnership development.',
      'Client relationship management.',
      'Business research and market analysis.',
    ],
    whoCanApply:
      'Students and beginners interested in business development, sales and entrepreneurship.',
    benefits: [
      'Practical business development knowledge.',
      'Certificate of Completion upon successful completion.',
      'Letter of Recommendation based on performance, commitment and professionalism.',
    ],
  },
]

export function getInternship(id: string): InternshipOpportunity | undefined {
  return INTERNSHIP_OPPORTUNITIES.find((item) => item.id === id)
}

export function getTraining(id: string): TrainingProgram | undefined {
  return TRAINING_PROGRAMS.find((item) => item.id === id)
}

export function getTrainingByProductCode(productCode: string): TrainingProgram | undefined {
  return TRAINING_PROGRAMS.find((item) => item.productCode === productCode)
}
