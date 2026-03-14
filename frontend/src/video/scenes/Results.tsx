/**
 * Act 4: Révélation (17-30s / 390 frames)
 * Phase 1 (0-90): Flash reveal — wheel fully filled + "Votre exposition réelle."
 * Phase 2 (90-350): Wheel slides left, product cards stagger in with counting numbers.
 * CTA: "Savoir, c'est déjà se protéger."
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, FONT_BODY, SCORE_COLORS, QUADRANT_SEGMENTS, DEMO_FILL_TARGETS, DEMO_FILL_COLORS } from '../constants'
import { fadeIn, fadeOut, slideUp } from '../helpers'
import { WheelSVG } from './WheelSVG'

const BALOISE_EASE = Easing.bezier(0.25, 0.8, 0.5, 1)
const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1)

const PRODUCTS = [
  { name: 'DRIVE', score: 72, level: SCORE_COLORS.moderate, color: '#fa9319' },
  { name: 'HOME', score: 91, level: SCORE_COLORS.high, color: '#d9304c', priority: true },
  { name: 'TRAVEL', score: 38, level: SCORE_COLORS.low, color: '#00b28f' },
  { name: 'B-SAFE', score: 65, level: SCORE_COLORS.moderate, color: '#9f52cc' },
]

const CTA_TEXT = "Savoir, c\u2019est d\u00e9j\u00e0 se prot\u00e9ger."

export function Results() {
  const frame = useCurrentFrame()

  // Phase 1: Flash reveal (0-5 frames)
  const flashOpacity = interpolate(frame, [0, 2, 5, 8], [0, 0.6, 0.4, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  // "Votre exposition réelle." text (15-80)
  const revealTextOpacity = fadeIn(frame, 15, 15) * fadeOut(frame, 65, 15)
  const revealTextY = slideUp(frame, 15, 20, 15)

  // Vulnerable quadrants pulse after flash (8-80)
  const vulnPulse = frame > 8 && frame < 80
    ? 1 + Math.sin((frame - 8) * 0.15) * 0.015
    : 1

  // Phase 2: Wheel slides left (80-105)
  const wheelX = interpolate(frame, [80, 105], [0, -390], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_OUT_EXPO,
  })

  // Product cards stagger in (110-250)
  const cards = PRODUCTS.map((p, i) => {
    const cardStart = 110 + i * 15
    const opacity = fadeIn(frame, cardStart, 15)
    const scale = interpolate(frame, [cardStart, cardStart + 15], [0.88, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: EASE_OUT_EXPO,
    })

    // Bar + counting start immediately with card (not delayed)
    const barFill = interpolate(frame, [cardStart + 5, cardStart + 35], [0, p.score / 100], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: BALOISE_EASE,
    })

    // Counting number
    const displayScore = Math.round(barFill * p.score)

    // Priority card pulse (stronger than V1)
    const pulse = p.priority && frame > 170
      ? 1 + Math.sin((frame - 170) * 0.1) * 0.035
      : 1

    return { ...p, opacity, scale, barFill, displayScore, pulse }
  })

  // CTA fade-in + slide-up (280-320) — no typewriter, clean fadeIn
  const ctaOpacity = fadeIn(frame, 280, 18)
  const ctaY = slideUp(frame, 280, 15, 18)

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Flash blanc */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: WHITE,
        opacity: flashOpacity,
        pointerEvents: 'none',
        zIndex: 10,
      }} />

      {/* "Votre exposition réelle." — phase 1 centered text */}
      {revealTextOpacity > 0.01 && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: `translate(-50%, ${revealTextY}px)`,
          opacity: revealTextOpacity,
          zIndex: 5,
        }}>
          <span style={{
            color: WHITE,
            fontSize: 28,
            fontFamily: FONT_HEADLINE,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}>
            Votre exposition réelle.
          </span>
        </div>
      )}

      {/* Wheel — stays centered in phase 1, slides left in phase 2 */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(calc(-50% + ${wheelX}px), -50%) scale(${vulnPulse})`,
      }}>
        <WheelSVG
          fillProgress={DEMO_FILL_TARGETS as unknown as number[]}
          fillColors={DEMO_FILL_COLORS as unknown as string[]}
          centerText="VOUS"
        />
      </div>

      {/* Product cards + CTA — right side, vertically centered */}
      {frame > 100 && (
        <div style={{
          position: 'absolute',
          right: 140,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              opacity: card.opacity,
              transform: `scale(${card.scale * card.pulse})`,
              transformOrigin: 'center center',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                background: card.priority
                  ? 'rgba(217,48,76,0.12)'
                  : 'rgba(255,255,255,0.10)',
                borderRadius: 16,
                padding: '20px 28px',
                width: 440,
                border: card.priority
                  ? `2px solid ${card.level}`
                  : '1px solid rgba(255,255,255,0.12)',
                boxShadow: card.priority
                  ? `0 0 ${8 + Math.sin(frame * 0.1) * 4}px rgba(217,48,76,0.2)`
                  : 'none',
              }}>
                {/* Score number — counting animation */}
                <div style={{
                  color: card.level,
                  fontSize: card.priority ? 52 : 42,
                  fontFamily: FONT_HEADLINE,
                  fontWeight: 700,
                  minWidth: 64,
                  textAlign: 'right',
                }}>
                  {card.displayScore}
                </div>

                {/* Name + bar */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: WHITE,
                    fontSize: 20,
                    fontFamily: FONT_HEADLINE,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}>
                    {card.name}
                    {card.priority && card.opacity > 0.5 && (
                      <span style={{
                        marginLeft: 12,
                        fontSize: 12,
                        background: card.level,
                        borderRadius: 10,
                        padding: '3px 10px',
                        verticalAlign: 'middle',
                        color: WHITE,
                      }}>
                        PRIORITÉ
                      </span>
                    )}
                  </div>
                  <div style={{
                    width: '100%', height: 6, borderRadius: 3,
                    background: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${card.barFill * 100}%`,
                      height: '100%', borderRadius: 3,
                      background: card.level,
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* CTA — clean fade-in + slide-up, no typewriter */}
          <div style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
            marginTop: 12,
            textAlign: 'center',
          }}>
            <span style={{
              color: WHITE,
              fontSize: 28,
              fontFamily: FONT_HEADLINE,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              {CTA_TEXT}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
