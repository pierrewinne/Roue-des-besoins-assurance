/**
 * Scene 1: Origin (0-3s / frames 0-90)
 * White dot → "VOUS" text morph, navy background
 */
import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, WHEEL } from '../constants'
import { fadeIn, scaleIn } from '../helpers'

const { CX, CY, VIEWBOX } = WHEEL

export function Origin() {
  const frame = useCurrentFrame()

  // Dot appears and grows (0-30)
  const dotScale = scaleIn(frame, 0, 30)
  const dotR = 4 + dotScale * 8

  // "VOUS" fades in and scales (30-70)
  const textOpacity = fadeIn(frame, 30, 25)
  const textScale = scaleIn(frame, 30, 25)

  // Subtle radial glow
  const glowOpacity = fadeIn(frame, 15, 40) * 0.3

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} width={VIEWBOX * 2} height={VIEWBOX * 2}>
        {/* Radial glow behind dot */}
        <radialGradient id="origin-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor={WHITE} stopOpacity={0.15} />
          <stop offset="100%" stopColor={WHITE} stopOpacity={0} />
        </radialGradient>
        <circle cx={CX} cy={CY} r={80} fill="url(#origin-glow)" opacity={glowOpacity} />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={dotR} fill={WHITE} opacity={dotScale} />

        {/* VOUS text */}
        <text
          x={CX} y={CY + 50}
          textAnchor="middle"
          fill={WHITE}
          fontSize={28}
          fontWeight={700}
          fontFamily={FONT_HEADLINE}
          letterSpacing="0.2em"
          opacity={textOpacity}
          style={{ transform: `scale(${textScale})`, transformOrigin: `${CX}px ${CY + 50}px` }}
        >
          VOUS
        </text>
      </svg>
    </div>
  )
}
