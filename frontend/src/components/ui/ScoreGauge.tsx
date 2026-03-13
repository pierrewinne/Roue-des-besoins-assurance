import { useState, useEffect } from 'react'
import { NEED_COLORS } from '../../lib/constants.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'

interface ScoreGaugeProps {
  score: number
  size?: number
}

export default function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (score / 100) * circumference

  // Start empty, animate to target after first paint (QW-01)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const offset = mounted ? targetOffset : circumference

  const color = NEED_COLORS[getNeedLevel(score)]

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color }}>{score}</span>
        <span className="text-grey-300 text-xs font-bold">/100</span>
      </div>
    </div>
  )
}
