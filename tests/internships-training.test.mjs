import assert from 'node:assert/strict'
import test from 'node:test'
import {
  INTERNSHIP_OPPORTUNITIES,
  TRAINING_PROGRAMS,
  getTraining,
  getTrainingByProductCode,
} from '../src/lib/internships-training/data.ts'

test('loads all 4 internship opportunities from the PDF', () => {
  assert.equal(INTERNSHIP_OPPORTUNITIES.length, 4)

  const titles = INTERNSHIP_OPPORTUNITIES.map((i) => i.title)
  assert.equal(titles.includes('Graphic Designing Intern'), true)
  assert.equal(titles.includes('Website Development Intern'), true)
  assert.equal(titles.includes('Business Development Intern'), true)
  assert.equal(titles.includes('Social Media Management Intern'), true)

  for (const item of INTERNSHIP_OPPORTUNITIES) {
    assert.ok(item.title, 'Title must not be empty')
    assert.ok(item.duration, 'Duration must not be empty')
    assert.ok(item.workMode, 'Work mode must not be empty')
    assert.ok(item.aboutRole, 'About role must not be empty')
    assert.ok(item.responsibilities.length > 0, 'Responsibilities must not be empty')
    assert.ok(item.requirements.length > 0, 'Requirements must not be empty')
    assert.ok(item.benefits.length > 0, 'Benefits must not be empty')
  }
})

test('loads all 5 training programs from the PDF with correct fees', () => {
  assert.equal(TRAINING_PROGRAMS.length, 5)

  const graphic = getTraining('graphic-designing-training')
  assert.ok(graphic)
  assert.equal(graphic.fee, '₹5000 per month')
  assert.equal(graphic.pricePaise, 500000)

  const marketing = getTraining('marketing-training')
  assert.ok(marketing)
  assert.equal(marketing.fee, '₹5000 per month')
  assert.equal(marketing.pricePaise, 500000)

  const smm = getTraining('social-media-marketing-training')
  assert.ok(smm)
  assert.equal(smm.fee, '₹4999 per month')
  assert.equal(smm.pricePaise, 499900)

  const dm = getTraining('digital-marketing-training')
  assert.ok(dm)
  assert.equal(dm.fee, '₹4999 per month')
  assert.equal(dm.pricePaise, 499900)

  const bd = getTraining('business-development-training')
  assert.ok(bd)
  assert.equal(bd.fee, '₹4999 per month')
  assert.equal(bd.pricePaise, 499900)

  for (const item of TRAINING_PROGRAMS) {
    assert.ok(item.title, 'Title must not be empty')
    assert.ok(item.duration, 'Duration must not be empty')
    assert.ok(item.workMode, 'Work mode must not be empty')
    assert.ok(item.aboutTraining, 'About training must not be empty')
    assert.ok(item.whatYouWillLearn.length > 0, 'What you will learn must not be empty')
    assert.ok(item.whoCanApply, 'Who can apply must not be empty')
    assert.ok(item.benefits.length > 0, 'Benefits must not be empty')
  }
})

test('finds training program by product code', () => {
  const graphic = getTrainingByProductCode('training:graphic-designing')
  assert.ok(graphic)
  assert.equal(graphic.pricePaise, 500000)

  const smm = getTrainingByProductCode('training:social-media-marketing')
  assert.ok(smm)
  assert.equal(smm.pricePaise, 499900)

  const invalid = getTrainingByProductCode('training:non-existent')
  assert.equal(invalid, undefined)
})
