export const INTERVIEW_PREP_BATCHES = [
  '23 November to 30 November',
  '1 October to 8 October',
  '9 October to 16 October',
] as const;

export type InterviewPrepBatch = (typeof INTERVIEW_PREP_BATCHES)[number];

export const ALLOWED_RESUME_EXTENSIONS = ['pdf', 'docx', 'doc'] as const;
export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  // Valid contact numbers should contain between 10 and 15 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

export function isValidResumeFile(file: { name: string; size: number } | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!file || typeof file !== 'object' || file.size === 0) {
    return {
      valid: false,
      error: 'Resume upload is mandatory. Please upload your resume in PDF or DOCX format.',
    };
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return {
      valid: false,
      error: 'Resume file size exceeds the 5MB limit.',
    };
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_RESUME_EXTENSIONS.includes(ext as (typeof ALLOWED_RESUME_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: 'Please upload a valid resume in PDF or DOCX format.',
    };
  }

  return { valid: true };
}

