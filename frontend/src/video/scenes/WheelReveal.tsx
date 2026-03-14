import { useCurrentFrame } from 'remotion'
import { NAVY, NAVY_DARK, NAVY_MID, WHITE, QUADRANT_COLORS, QUADRANT_LABELS, QUADRANT_ORDER, FONT_HEADLINE, FPS } from '../constants'
import { fadeIn, scaleIn, arcDraw, pulse } from '../helpers'

const CX = 500
const CY = 500
const OUTER_R = 420
const INNER_R = 280
const CENTER_R = 100

/** Full wheel reveal — quadrants light up one by one */
export function WheelReveal() {
  const frame = useCurrentFrame()
  const totalFrames = 17 * FPS

  // Structure appears first (first 2 seconds)
  const structureScale = scaleIn(frame, 0, 25)
  const centerOpacity = fadeIn(frame, 8, 15)
  const vousOpacity = fadeIn(frame, 20, 12)

  // Each quadrant: start at 2s, 1.5s apart
  const quadrantStarts = [2 * FPS, 3.5 * FPS, 5 * FPS, 6.5 * FPS]

  // Pulse after all quadrants are in
  const allDone = frame > 8 * FPS
  const globalPulse = allDone ? pulse(frame, 0.015, 0.008) : 1

  // Quadrant angles (matching the app: biens=top-right, personnes=bottom-right, projets=bottom-left, futur=top-left)
  const quadrantAngles = [
    { start: -90, end: 0 },    // biens: 270-360 (top-right)
    { start: 0, end: 90 },     // personnes: 0-90 (bottom-right)
    { start: 180, end: 270 },  // projets: 180-270 (bottom-left)
    { start: 90, end: 180 },   // futur: 90-180 (top-left)
  ]

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArcSector(cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number) {
    const outerStart = polarToCartesian(cx, cy, r2, startAngle)
    const outerEnd = polarToCartesian(cx, cy, r2, endAngle)
    const innerEnd = polarToCartesian(cx, cy, r1, endAngle)
    const innerStart = polarToCartesian(cx, cy, r1, startAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${r2} ${r2} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${r1} ${r1} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      'Z',
    ].join(' ')
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: NAVY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 1000 1000"
        width={800}
        height={800}
        style={{
          transform: `scale(${structureScale * globalPulse})`,
        }}
      >
        <defs>
          {/* Glow filters for each quadrant */}
          {QUADRANT_ORDER.map((q) => (
            <filter key={`glow-${q}`} id={`glow-${q}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Radial gradient for center */}
          <radialGradient id="center-grad" cx="50%" cy="50%">
            <stop offset="0%" stopColor={NAVY_MID} />
            <stop offset="60%" stopColor={NAVY} />
            <stop offset="100%" stopColor={NAVY_DARK} />
          </radialGradient>
        </defs>

        {/* Outer decorative circle (dotted) */}
        <circle
          cx={CX}
          cy={CY}
          r={OUTER_R + 30}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
          strokeDasharray="3 7"
          opacity={fadeIn(frame, 10 * FPS, 20)}
        />

        {/* Quadrant sectors */}
        {QUADRANT_ORDER.map((q, i) => {
          const qStart = quadrantStarts[i]
          const progress = arcDraw(frame, qStart, 35)
          const colors = QUADRANT_COLORS[q]
          const angles = quadrantAngles[i]
          const labelOpacity = fadeIn(frame, qStart + 30, 15)

          if (progress <= 0) return null

          // Sweep angle based on progress
          const sweepEnd = angles.start + (angles.end - angles.start) * progress

          return (
            <g key={q} opacity={progress}>
              {/* Glow */}
              <path
                d={describeArcSector(CX, CY, INNER_R, OUTER_R, angles.start, sweepEnd)}
                fill={colors.glow}
                filter={`url(#glow-${q})`}
                opacity={0.5}
              />
              {/* Outer ring */}
              <path
                d={describeArcSector(CX, CY, (INNER_R + OUTER_R) / 2, OUTER_R, angles.start, sweepEnd)}
                fill={colors.base}
                opacity={0.9}
              />
              {/* Inner ring */}
              <path
                d={describeArcSector(CX, CY, INNER_R, (INNER_R + OUTER_R) / 2, angles.start, sweepEnd)}
                fill={colors.light}
                opacity={0.7}
              />
              {/* Label (appears after quadrant fills) */}
              {progress > 0.8 && (() => {
                const midAngle = (angles.start + angles.end) / 2
                const labelR = (INNER_R + OUTER_R) / 2
                const pos = polarToCartesian(CX, CY, labelR, midAngle)
                const labels = QUADRANT_LABELS[q]
                return (
                  <g opacity={labelOpacity}>
                    <text
                      x={pos.x}
                      y={pos.y - 8}
                      textAnchor="middle"
                      fill={WHITE}
                      fontSize={16}
                      fontWeight={700}
                      fontFamily="'Inter',sans-serif"
                      letterSpacing="0.08em"
                    >
                      {labels.line1}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 14}
                      textAnchor="middle"
                      fill={WHITE}
                      fontSize={16}
                      fontWeight={700}
                      fontFamily="'Inter',sans-serif"
                      letterSpacing="0.08em"
                    >
                      {labels.line2}
                    </text>
                  </g>
                )
              })()}
            </g>
          )
        })}

        {/* Divider lines (cross) */}
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
              stroke={NAVY}
              strokeWidth={4}
              opacity={fadeIn(frame, 15, 15)}
            />
          )
        })}

        {/* Center circle */}
        <circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          fill="url(#center-grad)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={2}
          opacity={centerOpacity}
        />

        {/* "VOUS" text */}
        <text
          x={CX}
          y={CY + 7}
          textAnchor="middle"
          fill={WHITE}
          fontSize={22}
          fontWeight={700}
          fontFamily="'Inter',sans-serif"
          letterSpacing="0.14em"
          opacity={vousOpacity * 0.9}
        >
          VOUS
        </text>

        {/* Inner decorative circle */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R - 5}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.5}
          opacity={fadeIn(frame, 5 * FPS, 15)}
        />
      </svg>
    </div>
  )
}
