/**
 * Scene 5: Close (28-36s / frames 840-1080)
 * Logo text + "Roue des Besoins" + CTA pulsing, ghost wheel rotating in background.
 */
import { useCurrentFrame } from 'remotion'
import { NAVY, NAVY_MID, WHITE, FONT_HEADLINE, FONT_BODY, WHEEL } from '../constants'
import { fadeIn, scaleIn, pulse } from '../helpers'
import { WheelSVG } from './WheelSVG'

export function Close() {
  const frame = useCurrentFrame()

  // Ghost wheel: slowly rotating, low opacity
  const ghostRotation = frame * 0.15
  const ghostOpacity = 0.06 + fadeIn(frame, 0, 60) * 0.04

  // "Baloise" text
  const brandOpacity = fadeIn(frame, 10, 25)
  const brandScale = scaleIn(frame, 10, 25)

  // "Roue des Besoins" title
  const titleOpacity = fadeIn(frame, 40, 25)
  const titleScale = scaleIn(frame, 40, 25)

  // Subtitle
  const subOpacity = fadeIn(frame, 70, 20)

  // CTA button pulse
  const ctaOpacity = fadeIn(frame, 100, 25)
  const ctaPulse = frame > 120 ? pulse(frame, 0.03, 0.02) : 1

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ghost wheel in background */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(-50%, -50%) rotate(${ghostRotation}deg) scale(1.6)`,
        opacity: ghostOpacity,
        pointerEvents: 'none',
      }}>
        <WheelSVG
          centerText=""
          showIcons={false}
          labelOpacity={[0, 0, 0, 0]}
          glowOpacity={[0.1, 0.1, 0.1, 0.1]}
        />
      </div>

      {/* Brand name */}
      <div style={{
        opacity: brandOpacity,
        transform: `scale(${brandScale})`,
        marginBottom: 8,
      }}>
        <span style={{
          color: WHITE,
          fontSize: 28,
          fontFamily: FONT_HEADLINE,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
        }}>
          Baloise
        </span>
      </div>

      {/* Main title */}
      <div style={{
        opacity: titleOpacity,
        transform: `scale(${titleScale})`,
        marginBottom: 20,
      }}>
        <span style={{
          color: WHITE,
          fontSize: 52,
          fontFamily: FONT_HEADLINE,
          fontWeight: 700,
          letterSpacing: '0.06em',
        }}>
          Roue des Besoins
        </span>
      </div>

      {/* Subtitle */}
      <div style={{
        opacity: subOpacity,
        marginBottom: 40,
      }}>
        <span style={{
          color: WHITE,
          fontSize: 20,
          fontFamily: FONT_BODY,
          fontWeight: 500,
          opacity: 0.7,
          letterSpacing: '0.03em',
        }}>
          Votre diagnostic assurance personnalisé
        </span>
      </div>

      {/* CTA button */}
      <div style={{
        opacity: ctaOpacity,
        transform: `scale(${ctaPulse})`,
      }}>
        <div style={{
          background: WHITE,
          borderRadius: 32,
          padding: '14px 48px',
          boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
        }}>
          <span style={{
            color: NAVY,
            fontSize: 18,
            fontFamily: FONT_HEADLINE,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            Démarrer le diagnostic
          </span>
        </div>
      </div>

      {/* Decorative line */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: subOpacity * 0.4,
      }}>
        <div style={{
          width: 60, height: 2,
          background: WHITE,
          borderRadius: 1,
        }} />
      </div>
    </div>
  )
}
