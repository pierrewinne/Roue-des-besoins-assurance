import { describe, it, expect } from 'vitest'
import { isQuestionVisible, QUESTIONS, type Question, type QuestionnaireAnswers } from './schema.ts'

function makeQ(dependsOn: Question['dependsOn']): Question {
  return { id: 'test_q', quadrant: 'biens', label: 'Test', type: 'select', required: true, dependsOn }
}

describe('isQuestionVisible', () => {
  describe('no dependency', () => {
    it('returns true when question has no dependsOn', () => {
      expect(isQuestionVisible(makeQ(undefined), {})).toBe(true)
    })
  })

  describe('eq operator', () => {
    const q = makeQ({ questionId: 'residence_status', operator: 'eq', value: 'resident_gdl' })

    it('returns true when value matches', () => {
      expect(isQuestionVisible(q, { residence_status: 'resident_gdl' })).toBe(true)
    })
    it('returns false when value differs', () => {
      expect(isQuestionVisible(q, { residence_status: 'other' })).toBe(false)
    })
    it('returns false when dependency is undefined', () => {
      expect(isQuestionVisible(q, {})).toBe(false)
    })
  })

  describe('neq operator', () => {
    const q = makeQ({ questionId: 'travel_frequency', operator: 'neq', value: 'never' })

    it('returns true when value differs', () => {
      expect(isQuestionVisible(q, { travel_frequency: 'once_year' })).toBe(true)
    })
    it('returns false when value matches', () => {
      expect(isQuestionVisible(q, { travel_frequency: 'never' })).toBe(false)
    })
    it('returns true when dependency is undefined (undefined !== "never")', () => {
      expect(isQuestionVisible(q, {})).toBe(true)
    })
  })

  describe('in operator', () => {
    const q = makeQ({ questionId: 'family_status', operator: 'in', value: ['couple_with_children', 'single_parent', 'recomposed'] })

    it('returns true when value is in list', () => {
      expect(isQuestionVisible(q, { family_status: 'single_parent' })).toBe(true)
    })
    it('returns false when value is not in list', () => {
      expect(isQuestionVisible(q, { family_status: 'single' })).toBe(false)
    })
    it('returns false when dependency is undefined', () => {
      expect(isQuestionVisible(q, {})).toBe(false)
    })
  })

  describe('not_in operator', () => {
    const q = makeQ({ questionId: 'professional_status', operator: 'not_in', value: ['retired', 'inactive', 'student'] })

    it('returns true when value is not in list', () => {
      expect(isQuestionVisible(q, { professional_status: 'employee' })).toBe(true)
    })
    it('returns false when value is in list', () => {
      expect(isQuestionVisible(q, { professional_status: 'retired' })).toBe(false)
    })
    it('returns true when dependency is undefined (not in list)', () => {
      expect(isQuestionVisible(q, {})).toBe(true)
    })
  })

  describe('gt operator', () => {
    const q = makeQ({ questionId: 'vehicle_count', operator: 'gt', value: 0 })

    it('returns true when numeric value is greater', () => {
      expect(isQuestionVisible(q, { vehicle_count: 2 })).toBe(true)
    })
    it('returns false when numeric value is equal', () => {
      expect(isQuestionVisible(q, { vehicle_count: 0 })).toBe(false)
    })
    it('returns false when numeric value is less', () => {
      expect(isQuestionVisible(q, { vehicle_count: -1 })).toBe(false)
    })
    it('returns false when dependency is not a number', () => {
      expect(isQuestionVisible(q, { vehicle_count: 'two' })).toBe(false)
    })
    it('returns false when dependency is undefined', () => {
      expect(isQuestionVisible(q, {})).toBe(false)
    })
  })

  describe('gte operator', () => {
    const q = makeQ({ questionId: 'vehicle_count', operator: 'gte', value: 1 })

    it('returns true when value is greater', () => {
      expect(isQuestionVisible(q, { vehicle_count: 2 })).toBe(true)
    })
    it('returns true when value is equal', () => {
      expect(isQuestionVisible(q, { vehicle_count: 1 })).toBe(true)
    })
    it('returns false when value is less', () => {
      expect(isQuestionVisible(q, { vehicle_count: 0 })).toBe(false)
    })
  })

  describe('contains operator', () => {
    const q = makeQ({ questionId: 'valuable_possessions', operator: 'contains', value: 'jewelry' })

    it('returns true when array contains the value', () => {
      expect(isQuestionVisible(q, { valuable_possessions: ['jewelry', 'art'] })).toBe(true)
    })
    it('returns false when array does not contain the value', () => {
      expect(isQuestionVisible(q, { valuable_possessions: ['art'] })).toBe(false)
    })
    it('returns true when scalar matches (fallback)', () => {
      expect(isQuestionVisible(q, { valuable_possessions: 'jewelry' })).toBe(true)
    })
    it('returns false when scalar differs', () => {
      expect(isQuestionVisible(q, { valuable_possessions: 'art' })).toBe(false)
    })
  })

  describe('not_contains operator', () => {
    const q = makeQ({ questionId: 'valuable_possessions', operator: 'not_contains', value: 'none' })

    it('returns true when array does not contain the value', () => {
      expect(isQuestionVisible(q, { valuable_possessions: ['jewelry', 'art'] })).toBe(true)
    })
    it('returns false when array contains the value', () => {
      expect(isQuestionVisible(q, { valuable_possessions: ['none'] })).toBe(false)
    })
    it('returns true when scalar differs', () => {
      expect(isQuestionVisible(q, { valuable_possessions: 'jewelry' })).toBe(true)
    })
    it('returns false when scalar matches', () => {
      expect(isQuestionVisible(q, { valuable_possessions: 'none' })).toBe(false)
    })
  })

  describe('real-world schema questions', () => {
    it('children_count is visible when family has children', () => {
      const childrenQ = QUESTIONS.find(q => q.id === 'children_count')!
      expect(isQuestionVisible(childrenQ, { family_status: 'couple_with_children' })).toBe(true)
    })

    it('children_count is hidden for singles', () => {
      const childrenQ = QUESTIONS.find(q => q.id === 'children_count')!
      expect(isQuestionVisible(childrenQ, { family_status: 'single' })).toBe(false)
    })

    it('esg_interest depends on residence_status eq resident_gdl', () => {
      const esgQ = QUESTIONS.find(q => q.id === 'esg_interest')!
      expect(isQuestionVisible(esgQ, { residence_status: 'resident_gdl' })).toBe(true)
      expect(isQuestionVisible(esgQ, { residence_status: 'frontalier_fr' })).toBe(false)
    })

    it('vehicle_details depends on vehicle_count gt 0', () => {
      const vQ = QUESTIONS.find(q => q.id === 'vehicle_details')!
      expect(isQuestionVisible(vQ, { vehicle_count: 1 })).toBe(true)
      expect(isQuestionVisible(vQ, { vehicle_count: 0 })).toBe(false)
    })
  })
})
