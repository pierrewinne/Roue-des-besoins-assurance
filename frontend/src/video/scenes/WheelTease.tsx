import { useCurrentFrame } from 'remotion'
import { NAVY, NAVY_DARK, NAVY_MID, WHITE, GREY_300, FONT_HEADLINE, FONT_BODY, FPS } from '../constants'
import { fadeIn, fadeOut, scaleIn } from '../helpers'

const CX = 500
const CY = 500
const OUTER_R = 380
const INNER_R = 260
const CENTER_R = 90

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Scene 4: First wheel tease — empty structure fades in, no quadrant colors */
export function WheelTease() {
  const frame = useCurrentFrame()

  // Intro text: "Et si on voyait les choses... autrement ?"
  const textOpacity = fadeIn(frame, 5, 15) * (frame > 60 ? fadeOut(frame, 60, 15) : 1)

  // Wheel structure appears
  const wheelOpacity = fadeIn(frame, 40, 20)
  const wheelScale = scaleIn(frame, 40, 25)

  // Dividers
  const divOpacity = fadeIn(frame, 55, 15)

  // Center
  const centerOpacity = fadeIn(frame, 65, 15)

  // "?" in center
  const qOpacity = fadeIn(frame, 80, 12)

  // Overall fade out at the end
  const exitFade = frame > 4.2 * FPS ? fadeOut(frame, 4.2 * FPS, 15) : 1

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: NAVY,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Intro text */}
      <p
        style={{
          position: 'absolute',
          top: 120,
          fontFamily: FONT_BODY,
          fontSize: 32,
          color: GREY_300,
          textAlign: 'center',
          opacity: textOpacity * exitFade,
          letterSpacing: '0.02em',
        }}
      >
        Et si on voyait les choses...{' '}
        <span style={{ fontFamily: FONT_HEADLINE, fontWeight: 700, color: WHITE }}>
          autrement ?
        </span>
      </p>

      {/* Empty wheel structure */}
      <svg
        viewBox="0 0 1000 1000"
        width={600}
        height={600}
        style={{
          opacity: wheelOpacity * exitFade,
          transform: `scale(${wheelScale})`,
        }}
      >
        <defs>
          <radialGradient id="tease-center-grad" cx="50%" cy="50%">
            <stop offset="0%" stopColor={NAVY_MID} />
            <stop offset="100%" stopColor={NAVY_DARK} />
          </radialGradient>
        </defs>

        {/* Outer ring — ghost */}
        <circle
          cx={CX}
          cy={CY}
          r={OUTER_R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2}
        />

        {/* Inner ring — ghost */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2}
        />

        {/* Cross dividers */}
        {[0, 90, 180, 270].map((angle) => {
          const inner = polarToCartesian(CX, CY, INNER_R, angle)
          const outer = polarToCartesian(CX, CY, OUTER_R, angle)
          return (
            <line
              key={angle}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={2}
              opacity={divOpacity}
            />
          )
        })}

        {/* Center circle */}
        <circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          fill="url(#tease-center-grad)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={2}
          opacity={centerOpacity}
        />

        {/* "?" */}
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          fill={WHITE}
          fontSize={40}
          fontWeight={700}
          fontFamily="'Inter',sans-serif"
          opacity={qOpacity * 0.5}
        >
          ?
        </text>
      </svg>
    </div>
  )
}
