import { useEffect, useRef } from 'react'
import lottie from 'lottie-web/build/player/lottie_light'
import animationData from './baloise-spinner.json'

interface SpinnerProps {
  className?: string
  size?: number
}

export default function Spinner({ className = 'py-20', size = 80 }: SpinnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    })
    return () => anim.destroy()
  }, [])

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div ref={containerRef} style={{ width: size, height: size }} />
    </div>
  )
}
