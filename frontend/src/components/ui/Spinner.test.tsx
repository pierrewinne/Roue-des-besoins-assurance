import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Spinner from './Spinner.tsx'

describe('Spinner', () => {
  it('renders a container for the animation', () => {
    const { container } = render(<Spinner />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('applies default py-20 className', () => {
    const { container } = render(<Spinner />)
    expect(container.firstElementChild!.className).toContain('py-20')
  })

  it('applies custom className', () => {
    const { container } = render(<Spinner className="py-4" />)
    expect(container.firstElementChild!.className).toContain('py-4')
  })
})
