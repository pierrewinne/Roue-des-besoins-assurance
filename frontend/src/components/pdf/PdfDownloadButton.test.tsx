import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import PdfDownloadButton from './PdfDownloadButton.tsx'
import type { DiagnosticResult } from '../../shared/scoring/types.ts'

// Mock react-pdf
const mockToBlob = vi.fn()
vi.mock('@react-pdf/renderer', () => ({
  pdf: () => ({ toBlob: mockToBlob }),
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  Image: () => null,
  StyleSheet: { create: (s: unknown) => s },
  Font: { register: vi.fn() },
}))

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
}))

// Mock PDF report components
vi.mock('./PdfClientReport.tsx', () => ({
  default: () => null,
}))
vi.mock('./PdfAdvisorReport.tsx', () => ({
  default: () => null,
}))

// Mock audit
vi.mock('../../lib/api/diagnostics.ts', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

const mockDiagnostic: DiagnosticResult = {
  quadrantScores: {
    biens: { quadrant: 'biens', exposure: 50, coverage: 50, needScore: 50, needLevel: 'moderate', active: true },
    personnes: { quadrant: 'personnes', exposure: 50, coverage: 50, needScore: 50, needLevel: 'moderate', active: true },
    projets: { quadrant: 'projets', exposure: 0, coverage: 0, needScore: 0, needLevel: 'low', active: false },
    futur: { quadrant: 'futur', exposure: 50, coverage: 50, needScore: 50, needLevel: 'moderate', active: true },
  },
  globalScore: 50,
  weightings: { biens: 0.25, personnes: 0.25, projets: 0.25, futur: 0.25 },
  productScores: [],
  recommendations: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockToBlob.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
  URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
  URL.revokeObjectURL = vi.fn()
})

describe('PdfDownloadButton', () => {
  it('renders download button', () => {
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    expect(screen.getByText('Télécharger le PDF')).toBeInTheDocument()
  })

  it('shows primary variant for client type', () => {
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    expect(screen.getByRole('button').className).toContain('bg-primary-700')
  })

  it('shows secondary variant for advisor type', () => {
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="advisor" />)
    expect(screen.getByRole('button').className).toContain('border-primary-700')
  })

  it('shows "Génération..." during download', async () => {
    let resolveBlob: (v: Blob) => void
    mockToBlob.mockReturnValue(new Promise<Blob>(r => { resolveBlob = r }))

    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(screen.getByText('Génération...')).toBeInTheDocument()

    await act(async () => {
      resolveBlob!(new Blob(['pdf']))
    })
  })

  it('disables button during generation', async () => {
    let resolveBlob: (v: Blob) => void
    mockToBlob.mockReturnValue(new Promise<Blob>(r => { resolveBlob = r }))

    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(screen.getByRole('button')).toBeDisabled()

    await act(async () => {
      resolveBlob!(new Blob(['pdf']))
    })
  })

  it('shows error message on failure', async () => {
    mockToBlob.mockRejectedValue(new Error('fail'))
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(screen.getByText('Erreur lors de la génération du PDF.')).toBeInTheDocument()
  })

  it('creates download link with safe filename', async () => {
    const origCreateElement = document.createElement.bind(document)
    let capturedLink: HTMLAnchorElement | null = null
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options)
      if (tag === 'a') capturedLink = el as HTMLAnchorElement
      return el
    })
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" clientName="Jean Dupont" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(capturedLink).not.toBeNull()
    expect(capturedLink!.download).toContain('diagnostic-baloise-jean-dupont-')
    expect(capturedLink!.download).toMatch(/\.pdf$/)
    vi.restoreAllMocks()
  })

  it('uses fallback filename without clientName', async () => {
    const origCreateElement = document.createElement.bind(document)
    let capturedLink: HTMLAnchorElement | null = null
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options)
      if (tag === 'a') capturedLink = el as HTMLAnchorElement
      return el
    })
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(capturedLink).not.toBeNull()
    expect(capturedLink!.download).toContain('diagnostic-baloise-client-')
    vi.restoreAllMocks()
  })

  it('calls logAuditEvent for advisor type', async () => {
    const { logAuditEvent } = await import('../../lib/api/diagnostics.ts')
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="advisor" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(logAuditEvent).toHaveBeenCalledWith('generate_pdf_advisor', 'diagnostics', '', { client_name: undefined })
  })

  it('calls logAuditEvent for client type', async () => {
    const { logAuditEvent } = await import('../../lib/api/diagnostics.ts')
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(logAuditEvent).toHaveBeenCalledWith('generate_pdf_client', 'diagnostics', '', {})
  })

  it('revokes object URL after download', async () => {
    render(<PdfDownloadButton diagnostic={mockDiagnostic} type="client" />)
    await act(async () => {
      screen.getByText('Télécharger le PDF').click()
    })
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})
