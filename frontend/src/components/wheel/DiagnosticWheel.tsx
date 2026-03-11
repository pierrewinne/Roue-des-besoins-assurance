import { useRef, useEffect } from 'react'
import type { Universe, NeedLevel } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import { UNIVERSE_WHEEL_COLORS, UNIVERSE_WHEEL_LABELS, UNIVERSE_ICONS, UNIVERSE_ORDER, UNIVERSE_ANGLES, NEED_BADGE_LABELS } from '../../lib/constants.ts'

/* ─── Aria status labels (ANO-13) ─── */
const STATUS_ARIA: Record<string, string> = {
  locked: 'Verrouillé — Complétez votre profil',
  available: 'Disponible — Cliquez pour commencer',
  in_progress: 'En cours',
  completed: 'Complété',
}

/* ─── Geometry (viewBox 500×500) ─── */
const CX = 250
const CY = 250
const CENTER_R = 52
const INNER_R = 78
const OUTER_R = 185
const GAP = 5
const HALF = (90 - GAP) / 2

/* ─── Segment state ─── */
export interface UniverseState {
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  score?: number        // 0-100, present when completed
  needLevel?: NeedLevel // present when completed
  progress?: number     // 0-1, fraction of questions answered (for in_progress)
}

interface DiagnosticWheelProps {
  className?: string
  universeStates: Record<Universe, UniverseState>
  completedCount: number  // 0-4
  globalScore?: number    // present when all completed
  globalNeedLevel?: NeedLevel
  activeUniverse?: Universe | null
  onUniverseClick?: (universe: Universe) => void
  variant?: 'dark' | 'light'  // dark = on dark bg, light = on white bg
  compact?: boolean
}

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

function gradientCoords(angle: number): { x1: string; y1: string; x2: string; y2: string } {
  switch (angle) {
    case 0: return { x1: '50%', y1: '100%', x2: '50%', y2: '0%' }
    case 90: return { x1: '0%', y1: '50%', x2: '100%', y2: '50%' }
    case 180: return { x1: '50%', y1: '0%', x2: '50%', y2: '100%' }
    case 270: return { x1: '100%', y1: '50%', x2: '0%', y2: '50%' }
    default: return { x1: '50%', y1: '100%', x2: '50%', y2: '0%' }
  }
}

/* ─── Icon SVG paths ─── */
function SegmentIcon({ icon, x, y, opacity }: { icon: string; x: number; y: number; opacity: number }) {
  const size = 28
  const half = size / 2
  return (
    <g transform={`translate(${x - half}, ${y - half})`} opacity={opacity} className="pointer-events-none">
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
        {icon === 'gift' && (
          <>
            <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25" />
            <path d="M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
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

/* ─── Check icon for completed segments ─── */
function CheckBadge({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 8}, ${y - 8})`} className="pointer-events-none">
      <circle cx="8" cy="8" r="8" fill="white" />
      <path d="M5 8l2.5 2.5L11.5 5" fill="none" stroke={getNeedColor('low')} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

export default function DiagnosticWheel({
  className = '',
  universeStates,
  completedCount,
  globalScore,
  globalNeedLevel,
  activeUniverse = null,
  onUniverseClick,
  variant = 'dark',
  compact = false,
}: DiagnosticWheelProps) {
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <svg viewBox="0 0 500 500" className={className} role={onUniverseClick ? 'group' : 'img'} aria-label="Roue des besoins - diagnostic interactif">
      <title>Roue des besoins</title>
      <defs>
        {/* Universe gradients */}
        {UNIVERSE_ORDER.map(universe => {
          const colors = UNIVERSE_WHEEL_COLORS[universe]
          const angle = UNIVERSE_ANGLES[universe]
          const gc = gradientCoords(angle)
          return (
            <linearGradient key={`grad-${universe}`} id={`dw-grad-${universe}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={colors.dark} stopOpacity="0.90" />
              <stop offset="100%" stopColor={colors.light} stopOpacity="1" />
            </linearGradient>
          )
        })}

        {/* Dimmed gradients for locked/inactive */}
        {UNIVERSE_ORDER.map(universe => {
          const colors = UNIVERSE_WHEEL_COLORS[universe]
          const angle = UNIVERSE_ANGLES[universe]
          const gc = gradientCoords(angle)
          return (
            <linearGradient key={`grad-dim-${universe}`} id={`dw-grad-dim-${universe}`} x1={gc.x1} y1={gc.y1} x2={gc.x2} y2={gc.y2}>
              <stop offset="0%" stopColor={colors.dark} stopOpacity="0.18" />
              <stop offset="100%" stopColor={colors.light} stopOpacity="0.22" />
            </linearGradient>
          )
        })}

        {/* Glow filters */}
        {UNIVERSE_ORDER.map(universe => {
          const colors = UNIVERSE_WHEEL_COLORS[universe]
          return (
            <filter key={`glow-${universe}`} id={`dw-glow-${universe}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feFlood floodColor={colors.base} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )
        })}

        {/* Highlight */}
        <linearGradient id="dw-highlight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Center */}
        <radialGradient id="dw-center-fill" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f0f1f7" />
          <stop offset="100%" stopColor="#e5e7f0" />
        </radialGradient>
        <radialGradient id="dw-center-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.10" />
          <stop offset="50%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="dw-center-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="8" floodColor="rgba(0, 7, 57, 0.30)" />
        </filter>
      </defs>

      {/* Decorative rings */}
      <circle cx={CX} cy={CY} r={66} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={198} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="4 8" />

      {/* ─── Segments ─── */}
      {UNIVERSE_ORDER.map(universe => {
        const angle = UNIVERSE_ANGLES[universe]
        const a1 = angle - HALF
        const a2 = angle + HALF
        const state = universeStates[universe]
        const colors = UNIVERSE_WHEEL_COLORS[universe]
        const labels = UNIVERSE_WHEEL_LABELS[universe]
        const icon = UNIVERSE_ICONS[universe]
        const isActive = activeUniverse === universe
        const isOther = activeUniverse !== null && activeUniverse !== universe

        // Positions
        const isLateral = angle === 90 || angle === 270
        const iconR = INNER_R + (OUTER_R - INNER_R) * (isLateral ? 0.72 : 0.25)
        const [ix, iy] = xy(iconR, angle)
        const labelR = INNER_R + (OUTER_R - INNER_R) * (isLateral ? 0.35 : 0.62)
        const [tx, ty] = xy(labelR, angle)
        const checkR = INNER_R + (OUTER_R - INNER_R) * 0.85
        const [checkX, checkY] = xy(checkR, angle + 15)

        // Visual state
        let fillId: string
        let strokeColor: string
        let strokeWidth: number
        let iconOpacity: number
        let labelOpacity: number
        let segmentClass = ''

        if (state.status === 'completed' && state.needLevel) {
          fillId = '' // Direct fill handled below
          strokeColor = `${getNeedColor(state.needLevel)}50`
          strokeWidth = 1.5
          iconOpacity = 1
          labelOpacity = 1
        } else if (state.status === 'in_progress') {
          fillId = `url(#dw-grad-${universe})`
          strokeColor = `${colors.base}66`
          strokeWidth = 1.5
          iconOpacity = 0.85
          labelOpacity = 0.85
          segmentClass = 'dw-segment-active'
        } else if (state.status === 'available') {
          fillId = isOther ? `url(#dw-grad-dim-${universe})` : `url(#dw-grad-${universe})`
          strokeColor = isActive ? `${colors.base}99` : 'rgba(255,255,255,0.10)'
          strokeWidth = isActive ? 1.5 : 1
          iconOpacity = isActive ? 1 : isOther ? 0.25 : 0.80
          labelOpacity = isActive ? 1 : isOther ? 0.35 : 0.92
        } else {
          // locked
          fillId = `url(#dw-grad-dim-${universe})`
          strokeColor = 'rgba(255,255,255,0.05)'
          strokeWidth = 0.5
          iconOpacity = 0.25
          labelOpacity = 0.35
        }

        const isClickable = onUniverseClick && (state.status === 'available' || state.status === 'in_progress' || state.status === 'completed')

        return (
          <g
            key={universe}
            className={segmentClass}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              outline: 'none',
              filter: isOther && state.status !== 'completed' ? 'saturate(0.3)' : undefined,
              transition: reducedMotion.current ? 'none' : 'opacity 300ms cubic-bezier(0.25,0.8,0.5,1), filter 300ms cubic-bezier(0.25,0.8,0.5,1)',
            }}
            onClick={() => isClickable && onUniverseClick?.(universe)}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={`${labels.lines[0]} ${labels.lines[1]} - ${state.status === 'completed' && state.needLevel ? `${STATUS_ARIA.completed}, score : ${state.score} sur 100, ${NEED_BADGE_LABELS[state.needLevel]}` : STATUS_ARIA[state.status]}`}
            onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUniverseClick?.(universe) } } : undefined}
          >
            {/* Active glow */}
            {(isActive || state.status === 'in_progress') && (
              <path
                d={arc(INNER_R - 6, OUTER_R + 14, a1 - 3, a2 + 3)}
                fill={colors.glow}
                style={{ filter: `url(#dw-glow-${universe})` }}
              />
            )}

            {/* Segment fill */}
            <path
              d={arc(INNER_R, OUTER_R, a1, a2)}
              fill={state.status === 'completed' && state.needLevel ? getNeedColor(state.needLevel) : fillId}
              fillOpacity={state.status === 'completed' ? 0.85 : undefined}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              style={{ transition: reducedMotion.current ? 'none' : 'fill 500ms cubic-bezier(0.25,0.8,0.5,1), fill-opacity 500ms cubic-bezier(0.25,0.8,0.5,1)' }}
            />

            {/* Highlight overlay */}
            <path d={arc(INNER_R, OUTER_R, a1, a2)} fill="url(#dw-highlight)" className="pointer-events-none" />

            {/* Progress arc for in_progress */}
            {state.status === 'in_progress' && state.progress !== undefined && state.progress > 0 && (
              (() => {
                const progressAngle = a1 + (a2 - a1) * state.progress
                const progressR = OUTER_R + 4
                const [startX, startY] = xy(progressR, a1)
                const [endX, endY] = xy(progressR, progressAngle)
                const largeArc = (progressAngle - a1) > 180 ? 1 : 0
                return (
                  <>
                    {/* Background arc */}
                    <path
                      d={`M${xy(progressR, a1).join(',')} A${progressR},${progressR} 0 0 1 ${xy(progressR, a2).join(',')}`}
                      fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    <path
                      d={`M${startX},${startY} A${progressR},${progressR} 0 ${largeArc} 1 ${endX},${endY}`}
                      fill="none" stroke={`${colors.base}99`} strokeWidth="3" strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 300ms cubic-bezier(0.25,0.8,0.5,1)' }}
                    />
                  </>
                )
              })()
            )}

            {/* Icon */}
            <SegmentIcon icon={icon} x={ix} y={iy} opacity={iconOpacity} />

            {/* Check badge for completed */}
            {state.status === 'completed' && <CheckBadge x={checkX} y={checkY} />}

            {/* Label */}
            {!compact && (
              <text
                x={tx} y={ty}
                textAnchor="middle"
                fill={state.status === 'completed' ? 'white' : `rgba(${variant === 'dark' ? '255,255,255' : '0,13,110'},${labelOpacity})`}
                fontSize={isActive ? '15' : '14'}
                fontWeight="700"
                fontFamily="'Inter',sans-serif"
                className="pointer-events-none select-none"
                style={{ transition: 'fill 300ms cubic-bezier(0.25,0.8,0.5,1), font-size 300ms cubic-bezier(0.25,0.8,0.5,1)' }}
              >
                <tspan x={tx} dy="-8">{labels.lines[0]}</tspan>
                <tspan x={tx} dy="17">{labels.lines[1]}</tspan>
              </text>
            )}
          </g>
        )
      })}

      {/* ─── Center ─── */}
      <circle cx={CX} cy={CY} r={70} fill="url(#dw-center-halo)" className="pointer-events-none" />
      <circle cx={CX} cy={CY} r={58} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" className="pointer-events-none" />

      {/* Progress arc around center */}
      {completedCount > 0 && (
        <circle
          cx={CX} cy={CY} r={56}
          fill="none"
          stroke={globalNeedLevel ? getNeedColor(globalNeedLevel) : '#000d6e'}
          strokeWidth="2.5"
          strokeDasharray={`${2 * Math.PI * 56}`}
          strokeDashoffset={`${2 * Math.PI * 56 * (1 - completedCount / 4)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
          opacity={0.40}
          className="pointer-events-none"
          style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.25,0.8,0.5,1)' }}
        />
      )}

      <circle cx={CX} cy={CY} r={CENTER_R} fill="url(#dw-center-fill)" className="pointer-events-none" style={{ filter: 'url(#dw-center-shadow)' }} />

      {/* Center text */}
      {globalScore !== undefined && completedCount === 4 ? (
        <>
          <text x={CX} y={CY - 8} textAnchor="middle" fill="#000d6e" fontSize="10" fontWeight="700" letterSpacing="0.12em" fontFamily="'Inter',sans-serif" className="pointer-events-none select-none">
            SCORE
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fill={globalNeedLevel ? getNeedColor(globalNeedLevel) : '#000d6e'} fontSize="20" fontWeight="700" fontFamily="'Inter',sans-serif" className="pointer-events-none select-none">
            {globalScore}
          </text>
        </>
      ) : (
        <>
          <text x={CX} y={CY - 8} textAnchor="middle" fill="#000d6e" fontSize="10" fontWeight="700" letterSpacing="0.12em" fontFamily="'Inter',sans-serif" className="pointer-events-none select-none">
            MON PROFIL
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fill={completedCount > 0 ? '#000d6e' : '#b6b6b6'} fontSize="18" fontWeight="700" fontFamily="'Inter',sans-serif" className="pointer-events-none select-none">
            {completedCount}/4
          </text>
        </>
      )}
    </svg>
  )
}
