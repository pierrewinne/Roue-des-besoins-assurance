import React from 'react';
import { useCurrentFrame } from 'remotion';
import { interpolate, Easing } from 'remotion';
import { colors, fonts, demoData } from '../design-tokens';

interface ScoreGaugeProps {
  size?: number;
  score?: number;
  startFrame?: number;
  duration?: number;
}

function getScoreColor(score: number): string {
  if (score <= 25) return colors.scoring.green;
  if (score <= 50) return colors.scoring.amber;
  return colors.scoring.red;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  size = 160,
  score = demoData.globalScore,
  startFrame = 0,
  duration = 36,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const currentScore = Math.round(score * progress);
  const color = getScoreColor(currentScore);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  const strokeW = size * 0.08;
  const circumference = 2 * Math.PI * r;
  const arcLength = (currentScore / 100) * circumference;

  const containerOpacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        opacity: containerOpacity,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={colors.slate[100]}
          strokeWidth={strokeW}
        />
        {/* Animated arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: fonts.inter,
            fontWeight: 700,
            fontSize: size * 0.28,
            color,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {currentScore}
        </span>
        <span
          style={{
            fontFamily: fonts.inter,
            fontWeight: 500,
            fontSize: size * 0.1,
            color: colors.slate[400],
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          /100
        </span>
      </div>
    </div>
  );
};
