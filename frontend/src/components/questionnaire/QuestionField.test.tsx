import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QuestionField from './QuestionField.tsx'
import type { Question } from '../../shared/questionnaire/schema.ts'

const selectQuestion: Question = {
  id: 'residence_status',
  quadrant: 'profil_express',
  label: 'Ou residez-vous ?',
  helpText: 'Choisissez votre lieu de residence.',
  type: 'select',
  required: true,
  options: [
    { value: 'resident_gdl', label: 'Resident au Luxembourg' },
    { value: 'frontalier_fr', label: 'Frontalier France' },
    { value: 'other', label: 'Autre' },
  ],
}

const booleanQuestion: Question = {
  id: 'has_car',
  quadrant: 'biens',
  label: 'Possedez-vous un vehicule ?',
  type: 'boolean',
  required: true,
}

const multiSelectQuestion: Question = {
  id: 'insurance_types',
  quadrant: 'biens',
  label: 'Quelles assurances possedez-vous ?',
  helpText: 'Selectionnez toutes les options applicables.',
  type: 'multi_select',
  required: true,
  options: [
    { value: 'auto', label: 'Assurance auto' },
    { value: 'habitation', label: 'Assurance habitation' },
    { value: 'sante', label: 'Assurance sante' },
    { value: 'none', label: 'Aucune' },
  ],
}

const numberQuestion: Question = {
  id: 'nb_children',
  quadrant: 'personnes',
  label: 'Combien avez-vous d\'enfants ?',
  helpText: 'Entrez un nombre.',
  type: 'number',
  required: true,
}

describe('QuestionField', () => {
  describe('select question', () => {
    it('renders label and help text', () => {
      render(<QuestionField question={selectQuestion} value={undefined} onChange={vi.fn()} />)
      expect(screen.getByText('Ou residez-vous ?')).toBeInTheDocument()
      expect(screen.getByText('Choisissez votre lieu de residence.')).toBeInTheDocument()
    })

    it('renders all options as radio buttons', () => {
      render(<QuestionField question={selectQuestion} value={undefined} onChange={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(3)
      expect(screen.getByText('Resident au Luxembourg')).toBeInTheDocument()
      expect(screen.getByText('Frontalier France')).toBeInTheDocument()
      expect(screen.getByText('Autre')).toBeInTheDocument()
    })

    it('marks the selected option as checked', () => {
      render(<QuestionField question={selectQuestion} value="frontalier_fr" onChange={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      const checked = radios.find(r => r.getAttribute('aria-checked') === 'true')
      expect(checked).toBeDefined()
      expect(checked!.textContent).toBe('Frontalier France')
    })

    it('calls onChange with option value when clicked', () => {
      const onChange = vi.fn()
      render(<QuestionField question={selectQuestion} value={undefined} onChange={onChange} />)
      fireEvent.click(screen.getByText('Autre'))
      expect(onChange).toHaveBeenCalledWith('other')
    })
  })

  describe('boolean question', () => {
    it('renders Oui and Non buttons', () => {
      render(<QuestionField question={booleanQuestion} value={undefined} onChange={vi.fn()} />)
      expect(screen.getByText('Oui')).toBeInTheDocument()
      expect(screen.getByText('Non')).toBeInTheDocument()
    })

    it('marks Oui as checked when value is true', () => {
      render(<QuestionField question={booleanQuestion} value={true} onChange={vi.fn()} />)
      expect(screen.getByText('Oui').closest('[role="radio"]')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByText('Non').closest('[role="radio"]')).toHaveAttribute('aria-checked', 'false')
    })

    it('marks Non as checked when value is false', () => {
      render(<QuestionField question={booleanQuestion} value={false} onChange={vi.fn()} />)
      expect(screen.getByText('Non').closest('[role="radio"]')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByText('Oui').closest('[role="radio"]')).toHaveAttribute('aria-checked', 'false')
    })

    it('calls onChange with true when Oui clicked', () => {
      const onChange = vi.fn()
      render(<QuestionField question={booleanQuestion} value={undefined} onChange={onChange} />)
      fireEvent.click(screen.getByText('Oui'))
      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('calls onChange with false when Non clicked', () => {
      const onChange = vi.fn()
      render(<QuestionField question={booleanQuestion} value={undefined} onChange={onChange} />)
      fireEvent.click(screen.getByText('Non'))
      expect(onChange).toHaveBeenCalledWith(false)
    })
  })

  describe('multi_select question', () => {
    it('renders all options as checkboxes', () => {
      render(<QuestionField question={multiSelectQuestion} value={[]} onChange={vi.fn()} />)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(4)
    })

    it('renders help text', () => {
      render(<QuestionField question={multiSelectQuestion} value={[]} onChange={vi.fn()} />)
      expect(screen.getByText('Selectionnez toutes les options applicables.')).toBeInTheDocument()
    })

    it('marks selected options as checked', () => {
      render(<QuestionField question={multiSelectQuestion} value={['auto', 'sante']} onChange={vi.fn()} />)
      const checkboxes = screen.getAllByRole('checkbox')
      const autoBox = checkboxes.find(cb => cb.textContent?.includes('Assurance auto'))
      const santeBox = checkboxes.find(cb => cb.textContent?.includes('Assurance sante'))
      const habitationBox = checkboxes.find(cb => cb.textContent?.includes('Assurance habitation'))
      expect(autoBox).toHaveAttribute('aria-checked', 'true')
      expect(santeBox).toHaveAttribute('aria-checked', 'true')
      expect(habitationBox).toHaveAttribute('aria-checked', 'false')
    })

    it('adds option to selection when clicked', () => {
      const onChange = vi.fn()
      render(<QuestionField question={multiSelectQuestion} value={['auto']} onChange={onChange} />)
      fireEvent.click(screen.getByText('Assurance habitation'))
      expect(onChange).toHaveBeenCalledWith(['auto', 'habitation'])
    })

    it('removes option from selection when clicked again', () => {
      const onChange = vi.fn()
      render(<QuestionField question={multiSelectQuestion} value={['auto', 'habitation']} onChange={onChange} />)
      fireEvent.click(screen.getByText('Assurance auto'))
      expect(onChange).toHaveBeenCalledWith(['habitation'])
    })

    it('selects only "none" when "none" is clicked (exclusive logic)', () => {
      const onChange = vi.fn()
      render(<QuestionField question={multiSelectQuestion} value={['auto', 'habitation']} onChange={onChange} />)
      fireEvent.click(screen.getByText('Aucune'))
      expect(onChange).toHaveBeenCalledWith(['none'])
    })

    it('removes "none" when a real option is selected', () => {
      const onChange = vi.fn()
      render(<QuestionField question={multiSelectQuestion} value={['none']} onChange={onChange} />)
      fireEvent.click(screen.getByText('Assurance auto'))
      expect(onChange).toHaveBeenCalledWith(['auto'])
    })

    it('returns empty array when last real option is deselected', () => {
      const onChange = vi.fn()
      render(<QuestionField question={multiSelectQuestion} value={['auto']} onChange={onChange} />)
      fireEvent.click(screen.getByText('Assurance auto'))
      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('number question', () => {
    it('renders label and help text', () => {
      render(<QuestionField question={numberQuestion} value={undefined} onChange={vi.fn()} />)
      expect(screen.getByText("Combien avez-vous d'enfants ?")).toBeInTheDocument()
      expect(screen.getByText('Entrez un nombre.')).toBeInTheDocument()
    })

    it('renders number input with correct value', () => {
      render(<QuestionField question={numberQuestion} value={3} onChange={vi.fn()} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveValue(3)
    })

    it('renders empty input when value is undefined', () => {
      render(<QuestionField question={numberQuestion} value={undefined} onChange={vi.fn()} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveValue(null)
    })

    it('calls onChange with parsed number', () => {
      const onChange = vi.fn()
      render(<QuestionField question={numberQuestion} value={undefined} onChange={onChange} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } })
      expect(onChange).toHaveBeenCalledWith(5)
    })

    it('calls onChange with undefined for empty input', () => {
      const onChange = vi.fn()
      render(<QuestionField question={numberQuestion} value={3} onChange={onChange} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } })
      expect(onChange).toHaveBeenCalledWith(undefined)
    })

    it('clamps value to max 99', () => {
      const onChange = vi.fn()
      render(<QuestionField question={numberQuestion} value={undefined} onChange={onChange} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '150' } })
      expect(onChange).toHaveBeenCalledWith(99)
    })

    it('clamps value to min 0', () => {
      const onChange = vi.fn()
      render(<QuestionField question={numberQuestion} value={undefined} onChange={onChange} />)
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-5' } })
      expect(onChange).toHaveBeenCalledWith(0)
    })
  })
})
