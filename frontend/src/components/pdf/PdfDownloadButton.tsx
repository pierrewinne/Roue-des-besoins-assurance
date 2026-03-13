import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toPng } from 'html-to-image'
import Button from '../ui/Button.tsx'
import PdfClientReport from './PdfClientReport.tsx'
import PdfAdvisorReport from './PdfAdvisorReport.tsx'
import type { DiagnosticResult } from '../../shared/scoring/types.ts'
import type { QuestionnaireAnswers } from '../../shared/questionnaire/schema.ts'
import type { AdvisorInfo } from './pdf-tokens.ts'

interface PdfDownloadButtonProps {
  diagnostic: DiagnosticResult
  type: 'client' | 'advisor'
  clientName?: string
  clientEmail?: string
  answers?: QuestionnaireAnswers
  wheelRef?: React.RefObject<HTMLDivElement | null>
  advisor?: AdvisorInfo
}

export default function PdfDownloadButton({ diagnostic, type, clientName, clientEmail, answers, wheelRef, advisor }: PdfDownloadButtonProps) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(false)

  const handleDownload = useCallback(async () => {
    setGenerating(true)
    setError(false)
    try {
      let wheelImageUri: string | undefined

      // Capture wheel as PNG
      if (wheelRef?.current) {
        try {
          wheelImageUri = await toPng(wheelRef.current, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
          })
        } catch {
          // Continue without wheel image if capture fails
        }
      }

      const doc = type === 'client'
        ? <PdfClientReport diagnostic={diagnostic} clientName={clientName} wheelImageUri={wheelImageUri} advisor={advisor} />
        : <PdfAdvisorReport diagnostic={diagnostic} clientName={clientName} clientEmail={clientEmail} answers={answers} wheelImageUri={wheelImageUri} />

      // Audit PDF generation (P3-07)
      if (type === 'advisor') {
        const { logAuditEvent } = await import('../../lib/api/diagnostics.ts')
        await logAuditEvent('generate_pdf_advisor', 'diagnostics', '', {}).catch(() => {})
      }

      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const safeName = clientName?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').toLowerCase()
      const datePart = new Date().toISOString().split('T')[0]
      link.download = safeName
        ? `diagnostic-baloise-${safeName}-${datePart}.pdf`
        : `diagnostic-baloise-${type}-${datePart}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch {
      setError(true)
    } finally {
      setGenerating(false)
    }
  }, [diagnostic, type, clientName, clientEmail, answers, wheelRef, advisor])

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        onClick={handleDownload}
        disabled={generating}
        variant={type === 'advisor' ? 'secondary' : 'primary'}
      >
        {generating ? 'Génération...' : 'Télécharger le PDF'}
      </Button>
      {error && <p className="text-xs text-danger">Erreur lors de la génération du PDF.</p>}
    </div>
  )
}
