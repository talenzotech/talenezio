import assert from 'node:assert/strict'
import test from 'node:test'
import {
  VALID_EXPERIENCES,
  AVAILABLE_INTERESTS,
  validateProfileData,
} from '../src/lib/profile/validation.ts'

test('validates experience levels', () => {
  assert.equal(VALID_EXPERIENCES.includes('Fresher'), true)
  assert.equal(VALID_EXPERIENCES.includes('Internship Experience'), true)
  assert.equal(VALID_EXPERIENCES.includes('Experienced'), true)
  assert.equal(VALID_EXPERIENCES.includes('Senior Manager'), false)
})

test('validates core interest categories are present', () => {
  assert.equal(AVAILABLE_INTERESTS.includes('Technology'), true)
  assert.equal(AVAILABLE_INTERESTS.includes('Finance'), true)
  assert.equal(AVAILABLE_INTERESTS.includes('Marketing'), true)
  assert.equal(AVAILABLE_INTERESTS.includes('Software Engineering'), true)
  assert.equal(AVAILABLE_INTERESTS.length >= 3, true)
})

test('validates profile data', () => {
  // Valid profile
  const valid = validateProfileData({
    fullName: 'Aditi Verma',
    collegeName: 'IIT Delhi',
    experience: 'Fresher',
    interests: ['Technology', 'Marketing'],
  })
  assert.equal(valid.isValid, true)

  // Empty name
  const emptyName = validateProfileData({
    fullName: '',
    collegeName: 'IIT Delhi',
    experience: 'Fresher',
    interests: ['Technology'],
  })
  assert.equal(emptyName.isValid, false)
  assert.match(emptyName.error || '', /Full name is required/i)

  // Invalid experience
  const invalidExp = validateProfileData({
    fullName: 'Rahul Sharma',
    collegeName: 'BITS Pilani',
    experience: 'InvalidLevel',
    interests: ['Finance'],
  })
  assert.equal(invalidExp.isValid, false)
  assert.match(invalidExp.error || '', /valid experience level/i)

  // No interests
  const noInterests = validateProfileData({
    fullName: 'Rahul Sharma',
    collegeName: 'BITS Pilani',
    experience: 'Fresher',
    interests: [],
  })
  assert.equal(noInterests.isValid, false)
  assert.match(noInterests.error || '', /at least one interest/i)
})
