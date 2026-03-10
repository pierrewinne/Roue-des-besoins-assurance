import React from 'react';
import { useCurrentFrame } from 'remotion';
import { interpolate, Easing } from 'remotion';
import { demoData, colors, fonts } from '../design-tokens';

interface InsuranceWheelProps {
  size?: number;
  startFrame?: number;
  showLabels?: boolean;
  revealDuration?: number;
  delayBetweenSegments?: number;
}

export const InsuranceWheel: React.FC<InsuranceWheelProps> = ({
  size = 280,
  startFrame = 0,
  showLabels = true,
  revealDuration = 15,
  delayBetweenSegments = 9,
}) => {
  const frame = useCurrentFrame();
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.22;
  const midRadius = (outerRadius + innerRadius) / 2;
  const strokeWidth = outerRadius - innerRadius;
  const circumference = 2 * Math.PI * midRadius;
  const gap = 4;
  const totalGap = gap * demoData.universes.length;
  const usableArc = circumference - totalGap;

  // Weighted segment arcs based on actual portfolio weights
  const totalWeight = demoData.universes.reduce((sum, u) => sum + u.weight, 0);
  const segments = demoData.universes.map((u) => ({
    ...u,
    arc: (u.weight / totalWeight) * usableArc,
  }));

  // Cumulative rotation offset for each segment
  let cumulativeAngle = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle (empty state) */}
      <circle
        cx={cx}
        cy={cy}
        r={midRadius}
        fill="none"
        stroke={colors.slate[100]}
        strokeWidth={strokeWidth}
        opacity={interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
      />

      {/* White stroke ring for segment separation */}
      <circle
        cx={cx}
        cy={cy}
        r={midRadius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth + 2}
        strokeDasharray={`${gap} ${(circumference - gap * demoData.universes.length) / demoData.universes.length}`}
        opacity={0}
      />

      {/* Animated weighted segments */}
      {segments.map((segment, i) => {
        const segmentStart = startFrame + 8 + i * delayBetweenSegments;
        const progress = interpolate(
          frame,
          [segmentStart, segmentStart + revealDuration],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          }
        );

        const visibleArc = segment.arc * progress;
        // Rotation: start at top (-90deg), then offset by cumulative angle + gap
        const rotation = -90 + (cumulativeAngle / circumference) * 360;

        // Label position at the midpoint of this segment's arc
        const labelAngleDeg = -90 + ((cumulativeAngle + segment.arc / 2) / circumference) * 360;
        const labelAngle = (labelAngleDeg * Math.PI) / 180;
        const labelRadius = outerRadius + (size > 250 ? 28 : 18);
        const lx = cx + labelRadius * Math.cos(labelAngle);
        const ly = cy + labelRadius * Math.sin(labelAngle);

        // Advance cumulative angle for next segment (arc + gap)
        cumulativeAngle += segment.arc + gap;

        const labelOpacity = showLabels && progress > 0.8
          ? interpolate(
              frame,
              [segmentStart + revealDuration - 3, segmentStart + revealDuration + 6],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            )
          : 0;

        const labelFontSize = size > 300 ? 14 : size > 200 ? 12 : 10;

        return (
          <g key={segment.id}>
            {/* Segment arc */}
            <circle
              cx={cx}
              cy={cy}
              r={midRadius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth - 2}
              strokeDasharray={`${visibleArc} ${circumference - visibleArc}`}
              strokeLinecap="butt"
              transform={`rotate(${rotation}, ${cx}, ${cy})`}
              style={{ transition: 'none' }}
            />

            {/* Label */}
            {labelOpacity > 0 && (
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={segment.color}
                fontFamily={fonts.inter}
                fontWeight={600}
                fontSize={labelFontSize}
                opacity={labelOpacity}
              >
                {segment.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
