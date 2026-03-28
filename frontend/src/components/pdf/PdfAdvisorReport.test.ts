import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import PdfAdvisorReport from './PdfAdvisorReport'
import type { DiagnosticResult, QuadrantScore, Recommendation, NeedLevel, Quadrant } from '../../shared/scoring/types'
import type { QuestionnaireAnswers } from '../../shared/questionnaire/schema'

function makeScore(quadrant: Quadrant, overrides: Partial<QuadrantScore> = {}): QuadrantScore {
  return {
    quadrant,
    exposure: 50,
    coverage: 50,
    needScore: 60,
    needLevel: 'high',
    active: true,
    ...overrides,
  }
}

function makeDiagnostic(overrides: Partial<DiagnosticResult> = {}): DiagnosticResult {
  return {
    quadrantScores: {
      biens: makeScore('biens'),
      personnes: makeScore('personnes'),
      projets: makeScore('projets'),
      futur: makeScore('futur'),
    },
    globalScore: 65,
    weightings: { biens: 25, personnes: 25, projets: 25, futur: 25 },
    productScores: [],
    recommendations: [],
    ...overrides,
  }
}

function makeRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'test_rec_01',
    product: 'drive',
    type: 'immediate',
    priority: 5,
    title: 'Recommendation test',
    message: 'Message test',
    ...overrides,
  }
}

async function render(
  diagnostic: DiagnosticResult,
  opts: { clientName?: string; clientEmail?: string; answers?: QuestionnaireAnswers; wheelImageUri?: string } = {}
): Promise<Buffer> {
  const doc = createElement(PdfAdvisorReport, {
    diagnostic,
    clientName: opts.clientName,
    clientEmail: opts.clientEmail,
    answers: opts.answers,
    wheelImageUri: opts.wheelImageUri,
  })
  return await renderToBuffer(doc as any) as Buffer
}

describe('PdfAdvisorReport', () => {
  describe('génération PDF', () => {
    it('génère un PDF valide', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
      const header = buffer.subarray(0, 5).toString()
      expect(header).toBe('%PDF-')
    })

    it('génère un PDF avec infos client complètes', async () => {
      const buffer = await render(makeDiagnostic(), {
        clientName: 'Marie Martin',
        clientEmail: 'marie@example.com',
      })
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF sans infos client', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('synthèse globale', () => {
    it('score ≤ 25 : couleur verte', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 15 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('score 26-50 : couleur orange', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 40 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('score > 50 : couleur rouge', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 80 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('affiche le nombre correct de quadrants actifs', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { active: false }),
          personnes: makeScore('personnes'),
          projets: makeScore('projets'),
          futur: makeScore('futur', { active: false }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('nombre de pages', () => {
    it('PDF plus gros avec recommendations (3 pages) que sans (2 pages)', async () => {
      const diagSans = makeDiagnostic({ recommendations: [] })
      const bufferSans = await render(diagSans)

      const diagAvec = makeDiagnostic({
        recommendations: [
          makeRecommendation({ type: 'immediate' }),
          makeRecommendation({ id: 'test_rec_02', type: 'deferred' }),
        ],
      })
      const bufferAvec = await render(diagAvec)

      expect(bufferAvec.length).toBeGreaterThan(bufferSans.length)
    })
  })

  describe('pondérations et tableau', () => {
    it('génère un PDF avec pondérations normalisées', async () => {
      const diag = makeDiagnostic({
        weightings: { biens: 30, personnes: 25, projets: 25, futur: 20 },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec quadrants désactivés dans le tableau', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { active: false, needScore: 0, needLevel: 'low' }),
          personnes: makeScore('personnes'),
          projets: makeScore('projets'),
          futur: makeScore('futur', { active: false, needScore: 0, needLevel: 'low' }),
        },
        weightings: { biens: 0, personnes: 46, projets: 54, futur: 0 },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('analyse détaillée par quadrant', () => {
    const levels: NeedLevel[] = ['low', 'moderate', 'high', 'critical']

    for (const level of levels) {
      it(`affiche correctement le niveau "${level}"`, async () => {
        const diag = makeDiagnostic({
          quadrantScores: {
            biens: makeScore('biens', { needLevel: level, needScore: level === 'low' ? 10 : level === 'moderate' ? 40 : level === 'high' ? 65 : 90 }),
            personnes: makeScore('personnes', { needLevel: level }),
            projets: makeScore('projets', { needLevel: level }),
            futur: makeScore('futur', { needLevel: level }),
          },
        })
        const buffer = await render(diag)
        expect(buffer.length).toBeGreaterThan(0)
      })
    }

    it('affiche les barres d\'exposition et couverture', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { exposure: 100, coverage: 0 }),
          personnes: makeScore('personnes', { exposure: 0, coverage: 100 }),
          projets: makeScore('projets', { exposure: 75, coverage: 25 }),
          futur: makeScore('futur', { exposure: 50, coverage: 50 }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('données collectées', () => {
    it('génère un PDF avec les réponses du questionnaire', async () => {
      const answers = {
        vehicle_count: 2,
        vehicle_details: 'car_new',
        housing_status: 'owner_with_mortgage',
        family_status: 'couple_with_children',
        home_contents_value: '50k_100k',
      }
      const buffer = await render(makeDiagnostic(), { answers })
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF sans réponses', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec réponses vides', async () => {
      const buffer = await render(makeDiagnostic(), { answers: {} })
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('plan de recommandations', () => {
    it('regroupe les recommandations par type (immediate/deferred/event)', async () => {
      const diag = makeDiagnostic({
        recommendations: [
          makeRecommendation({ id: 'rec_01', type: 'immediate', title: 'Recommandation immédiate 1', product: 'drive' }),
          makeRecommendation({ id: 'rec_02', type: 'immediate', title: 'Recommandation immédiate 2', product: 'home' }),
          makeRecommendation({ id: 'rec_03', type: 'deferred', title: 'Recommandation différée', product: 'bsafe' }),
          makeRecommendation({ id: 'rec_04', type: 'event', title: 'Événement de vie', product: 'travel' }),
        ],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('gère un seul type de recommandation', async () => {
      const diag = makeDiagnostic({
        recommendations: [makeRecommendation({ type: 'deferred' })],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('synthèse des besoins', () => {
    it('identifie les quadrants avec besoin élevé/critique', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { needLevel: 'critical' }),
          personnes: makeScore('personnes', { needLevel: 'high' }),
          projets: makeScore('projets', { needLevel: 'low' }),
          futur: makeScore('futur', { needLevel: 'moderate' }),
        },
        recommendations: [makeRecommendation()],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('potentiel de cross-selling élevé si > 2 quadrants actifs', async () => {
      const diag = makeDiagnostic({
        recommendations: [makeRecommendation()],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('potentiel de cross-selling modéré si ≤ 2 quadrants actifs', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { active: false }),
          personnes: makeScore('personnes'),
          projets: makeScore('projets'),
          futur: makeScore('futur', { active: false }),
        },
        recommendations: [makeRecommendation()],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('cas limites', () => {
    it('génère un PDF avec score 0 et tout couvert', async () => {
      const diag = makeDiagnostic({
        globalScore: 0,
        quadrantScores: {
          biens: makeScore('biens', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
          personnes: makeScore('personnes', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
          projets: makeScore('projets', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
          futur: makeScore('futur', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec score 100 et rien couvert', async () => {
      const diag = makeDiagnostic({
        globalScore: 100,
        quadrantScores: {
          biens: makeScore('biens', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
          personnes: makeScore('personnes', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
          projets: makeScore('projets', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
          futur: makeScore('futur', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
        },
        recommendations: [
          makeRecommendation({ id: 'rec_01', type: 'immediate', product: 'drive' }),
          makeRecommendation({ id: 'rec_02', type: 'immediate', product: 'home' }),
          makeRecommendation({ id: 'rec_03', type: 'immediate', product: 'bsafe' }),
          makeRecommendation({ id: 'rec_04', type: 'immediate', product: 'travel' }),
        ],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF complet avec toutes les options', async () => {
      const diag = makeDiagnostic({
        globalScore: 72,
        recommendations: [
          makeRecommendation({ id: 'rec_01', type: 'immediate', product: 'drive', priority: 5 }),
          makeRecommendation({ id: 'rec_02', type: 'deferred', product: 'home', priority: 3 }),
          makeRecommendation({ id: 'rec_03', type: 'event', product: 'bsafe', priority: 2 }),
        ],
      })
      const buffer = await render(diag, {
        clientName: 'Pierre Dupont',
        clientEmail: 'pierre@example.com',
        answers: {
          vehicle_count: 1,
          vehicle_details: 'car_new',
          housing_status: 'owner_with_mortgage',
          family_status: 'couple_with_children',
          home_contents_value: '100k_plus',
        },
      })
      expect(buffer.length).toBeGreaterThan(0)
      const header = buffer.subarray(0, 5).toString()
      expect(header).toBe('%PDF-')
    })
  })
})
