const CX = 200
const CY = 200
const CENTER_R = 46
const INNER_R = 60
const OUTER_R = 134
const PRODUCT_R = 162
const GAP = 5
const HALF = (90 - GAP) / 2 // 42.5°

const segments = [
  { lines: ['Protection', 'des personnes'], product: 'Bsafe', angle: 0 },
  { lines: ['Protection', 'des biens'], product: 'Home', angle: 90 },
  { lines: ['Protection', 'du futur'], product: 'Pension Plan', angle: 180 },
  { lines: ['Protection', 'des projets'], product: 'Drive', angle: 270 },
]

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

export default function NeedsWheel({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="Diagramme des 4 univers de protection centré sur le client"
    >
      {/* Decorative outer ring */}
      <circle
        cx={CX} cy={CY} r={150}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="0.5"
        strokeDasharray="2 5"
      />

      {/* Segments */}
      {segments.map((seg, i) => {
        const a1 = seg.angle - HALF
        const a2 = seg.angle + HALF
        const midR = (INNER_R + OUTER_R) / 2
        const [tx, ty] = xy(midR, seg.angle)
        const [px, py] = xy(PRODUCT_R, seg.angle)

        return (
          <g key={i}>
            {/* Segment shape */}
            <path
              d={arc(INNER_R, OUTER_R, a1, a2)}
              fill="rgba(255,255,255,0.055)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.75"
            />

            {/* Thin radial tick from segment to product label */}
            {(() => {
              const [t1x, t1y] = xy(OUTER_R + 3, seg.angle)
              const [t2x, t2y] = xy(PRODUCT_R - 12, seg.angle)
              return (
                <line
                  x1={t1x} y1={t1y} x2={t2x} y2={t2y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="0.5"
                />
              )
            })()}

            {/* Segment label (2 lines) */}
            <text
              x={tx} y={ty}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize="11"
              fontWeight="500"
              fontFamily="'Inter',sans-serif"
            >
              <tspan x={tx} dy="-7">{seg.lines[0]}</tspan>
              <tspan x={tx} dy="15">{seg.lines[1]}</tspan>
            </text>

            {/* Product label */}
            <text
              x={px} y={py}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.3)"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="'Inter',sans-serif"
              letterSpacing="0.06em"
            >
              {seg.product}
            </text>
          </g>
        )
      })}

      {/* Center glow */}
      <circle cx={CX} cy={CY} r={52} fill="rgba(255,255,255,0.06)" />

      {/* Center circle */}
      <circle cx={CX} cy={CY} r={CENTER_R} fill="white" />
      <text
        x={CX} y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#000739"
        fontSize="13"
        fontWeight="700"
        fontFamily="'Inter',sans-serif"
      >
        Le client
      </text>
    </svg>
  )
}
