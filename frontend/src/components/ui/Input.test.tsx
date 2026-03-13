import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Input from './Input.tsx'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with label and correct htmlFor/id association', () => {
    render(<Input label="Email" id="email-input" />)
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', 'email-input')
    expect(input).toHaveAttribute('id', 'email-input')
  })

  it('generates a unique id when no id is provided but label exists', () => {
    render(<Input label="Nom" />)
    const label = screen.getByText('Nom')
    const input = screen.getByRole('textbox')
    const labelFor = label.getAttribute('for')
    const inputId = input.getAttribute('id')
    expect(labelFor).toBeTruthy()
    expect(labelFor).toBe(inputId)
  })

  it('does not render label when label prop is omitted', () => {
    render(<Input placeholder="type here" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('type here')).toBeInTheDocument()
  })

  it('renders with an icon', () => {
    render(<Input icon={<span data-testid="icon-el">icon</span>} />)
    expect(screen.getByTestId('icon-el')).toBeInTheDocument()
  })

  it('adds pl-9 class when icon is present', () => {
    render(<Input icon={<span>icon</span>} />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('pl-9')
  })

  it('does not add pl-9 class when no icon', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input.className).not.toContain('pl-9')
  })

  it('passes through HTML attributes like placeholder and type', () => {
    render(<Input placeholder="Enter email" type="email" disabled />)
    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeDisabled()
  })

  it('merges custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('custom-class')
  })
})
