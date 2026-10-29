export type ExperienceLevel = 'Fresher' | 'Internship Experience' | 'Experienced'

export interface ProfileData {
  fullName: string
  collegeName: string
  experience: ExperienceLevel
  interests: string[]
}

export interface ProfileActionResult {
  success: boolean
  error?: string
  profile?: ProfileData
}

export const VALID_EXPERIENCES: readonly ExperienceLevel[] = [
  'Fresher',
  'Internship Experience',
  'Experienced',
] as const

export const AVAILABLE_INTERESTS: readonly string[] = [
  'Technology',
  'Finance',
  'Marketing',
  'Software Engineering',
  'Product Management',
  'Data & AI',
  'Business & Consulting',
] as const

export function validateProfileData(data: ProfileData): { isValid: boolean; error?: string } {
  const fullName = (data.fullName || '').trim()
  const experience = data.experience || 'Fresher'
  const interests = Array.isArray(data.interests) ? data.interests.filter(Boolean) : []

  if (!fullName || fullName.length < 2) {
    return {
      isValid: false,
      error: 'Full name is required (at least 2 characters).',
    }
  }

  if (!VALID_EXPERIENCES.includes(experience as ExperienceLevel)) {
    return {
      isValid: false,
      error: 'Please select a valid experience level.',
    }
  }

  if (interests.length === 0) {
    return {
      isValid: false,
      error: 'Please select at least one interest.',
    }
  }

  return { isValid: true }
}
