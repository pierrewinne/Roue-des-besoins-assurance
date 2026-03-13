import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card.tsx'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('has white background and shadow', () => {
    const { container } = render(<Card>Test</Card>)
    expect(container.firstElementChild!.className).toContain('bg-white')
    expect(container.firstElementChild!.className).toContain('shadow-card')
  })

  it('applies padding by default', () => {
    const { container } = render(<Card>Test</Card>)
    expect(container.firstElementChild!.className).toContain('p-6')
  })

  it('removes padding when padding=false', () => {
    const { container } = render(<Card padding={false}>Test</Card>)
    expect(container.firstElementChild!.className).not.toContain('p-6')
  })

  it('applies hover effect when hover=true', () => {
    const { container } = render(<Card hover>Test</Card>)
    expect(container.firstElementChild!.className).toContain('hover:shadow-card-hover')
  })

  it('merges custom className', () => {
    const { container } = render(<Card className="my-class">Test</Card>)
    expect(container.firstElementChild!.className).toContain('my-class')
  })
})
