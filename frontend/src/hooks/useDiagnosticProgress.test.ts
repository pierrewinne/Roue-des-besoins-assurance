import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockUseAuth = vi.fn()
const mockFetchActiveQuestionnaire = vi.fn()
const mockComputeQuadrantScore = vi.fn()
const mockComputeDiagnostic = vi.fn()

vi.mock('../contexts/AuthContext.tsx', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('../lib/api/questionnaire.ts', () => ({
  fetchActiveQuestionnaire: (...args: unknown[]) => mockFetchActiveQuestionnaire(...args),
}))

vi.mock('../shared/scoring/engine.ts', () => ({
  computeQuadrantScore: (...args: unknown[]) => mockComputeQuadrantScore(...args),
  computeDiagnostic: (...args: unknown[]) => mockComputeDiagnostic(...args),
}))

// We need the real thresholds and constants
vi.mock('../shared/scoring/thresholds.ts', async () => {
  const actual = await vi.importActual('../shared/scoring/thresholds.ts')
  return actual
})

import { useDiagnosticProgress } from './useDiagnosticProgress.ts'

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: null })
  mockComputeQuadrantScore.mockReturnValue({ needScore: 50, needLevel: 'moderate' })
  mockComputeDiagnostic.mockReturnValue({ globalScore: 55 })
})

describe('useDiagnosticProgress', () => {
  it('returns loading=false and no data when no user', async () => {
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.responseId).toBeNull()
    expect(result.current.profilCompleted).toBe(false)
  })

  it('handles fetchActiveQuestionnaire returning null', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue(null)
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.responseId).toBeNull()
  })

  it('sets error when fetch throws', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error).toBe('Impossible de charger votre questionnaire.')
  })

  it('loads questionnaire data successfully', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: { residence_status: 'resident_gdl' },
      profil_completed: true,
      completed_universes: {},
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.responseId).toBe('resp-1')
    expect(result.current.profilCompleted).toBe(true)
  })

  it('locks quadrants when profil is not completed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: {},
      profil_completed: false,
      completed_universes: {},
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.quadrantStates.biens.status).toBe('locked')
    expect(result.current.quadrantStates.personnes.status).toBe('locked')
  })

  it('sets quadrants to available when profil completed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: {},
      profil_completed: true,
      completed_universes: {},
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.quadrantStates.biens.status).toBe('available')
    expect(result.current.quadrantStates.personnes.status).toBe('available')
  })

  it('locks projets quadrant (no questions)', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: {},
      profil_completed: true,
      completed_universes: {},
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.quadrantStates.projets.status).toBe('locked')
  })

  it('marks completed quadrant with score', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: { residence_status: 'resident_gdl' },
      profil_completed: true,
      completed_universes: { biens: true },
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.quadrantStates.biens.status).toBe('completed')
    expect(result.current.completedCount).toBe(1)
    expect(mockComputeQuadrantScore).toHaveBeenCalledWith('biens', expect.any(Object))
  })

  it('computes global score when all active quadrants completed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: {},
      profil_completed: true,
      completed_universes: { biens: true, personnes: true, futur: true },
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.allCompleted).toBe(true)
    expect(result.current.globalScore).toBe(55)
    expect(mockComputeDiagnostic).toHaveBeenCalled()
  })

  it('does not compute global score when not all active quadrants completed', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: {},
      profil_completed: true,
      completed_universes: { biens: true },
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.allCompleted).toBe(false)
    expect(result.current.globalScore).toBeUndefined()
    expect(mockComputeDiagnostic).not.toHaveBeenCalled()
  })

  it('returns segmentStates array of length 4', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'u1' } })
    mockFetchActiveQuestionnaire.mockResolvedValue({
      id: 'resp-1',
      responses: {},
      profil_completed: true,
      completed_universes: {},
    })
    const { result } = renderHook(() => useDiagnosticProgress())
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.segmentStates).toHaveLength(4)
  })
})
