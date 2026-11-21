import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateFullName,
  validatePhoneNumber,
  validateProfessionalSummary,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MIN_DIGITS,
  PHONE_MAX_DIGITS,
  MAX_SUMMARY_LENGTH,
} from '../src/lib/validation/form-fields.ts';

test('constants have expected standard values', () => {
  assert.equal(NAME_MIN_LENGTH, 2);
  assert.equal(NAME_MAX_LENGTH, 50);
  assert.equal(PHONE_MIN_DIGITS, 10);
  assert.equal(PHONE_MAX_DIGITS, 15);
  assert.equal(MAX_SUMMARY_LENGTH, 500);
});

test('validateFullName accepts valid names with letters, spaces, hyphens, periods, and apostrophes', () => {
  const validCases = [
    'Rahul Sharma',
    'Aditi Verma',
    'Mary-Jane Watson',
    "O'Connor",
    'Dr. John Smith',
    'Élodie Østergård',
    'Anne-Marie O’Neil',
    'Al', // exactly 2 chars
    'A'.repeat(50), // exactly 50 chars
  ];

  for (const name of validCases) {
    const res = validateFullName(name);
    assert.equal(res.valid, true, `Expected "${name}" to be valid`);
    assert.ok(res.normalized);
  }
});

test('validateFullName rejects empty, too short, too long, and invalid format names', () => {
  // Empty & whitespace
  assert.equal(validateFullName('').valid, false);
  assert.equal(validateFullName('   ').valid, false);
  assert.equal(validateFullName(null).valid, false);
  assert.equal(validateFullName(undefined).valid, false);
  assert.match(validateFullName('').error || '', /required/i);

  // Too short (< 2 chars)
  const tooShort = validateFullName('A');
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.error || '', /at least 2 characters/i);

  // Too long (> 50 chars by default)
  const tooLong = validateFullName('A'.repeat(51));
  assert.equal(tooLong.valid, false);
  assert.match(tooLong.error || '', /cannot exceed 50 characters/i);

  // Numbers in name
  const withNumbers = validateFullName('John123');
  assert.equal(withNumbers.valid, false);
  assert.match(withNumbers.error || '', /can only contain letters/i);

  // Symbols in name
  const withSymbols = validateFullName('Rahul@Sharma');
  assert.equal(withSymbols.valid, false);
  assert.match(withSymbols.error || '', /can only contain letters/i);

  // Non-letters only
  const noLetters = validateFullName('--- ...');
  assert.equal(noLetters.valid, false);
  assert.match(noLetters.error || '', /must contain at least one letter/i);
});

test('validateFullName supports custom options', () => {
  // Custom fieldName
  const customField = validateFullName('', { fieldName: 'Candidate name' });
  assert.match(customField.error || '', /Candidate name is required/i);

  // Custom minLength
  const customMin = validateFullName('Abc', { minLength: 5 });
  assert.equal(customMin.valid, false);
  assert.match(customMin.error || '', /at least 5 characters/i);

  // Custom maxLength (e.g. 100 for certificates)
  const customMax = validateFullName('A'.repeat(80), { maxLength: 100 });
  assert.equal(customMax.valid, true);

  // Optional name
  const optionalEmpty = validateFullName('', { required: false });
  assert.equal(optionalEmpty.valid, true);
});

test('validatePhoneNumber accepts valid standard and international phone numbers', () => {
  const validCases = [
    { input: '9876543210', expected: '9876543210' },
    { input: '+919876543210', expected: '+919876543210' },
    { input: '+91 98765 43210', expected: '+919876543210' },
    { input: '+1 (555) 234-5678', expected: '+15552345678' },
    { input: '09876543210', expected: '09876543210' },
    { input: '123456789012345', expected: '123456789012345' }, // 15 digits
  ];

  for (const { input, expected } of validCases) {
    const res = validatePhoneNumber(input);
    assert.equal(res.valid, true, `Expected "${input}" to be valid`);
    assert.equal(res.normalized, expected);
  }
});

test('validatePhoneNumber rejects empty, invalid length, and malformed phone numbers', () => {
  // Empty & whitespace
  assert.equal(validatePhoneNumber('').valid, false);
  assert.equal(validatePhoneNumber('   ').valid, false);
  assert.equal(validatePhoneNumber(null).valid, false);
  assert.equal(validatePhoneNumber(undefined).valid, false);
  assert.match(validatePhoneNumber('').error || '', /required/i);

  // Too short (< 10 digits)
  const tooShort = validatePhoneNumber('12345');
  assert.equal(tooShort.valid, false);
  assert.match(tooShort.error || '', /at least 10 digits/i);

  // Too long (> 15 digits)
  const tooLong = validatePhoneNumber('1234567890123456');
  assert.equal(tooLong.valid, false);
  assert.match(tooLong.error || '', /cannot exceed 15 digits/i);

  // Contains letters
  const withLetters = validatePhoneNumber('abcdefghij');
  assert.equal(withLetters.valid, false);
  assert.match(withLetters.error || '', /digits, spaces, and optional \+ only/i);

  // Letters mixed with digits
  const mixed = validatePhoneNumber('+91 98765-ABCDE');
  assert.equal(mixed.valid, false);
  assert.match(mixed.error || '', /digits, spaces, and optional \+ only/i);

  // Invalid symbols
  const invalidSymbols = validatePhoneNumber('9876543210#@');
  assert.equal(invalidSymbols.valid, false);
  assert.match(invalidSymbols.error || '', /digits, spaces, and optional \+ only/i);
});

test('validatePhoneNumber supports custom options', () => {
  // Custom fieldName
  const customField = validatePhoneNumber('', { fieldName: 'WhatsApp phone number' });
  assert.match(customField.error || '', /WhatsApp phone number is required/i);

  // Optional phone
  const optionalEmpty = validatePhoneNumber('', { required: false });
  assert.equal(optionalEmpty.valid, true);
});

test('validateProfessionalSummary enforces maximum character limit of 500', () => {
  // Empty or non-string inputs are valid (optional summary)
  assert.equal(validateProfessionalSummary('').valid, true);
  assert.equal(validateProfessionalSummary(null).valid, true);
  assert.equal(validateProfessionalSummary(undefined).valid, true);

  // Normal length summary
  const normalSummary = 'Full-stack software developer with 4 years of experience building modern web applications.';
  const normalRes = validateProfessionalSummary(normalSummary);
  assert.equal(normalRes.valid, true);
  assert.equal(normalRes.value, normalSummary);

  // Exactly 500 characters
  const exact500 = 'A'.repeat(500);
  const exactRes = validateProfessionalSummary(exact500);
  assert.equal(exactRes.valid, true);

  // Exceeding limit (501 characters)
  const tooLong = 'A'.repeat(501);
  const tooLongRes = validateProfessionalSummary(tooLong);
  assert.equal(tooLongRes.valid, false);
  assert.match(tooLongRes.error || '', /Professional summary cannot exceed 500 characters/i);
  assert.match(tooLongRes.error || '', /currently 501/i);

  // Custom limit
  const customLimitRes = validateProfessionalSummary('A'.repeat(300), 200);
  assert.equal(customLimitRes.valid, false);
  assert.match(customLimitRes.error || '', /cannot exceed 200 characters/i);
});
