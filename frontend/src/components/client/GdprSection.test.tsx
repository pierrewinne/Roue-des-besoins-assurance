import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GdprSection from './GdprSection.tsx'

const defaultProps = {
  rgpdError: null,
  showDeleteConfirm: false,
  isDeleting: false,
  onExportData: vi.fn(),
  onDeleteClick: vi.fn(),
  onDeleteConfirm: vi.fn(),
  onDeleteCancel: vi.fn(),
}

describe('GdprSection', () => {
  it('renders "Exporter mes données" button', () => {
    render(<GdprSection {...defaultProps} />)
    expect(screen.getByText('Exporter mes données')).toBeInTheDocument()
  })

  it('renders "Supprimer mon compte" button', () => {
    render(<GdprSection {...defaultProps} />)
    expect(screen.getByText('Supprimer mon compte')).toBeInTheDocument()
  })

  it('calls onExportData when export button clicked', () => {
    const onExportData = vi.fn()
    render(<GdprSection {...defaultProps} onExportData={onExportData} />)
    screen.getByText('Exporter mes données').click()
    expect(onExportData).toHaveBeenCalledOnce()
  })

  it('calls onDeleteClick when delete button clicked', () => {
    const onDeleteClick = vi.fn()
    render(<GdprSection {...defaultProps} onDeleteClick={onDeleteClick} />)
    screen.getByText('Supprimer mon compte').click()
    expect(onDeleteClick).toHaveBeenCalledOnce()
  })

  it('does not show confirmation dialog by default', () => {
    render(<GdprSection {...defaultProps} />)
    expect(screen.queryByText('Cette action est irréversible')).not.toBeInTheDocument()
  })

  it('shows confirmation dialog when showDeleteConfirm is true', () => {
    render(<GdprSection {...defaultProps} showDeleteConfirm />)
    expect(screen.getByText('Cette action est irréversible')).toBeInTheDocument()
    expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument()
    expect(screen.getByText('Annuler')).toBeInTheDocument()
  })

  it('shows "Suppression..." text when isDeleting', () => {
    render(<GdprSection {...defaultProps} showDeleteConfirm isDeleting />)
    expect(screen.getByText('Suppression...')).toBeInTheDocument()
  })

  it('disables confirm button when isDeleting', () => {
    render(<GdprSection {...defaultProps} showDeleteConfirm isDeleting />)
    expect(screen.getByText('Suppression...')).toBeDisabled()
  })

  it('shows error message when rgpdError is set', () => {
    render(<GdprSection {...defaultProps} rgpdError="Une erreur est survenue" />)
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
  })

  it('does not show error when rgpdError is null', () => {
    const { container } = render(<GdprSection {...defaultProps} />)
    expect(container.querySelector('.bg-danger-light')).not.toBeInTheDocument()
  })
})
