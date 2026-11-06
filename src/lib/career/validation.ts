/**
 * Career Services validation utilities:
 * - Contact number validation (10 to 15 digits, optional + prefix)
 * - LinkedIn Profile URL validation & normalization
 * - Booking date & time slot validation (future date enforcement)
 */

export function isValidPhoneNumber(phone: string): { valid: boolean; normalized?: string; error?: string } {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Contact number is required.' };
  }

  // Remove common separators (spaces, hyphens, parentheses)
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Check if string contains only digits and at most one leading +
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Please enter a valid contact number (10 to 15 digits).',
    };
  }

  // Extract pure digits
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return {
      valid: false,
      error: 'Please enter a valid contact number with at least 10 digits.',
    };
  }

  return { valid: true, normalized: cleaned };
}

export function isValidLinkedInUrl(url: string): { valid: boolean; normalized?: string; error?: string } {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'LinkedIn profile URL is required.' };
  }

  // Prepend https:// if protocol is missing
  let withProto = trimmed;
  if (!/^https?:\/\//i.test(withProto)) {
    withProto = `https://${withProto}`;
  }

  try {
    const parsed = new URL(withProto);
    const host = parsed.hostname.toLowerCase();

    // Hostname must be linkedin.com or subdomain like www.linkedin.com or in.linkedin.com
    const isLinkedInHost = host === 'linkedin.com' || host.endsWith('.linkedin.com');
    if (!isLinkedInHost) {
      return {
        valid: false,
        error: 'Please enter a valid LinkedIn URL (domain must be linkedin.com).',
      };
    }

    // Path must start with /in/, /pub/, or /company/ with an identifier
    const path = parsed.pathname;
    const pathRegex = /^\/(in|pub|company)\/[a-zA-Z0-9_\-\u00C0-\u00FF%]+\/?/i;
    if (!pathRegex.test(path)) {
      return {
        valid: false,
        error: 'Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username).',
      };
    }

    // Normalize protocol and host to clean https://www.linkedin.com
    const normalized = `https://www.linkedin.com${path.replace(/\/+$/, '')}`;
    return { valid: true, normalized };
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid URL (e.g. https://www.linkedin.com/in/username).',
    };
  }
}

export function isValidBookingDate(dateStr: string): { valid: boolean; normalized?: string; error?: string } {
  const trimmed = (dateStr || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'Please select a convenient date for your 1-on-1 session.' };
  }

  // Attempt date parsing
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'Invalid booking date format selected.' };
  }

  // Booking date must be today or in the future (allow 1 hour buffer for same-day selection)
  const now = new Date();
  const pastCutoff = new Date(now.getTime() - 60 * 60 * 1000);
  if (parsed < pastCutoff) {
    return { valid: false, error: 'Booking date cannot be in the past. Please choose an upcoming date.' };
  }

  return { valid: true, normalized: parsed.toISOString() };
}

export const BOOKING_TIME_SLOTS = [
  '10:00 AM - 12:00 PM (Morning)',
  '02:00 PM - 04:00 PM (Afternoon)',
  '04:00 PM - 06:00 PM (Evening)',
  '07:00 PM - 09:00 PM (Night)',
] as const;

