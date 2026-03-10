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

  // Add padding for labels when showLabels is true
  const pad = showLabels && size > 200 ? 60 : 0;
  const svgW = size + pad * 2;
  const svgH = size + pad * 2;
  const offsetX = pad;
  const offsetY = pad;

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: 'visible' }}>
      {/* Background circle (empty state) */}
      <circle
        cx={cx + offsetX}
        cy={cy + offsetY}
        r={midRadius}
        fill="none"
        stroke={colors.slate[100]}
        strokeWidth={strokeWidth}
        opacity={interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}
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
        // Push small segments' labels further out to avoid clipping
        const minLabelOffset = size > 250 ? 28 : 18;
        const labelOffset = segment.arc < usableArc * 0.15 ? minLabelOffset + 14 : minLabelOffset;
        const labelRadius = outerRadius + labelOffset;
        const lx = cx + offsetX + labelRadius * Math.cos(labelAngle);
        const ly = cy + offsetY + labelRadius * Math.sin(labelAngle);

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
              cx={cx + offsetX}
              cy={cy + offsetY}
              r={midRadius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth - 2}
              strokeDasharray={`${visibleArc} ${circumference - visibleArc}`}
              strokeLinecap="butt"
              transform={`rotate(${rotation}, ${cx + offsetX}, ${cy + offsetY})`}
              style={{ transition: 'none' }}
            />

            {/* Label */}
            {labelOpacity > 0 && (() => {
              // Dynamic text anchor: left-side labels anchor end, right-side anchor start
              const isLeft = lx < cx + offsetX;
              const isCenter = Math.abs(lx - (cx + offsetX)) < 20;
              const anchor = isCenter ? 'middle' : isLeft ? 'end' : 'start';
              const labelText = segment.arc < usableArc * 0.15 ? segment.label.split(' ')[0] : segment.label;
              return (
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="central"
                  fill={segment.color}
                  fontFamily={fonts.inter}
                  fontWeight={600}
                  fontSize={labelFontSize}
                  opacity={labelOpacity}
                >
                  {labelText}
                </text>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
};
