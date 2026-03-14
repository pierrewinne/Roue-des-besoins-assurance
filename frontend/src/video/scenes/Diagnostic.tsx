/**
 * Scene 3: Diagnostic (10-20s / frames 300-600)
 * Wheel shrinks left, question cards appear right (3 simulated questions),
 * then wheel returns to center and fills asymmetrically with score colors.
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, FONT_BODY, DEMO_FILL_TARGETS, DEMO_FILL_COLORS } from '../constants'
import { fadeIn, fadeOut } from '../helpers'
import { WheelSVG } from './WheelSVG'

const QUESTIONS = [
  { q: 'Êtes-vous propriétaire ?', a: 'Oui' },
  { q: 'Avez-vous des enfants ?', a: '2 enfants' },
  { q: 'Votre véhicule a-t-il moins de 3 ans ?', a: 'Non' },
]

const EASE_OUT = Easing.out(Easing.cubic)

export function Diagnostic() {
  const frame = useCurrentFrame()

  // Phase 1 (0-160): Wheel moves left, questions appear
  const wheelX = interpolate(frame, [0, 40], [0, -320], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_OUT,
  })
  const wheelScale = interpolate(frame, [0, 40], [1, 0.65], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_OUT,
  })

  // Phase 2 (160-300): Wheel returns to center and fills
  const returnProgress = interpolate(frame, [160, 200], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: EASE_OUT,
  })

  const finalWheelX = frame < 160 ? wheelX : interpolate(returnProgress, [0, 1], [wheelX, 0])
  const finalWheelScale = frame < 160 ? wheelScale : interpolate(returnProgress, [0, 1], [wheelScale, 1])

  // Fill progress (200-280)
  const fillProgress = DEMO_FILL_TARGETS.map((target, i) =>
    interpolate(frame, [200 + i * 12, 250 + i * 12], [0, target], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: EASE_OUT,
    })
  )

  // Completion pulse (280-300)
  const pulseScale = frame > 270
    ? 1 + Math.sin((frame - 270) * 0.15) * 0.01
    : 1

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Wheel */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(calc(-50% + ${finalWheelX}px), -50%) scale(${finalWheelScale * pulseScale})`,
      }}>
        <WheelSVG
          fillProgress={frame > 200 ? fillProgress : undefined}
          fillColors={DEMO_FILL_COLORS as unknown as string[]}
          centerText="VOUS"
        />
      </div>

      {/* Question cards (phase 1 only) */}
      {frame < 180 && QUESTIONS.map((q, i) => {
        const cardStart = 40 + i * 40
        const cardOpacity = fadeIn(frame, cardStart, 15) * fadeOut(frame, cardStart + 35, 12)
        // Answer appears after question
        const answerOpacity = fadeIn(frame, cardStart + 18, 10) * fadeOut(frame, cardStart + 35, 12)

        return (
          <div key={i} style={{
            position: 'absolute',
            right: 120,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: cardOpacity,
            width: 480,
          }}>
            {/* Question card */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '28px 32px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{
                color: WHITE,
                fontSize: 22,
                fontFamily: FONT_HEADLINE,
                fontWeight: 700,
                marginBottom: 16,
              }}>
                {q.q}
              </div>
              {/* Answer pill */}
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '8px 24px',
                opacity: answerOpacity,
              }}>
                <span style={{
                  color: WHITE,
                  fontSize: 18,
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                }}>
                  {q.a}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Score label after fill */}
      {frame > 260 && (
        <div style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: fadeIn(frame, 260, 20),
        }}>
          <span style={{
            color: WHITE,
            fontSize: 20,
            fontFamily: FONT_BODY,
            fontWeight: 500,
            opacity: 0.7,
            letterSpacing: '0.05em',
          }}>
            Votre diagnostic en cours...
          </span>
        </div>
      )}
    </div>
  )
}
