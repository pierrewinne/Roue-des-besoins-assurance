import React from 'react';
import { colors, fonts } from '../design-tokens';

interface LogoProps {
  size?: number;
  color?: 'navy' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ size = 64, color = 'navy' }) => {
  const bgColor = color === 'navy' ? colors.primary[700] : colors.white;
  const textColor = color === 'navy' ? colors.white : colors.primary[700];
  const radius = size * 0.2;

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: textColor,
          fontFamily: fonts.inter,
          fontWeight: 700,
          fontSize: size * 0.45,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        RB
      </span>
    </div>
  );
};
