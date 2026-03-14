import { useRef, useEffect } from 'react'
import type { NeedLevel, Quadrant, DiagnosticResult } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import { QUADRANT_PRODUCTS, QUADRANT_ORDER } from '../../lib/constants.ts'

/* ─── Geometry (viewBox 500×500) ─── */
const CX = 250
const CY = 250
const CENTER_R = 46
const INNER_R1 = 54
const INNER_R2 = 130
const RING_GAP = 3
const OUTER_R1 = INNER_R2 + RING_GAP
const OUTER_R2 = 228
const HALF = 45
const DIVIDER_ANGLES = [0, 90, 180, 270]
const DIVIDER_WIDTH = 4

/* ─── Quadrant state (diagnostic mode) ─── */
export interface QuadrantState {
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  score?: number
  needLevel?: NeedLevel
  progress?: number
}

/** Build QuadrantState[] from a completed DiagnosticResult (shared helper) */
export function buildSegmentStates(diagnostic: DiagnosticResult): { segmentStates: QuadrantState[]; completedCount: number } {
  const segmentStates: QuadrantState[] = QUADRANT_ORDER.map(q => {
    const score = diagnostic.quadrantScores[q]
    if (!score || !score.active) return { status: 'locked' as const }
    return { status: 'completed' as const, score: score.needScore, needLevel: score.needLevel }
  })
  return { segmentStates, completedCount: segmentStates.filter(s => s.status === 'completed').length }
}

/* ─── Segment data ─── */
export interface WheelSegment {
  key: Quadrant
  lines: [string, string]
  angle: number
  color: string
  outerGradient: [string, string]
  innerGradient: [string, string]
  glowColor: string
  icons: { src: string; anglePct: number; radiusPct: number }[]
}

export const WHEEL_SEGMENTS: WheelSegment[] = [
  {
    key: 'biens',
    lines: ['Protection', 'des biens'],
    angle: 315,
    color: '#4E5BA6',
    outerGradient: ['#3D4691', '#6B78C4'],
    innerGradient: ['#4E5BA6', '#8890D0'],
    glowColor: 'rgba(78, 91, 166, 0.40)',
    icons: [
      { src: '/icons/wheel/biens-house.png', anglePct: 0.15, radiusPct: 0.55 },
      { src: '/icons/wheel/biens-car.png', anglePct: 0.40, radiusPct: 0.55 },
      { src: '/icons/wheel/biens-motorcycle.png', anglePct: 0.65, radiusPct: 0.55 },
      { src: '/icons/wheel/biens-watch.png', anglePct: 0.88, radiusPct: 0.55 },
    ],
  },
  {
    key: 'personnes',
    lines: ['Protection', 'des personnes'],
    angle: 45,
    color: '#2563EB',
    outerGradient: ['#1D4ED8', '#3B82F6'],
    innerGradient: ['#2563EB', '#60A5FA'],
    glowColor: 'rgba(37, 99, 235, 0.40)',
    icons: [
      { src: '/icons/wheel/personnes-couple.png', anglePct: 0.20, radiusPct: 0.55 },
      { src: '/icons/wheel/personnes-travel.png', anglePct: 0.50, radiusPct: 0.55 },
      { src: '/icons/wheel/personnes-accidents.png', anglePct: 0.80, radiusPct: 0.55 },
    ],
  },
  {
    key: 'projets',
    lines: ['Protection', 'des projets'],
    angle: 225,
    color: '#00b28f',
    outerGradient: ['#008A6E', '#2DD4AE'],
    innerGradient: ['#00b28f', '#4ECDB2'],
    glowColor: 'rgba(0, 178, 143, 0.35)',
    icons: [
      { src: '/icons/wheel/projets-dream-house.png', anglePct: 0.25, radiusPct: 0.55 },
      { src: '/icons/wheel/projets-savings.png', anglePct: 0.55, radiusPct: 0.55 },
      { src: '/icons/wheel/projets-lightbulb.png', anglePct: 0.82, radiusPct: 0.55 },
    ],
  },
  {
    key: 'futur',
    lines: ['Protection', 'du futur'],
    angle: 135,
    color: '#9f52cc',
    outerGradient: ['#7B3DA6', '#B86EE0'],
    innerGradient: ['#9f52cc', '#C084E4'],
    glowColor: 'rgba(159, 82, 204, 0.35)',
    icons: [
      { src: '/icons/wheel/futur-retirement.png', anglePct: 0.25, radiusPct: 0.55 },
      { src: '/icons/wheel/futur-pension.png', anglePct: 0.55, radiusPct: 0.55 },
      { src: '/icons/wheel/futur-umbrella.png', anglePct: 0.82, radiusPct: 0.55 },
    ],
  },
]

/* ─── Helpers ─── */
function xy(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180
  return [+(CX + r * Math.cos(rad)).toFixed(1), +(CY + r * Math.sin(rad)).toFixed(1)]
}

function arcPath(r1: number, r2: number, a1: number, a2: number) {
  const [ox1, oy1] = xy(r2, a1)
  const [ox2, oy2] = xy(r2, a2)
  const [ix2, iy2] = xy(r1, a2)
  const [ix1, iy1] = xy(r1, a1)
  const lg = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0
  return `M${ox1},${oy1} A${r2},${r2} 0 ${lg} 1 ${ox2},${oy2} L${ix2},${iy2} A${r1},${r1} 0 ${lg} 0 ${ix1},${iy1} Z`
}

function gradientCoords(angle: number): { x1: string; y1: string; x2: string; y2: string } {
  const rad = ((angle - 90) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x1: `${50 - cos * 50}%`, y1: `${50 - sin * 50}%`, x2: `${50 + cos * 50}%`, y2: `${50 + sin * 50}%` }
}

/* ─── Props ─── */
interface NeedsWheelProps {
  className?: string
  // Landing mode
  activeSegment?: number | null
  onSegmentClick?: (index: number) => void
  // Diagnostic mode (when segmentStates is provided)
  segmentStates?: QuadrantState[]
  completedCount?: number
  globalScore?: number
  globalNeedLevel?: NeedLevel
  compact?: boolean
  variant?: 'dark' | 'light'
  showProducts?: boolean
}

const ease = 'cubic-bezier(0.25,0.8,0.5,1)'

export default function NeedsWheel({
  className = '',
  activeSegment = null,
  onSegmentClick,
  segmentStates,
  completedCount = 0,
  globalScore,
  globalNeedLevel,
  compact = false,
  variant = 'dark',
  showProducts = true,
}: NeedsWheelProps) {
  const reducedMotion = useRef(false)
  useEffect(() => { reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches }, [])

  const isDiagnostic = !!segmentStates
  const activeColor = activeSegment !== null ? WHEEL_SEGMENTS[activeSegment].color : null
  const lightStroke = variant === 'light' ? 'rgba(0,13,110,0.06)' : 'rgba(255,255,255,0.06)'
  const lightStrokeFaint = variant === 'light' ? 'rgba(0,13,110,0.04)' : 'rgba(255,255,255,0.04)'

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      role={onSegmentClick ? 'group' : 'img'}
      aria-label="Roue des besoins en assurance"
    >
      <title>Roue des besoins en assurance</title>
      <defs>
        {WHEEL_SEGMENTS.map((seg, i) => {
          const gc = gradientCoords(seg.angle)
          return [
            <linearGradient key={`og-${i}`} id={`nw-outer-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={seg.outerGradient[0]} />
              <stop offset="100%" stopColor={seg.outerGradient[1]} />
            </linearGradient>,
            <linearGradient key={`ig-${i}`} id={`nw-inner-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={seg.innerGradient[0]} />
              <stop offset="100%" stopColor={seg.innerGradient[1]} />
            </linearGradient>,
            <linearGradient key={`od-${i}`} id={`nw-outer-dim-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={seg.outerGradient[0]} stopOpacity="0.20" />
              <stop offset="100%" stopColor={seg.outerGradient[1]} stopOpacity="0.25" />
            </linearGradient>,
            <linearGradient key={`id-${i}`} id={`nw-inner-dim-${i}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={seg.innerGradient[0]} stopOpacity="0.15" />
              <stop offset="100%" stopColor={seg.innerGradient[1]} stopOpacity="0.20" />
            </linearGradient>,
            <filter key={`glow-${i}`} id={`nw-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feFlood floodColor={seg.color} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>,
          ]
        })}
        <linearGradient id="nw-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="nw-center" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#0A1F8C" />
          <stop offset="70%" stopColor="#000D6E" />
          <stop offset="100%" stopColor="#000739" />
        </radialGradient>
        <radialGradient id="nw-center-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0014AA" stopOpacity="0.08" />
          <stop offset="60%" stopColor="#0014AA" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#0014AA" stopOpacity="0" />
        </radialGradient>
        <filter id="nw-center-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="10" floodColor="rgba(0, 3, 30, 0.50)" />
        </filter>
        {/* Quadrant clip paths — straight boundaries matching parallel dividers */}
        {/* Order matches WHEEL_SEGMENTS: 0=biens(top-left), 1=personnes(top-right), 2=projets(bottom-left), 3=futur(bottom-right) */}
        <clipPath id="nw-qclip-0"><rect x="0" y="0" width={CX + 1} height={CY + 1} /></clipPath>
        <clipPath id="nw-qclip-1"><rect x={CX - 1} y="0" width={CX + 51} height={CY + 1} /></clipPath>
        <clipPath id="nw-qclip-2"><rect x="0" y={CY - 1} width={CX + 1} height={CY + 51} /></clipPath>
        <clipPath id="nw-qclip-3"><rect x={CX - 1} y={CY - 1} width={CX + 51} height={CY + 51} /></clipPath>
      </defs>

      {/* Decorative rings */}
      <circle cx={CX} cy={CY} r={INNER_R1 - 4} fill="none" stroke={lightStrokeFaint} strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={OUTER_R2 + 14} fill="none" stroke={lightStrokeFaint} strokeWidth="0.5" strokeDasharray="3 7" />

      {/* ─── Quadrant segments ─── */}
      {WHEEL_SEGMENTS.map((seg, i) => {
        const a1 = seg.angle - HALF
        const a2 = seg.angle + HALF
        const state = segmentStates?.[i]
        const isActive = activeSegment === i
        const isOther = activeSegment !== null && activeSegment !== i
        const isCompleted = state?.status === 'completed' && state.needLevel
        const isLocked = state?.status === 'locked'
        const isInProgress = state?.status === 'in_progress'

        // Visual state
        let outerFill: string
        let innerFill: string
        let iconOp: number
        let labelOp: number
        let stroke: string
        let strokeW: number

        if (isDiagnostic && isCompleted) {
          const nc = getNeedColor(state!.needLevel!)
          outerFill = nc
          innerFill = nc
          iconOp = 1
          labelOp = 1
          stroke = `${nc}50`
          strokeW = 1.5
        } else if (isDiagnostic && isLocked) {
          outerFill = `url(#nw-outer-dim-${i})`
          innerFill = `url(#nw-inner-dim-${i})`
          iconOp = 0.15
          labelOp = 0.30
          stroke = lightStrokeFaint
          strokeW = 0.5
        } else if (isDiagnostic && isInProgress) {
          outerFill = `url(#nw-outer-${i})`
          innerFill = `url(#nw-inner-${i})`
          iconOp = 0.90
          labelOp = 0.95
          stroke = `${seg.color}66`
          strokeW = 1.5
        } else if (isOther) {
          outerFill = `url(#nw-outer-dim-${i})`
          innerFill = `url(#nw-inner-dim-${i})`
          iconOp = 0.20
          labelOp = 0.25
          stroke = lightStrokeFaint
          strokeW = 0.5
        } else if (isActive) {
          outerFill = `url(#nw-outer-${i})`
          innerFill = `url(#nw-inner-${i})`
          iconOp = 1
          labelOp = 1
          stroke = `${seg.color}99`
          strokeW = 1.5
        } else {
          outerFill = `url(#nw-outer-${i})`
          innerFill = `url(#nw-inner-${i})`
          iconOp = 0.85
          labelOp = 0.95
          stroke = lightStroke
          strokeW = 0.5
        }

        const isClickable = onSegmentClick && (!isDiagnostic || state?.status === 'available' || state?.status === 'in_progress' || state?.status === 'completed')
        const labelR = (INNER_R1 + INNER_R2) / 2
        const [lx, ly] = xy(labelR, seg.angle)
        const productR = OUTER_R2 + 26
        const [px, py] = xy(productR, seg.angle)

        return (
          <g
            key={seg.key}
            className="wheel-segment-premium focus:outline-none focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-[-2px]"
            clipPath={`url(#nw-qclip-${i})`}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              filter: isOther && !isCompleted ? 'saturate(0.25)' : undefined,
              transition: reducedMotion.current ? 'none' : `opacity 300ms ${ease}, filter 300ms ${ease}`,
            }}
            onClick={() => isClickable && onSegmentClick?.(i)}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={`${seg.lines[0]} ${seg.lines[1]}${isCompleted ? `, score ${state!.score} sur 100` : ''}`}
            aria-pressed={onSegmentClick && !isDiagnostic ? isActive : undefined}
            onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSegmentClick?.(i) } } : undefined}
          >
            {/* Active/in_progress glow */}
            {(isActive || isInProgress) && (
              <path
                d={arcPath(INNER_R1 - 6, OUTER_R2 + 12, a1 - 2, a2 + 2)}
                fill={seg.glowColor}
                className="wheel-segment-glow"
                style={{ filter: `url(#nw-glow-${i})` }}
              />
            )}

            {/* Outer ring arc */}
            <path
              d={arcPath(OUTER_R1, OUTER_R2, a1, a2)}
              fill={outerFill}
              fillOpacity={isCompleted ? 0.85 : undefined}
              stroke={stroke}
              strokeWidth={strokeW}
              style={{ transition: reducedMotion.current ? 'none' : `fill 500ms ${ease}, fill-opacity 500ms ${ease}` }}
            />

            {/* Inner ring arc */}
            <path
              d={arcPath(INNER_R1, INNER_R2, a1, a2)}
              fill={innerFill}
              fillOpacity={isCompleted ? 0.70 : undefined}
              stroke={stroke}
              strokeWidth={strokeW * 0.75}
              style={{ transition: reducedMotion.current ? 'none' : `fill 500ms ${ease}, fill-opacity 500ms ${ease}` }}
            />

            {/* Highlight overlays */}
            <path d={arcPath(OUTER_R1, OUTER_R2, a1, a2)} fill="url(#nw-highlight)" className="pointer-events-none" />
            <path d={arcPath(INNER_R1, INNER_R2, a1, a2)} fill="url(#nw-highlight)" className="pointer-events-none" />

            {/* Separator arc */}
            {(() => {
              const [s1x, s1y] = xy(INNER_R2 + 1, a1)
              const [s2x, s2y] = xy(INNER_R2 + 1, a2)
              return <path d={`M${s1x},${s1y} A${INNER_R2 + 1},${INNER_R2 + 1} 0 0 1 ${s2x},${s2y}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" className="pointer-events-none" />
            })()}

            {/* Progress arc (diagnostic in_progress) */}
            {isInProgress && state?.progress !== undefined && state.progress > 0 && (() => {
              const pR = OUTER_R2 + 5
              const pAngle = a1 + (a2 - a1) * state.progress
              const [sx, sy] = xy(pR, a1)
              const [ex, ey] = xy(pR, pAngle)
              const lg = (pAngle - a1) > 180 ? 1 : 0
              return (
                <>
                  <path d={`M${xy(pR, a1).join(',')} A${pR},${pR} 0 0 1 ${xy(pR, a2).join(',')}`} fill="none" stroke={lightStrokeFaint} strokeWidth="3" strokeLinecap="round" />
                  <path d={`M${sx},${sy} A${pR},${pR} 0 ${lg} 1 ${ex},${ey}`} fill="none" stroke={`${seg.color}99`} strokeWidth="3" strokeLinecap="round" />
                </>
              )
            })()}

            {/* Icons in outer ring */}
            {!compact && seg.icons.map((icon, j) => {
              const iconAngle = a1 + (a2 - a1) * icon.anglePct
              const iconR = OUTER_R1 + (OUTER_R2 - OUTER_R1) * icon.radiusPct
              const [ix, iy] = xy(iconR, iconAngle)
              const sz = 52
              return (
                <image key={j} href={icon.src} x={ix - sz / 2} y={iy - sz / 2} width={sz} height={sz} opacity={iconOp} className="pointer-events-none" style={{ transition: reducedMotion.current ? 'none' : `opacity 300ms ${ease}` }} />
              )
            })}

            {/* Check badge (completed) */}
            {isCompleted && (() => {
              const [cx, cy] = xy(OUTER_R2 - 12, a2 - 8)
              return (
                <g transform={`translate(${cx - 8},${cy - 8})`} className="pointer-events-none">
                  <circle cx="8" cy="8" r="8" fill="white" />
                  <path d="M5 8l2.5 2.5L11.5 5" fill="none" stroke={getNeedColor('low')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )
            })()}

            {/* Label in inner ring */}
            {!compact && (
              <text
                x={lx} y={ly}
                textAnchor="middle"
                fill={isCompleted ? 'white' : variant === 'light' && !isLocked ? `rgba(0,13,110,${labelOp})` : `rgba(255,255,255,${labelOp})`}
                fontSize={isActive ? '10' : '9.5'}
                fontWeight="700"
                fontFamily="'BaloiseCreateHeadline','Inter',sans-serif"
                className="pointer-events-none select-none"
                style={{ transition: `fill 300ms ${ease}` }}
              >
                <tspan x={lx} dy="-6">{seg.lines[0]}</tspan>
                <tspan x={lx} dy="14" fontSize={isActive ? '13' : '12'} fill={isCompleted ? 'white' : variant === 'light' && !isLocked ? `rgba(0,13,110,1)` : 'rgba(255,255,255,0.95)'}>{seg.lines[1]}</tspan>
              </text>
            )}

            {/* Tick + product label — shown when showProducts is true OR when segment is completed */}
            {!compact && (showProducts || isCompleted) && (() => {
              const productLabel = QUADRANT_PRODUCTS[seg.key]
              const [t1x, t1y] = xy(OUTER_R2 + 3, seg.angle)
              const [t2x, t2y] = xy(OUTER_R2 + 14, seg.angle)
              const fillColor = isCompleted
                ? (variant === 'light' ? seg.color : 'rgba(255,255,255,0.85)')
                : isActive ? seg.color : isOther ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)'
              return (
                <>
                  <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke={isCompleted ? `${seg.color}80` : isActive ? `${seg.color}80` : 'rgba(255,255,255,0.05)'} strokeWidth="1" strokeLinecap="round" className="pointer-events-none" style={{ transition: `stroke 300ms ${ease}` }} />
                  <text x={px} y={py} textAnchor="middle" dominantBaseline="middle" fill={fillColor} fontSize="8.5" fontWeight="700" fontFamily="'BaloiseCreateText','Inter',sans-serif" letterSpacing="0.10em" className="pointer-events-none select-none" style={{ filter: isCompleted ? `drop-shadow(0 0 4px ${seg.glowColor})` : isActive ? `drop-shadow(0 0 6px ${seg.glowColor})` : undefined, transition: `fill 300ms ${ease}` }}>
                    {productLabel.toUpperCase()}
                  </text>
                </>
              )
            })()}
          </g>
        )
      })}

      {/* ─── Parallel divider lines ─── */}
      {DIVIDER_ANGLES.map(angle => {
        const [x1, y1] = xy(INNER_R1 - 1, angle)
        const [x2, y2] = xy(OUTER_R2 + 1, angle)
        return (
          <line key={`div-${angle}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={variant === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(0,3,30,0.95)'} strokeWidth={DIVIDER_WIDTH} className="pointer-events-none" />
        )
      })}

      {/* ─── Center ─── */}
      <circle cx={CX} cy={CY} r={CENTER_R + 18} fill="url(#nw-center-halo)" className="pointer-events-none" />
      <circle cx={CX} cy={CY} r={CENTER_R + 3} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.75" className="pointer-events-none" />

      {/* Progress ring around center (diagnostic mode) */}
      {isDiagnostic && completedCount > 0 && (
        <circle
          cx={CX} cy={CY} r={CENTER_R + 2}
          fill="none"
          stroke={globalNeedLevel ? getNeedColor(globalNeedLevel) : '#4E5BA6'}
          strokeWidth="2.5"
          strokeDasharray={`${2 * Math.PI * (CENTER_R + 2)}`}
          strokeDashoffset={`${2 * Math.PI * (CENTER_R + 2) * (1 - completedCount / 4)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
          opacity={0.50}
          className="pointer-events-none"
          style={{ transition: `stroke-dashoffset 600ms ${ease}` }}
        />
      )}

      <circle cx={CX} cy={CY} r={CENTER_R} fill="url(#nw-center)" className="pointer-events-none" style={{ filter: 'url(#nw-center-shadow)' }} />

      {activeColor && (
        <circle cx={CX} cy={CY} r={CENTER_R + 0.5} fill="none" stroke={activeColor} strokeWidth="2" strokeOpacity="0.40" className="pointer-events-none" style={{ transition: `stroke 300ms ${ease}` }} />
      )}

      {/* Center content */}
      <image href="/icons/wheel/center-family.png" x={CX - 16} y={CY - 24} width="32" height="32" className="pointer-events-none" opacity={0.85} />

      {isDiagnostic && globalScore !== undefined && completedCount === 4 ? (
        <>
          <text x={CX} y={CY + 14} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" letterSpacing="0.10em" fontFamily="'BaloiseCreateText','Inter',sans-serif" opacity={0.70} className="pointer-events-none select-none">SCORE</text>
          <text x={CX} y={CY + 30} textAnchor="middle" fill={globalNeedLevel ? getNeedColor(globalNeedLevel) : 'white'} fontSize="18" fontWeight="700" fontFamily="'BaloiseCreateHeadline','Inter',sans-serif" className="pointer-events-none select-none">{globalScore}</text>
        </>
      ) : isDiagnostic ? (
        <>
          <text x={CX} y={CY + 14} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" letterSpacing="0.08em" fontFamily="'BaloiseCreateText','Inter',sans-serif" opacity={0.70} className="pointer-events-none select-none">MON PROFIL</text>
          <text x={CX} y={CY + 30} textAnchor="middle" fill={completedCount > 0 ? 'white' : 'rgba(255,255,255,0.40)'} fontSize="16" fontWeight="700" fontFamily="'BaloiseCreateHeadline','Inter',sans-serif" className="pointer-events-none select-none">{completedCount}/4</text>
        </>
      ) : (
        <text x={CX} y={CY + 20} textAnchor="middle" fill="white" fontSize="14" fontWeight="700" letterSpacing="0.14em" fontFamily="'BaloiseCreateHeadline','Inter',sans-serif" opacity={0.90} className="pointer-events-none select-none">VOUS</text>
      )}
    </svg>
  )
}
