import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar from './ProgressBar.tsx'

const steps = ['Profil', 'Biens', 'Personnes']

describe('ProgressBar', () => {
  it('renders all step labels', () => {
    render(<ProgressBar steps={steps} currentStep={0} />)
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Biens')).toBeInTheDocument()
    expect(screen.getByText('Personnes')).toBeInTheDocument()
  })

  it('renders step circles matching steps count', () => {
    const { container } = render(<ProgressBar steps={steps} currentStep={1} />)
    const circles = container.querySelectorAll('.rounded-full.w-9')
    expect(circles).toHaveLength(3)
  })

  it('marks completed steps with check icon', () => {
    const { container } = render(<ProgressBar steps={steps} currentStep={2} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2) // step 0 and 1 completed
  })

  it('shows step number for current step', () => {
    render(<ProgressBar steps={steps} currentStep={1} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows step number for future steps', () => {
    render(<ProgressBar steps={steps} currentStep={0} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders connector lines between steps', () => {
    const { container } = render(<ProgressBar steps={steps} currentStep={1} />)
    const connectors = container.querySelectorAll('.h-0\\.5')
    expect(connectors).toHaveLength(2)
  })

  it('highlights current step with ring', () => {
    const { container } = render(<ProgressBar steps={steps} currentStep={1} />)
    const circles = container.querySelectorAll('.rounded-full.w-9')
    expect(circles[1].className).toContain('ring-2')
  })
})
