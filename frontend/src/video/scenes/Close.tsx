/**
 * Scene 5: Close (28-36s / frames 840-1080)
 * Baloise logo animates in centered, alone on navy background.
 */
import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE } from '../constants'
import { fadeIn, scaleIn, pulse } from '../helpers'
import { BaloiseLogo } from './BaloiseLogo'

export function Close() {
  const frame = useCurrentFrame()

  // Logo fades in and scales up
  const logoOpacity = fadeIn(frame, 15, 30)
  const logoScale = scaleIn(frame, 15, 30)

  // Subtle breathing pulse after settled
  const logoPulse = frame > 60 ? pulse(frame, 0.02, 0.008) : 1

  // Subtle radial glow behind logo
  const glowOpacity = fadeIn(frame, 30, 40) * 0.15

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
