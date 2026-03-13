import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge.tsx'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Hello</Badge>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies gray color by default', () => {
    render(<Badge>Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('bg-grey-100')
  })

  it('applies green color', () => {
    render(<Badge color="green">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('bg-success-light')
  })

  it('applies orange color', () => {
    render(<Badge color="orange">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('bg-warning-light')
  })

  it('applies red color', () => {
    render(<Badge color="red">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('bg-danger-light')
  })

  it('applies blue color', () => {
    render(<Badge color="blue">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('bg-info-light')
  })

  it('applies purple color', () => {
    render(<Badge color="purple">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('bg-accent-purple-bg')
  })

  it('merges custom className', () => {
    render(<Badge className="my-class">Tag</Badge>)
    expect(screen.getByText('Tag').className).toContain('my-class')
  })
})
