/**
 * Shared wheel SVG — exact replica of app NeedsWheel.
 * Used across multiple scenes with different animation states.
 */
import { Img, staticFile } from 'remotion'
import { WHEEL, QUADRANT_SEGMENTS, NAVY, NAVY_MID, NAVY_DARK, WHITE } from '../constants'
import { polarXY, arcSectorPath, gradientCoords } from '../helpers'

const { VIEWBOX, CX, CY, CENTER_R, INNER_R1, INNER_R2, RING_GAP, OUTER_R1, OUTER_R2, HALF } = WHEEL

interface WheelProps {
  /** Per-quadrant progress 0-1 (for ring fill animation) */
  quadrantProgress?: number[]
  /** Per-quadrant ring fill 0-1 (for diagnostic fill animation) */
  fillProgress?: number[]
  /** Fill colors per quadrant (scoring colors) */
  fillColors?: string[]
  /** Global opacity for the whole wheel */
  opacity?: number
  /** Scale */
  scale?: number
  /** Center text */
  centerText?: string
  /** Show icons */
  showIcons?: boolean
  /** Per-quadrant icon opacity */
  iconOpacity?: number[]
  /** Per-quadrant label opacity */
  labelOpacity?: number[]
  /** Glow pulse opacity (0-1) per quadrant */
  glowOpacity?: number[]
}

export function WheelSVG({
  quadrantProgress = [1, 1, 1, 1],
  fillProgress,
  fillColors,
  opacity = 1,
  scale = 1,
  centerText = 'VOUS',
  showIcons = true,
  iconOpacity = [1, 1, 1, 1],
  labelOpacity = [1, 1, 1, 1],
  glowOpacity = [0.3, 0.3, 0.3, 0.3],
}: WheelProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      width={VIEWBOX * 2}
      height={VIEWBOX * 2}
      style={{ opacity, transform: `scale(${scale})` }}
    >
      <defs>
        {/* Gradients for each quadrant */}
        {QUADRANT_SEGMENTS.map((seg, i) => {
          const gc = gradientCoords(seg.angle)
          return (
            <g key={`grad-${i}`}>
              <linearGradient id={`outer-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
                <stop offset="0%" stopColor={seg.outerGrad[0]} />
                <stop offset="100%" stopColor={seg.outerGrad[1]} />
              </linearGradient>
              <linearGradient id={`inner-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
                <stop offset="0%" stopColor={seg.innerGrad[0]} />
                <stop offset="100%" stopColor={seg.innerGrad[1]} />
              </linearGradient>
            </g>
          )
        })}
        {/* Center radial gradient */}
        <radialGradient id="center-grad" cx="50%" cy="50%">
          <stop offset="0%" stopColor={NAVY_MID} />
          <stop offset="70%" stopColor={NAVY} />
          <stop offset="100%" stopColor={NAVY_DARK} />
        </radialGradient>
        {/* Glow filters */}
        {QUADRANT_SEGMENTS.map((seg, i) => (
          <filter key={`glow-${i}`} id={`glow-${i}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feFlood floodColor={seg.glowColor} floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
        {/* Highlight overlay */}
        <linearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={WHITE} stopOpacity="0.06" />
          <stop offset="60%" stopColor={WHITE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer decorative ring (dashed) */}
      <circle cx={CX} cy={CY} r={OUTER_R2 + 14} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} strokeDasharray="3 7" />

      {/* Quadrant arcs */}
      {QUADRANT_SEGMENTS.map((seg, i) => {
        const progress = quadrantProgress[i]
        if (progress <= 0) return null

        const a1 = seg.angle - HALF
        const a2Outer = a1 + 90 * progress
        const a2Inner = a1 + 90 * progress

        return (
          <g key={seg.key} opacity={progress}>
            {/* Glow */}
            <path
              d={arcSectorPath(INNER_R1, OUTER_R2, a1, a2Outer)}
              fill={seg.glowColor}
              filter={`url(#glow-${i})`}
              opacity={glowOpacity[i]}
            />
            {/* Outer ring */}
            <path
              d={arcSectorPath(OUTER_R1, OUTER_R2, a1, a2Outer)}
              fill={`url(#outer-${i})`}
              opacity={0.95}
            />
            {/* Inner ring */}
            <path
              d={arcSectorPath(INNER_R1, INNER_R2, a1, a2Inner)}
              fill={`url(#inner-${i})`}
              opacity={0.8}
            />
            {/* Highlight overlay */}
            <path
              d={arcSectorPath(INNER_R1, OUTER_R2, a1, a2Outer)}
              fill="url(#highlight)"
            />

            {/* Diagnostic fill overlay */}
            {fillProgress && fillProgress[i] > 0 && (
              <path
                d={arcSectorPath(OUTER_R1, OUTER_R2, a1, a1 + 90 * fillProgress[i])}
                fill={fillColors?.[i] ?? WHITE}
                opacity={0.35}
              />
            )}

            {/* Labels */}
            {progress > 0.8 && (() => {
              const midAngle = seg.angle
              const labelR = (INNER_R1 + INNER_R2) / 2
              const [lx, ly] = polarXY(labelR, midAngle)
              return (
                <g opacity={labelOpacity[i]}>
                  <text x={lx} y={ly - 6} textAnchor="middle" fill={WHITE}
                    fontSize={9.5} fontWeight={700} fontFamily="'BaloiseCreateHeadline','Inter',sans-serif"
                    letterSpacing="0.06em">
                    {seg.lines[0]}
                  </text>
                  <text x={lx} y={ly + 8} textAnchor="middle" fill={WHITE}
                    fontSize={10} fontWeight={700} fontFamily="'BaloiseCreateHeadline','Inter',sans-serif"
                    letterSpacing="0.06em">
                    {seg.lines[1]}
                  </text>
                </g>
              )
            })()}

            {/* Icons */}
            {showIcons && progress > 0.9 && seg.icons.map((icon, j) => {
              const iconAngle = a1 + 90 * icon.anglePct
              const iconR = OUTER_R1 + (OUTER_R2 - OUTER_R1) * icon.radiusPct
              const [ix, iy] = polarXY(iconR, iconAngle)
              return (
                <image
                  key={j}
                  href={staticFile(icon.src)}
                  x={ix - 13}
                  y={iy - 13}
                  width={26}
                  height={26}
                  opacity={iconOpacity[i]}
                />
              )
            })}
          </g>
        )
      })}

      {/* Divider lines */}
      {[0, 90, 180, 270].map((angle) => {
        const [ix, iy] = polarXY(INNER_R1, angle)
        const [ox, oy] = polarXY(OUTER_R2, angle)
        return (
          <line key={angle} x1={ix} y1={iy} x2={ox} y2={oy}
            stroke="rgba(0,3,30,0.95)" strokeWidth={4} />
        )
      })}

      {/* Inner decorative ring */}
      <circle cx={CX} cy={CY} r={INNER_R1 - 4} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />

      {/* Center circle */}
      <circle cx={CX} cy={CY} r={CENTER_R} fill="url(#center-grad)"
        stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />

      {/* Center icon */}
      <image
        href={staticFile('/icons/wheel/center-family.png')}
        x={CX - 16} y={CY - 20} width={32} height={32} opacity={0.85}
      />

      {/* Center text */}
      <text x={CX} y={CY + 24} textAnchor="middle" fill={WHITE}
        fontSize={14} fontWeight={700} fontFamily="'BaloiseCreateHeadline','Inter',sans-serif"
        letterSpacing="0.14em" opacity={0.9}>
        {centerText}
      </text>
    </svg>
  )
}
