import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScoreGauge from './ScoreGauge.tsx'

describe('ScoreGauge', () => {
  it('renders the score text', () => {
    render(<ScoreGauge score={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders "/100" label', () => {
    render(<ScoreGauge score={50} />)
    expect(screen.getByText('/100')).toBeInTheDocument()
  })

  it('renders two SVG circles', () => {
    const { container } = render(<ScoreGauge score={50} />)
    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2)
  })

  it('uses green color for low score (≤25)', () => {
    const { container } = render(<ScoreGauge score={20} />)
    const progressCircle = container.querySelectorAll('circle')[1]
    expect(progressCircle.getAttribute('stroke')).toBe('#168741')
  })

  it('uses amber color for moderate score (26-50)', () => {
    const { container } = render(<ScoreGauge score={40} />)
    const progressCircle = container.querySelectorAll('circle')[1]
    expect(progressCircle.getAttribute('stroke')).toBe('#c97612')
  })

  it('uses red color for high score (51-75)', () => {
    const { container } = render(<ScoreGauge score={60} />)
    const progressCircle = container.querySelectorAll('circle')[1]
    expect(progressCircle.getAttribute('stroke')).toBe('#d9304c')
  })

  it('uses dark red color for critical score (>75)', () => {
    const { container } = render(<ScoreGauge score={80} />)
    const progressCircle = container.querySelectorAll('circle')[1]
    expect(progressCircle.getAttribute('stroke')).toBe('#99172d')
  })

  it('computes correct strokeDashoffset for score 0', () => {
    const { container } = render(<ScoreGauge score={0} />)
    const circle = container.querySelectorAll('circle')[1]
    const dasharray = parseFloat(circle.getAttribute('stroke-dasharray')!)
    const dashoffset = parseFloat(circle.getAttribute('stroke-dashoffset')!)
    // score=0 → offset = circumference (full offset)
    expect(dashoffset).toBeCloseTo(dasharray)
  })

  it('computes correct strokeDashoffset for score 100', () => {
    const { container } = render(<ScoreGauge score={100} />)
    const circle = container.querySelectorAll('circle')[1]
    const dashoffset = parseFloat(circle.getAttribute('stroke-dashoffset')!)
    expect(dashoffset).toBeCloseTo(0)
  })

  it('uses custom size', () => {
    const { container } = render(<ScoreGauge score={50} size={200} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('200')
    expect(svg.getAttribute('height')).toBe('200')
  })
})
