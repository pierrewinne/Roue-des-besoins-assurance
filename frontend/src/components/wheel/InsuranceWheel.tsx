import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import type { DiagnosticResult, NeedLevel } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'

import { QUADRANT_LABELS } from '../../lib/constants.ts'

interface InsuranceWheelProps {
  diagnostic: DiagnosticResult
  size?: number
  showLabels?: boolean
}

function renderCustomLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0)
  const cy = Number(props.cy ?? 0)
  const midAngle = Number(props.midAngle ?? 0)
  const outerRadius = Number(props.outerRadius ?? 0)
  const name = String(props.name ?? '')
  const payload = props.payload as { needLevel?: NeedLevel } | undefined
  const needLevel = payload?.needLevel ?? 'moderate'

  const RADIAN = Math.PI / 180
  const radius = outerRadius + 30
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <Text
      x={x}
      y={y}
      fill={getNeedColor(needLevel)}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
      fontFamily="Inter, system-ui, sans-serif"
    >
      {name}
    </Text>
  )
}

export default function InsuranceWheel({ diagnostic, size = 350, showLabels = true }: InsuranceWheelProps) {
  const entries = Object.entries(diagnostic.quadrantScores)
  const activeEntries = entries.filter(([, s]) => s.active)

  const data = activeEntries.map(([key, score]) => ({
    name: QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS] || key,
    value: 1,
    needScore: score.needScore,
    needLevel: score.needLevel,
    universe: key,
  }))

  if (data.length === 0) {
    return <div className="text-center text-grey-400 py-8">Aucun univers actif</div>
  }

  const padding = showLabels ? 60 : 0
  const containerSize = size + padding * 2

  return (
    <div style={{ width: containerSize, height: containerSize, margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: padding, right: padding, bottom: padding, left: padding }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.2}
            outerRadius={size * 0.38}
            dataKey="value"
            stroke="#fff"
            strokeWidth={3}
            label={showLabels ? renderCustomLabel : undefined}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.universe}
                fill={getNeedColor(entry.needLevel)}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
