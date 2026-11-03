import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCertificateNumberBase, certificateInitials, certificateDateParts } from '../src/lib/certificates/numbering.ts'

const details = {
  category: 'digital-marketing', testType: 'free', score: 12,
  candidateName: 'Rahul Sharma', issuedAt: '2026-01-20T06:00:00Z',
}

test('uses the specified subject codes and free/paid codes, not display order', () => {
  for (const [category, code] of [['digital-marketing', '1'], ['finance', '2'], ['ai', '3'], ['technology', '4']]) {
    assert.equal(buildCertificateNumberBase({ ...details, category }), `${code}20012612BRS`)
    assert.equal(buildCertificateNumberBase({ ...details, category, testType: 'pro' }), `${code}20012612ARS`)
  }
})

test('IST date crosses day, month, and year at 18:30 UTC', () => {
  assert.deepEqual(certificateDateParts('2026-12-31T18:29:59Z'), { day: '31', month: '12', year: '2026' })
  assert.deepEqual(certificateDateParts('2026-12-31T18:30:00Z'), { day: '01', month: '01', year: '2027' })
  assert.equal(buildCertificateNumberBase({ ...details, issuedAt: '2026-12-31T18:30:00Z', score: 0 }), '10101270BRS')
})

test('initials follow the confirmed short, multi-word, and long-name rules', () => {
  for (const [name, initials] of [
    ['Rahul Sharma', 'RS'], ['Priya Anil Patel', 'PAP'], ['Madonna', 'MA'],
    ['Anita Devi Kumar Sharma', 'ADS'], ['A', 'AA'], ['  Rahul   Sharma  ', 'RS'],
    ['Élodie Østergård', 'EO'], ["Anne-Marie O'Neil", 'AO'],
  ]) assert.equal(certificateInitials(name), initials)
})

test('rejects invalid subjects, test types, scores, names, and dates', () => {
  for (const override of [
    { category: 'unknown' }, { category: 'toString' }, { testType: 'paid' },
    { score: -1 }, { score: 12.5 }, { score: NaN }, { candidateName: '123 --' },
    { issuedAt: 'invalid' },
  ]) assert.throws(() => buildCertificateNumberBase({ ...details, ...override }))
})
