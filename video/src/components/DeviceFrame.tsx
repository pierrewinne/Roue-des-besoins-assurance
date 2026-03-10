import React from 'react';
import { colors } from '../design-tokens';

interface DeviceFrameProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  type?: 'laptop' | 'tablet' | 'phone';
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  width = 1440,
  height = 900,
  type = 'laptop',
}) => {
  const scale = type === 'phone' ? 0.35 : type === 'tablet' ? 0.55 : 0.78;
  const frameW = width * scale;
  const frameH = height * scale;
  const borderRadius = type === 'phone' ? 24 : 12;

  return (
    <div
      style={{
        width: frameW + 2,
        height: frameH + 36,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: borderRadius + 4,
        overflow: 'hidden',
        boxShadow: `0 25px 50px -12px rgba(0, 7, 57, 0.25), 0 0 0 1px rgba(0, 7, 57, 0.05)`,
        backgroundColor: colors.white,
      }}
    >
      {/* Browser chrome */}
      {type === 'laptop' && (
        <div
          style={{
            height: 36,
            backgroundColor: colors.slate[50],
            borderBottom: `1px solid ${colors.slate[200]}`,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 14,
            gap: 7,
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#28c840' }} />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          width: frameW,
          height: type === 'laptop' ? frameH - 36 : frameH,
          overflow: 'hidden',
          backgroundColor: colors.white,
          borderRadius: type !== 'laptop' ? borderRadius : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
