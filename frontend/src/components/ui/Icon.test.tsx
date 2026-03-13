import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Icon from './Icon.tsx'

describe('Icon', () => {
  it('renders SVG element for valid icon name', () => {
    const { container } = render(<Icon name="check" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders null for unknown icon name', () => {
    const { container } = render(<Icon name={'does-not-exist' as never} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies default size of 24', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('24')
    expect(svg.getAttribute('height')).toBe('24')
  })

  it('applies custom size', () => {
    const { container } = render(<Icon name="check" size={16} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('16')
  })

  it('applies custom strokeWidth', () => {
    const { container } = render(<Icon name="check" strokeWidth={2.5} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('stroke-width')).toBe('2.5')
  })

  it('applies className', () => {
    const { container } = render(<Icon name="check" className="text-red-500" />)
    const svg = container.querySelector('svg')!
    expect(svg.className.baseVal).toContain('text-red-500')
  })

  it('renders multiple paths for multi-path icons (chart-pie)', () => {
    const { container } = render(<Icon name="chart-pie" />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(2)
  })

  it('renders single path for simple icons', () => {
    const { container } = render(<Icon name="check" />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)
  })
})
