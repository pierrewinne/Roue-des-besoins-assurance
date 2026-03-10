import { useRef, useEffect } from 'react'

/* ─── Geometry ─── */
const CX = 200
const CY = 200
const CENTER_R = 44
const INNER_R = 62
const OUTER_R = 150
const GAP = 4
const HALF = (90 - GAP) / 2

/* ─── Segment data ─── */
export interface WheelSegment {
  key: string
  lines: [string, string]
  product: string
  angle: number
  color: string
  glowColor: string
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  { key: 'personnes', lines: ['Protection', 'des personnes'], product: 'Bsafe', angle: 0, color: '#0014aa', glowColor: 'rgba(0, 20, 170, 0.35)' },
  { key: 'biens', lines: ['Protection', 'des biens'], product: 'Home', angle: 90, color: '#293485', glowColor: 'rgba(41, 52, 133, 0.35)' },
  { key: 'futur', lines: ['Protection', 'du futur'], product: 'Pension Plan', angle: 180, color: '#3d4691', glowColor: 'rgba(61, 70, 145, 0.35)' },
  { key: 'projets', lines: ['Protection', 'des projets'], product: 'Drive', angle: 270, color: '#656ea8', glowColor: 'rgba(101, 110, 168, 0.35)' },
]

/* ─── Helpers ─── */
function xy(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [+(CX + r * Math.cos(rad)).toFixed(1), +(CY + r * Math.sin(rad)).toFixed(1)]
}

function arc(r1: number, r2: number, a1: number, a2: number) {
  const [ox1, oy1] = xy(r2, a1)
  const [ox2, oy2] = xy(r2, a2)
  const [ix2, iy2] = xy(r1, a2)
  const [ix1, iy1] = xy(r1, a1)
  const lg = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0
  return `M${ox1},${oy1} A${r2},${r2} 0 ${lg} 1 ${ox2},${oy2} L${ix2},${iy2} A${r1},${r1} 0 ${lg} 0 ${ix1},${iy1} Z`
}

/* ─── Props ─── */
interface NeedsWheelProps {
  className?: string
  activeSegment?: number | null
  onSegmentClick?: (index: number) => void
}

export default function NeedsWheel({ className = '', activeSegment = null, onSegmentClick }: NeedsWheelProps) {
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Diagramme interactif des 4 univers de protection -- cliquez sur un segment pour en savoir plus"
    >
      <defs>
        {/* Glow filters per segment */}
        {WHEEL_SEGMENTS.map((seg, i) => (
          <filter key={`glow-${i}`} id={`segment-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor={seg.color} floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}

        {/* Center glow */}
        <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Decorative outer ring */}
      <circle
        cx={CX} cy={CY} r={170}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="0.5"
        strokeDasharray="3 6"
      />
      <circle
        cx={CX} cy={CY} r={185}
        fill="none"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="0.5"
        strokeDasharray="2 8"
      />

      {/* Segments */}
      {WHEEL_SEGMENTS.map((seg, i) => {
        const a1 = seg.angle - HALF
        const a2 = seg.angle + HALF
        const midR = (INNER_R + OUTER_R) / 2
        const [tx, ty] = xy(midR, seg.angle)
        const isActive = activeSegment === i
        const isOther = activeSegment !== null && activeSegment !== i

        /* Fill opacity logic */
        const fillOpacity = isActive ? 0.18 : isOther ? 0.04 : 0.07
        const strokeOpacity = isActive ? 0.35 : isOther ? 0.06 : 0.12
        const textOpacity = isActive ? 1 : isOther ? 0.4 : 0.85

        return (
          <g
            key={seg.key}
            className="wheel-segment focus:outline-none focus-visible:outline-none"
            style={{
              cursor: onSegmentClick ? 'pointer' : 'default',
              outline: 'none',
              transition: reducedMotion.current ? 'none' : undefined,
            }}
            onClick={() => onSegmentClick?.(i)}
            role={onSegmentClick ? 'button' : undefined}
            tabIndex={onSegmentClick ? 0 : undefined}
            aria-label={`${seg.lines[0]} ${seg.lines[1]} -- ${seg.product}`}
            aria-pressed={onSegmentClick ? isActive : undefined}
            onKeyDown={onSegmentClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSegmentClick(i) } } : undefined}
          >
            {/* Active glow backdrop */}
            {isActive && (
              <path
                d={arc(INNER_R - 4, OUTER_R + 12, a1 - 2, a2 + 2)}
                fill={seg.glowColor}
                className="wheel-segment-glow"
                style={{ filter: `url(#segment-glow-${i})` }}
              />
            )}

            {/* Segment shape */}
            <path
              d={arc(INNER_R, OUTER_R, a1, a2)}
              fill={isActive ? `${seg.color}30` : `rgba(255,255,255,${fillOpacity})`}
              stroke={isActive ? `${seg.color}90` : `rgba(255,255,255,${strokeOpacity})`}
              strokeWidth={isActive ? 1.5 : 0.75}
              className="wheel-segment-path"
            />

            {/* Segment label */}
            <text
              x={tx} y={ty}
              textAnchor="middle"
              fill={isActive ? 'white' : `rgba(255,255,255,${textOpacity})`}
              fontSize={isActive ? '12' : '11'}
              fontWeight="700"
              fontFamily="'Inter',sans-serif"
              className="pointer-events-none select-none"
            >
              <tspan x={tx} dy="-7">{seg.lines[0]}</tspan>
              <tspan x={tx} dy="15">{seg.lines[1]}</tspan>
            </text>

            {/* Product label (outside) */}
            {(() => {
              const productR = OUTER_R + 20
              const [px, py] = xy(productR, seg.angle)
              return (
                <text
                  x={px} y={py}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? `${seg.color}` : `rgba(255,255,255,0.25)`}
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="'Inter',sans-serif"
                  letterSpacing="0.08em"
                  className="pointer-events-none select-none"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 4px ${seg.glowColor})` : undefined,
                    transition: 'fill 300ms cubic-bezier(0.25, 0.8, 0.5, 1), filter 300ms cubic-bezier(0.25, 0.8, 0.5, 1)',
                  }}
                >
                  {seg.product.toUpperCase()}
                </text>
              )
            })()}

            {/* Tick line from segment to product */}
            {(() => {
              const [t1x, t1y] = xy(OUTER_R + 3, seg.angle)
              const [t2x, t2y] = xy(OUTER_R + 14, seg.angle)
              return (
                <line
                  x1={t1x} y1={t1y} x2={t2x} y2={t2y}
                  stroke={isActive ? `${seg.color}60` : 'rgba(255,255,255,0.06)'}
                  strokeWidth="0.5"
                  className="pointer-events-none"
                />
              )
            })()}
          </g>
        )
      })}

      {/* Center ambient glow */}
      <circle cx={CX} cy={CY} r={56} fill="url(#center-glow)" className="pointer-events-none" />

      {/* Center circle */}
      <circle
        cx={CX} cy={CY} r={CENTER_R}
        fill="white"
        className="pointer-events-none"
        style={{
          filter: activeSegment !== null
            ? `drop-shadow(0 0 12px ${WHEEL_SEGMENTS[activeSegment].glowColor})`
            : 'drop-shadow(0 0 8px rgba(255,255,255,0.1))',
          transition: 'filter 300ms cubic-bezier(0.25, 0.8, 0.5, 1)',
        }}
      />
      <text
        x={CX} y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#000739"
        fontSize="12"
        fontWeight="700"
        fontFamily="'Inter',sans-serif"
        className="pointer-events-none select-none"
      >
        Le client
      </text>
    </svg>
  )
}
