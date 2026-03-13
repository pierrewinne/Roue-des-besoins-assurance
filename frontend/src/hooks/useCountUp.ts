import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number from 0 to target with eased progression.
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export function useCountUp(target: number, duration = 1000): number {
  const [count, setCount] = useState(0)
  const frameRef = useRef(0)

  useEffect(() => {
    if (target === 0) { setCount(0); return }

    const start = performance.now()

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return count
}
