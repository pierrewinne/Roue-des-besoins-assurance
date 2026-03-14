/**
 * Scene 4: Results (20-32s / frames 600-960)
 * Wheel stays large on left (same size as Diagnostic), product cards on right.
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, FONT_BODY, SCORE_COLORS, QUADRANT_SEGMENTS, DEMO_FILL_TARGETS, DEMO_FILL_COLORS } from '../constants'
import { fadeIn, scaleIn } from '../helpers'
import { WheelSVG } from './WheelSVG'

const PRODUCTS = [
  { name: 'DRIVE', color: QUADRANT_SEGMENTS[0].outerGrad[1], score: 72, level: SCORE_COLORS.moderate },
  { name: 'HOME', color: QUADRANT_SEGMENTS[0].outerGrad[0], score: 91, level: SCORE_COLORS.high, priority: true },
  { name: 'TRAVEL', color: QUADRANT_SEGMENTS[1].outerGrad[1], score: 38, level: SCORE_COLORS.low },
  { name: 'B-SAFE', color: QUADRANT_SEGMENTS[3].outerGrad[1], score: 65, level: SCORE_COLORS.moderate },
]

const CTA_TEXT = 'Un diagnostic complet en 5 minutes.'
const EASE_OUT = Easing.out(Easing.cubic)

export function Results() {
  const frame = useCurrentFrame()

  // Wheel slides from center to left (no size change — same as Diagnostic)
  const wheelX = interpolate(frame, [0, 35], [0, -390], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_OUT,
  })

  // Product cards stagger in (35-130)
  const cards = PRODUCTS.map((p, i) => {
    const cardStart = 35 + i * 18
    const opacity = fadeIn(frame, cardStart, 18)
    const scale = scaleIn(frame, cardStart, 18)

    const barFill = interpolate(frame, [cardStart + 10, cardStart + 40], [0, p.score / 100], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: EASE_OUT,
    })

    const pulse = p.priority && frame > 120
      ? 1 + Math.sin((frame - 120) * 0.1) * 0.015
      : 1

    return { ...p, opacity, scale, barFill, pulse }
  })

  // CTA typewriter (160-240)
  const ctaChars = Math.floor(
    interpolate(frame, [160, 230], [0, CTA_TEXT.length], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
  )

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Wheel — same size as Diagnostic scene, slides left */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(calc(-50% + ${wheelX}px), -50%)`,
      }}>
        <WheelSVG
          fillProgress={DEMO_FILL_TARGETS as unknown as number[]}
          fillColors={DEMO_FILL_COLORS as unknown as string[]}
          centerText="VOUS"
        />
      </div>

      {/* Product cards + CTA — right side, vertically centered together */}
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
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '20px 28px',
              width: 440,
              border: card.priority
                ? `2px solid ${card.level}`
                : '1px solid rgba(255,255,255,0.08)',
            }}>
              {/* Score number */}
              <div style={{
                color: card.level,
                fontSize: 42,
                fontFamily: FONT_HEADLINE,
                fontWeight: 700,
                minWidth: 64,
                textAlign: 'right',
              }}>
                {Math.round(card.barFill * card.score)}
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

        {/* CTA — synthèse sous les cards */}
        <div style={{
          opacity: fadeIn(frame, 160, 15),
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
            {CTA_TEXT.slice(0, ctaChars)}
            <span style={{ opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0 }}>|</span>
          </span>
        </div>
      </div>
    </div>
  )
}
