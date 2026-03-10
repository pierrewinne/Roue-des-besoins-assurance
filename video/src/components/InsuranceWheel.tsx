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
  const segmentCount = demoData.universes.length;
  const gap = 4;
  const segmentArc = (circumference - gap * segmentCount) / segmentCount;

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

      {/* Animated segments */}
      {demoData.universes.map((universe, i) => {
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

        const visibleArc = segmentArc * progress;
        const rotation = -90 + (i * 360) / segmentCount + (gap / circumference) * 180;

        return (
          <g key={universe.id}>
            <circle
              cx={cx}
              cy={cy}
              r={midRadius}
              fill="none"
              stroke={universe.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${visibleArc} ${circumference - visibleArc}`}
              strokeLinecap="butt"
              transform={`rotate(${rotation}, ${cx}, ${cy})`}
              style={{ transition: 'none' }}
            />

            {/* Labels */}
            {showLabels && progress > 0.8 && (
              (() => {
                const angle = ((rotation + (segmentArc / circumference) * 180) * Math.PI) / 180;
                const labelRadius = outerRadius + 24;
                const lx = cx + labelRadius * Math.cos(angle);
                const ly = cy + labelRadius * Math.sin(angle);
                const labelOpacity = interpolate(
                  frame,
                  [segmentStart + revealDuration - 3, segmentStart + revealDuration + 6],
                  [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={universe.color}
                    fontFamily={fonts.inter}
                    fontWeight={600}
                    fontSize={11}
                    opacity={labelOpacity}
                  >
                    {universe.label}
                  </text>
                );
              })()
            )}
          </g>
        );
      })}
    </svg>
  );
};
