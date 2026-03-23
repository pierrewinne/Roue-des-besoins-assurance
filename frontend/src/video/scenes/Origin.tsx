/**
 * Act 1: L'angle mort (0-5s / 150 frames)
 * Staccato text — certainties then doubts — flash transition to wheel.
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { WHITE, FONT_HEADLINE } from '../constants'
import { fadeIn, fadeOut } from '../helpers'

const BALOISE_EASE = Easing.bezier(0.25, 0.8, 0.5, 1)

const PHRASES: { text: string; start: number; isQuestion: boolean }[] = [
  { text: 'Votre maison est assurée.', start: 8, isQuestion: false },
  { text: 'Votre voiture aussi.', start: 33, isQuestion: false },
  { text: 'Mais vos projets ?', start: 58, isQuestion: true },
  { text: 'Votre famille ?', start: 78, isQuestion: true },
  { text: 'Votre avenir ?', start: 96, isQuestion: true },
]

export function Origin() {
  const frame = useCurrentFrame()

  // Flash blanc (128-132)
  const flashOpacity = interpolate(frame, [126, 128, 131, 134], [0, 0.7, 0.7, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  // Expanding ring after flash (130-150)
  const ringScale = interpolate(frame, [130, 150], [0, 3.5], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: BALOISE_EASE,
  })
  const ringOpacity = interpolate(frame, [130, 150], [0.5, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Phrases — staccato */}
      {PHRASES.map((phrase, i) => {
        const nextStart = PHRASES[i + 1]?.start ?? 126
        const fadeInDur = 10
        const fadeOutStart = nextStart - 8
        const fadeOutDur = 8

        const inOp = fadeIn(frame, phrase.start, fadeInDur)
        const outOp = i < PHRASES.length - 1
          ? fadeOut(frame, fadeOutStart, fadeOutDur)
          : fadeOut(frame, 120, 8)
        const opacity = inOp * outOp

        const slideY = interpolate(frame, [phrase.start, phrase.start + fadeInDur], [24, 0], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: BALOISE_EASE,
        })

        // Questions: slightly reduced max opacity + bigger font
        const maxOpacity = phrase.isQuestion ? 0.8 : 1
        const fontSize = phrase.isQuestion ? 48 : 44

        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: `translate(-50%, calc(-50% + ${slideY}px))`,
            opacity: opacity * maxOpacity,
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              color: WHITE,
              fontSize,
              fontFamily: FONT_HEADLINE,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              {phrase.text}
            </span>
          </div>
        )
      })}

      {/* Flash blanc */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: WHITE,
        opacity: flashOpacity,
        pointerEvents: 'none',
      }} />

      {/* Expanding ring — transition to wheel */}
      {frame > 129 && (
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 180, height: 180,
          borderRadius: '50%',
          border: `1.5px solid rgba(255,255,255,0.5)`,
          opacity: ringOpacity,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
