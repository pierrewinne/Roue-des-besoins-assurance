/**
 * Act 5: Close (30-36s / 180 frames)
 * Baloise logo centered + tagline "La Roue des Besoins" + signature "Tout part de vous."
 */
import { useCurrentFrame } from 'remotion'
import { WHITE, FONT_HEADLINE, FONT_BODY } from '../constants'
import { fadeIn, scaleIn, pulse } from '../helpers'
import { BaloiseLogo } from './BaloiseLogo'

export function Close() {
  const frame = useCurrentFrame()

  // Logo fades in quickly
  const logoOpacity = fadeIn(frame, 5, 18)
  const logoScale = scaleIn(frame, 5, 18)

  // Subtle breathing pulse after settled
  const logoPulse = frame > 35 ? pulse(frame, 0.02, 0.008) : 1

  // Radial glow — stronger than V1 (28% instead of 15%)
  const glowOpacity = fadeIn(frame, 10, 25) * 0.28
  const glowScale = 1 + frame * 0.0008 // slow grow

  // Product name "La Roue des Besoins" — appears after logo settles
  const taglineOpacity = fadeIn(frame, 30, 18)
  const taglineY = frame < 30 ? 10 : 10 * (1 - fadeIn(frame, 30, 18))

  // Signature "Tout part de vous." — appears last
  const signatureOpacity = fadeIn(frame, 60, 20)
  const signatureY = frame < 60 ? 8 : 8 * (1 - fadeIn(frame, 60, 20))

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(-50%, -50%) scale(${glowScale})`,
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,${glowOpacity}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Centered content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
      }}>
        {/* Baloise logo */}
        <div style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale * logoPulse})`,
        }}>
          <BaloiseLogo height={80} />
        </div>

        {/* Tagline */}
        <div style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          marginTop: 28,
        }}>
          <span style={{
            color: WHITE,
            fontSize: 22,
            fontFamily: FONT_HEADLINE,
            fontWeight: 700,
            letterSpacing: '0.08em',
            opacity: 0.8,
          }}>
            La Roue des Besoins
          </span>
        </div>

        {/* Signature */}
        <div style={{
          opacity: signatureOpacity,
          transform: `translateY(${signatureY}px)`,
          marginTop: 16,
        }}>
          <span style={{
            color: WHITE,
            fontSize: 18,
            fontFamily: FONT_BODY,
            fontWeight: 400,
            letterSpacing: '0.04em',
            opacity: 0.6,
          }}>
            Tout part de vous.
          </span>
        </div>
      </div>
    </div>
  )
}
