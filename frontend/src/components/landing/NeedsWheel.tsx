import { useRef, useEffect } from 'react'

/* ─── Geometry (viewBox 500×500) ─── */
const CX = 250
const CY = 250
const CENTER_R = 52
const INNER_R = 78
const OUTER_R = 185
const GAP = 5
const HALF = (90 - GAP) / 2

/* ─── Segment data ─── */
export interface WheelSegment {
  key: string
  lines: [string, string]
  product: string
  angle: number
  color: string
  gradientLight: string
  gradientDark: string
  glowColor: string
  icon: 'shield' | 'home' | 'trending-up' | 'car'
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    key: 'personnes',
    lines: ['Protection', 'des personnes'],
    product: 'Bsafe',
    angle: 0,
    color: '#3B82F6',
    gradientLight: '#60A5FA',
    gradientDark: '#2563EB',
    glowColor: 'rgba(59, 130, 246, 0.30)',
    icon: 'shield',
  },
  {
    key: 'biens',
    lines: ['Protection', 'des biens'],
    product: 'Home',
    angle: 90,
    color: '#8B5CF6',
    gradientLight: '#A78BFA',
    gradientDark: '#7C3AED',
    glowColor: 'rgba(139, 92, 246, 0.30)',
    icon: 'home',
  },
  {
    key: 'futur',
    lines: ['Protection', 'du futur'],
    product: 'Pension Plan',
    angle: 180,
    color: '#14B8A6',
    gradientLight: '#2DD4BF',
    gradientDark: '#0D9488',
    glowColor: 'rgba(20, 184, 166, 0.30)',
    icon: 'trending-up',
  },
  {
    key: 'projets',
    lines: ['Protection', 'des projets'],
    product: 'Drive',
    angle: 270,
    color: '#F59E0B',
    gradientLight: '#FBBF24',
    gradientDark: '#D97706',
    glowColor: 'rgba(245, 158, 11, 0.30)',
    icon: 'car',
  },
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

/* ─── Gradient direction per angle ─── */
function gradientCoords(angle: number): { x1: string; y1: string; x2: string; y2: string } {
  switch (angle) {
    case 0: return { x1: '50%', y1: '100%', x2: '50%', y2: '0%' }
    case 90: return { x1: '0%', y1: '50%', x2: '100%', y2: '50%' }
    case 180: return { x1: '50%', y1: '0%', x2: '50%', y2: '100%' }
    case 270: return { x1: '100%', y1: '50%', x2: '0%', y2: '50%' }
    default: return { x1: '50%', y1: '100%', x2: '50%', y2: '0%' }
  }
}

/* ─── Icon SVG paths (24×24 viewBox, stroke-based) ─── */
function SegmentIcon({ icon, x, y, opacity }: { icon: WheelSegment['icon']; x: number; y: number; opacity: number }) {
  const size = 28
  const half = size / 2
  return (
    <g
      transform={`translate(${x - half}, ${y - half})`}
      opacity={opacity}
      className="pointer-events-none"
    >
      <g transform="scale(1.167)" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icon === 'shield' && (
          <>
            <path d="M12 2s-4 2-8 2c0 6 3.2 12 8 14 4.8-2 8-8 8-14-4 0-8-2-8-2z" />
            <path d="M9 12l2 2 4-4" />
          </>
        )}
        {icon === 'home' && (
          <>
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 10v8a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-8" />
          </>
        )}
        {icon === 'trending-up' && (
          <>
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </>
        )}
        {icon === 'car' && (
          <>
            <path d="M5 17h14M5 17a2 2 0 01-2-2v-3a1 1 0 011-1l2.6-3.9A2 2 0 018.3 6h7.4a2 2 0 011.7 1.1L20 11a1 1 0 011 1v3a2 2 0 01-2 2" />
            <circle cx="7.5" cy="17" r="2" />
            <circle cx="16.5" cy="17" r="2" />
          </>
        )}
      </g>
    </g>
  )
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

  const activeColor = activeSegment !== null ? WHEEL_SEGMENTS[activeSegment].color : null

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      role="img"
      aria-label={onSegmentClick
        ? 'Diagramme interactif des 4 univers de protection -- cliquez sur un segment pour en savoir plus'
        : 'Diagramme des 4 univers de protection'}
    >
      <title>Diagramme des 4 univers de protection</title>
      <defs>
        {/* Segment gradients */}
        {WHEEL_SEGMENTS.map((seg, i) => {
          const gc = gradientCoords(seg.angle)
          return (
            <linearGradient key={`grad-${i}`} id={`seg-grad-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={seg.gradientDark} stopOpacity="0.90" />
              <stop offset="100%" stopColor={seg.gradientLight} stopOpacity="1" />
            </linearGradient>
          )
        })}

        {/* Dimmed gradients for inactive state */}
        {WHEEL_SEGMENTS.map((seg, i) => {
          const gc = gradientCoords(seg.angle)
          return (
            <linearGradient key={`grad-dim-${i}`} id={`seg-grad-dim-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={seg.gradientDark} stopOpacity="0.25" />
              <stop offset="100%" stopColor={seg.gradientLight} stopOpacity="0.30" />
            </linearGradient>
          )
        })}

        {/* Glow filters per segment */}
        {WHEEL_SEGMENTS.map((seg, i) => (
          <filter key={`glow-${i}`} id={`seg-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feFlood floodColor={seg.color} floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}

        {/* Inner highlight mask (top-half light) */}
        <linearGradient id="inner-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Center gradient fill */}
        <radialGradient id="center-fill" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f0f1f7" />
          <stop offset="100%" stopColor="#e5e7f0" />
        </radialGradient>

        {/* Center halo */}
        <radialGradient id="center-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.10" />
          <stop offset="50%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Center shadow */}
        <filter id="center-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="8" floodColor="rgba(0, 7, 57, 0.30)" />
        </filter>
      </defs>

      {/* ─── Decorative rings ─── */}
      <circle cx={CX} cy={CY} r={66} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={198} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="4 8" />

      {/* ─── Segments ─── */}
      {WHEEL_SEGMENTS.map((seg, i) => {
        const a1 = seg.angle - HALF
        const a2 = seg.angle + HALF
        const isActive = activeSegment === i
        const isOther = activeSegment !== null && activeSegment !== i

        /* Positions — lateral segments (90°/270°): icon outer, label inner
           Top/bottom segments (0°/180°): icon inner, label outer */
        const isLateral = seg.angle === 90 || seg.angle === 270
        const iconR = INNER_R + (OUTER_R - INNER_R) * (isLateral ? 0.72 : 0.25)
        const [ix, iy] = xy(iconR, seg.angle)
        const labelR = INNER_R + (OUTER_R - INNER_R) * (isLateral ? 0.35 : 0.62)
        const [tx, ty] = xy(labelR, seg.angle)

        /* Opacities */
        const textOpacity = isActive ? 1 : isOther ? 0.35 : 0.92
        const iconOpacity = isActive ? 1 : isOther ? 0.25 : 0.80
        const productR = OUTER_R + 34
        const [px, py] = xy(productR, seg.angle)

        return (
          <g
            key={seg.key}
            className="wheel-segment-premium focus:outline-none focus-visible:outline-none"
            style={{
              cursor: onSegmentClick ? 'pointer' : 'default',
              outline: 'none',
              filter: isOther ? 'saturate(0.3)' : undefined,
              transition: reducedMotion.current ? 'none' : 'opacity 300ms cubic-bezier(0.25,0.8,0.5,1), filter 300ms cubic-bezier(0.25,0.8,0.5,1)',
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
                d={arc(INNER_R - 6, OUTER_R + 14, a1 - 3, a2 + 3)}
                fill={seg.glowColor}
                className="wheel-segment-glow"
                style={{ filter: `url(#seg-glow-${i})` }}
              />
            )}

            {/* Segment shape with gradient fill */}
            <path
              d={arc(INNER_R, OUTER_R, a1, a2)}
              fill={isOther ? `url(#seg-grad-dim-${i})` : `url(#seg-grad-${i})`}
              stroke={isActive ? `${seg.color}99` : 'rgba(255,255,255,0.10)'}
              strokeWidth={isActive ? 1.5 : 1}
              className="wheel-segment-path-premium"
            />

            {/* Inner highlight overlay */}
            <path
              d={arc(INNER_R, OUTER_R, a1, a2)}
              fill="url(#inner-highlight)"
              className="pointer-events-none"
            />

            {/* Icon */}
            <SegmentIcon icon={seg.icon} x={ix} y={iy} opacity={iconOpacity} />

            {/* Segment label */}
            <text
              x={tx} y={ty}
              textAnchor="middle"
              fill={isActive ? 'white' : `rgba(255,255,255,${textOpacity})`}
              fontSize={isActive ? '15' : '14'}
              fontWeight="700"
              fontFamily="'Inter',sans-serif"
              className="pointer-events-none select-none"
              style={{ transition: 'fill 300ms cubic-bezier(0.25,0.8,0.5,1), font-size 300ms cubic-bezier(0.25,0.8,0.5,1)' }}
            >
              <tspan x={tx} dy="-8">{seg.lines[0]}</tspan>
              <tspan x={tx} dy="17">{seg.lines[1]}</tspan>
            </text>

            {/* Tick line */}
            {(() => {
              const [t1x, t1y] = xy(OUTER_R + 4, seg.angle)
              const [t2x, t2y] = xy(OUTER_R + 18, seg.angle)
              return (
                <line
                  x1={t1x} y1={t1y} x2={t2x} y2={t2y}
                  stroke={isActive ? `${seg.color}80` : 'rgba(255,255,255,0.08)'}
                  strokeWidth="1"
                  strokeLinecap="round"
                  className="pointer-events-none"
                  style={{ transition: 'stroke 300ms cubic-bezier(0.25,0.8,0.5,1)' }}
                />
              )
            })()}

            {/* Product label (outside) */}
            <text
              x={px} y={py}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isActive ? seg.color : isOther ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.50)'}
              fontSize="11"
              fontWeight="700"
              fontFamily="'Inter',sans-serif"
              letterSpacing="0.16em"
              className="pointer-events-none select-none"
              style={{
                filter: isActive ? `drop-shadow(0 0 6px ${seg.glowColor})` : undefined,
                transition: 'fill 300ms cubic-bezier(0.25,0.8,0.5,1), filter 300ms cubic-bezier(0.25,0.8,0.5,1)',
              }}
            >
              {seg.product.toUpperCase()}
            </text>
          </g>
        )
      })}

      {/* ─── Center ─── */}
      {/* Halo */}
      <circle cx={CX} cy={CY} r={70} fill="url(#center-halo)" className="pointer-events-none" />

      {/* Outer ring */}
      <circle
        cx={CX} cy={CY} r={58}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.75"
        className="pointer-events-none"
      />

      {/* Main circle */}
      <circle
        cx={CX} cy={CY} r={CENTER_R}
        fill="url(#center-fill)"
        className="pointer-events-none"
        style={{
          filter: 'url(#center-shadow)',
          transition: 'filter 300ms cubic-bezier(0.25,0.8,0.5,1)',
        }}
      />

      {/* Active color ring on center */}
      {activeColor && (
        <circle
          cx={CX} cy={CY} r={CENTER_R + 0.5}
          fill="none"
          stroke={activeColor}
          strokeWidth="1.5"
          strokeOpacity="0.25"
          className="pointer-events-none"
          style={{ transition: 'stroke 300ms cubic-bezier(0.25,0.8,0.5,1)' }}
        />
      )}

      {/* Center label */}
      <text
        x={CX} y={CY - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        fill="#000d6e"
        fontSize="11"
        fontWeight="700"
        fontFamily="'Inter',sans-serif"
        letterSpacing="0.12em"
        className="pointer-events-none select-none"
      >
        LE CLIENT
      </text>

      {/* Decorative underline */}
      <line
        x1={CX - 20} y1={CY + 8} x2={CX + 20} y2={CY + 8}
        stroke={activeColor || '#000d6e'}
        strokeWidth="2"
        strokeLinecap="round"
        opacity={activeColor ? 0.4 : 0.25}
        className="pointer-events-none"
        style={{ transition: 'stroke 300ms cubic-bezier(0.25,0.8,0.5,1), opacity 300ms cubic-bezier(0.25,0.8,0.5,1)' }}
      />
    </svg>
  )
}
