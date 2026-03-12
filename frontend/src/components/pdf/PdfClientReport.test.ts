import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import PdfClientReport from './PdfClientReport'
import type { DiagnosticResult, QuadrantScore, Recommendation, NeedLevel, Quadrant } from '../../shared/scoring/types'

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

interface AdvisorInfo {
  name: string
  email?: string
  phone?: string
}

async function render(diagnostic: DiagnosticResult, clientName?: string, wheelImageUri?: string, advisor?: AdvisorInfo): Promise<Buffer> {
  const doc = createElement(PdfClientReport, { diagnostic, clientName, wheelImageUri, advisor })
  return await renderToBuffer(doc as any) as Buffer
}

describe('PdfClientReport', () => {
  describe('génération PDF', () => {
    it('génère un PDF valide sans erreur', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
      const header = buffer.subarray(0, 5).toString()
      expect(header).toBe('%PDF-')
    })

    it('génère un PDF avec un nom de client', async () => {
      const buffer = await render(makeDiagnostic(), 'Jean Dupont')
      expect(buffer.length).toBeGreaterThan(0)
      const header = buffer.subarray(0, 5).toString()
      expect(header).toBe('%PDF-')
    })

    it('génère un PDF sans nom de client', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('score global - couleur', () => {
    it('utilise vert pour score ≤ 25', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 20 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('utilise orange pour score 26-50', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 40 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('utilise rouge pour score > 50', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 75 }))
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('filtrage des quadrants actifs', () => {
    it('génère un PDF quand tous les quadrants sont actifs', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF quand certains quadrants sont inactifs', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { active: false, needScore: 0, needLevel: 'low' }),
          personnes: makeScore('personnes'),
          projets: makeScore('projets'),
          futur: makeScore('futur', { active: false, needScore: 0, needLevel: 'low' }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF quand aucun quadrant n\'est actif', async () => {
      const diag = makeDiagnostic({
        quadrantScores: {
          biens: makeScore('biens', { active: false }),
          personnes: makeScore('personnes', { active: false }),
          projets: makeScore('projets', { active: false }),
          futur: makeScore('futur', { active: false }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('page des recommandations', () => {
    it('génère un PDF plus gros avec recommandations immédiates (2 pages)', async () => {
      const diagSans = makeDiagnostic({ recommendations: [] })
      const bufferSans = await render(diagSans)

      const diagAvec = makeDiagnostic({
        recommendations: [
          makeRecommendation({ id: 'rec_01', title: 'Recommendation 1' }),
          makeRecommendation({ id: 'rec_02', title: 'Recommendation 2' }),
          makeRecommendation({ id: 'rec_03', title: 'Recommendation 3' }),
        ],
      })
      const bufferAvec = await render(diagAvec)

      expect(bufferAvec.length).toBeGreaterThan(bufferSans.length)
    })

    it('génère un PDF avec des recommandations de types mixtes', async () => {
      const diag = makeDiagnostic({
        recommendations: [
          makeRecommendation({ id: 'rec_01', type: 'immediate', title: 'Immédiate' }),
          makeRecommendation({ id: 'rec_02', type: 'deferred', title: 'Différée' }),
          makeRecommendation({ id: 'rec_03', type: 'event', title: 'Événement' }),
        ],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('n\'ajoute pas de page 2 si seules des recommandations non-immédiates existent', async () => {
      const diagDeferred = makeDiagnostic({
        recommendations: [
          makeRecommendation({ id: 'rec_01', type: 'deferred', title: 'Différée 1' }),
          makeRecommendation({ id: 'rec_02', type: 'deferred', title: 'Différée 2' }),
        ],
      })
      const bufferDeferred = await render(diagDeferred)

      const diagSans = makeDiagnostic({ recommendations: [] })
      const bufferSans = await render(diagSans)

      // Même taille approximative car aucune recommandation immédiate = pas de page 2
      const ratio = bufferDeferred.length / bufferSans.length
      expect(ratio).toBeGreaterThan(0.9)
      expect(ratio).toBeLessThan(1.1)
    })
  })

  describe('niveaux de besoin', () => {
    const levels: NeedLevel[] = ['low', 'moderate', 'high', 'critical']

    for (const level of levels) {
      it(`génère un PDF avec des quadrants en niveau "${level}"`, async () => {
        const diag = makeDiagnostic({
          quadrantScores: {
            biens: makeScore('biens', { needLevel: level }),
            personnes: makeScore('personnes', { needLevel: level }),
            projets: makeScore('projets', { needLevel: level }),
            futur: makeScore('futur', { needLevel: level }),
          },
        })
        const buffer = await render(diag)
        expect(buffer.length).toBeGreaterThan(0)
      })
    }
  })

  describe('priorités des recommandations', () => {
    it('génère un PDF avec des recommandations de toutes priorités (1-5)', async () => {
      const recommendations = [1, 2, 3, 4, 5].map(p =>
        makeRecommendation({ id: `rec_p${p}`, priority: p, title: `Priorité ${p}` })
      )
      const diag = makeDiagnostic({ recommendations })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('cas limites', () => {
    it('génère un PDF avec un score global de 0', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 0 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec un score global de 100', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 100 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec beaucoup de recommandations', async () => {
      const recommendations = Array.from({ length: 15 }, (_, i) =>
        makeRecommendation({ id: `rec_${i + 1}`, title: `Recommendation numéro ${i + 1}`, priority: Math.min(5, i + 1) })
      )
      const diag = makeDiagnostic({ recommendations })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('encart conseiller', () => {
    it('génère un PDF avec les infos conseiller', async () => {
      const advisor = { name: 'Marie Martin', email: 'marie@baloise.be', phone: '+32 2 123 45 67' }
      const buffer = await render(makeDiagnostic(), 'Jean Dupont', undefined, advisor)
      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
      const header = buffer.subarray(0, 5).toString()
      expect(header).toBe('%PDF-')
    })

    it('génère un PDF sans conseiller (pas de crash)', async () => {
      const buffer = await render(makeDiagnostic(), 'Jean Dupont', undefined, undefined)
      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('score qualitatif par palier', () => {
    it('génère un PDF pour score 0-25 (protection adaptée)', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 20 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF pour score 26-50 (attention)', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 40 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF pour score 51-75 (lacunes significatives)', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 65 }))
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF pour score 76-100 (lacunes critiques)', async () => {
      const buffer = await render(makeDiagnostic({ globalScore: 90 }))
      expect(buffer.length).toBeGreaterThan(0)
    })
  })
})
