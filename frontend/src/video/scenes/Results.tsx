/**
 * Scene 4: Results (20-28s / frames 600-840)
 * Wheel shrinks top, 4 product cards with score bars,
 * HOME pulses as priority, typewriter CTA text.
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { NAVY, NAVY_MID, WHITE, FONT_HEADLINE, FONT_BODY, SCORE_COLORS, WHEEL, QUADRANT_SEGMENTS } from '../constants'
import { fadeIn, scaleIn } from '../helpers'
import { WheelSVG } from './WheelSVG'

const PRODUCTS = [
  { name: 'DRIVE', color: QUADRANT_SEGMENTS[0].outerGrad[1], score: 72, level: SCORE_COLORS.moderate },
  { name: 'HOME', color: QUADRANT_SEGMENTS[0].outerGrad[0], score: 91, level: SCORE_COLORS.high, priority: true },
  { name: 'TRAVEL', color: QUADRANT_SEGMENTS[1].outerGrad[1], score: 38, level: SCORE_COLORS.low },
  { name: 'B-SAFE', color: QUADRANT_SEGMENTS[3].outerGrad[1], score: 65, level: SCORE_COLORS.moderate },
]

const CTA_TEXT = 'Un diagnostic complet en 5 minutes.'

export function Results() {
  const frame = useCurrentFrame()

  // Wheel shrinks to top-left (0-30 relative)
  const wheelScale = interpolate(frame, [0, 30], [1, 0.38], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
  const wheelY = interpolate(frame, [0, 30], [0, -260], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // Fill values (from diagnostic scene)
  const fillProgress = [0.78, 0.92, 0.45, 0.65]
  const fillColors = [SCORE_COLORS.moderate, SCORE_COLORS.high, SCORE_COLORS.low, SCORE_COLORS.moderate]

  // Product cards stagger in (30-120)
  const cards = PRODUCTS.map((p, i) => {
    const cardStart = 30 + i * 18
    const opacity = fadeIn(frame, cardStart, 18)
    const scale = scaleIn(frame, cardStart, 18)

    // Score bar fill
    const barFill = interpolate(frame, [cardStart + 10, cardStart + 40], [0, p.score / 100], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    })

    // Priority pulse for HOME
    const pulse = p.priority && frame > 100
      ? 1 + Math.sin((frame - 100) * 0.1) * 0.015
      : 1

    return { ...p, opacity, scale, barFill, pulse }
  })

  // CTA typewriter (140-220)
  const ctaChars = Math.floor(
    interpolate(frame, [140, 210], [0, CTA_TEXT.length], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
  )

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Mini wheel top-left */}
      <div style={{
        position: 'absolute',
        left: 80, top: 40,
        transform: `scale(${wheelScale})`,
        transformOrigin: 'center',
        opacity: frame > 5 ? 1 : 0,
      }}>
        <WheelSVG
          fillProgress={fillProgress}
          fillColors={fillColors}
          centerText="VOUS"
          scale={0.5}
        />
      </div>

      {/* Product cards */}
      <div style={{
        display: 'flex',
        gap: 24,
        marginTop: 40,
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            width: 200,
            opacity: card.opacity,
            transform: `scale(${card.scale * card.pulse})`,
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '24px 20px',
              border: card.priority
                ? `2px solid ${card.level}`
                : '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}>
              {/* Product name */}
              <div style={{
                color: WHITE,
                fontSize: 16,
                fontFamily: FONT_HEADLINE,
                fontWeight: 700,
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}>
                {card.name}
              </div>

              {/* Score number */}
              <div style={{
                color: card.level,
                fontSize: 36,
                fontFamily: FONT_HEADLINE,
                fontWeight: 700,
                marginBottom: 8,
              }}>
                {Math.round(card.barFill * card.score)}
              </div>

              {/* Score bar */}
              <div style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${card.barFill * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: card.level,
                }} />
              </div>

              {/* Priority badge */}
              {card.priority && card.opacity > 0.5 && (
                <div style={{
                  marginTop: 10,
                  display: 'inline-block',
                  background: card.level,
                  borderRadius: 12,
                  padding: '3px 12px',
                }}>
                  <span style={{
                    color: WHITE,
                    fontSize: 11,
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}>
                    PRIORITÉ
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CTA typewriter */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: fadeIn(frame, 140, 15),
      }}>
        <span style={{
          color: WHITE,
          fontSize: 24,
          fontFamily: FONT_HEADLINE,
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}>
          {CTA_TEXT.slice(0, ctaChars)}
          <span style={{ opacity: Math.sin(frame * 0.15) > 0 ? 1 : 0 }}>|</span>
        </span>
      </div>
    </div>
  )
}
