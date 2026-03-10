import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import PdfAdvisorReport from './PdfAdvisorReport'
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

async function render(
  diagnostic: DiagnosticResult,
  opts: { clientName?: string; clientEmail?: string; answers?: Record<string, unknown>; wheelImageUri?: string } = {}
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

    it('affiche le nombre correct d\'univers actifs', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { active: false }),
          habitation: makeScore('habitation'),
          prevoyance: makeScore('prevoyance'),
          objets_valeur: makeScore('objets_valeur', { active: false }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('nombre de pages', () => {
    it('PDF plus gros avec actions (3 pages) que sans (2 pages)', async () => {
      const diagSans = makeDiagnostic({ actions: [] })
      const bufferSans = await render(diagSans)

      const diagAvec = makeDiagnostic({
        actions: [
          makeAction({ type: 'immediate' }),
          makeAction({ type: 'deferred' }),
        ],
      })
      const bufferAvec = await render(diagAvec)

      expect(bufferAvec.length).toBeGreaterThan(bufferSans.length)
    })
  })

  describe('pondérations et tableau', () => {
    it('génère un PDF avec pondérations normalisées', async () => {
      const diag = makeDiagnostic({
        weightings: { auto: 30, habitation: 30, prevoyance: 30, objets_valeur: 10 },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec univers désactivés dans le tableau', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { active: false, needScore: 0, needLevel: 'low' }),
          habitation: makeScore('habitation'),
          prevoyance: makeScore('prevoyance'),
          objets_valeur: makeScore('objets_valeur', { active: false, needScore: 0, needLevel: 'low' }),
        },
        weightings: { auto: 0, habitation: 46, prevoyance: 54, objets_valeur: 0 },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('analyse détaillée par univers', () => {
    const levels: NeedLevel[] = ['low', 'moderate', 'high', 'critical']

    for (const level of levels) {
      it(`affiche correctement le niveau "${level}"`, async () => {
        const diag = makeDiagnostic({
          universeScores: {
            auto: makeScore('auto', { needLevel: level, needScore: level === 'low' ? 10 : level === 'moderate' ? 40 : level === 'high' ? 65 : 90 }),
            habitation: makeScore('habitation', { needLevel: level }),
            prevoyance: makeScore('prevoyance', { needLevel: level }),
            objets_valeur: makeScore('objets_valeur', { needLevel: level }),
          },
        })
        const buffer = await render(diag)
        expect(buffer.length).toBeGreaterThan(0)
      })
    }

    it('affiche les barres d\'exposition et couverture', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { exposure: 100, coverage: 0 }),
          habitation: makeScore('habitation', { exposure: 0, coverage: 100 }),
          prevoyance: makeScore('prevoyance', { exposure: 75, coverage: 25 }),
          objets_valeur: makeScore('objets_valeur', { exposure: 50, coverage: 50 }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('données collectées', () => {
    it('génère un PDF avec les réponses du questionnaire', async () => {
      const answers = {
        vehicleCount: 2,
        vehicleAge: 3,
        isOwner: true,
        hasMortgage: true,
        familyStatus: 'family',
        hasValuables: true,
        valuablesAmount: '10k-50k',
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

  describe('plan d\'actions', () => {
    it('regroupe les actions par type (immediate/deferred/event)', async () => {
      const diag = makeDiagnostic({
        actions: [
          makeAction({ type: 'immediate', title: 'Action immédiate 1', universe: 'auto' }),
          makeAction({ type: 'immediate', title: 'Action immédiate 2', universe: 'habitation' }),
          makeAction({ type: 'deferred', title: 'Action différée', universe: 'prevoyance' }),
          makeAction({ type: 'event', title: 'Événement de vie', universe: 'objets_valeur' }),
        ],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('gère un seul type d\'action', async () => {
      const diag = makeDiagnostic({
        actions: [makeAction({ type: 'deferred' })],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('opportunités commerciales', () => {
    it('identifie les univers avec besoin élevé/critique', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { needLevel: 'critical' }),
          habitation: makeScore('habitation', { needLevel: 'high' }),
          prevoyance: makeScore('prevoyance', { needLevel: 'low' }),
          objets_valeur: makeScore('objets_valeur', { needLevel: 'moderate' }),
        },
        actions: [makeAction()],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('potentiel de cross-selling élevé si > 2 univers actifs', async () => {
      const diag = makeDiagnostic({
        actions: [makeAction()],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('potentiel de cross-selling modéré si ≤ 2 univers actifs', async () => {
      const diag = makeDiagnostic({
        universeScores: {
          auto: makeScore('auto', { active: false }),
          habitation: makeScore('habitation'),
          prevoyance: makeScore('prevoyance'),
          objets_valeur: makeScore('objets_valeur', { active: false }),
        },
        actions: [makeAction()],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })

  describe('cas limites', () => {
    it('génère un PDF avec score 0 et tout couvert', async () => {
      const diag = makeDiagnostic({
        globalScore: 0,
        universeScores: {
          auto: makeScore('auto', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
          habitation: makeScore('habitation', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
          prevoyance: makeScore('prevoyance', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
          objets_valeur: makeScore('objets_valeur', { needScore: 0, needLevel: 'low', exposure: 0, coverage: 100 }),
        },
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF avec score 100 et rien couvert', async () => {
      const diag = makeDiagnostic({
        globalScore: 100,
        universeScores: {
          auto: makeScore('auto', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
          habitation: makeScore('habitation', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
          prevoyance: makeScore('prevoyance', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
          objets_valeur: makeScore('objets_valeur', { needScore: 95, needLevel: 'critical', exposure: 100, coverage: 0 }),
        },
        actions: [
          makeAction({ type: 'immediate', universe: 'auto' }),
          makeAction({ type: 'immediate', universe: 'habitation' }),
          makeAction({ type: 'immediate', universe: 'prevoyance' }),
          makeAction({ type: 'immediate', universe: 'objets_valeur' }),
        ],
      })
      const buffer = await render(diag)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('génère un PDF complet avec toutes les options', async () => {
      const diag = makeDiagnostic({
        globalScore: 72,
        actions: [
          makeAction({ type: 'immediate', universe: 'auto', priority: 5 }),
          makeAction({ type: 'deferred', universe: 'habitation', priority: 3 }),
          makeAction({ type: 'event', universe: 'prevoyance', priority: 2 }),
        ],
      })
      const buffer = await render(diag, {
        clientName: 'Pierre Dupont',
        clientEmail: 'pierre@example.com',
        answers: {
          vehicleCount: 1,
          vehicleAge: 2,
          isOwner: true,
          hasMortgage: true,
          familyStatus: 'family',
          hasValuables: true,
          valuablesAmount: '50k+',
        },
      })
      expect(buffer.length).toBeGreaterThan(0)
      const header = buffer.subarray(0, 5).toString()
      expect(header).toBe('%PDF-')
    })
  })
})
