/**
 * Scene 5: Close (32-36s / 4 seconds)
 * Baloise logo animates in centered, alone on navy background.
 */
import { useCurrentFrame } from 'remotion'
import { NAVY } from '../constants'
import { fadeIn, scaleIn, pulse } from '../helpers'
import { BaloiseLogo } from './BaloiseLogo'

export function Close() {
  const frame = useCurrentFrame()

  // Logo fades in quickly (4s scene = 120 frames)
  const logoOpacity = fadeIn(frame, 5, 18)
  const logoScale = scaleIn(frame, 5, 18)

  // Subtle breathing pulse after settled
  const logoPulse = frame > 35 ? pulse(frame, 0.02, 0.008) : 1

  // Subtle radial glow
  const glowOpacity = fadeIn(frame, 10, 25) * 0.15

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,${glowOpacity}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Centered Baloise logo */}
      <div style={{
        opacity: logoOpacity,
        transform: `scale(${logoScale * logoPulse})`,
      }}>
        <BaloiseLogo height={80} />
      </div>
    </div>
  )
}
