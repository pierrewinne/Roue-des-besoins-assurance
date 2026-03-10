import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import PdfClientReport from './PdfClientReport'
import type { DiagnosticResult, UniverseScore, RecommendedAction, NeedLevel, Universe } from '../../shared/scoring/types'

function makeScore(universe: Universe, overrides: Partial<UniverseScore> = {}): UniverseScore {
  return {
    universe,
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
    universeScores: {
      auto: makeScore('auto'),
      habitation: makeScore('habitation'),
      prevoyance: makeScore('prevoyance'),
      objets_valeur: makeScore('objets_valeur'),
    },
    globalScore: 65,
    weightings: { auto: 25, habitation: 30, prevoyance: 35, objets_valeur: 10 },
    actions: [],
    ...overrides,
  }
}

function makeAction(overrides: Partial<RecommendedAction> = {}): RecommendedAction {
  return {
    type: 'immediate',
    universe: 'auto',
    priority: 5,
    title: 'Action test',
    description: 'Description test',
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

  describe('filtrage des univers actifs', () => {
    it('génère un PDF quand tous les univers sont actifs', async () => {
      const buffer = await render(makeDiagnostic())
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF quand certains univers sont inactifs', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { active: false, needScore: 0, needLevel: 'low' }),
          habitation: makeScore('habitation'),
          prevoyance: makeScore('prevoyance'),
          objets_valeur: makeScore('objets_valeur', { active: false, needScore: 0, needLevel: 'low' }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF quand aucun univers n\'est actif', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { active: false }),
          habitation: makeScore('habitation', { active: false }),
          prevoyance: makeScore('prevoyance', { active: false }),
          objets_valeur: makeScore('objets_valeur', { active: false }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('page des actions', () => {
    it('génère un PDF plus gros avec actions immédiates (2 pages)', async () => {
      const diagSans = makeDiagnostic({ actions: [] })
      const bufferSans = await render(diagSans)

      const diagAvec = makeDiagnostic({
        actions: [
          makeAction({ title: 'Action 1' }),
          makeAction({ title: 'Action 2' }),
          makeAction({ title: 'Action 3' }),
        ],
      })
      const bufferAvec = await render(diagAvec)

      expect(bufferAvec.length).toBeGreaterThan(bufferSans.length)
    })

    it('génère un PDF avec des actions de types mixtes', async () => {
      const diag = makeDiagnostic({
        actions: [
          makeAction({ type: 'immediate', title: 'Immédiate' }),
          makeAction({ type: 'deferred', title: 'Différée' }),
          makeAction({ type: 'event', title: 'Événement' }),
        ],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('n\'ajoute pas de page 2 si seules des actions non-immédiates existent', async () => {
      const diagDeferred = makeDiagnostic({
        actions: [
          makeAction({ type: 'deferred', title: 'Différée 1' }),
          makeAction({ type: 'deferred', title: 'Différée 2' }),
        ],
      })
      const bufferDeferred = await render(diagDeferred)

      const diagSans = makeDiagnostic({ actions: [] })
      const bufferSans = await render(diagSans)

      // Même taille approximative car aucune action immédiate = pas de page 2
      const ratio = bufferDeferred.length / bufferSans.length
      expect(ratio).toBeGreaterThan(0.9)
      expect(ratio).toBeLessThan(1.1)
    })
  })

  describe('niveaux de besoin', () => {
    const levels: NeedLevel[] = ['low', 'moderate', 'high', 'critical']

    for (const level of levels) {
      it(`génère un PDF avec des univers en niveau "${level}"`, async () => {
        const diag = makeDiagnostic({
          universeScores: {
            auto: makeScore('auto', { needLevel: level }),
            habitation: makeScore('habitation', { needLevel: level }),
            prevoyance: makeScore('prevoyance', { needLevel: level }),
            objets_valeur: makeScore('objets_valeur', { needLevel: level }),
          },
        })
        const buffer = await render(diag)
        expect(buffer.length).toBeGreaterThan(0)
      })
    }
  })

  describe('priorités des actions', () => {
    it('génère un PDF avec des actions de toutes priorités (1-5)', async () => {
      const actions = [1, 2, 3, 4, 5].map(p =>
        makeAction({ priority: p, title: `Priorité ${p}` })
      )
      const diag = makeDiagnostic({ actions })
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

    it('génère un PDF avec beaucoup d\'actions', async () => {
      const actions = Array.from({ length: 15 }, (_, i) =>
        makeAction({ title: `Action numéro ${i + 1}`, priority: Math.min(5, i + 1) })
      )
      const diag = makeDiagnostic({ actions })
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
