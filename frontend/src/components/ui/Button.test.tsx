import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button.tsx'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies primary variant by default', () => {
    render(<Button>Btn</Button>)
    expect(screen.getByRole('button').className).toContain('bg-primary-700')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('border-primary-700')
  })

  it('applies outline variant', () => {
    render(<Button variant="outline">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('border-grey-200')
  })

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('hover:bg-primary-100')
  })

  it('applies sm size', () => {
    render(<Button size="sm">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('px-3')
  })

  it('applies md size by default', () => {
    render(<Button>Btn</Button>)
    expect(screen.getByRole('button').className).toContain('px-4')
  })

  it('applies lg size', () => {
    render(<Button size="lg">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('px-6')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Btn</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Btn</Button>)
    screen.getByRole('button').click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('merges custom className', () => {
    render(<Button className="my-custom">Btn</Button>)
    expect(screen.getByRole('button').className).toContain('my-custom')
  })

  it('forwards HTML button attributes', () => {
    render(<Button type="submit">Btn</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Btn</Button>)
    screen.getByRole('button').click()
    expect(onClick).not.toHaveBeenCalled()
  })
})
