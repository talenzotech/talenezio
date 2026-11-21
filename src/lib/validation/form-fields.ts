/**
 * Centralized Form Field Validation Utilities
 *
 * Provides standardized validation for:
 * - Names (Full Name, Candidate Name, Personal Name):
 *     min 2 chars, max 50/100 chars, letters/accents/spaces/hyphens/periods/apostrophes
 * - Phone / Mobile Numbers (Standard, WhatsApp, Contact):
 *     E.164 compliance, 10 to 15 digits, optional leading +, allowed separators (spaces, hyphens, parens, periods)
 */

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const EXTENDED_NAME_MAX_LENGTH = 100;

export const PHONE_MIN_DIGITS = 10;
export const PHONE_MAX_DIGITS = 15;
export const PHONE_INPUT_MAX_LENGTH = 20;

export const MAX_SUMMARY_LENGTH = 500;

export interface ValidationResult<T = string> {
  valid: boolean;
  value?: T;
  normalized?: T;
  error?: string;
}

export interface NameValidationOptions {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  fieldName?: string;
}

export interface PhoneValidationOptions {
  required?: boolean;
  minDigits?: number;
  maxDigits?: number;
  fieldName?: string;
}

/**
 * Validates a person's name or full name.
 * - Trims whitespace
 * - Enforces minimum and maximum character limits
 * - Verifies allowed characters: letters, spaces, hyphens, periods, apostrophes
 * - Requires at least one letter
 */
export function validateFullName(
  input: unknown,
  options?: NameValidationOptions
): ValidationResult<string> {
  const minLength = options?.minLength ?? NAME_MIN_LENGTH;
  const maxLength = options?.maxLength ?? NAME_MAX_LENGTH;
  const required = options?.required ?? true;
  const fieldName = options?.fieldName ?? 'Full name';

  if (typeof input !== 'string') {
    if (required) {
      return { valid: false, error: `${fieldName} is required.` };
    }
    return { valid: true, value: '' };
  }

  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    if (required) {
      return { valid: false, error: `${fieldName} is required.` };
    }
    return { valid: true, value: '' };
  }

  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters.`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${maxLength} characters.`,
    };
  }

  // Letters (including international Unicode letters \p{L}), spaces, hyphens, periods, apostrophes
  const allowedNamePattern = /^[\p{L}\s.'’\-]+$/u;
  if (!allowedNamePattern.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldName} can only contain letters, spaces, hyphens, periods, and apostrophes.`,
    };
  }

  if (!/\p{L}/u.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldName} must contain at least one letter.`,
    };
  }

  return { valid: true, value: trimmed, normalized: trimmed };
}

/**
 * Validates and normalizes phone / mobile numbers according to E.164 recommendations.
 * - Checks that input only contains allowed characters (digits, spaces, hyphens, parens, periods, optional leading +)
 * - Strips allowed separators and verifies pure digit length (10 to 15 digits)
 * - Returns normalized phone string
 */
export function validatePhoneNumber(
  input: unknown,
  options?: PhoneValidationOptions
): ValidationResult<string> {
  const minDigits = options?.minDigits ?? PHONE_MIN_DIGITS;
  const maxDigits = options?.maxDigits ?? PHONE_MAX_DIGITS;
  const required = options?.required ?? true;
  const fieldName = options?.fieldName ?? 'Contact number';

  if (typeof input !== 'string') {
    if (required) {
      return { valid: false, error: `${fieldName} is required.` };
    }
    return { valid: true, value: '' };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    if (required) {
      return { valid: false, error: `${fieldName} is required.` };
    }
    return { valid: true, value: '' };
  }

  // Ensure only digits, spaces, parentheses, hyphens, periods, and at most one leading +
  const allowedCharsPattern = /^\+?[0-9\s().-]+$/;
  if (!allowedCharsPattern.test(trimmed)) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()} (digits, spaces, and optional + only).`,
    };
  }

  // Remove common separators
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, '');

  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length < minDigits) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()} (at least ${minDigits} digits).`,
    };
  }

  if (digitsOnly.length > maxDigits) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${maxDigits} digits.`,
    };
  }

  // Check valid regex format with optional leading + and digits
  const phoneFormatRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneFormatRegex.test(cleaned)) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()} (10 to 15 digits).`,
    };
  }

  return { valid: true, value: cleaned, normalized: cleaned };
}

/**
 * Validates a professional summary text.
 * - Enforces maximum character limit (default 500)
 * - Returns validation error if limit is exceeded
 */
export function validateProfessionalSummary(
  summary: unknown,
  maxLength = MAX_SUMMARY_LENGTH
): ValidationResult<string> {
  if (typeof summary !== 'string') {
    return { valid: true, value: '', normalized: '' };
  }

  if (summary.length > maxLength) {
    return {
      valid: false,
      error: `Professional summary cannot exceed ${maxLength} characters (currently ${summary.length}).`,
    };
  }

  return { valid: true, value: summary, normalized: summary };
}
