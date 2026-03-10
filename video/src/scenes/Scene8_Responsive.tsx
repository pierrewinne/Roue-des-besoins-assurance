import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts, demoData } from '../design-tokens';
import { Logo } from '../components/Logo';

// Scene 8: Responsive mobile/tablet (1:44-1:50, 180 frames)
export const Scene8_Responsive: React.FC = () => {
  const frame = useCurrentFrame();

  // Three devices appearing with stagger and slight parallax
  const devices = [
    {
      type: 'tablet' as const,
      label: 'iPad',
      width: 420,
      height: 560,
      rotation: -8,
      x: -380,
      y: 40,
      delay: 0,
    },
    {
      type: 'phone' as const,
      label: 'iPhone',
      width: 220,
      height: 440,
      rotation: 5,
      x: 80,
      y: 80,
      delay: 20,
    },
    {
      type: 'laptop' as const,
      label: 'Laptop',
      width: 520,
      height: 340,
      rotation: 3,
      x: 360,
      y: -20,
      delay: 40,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.slate[50] }}>
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {devices.map((device, i) => {
          const opacity = interpolate(
            frame,
            [device.delay, device.delay + 24],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          );
          const scale = interpolate(
            frame,
            [device.delay, device.delay + 24],
            [0.9, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          );
          // Subtle parallax drift
          const drift = Math.sin(frame * 0.02 + i * 2) * 3;

          return (
            <div
              key={device.label}
              style={{
                position: 'absolute',
                left: `calc(50% + ${device.x}px)`,
                top: `calc(50% + ${device.y + drift}px)`,
                transform: `translate(-50%, -50%) rotate(${device.rotation}deg) scale(${scale})`,
                opacity,
              }}
            >
              <DeviceMockup
                type={device.type}
                width={device.width}
                height={device.height}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Simplified device mockup with mini app content
const DeviceMockup: React.FC<{
  type: 'tablet' | 'phone' | 'laptop';
  width: number;
  height: number;
}> = ({ type, width, height }) => {
  const borderRadius = type === 'phone' ? 28 : type === 'tablet' ? 20 : 10;
  const hasNotch = type === 'phone';
  const hasBrowserBar = type === 'laptop';

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.white,
        boxShadow: '0 20px 60px rgba(0,7,57,0.15), 0 0 0 1px rgba(0,7,57,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Browser bar for laptop */}
      {hasBrowserBar && (
        <div
          style={{
            height: 28,
            backgroundColor: colors.slate[50],
            borderBottom: `1px solid ${colors.slate[200]}`,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
            gap: 5,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff5f57' }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#febc2e' }} />
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#28c840' }} />
        </div>
      )}

      {/* Phone notch */}
      {hasNotch && (
        <div style={{ height: 32, backgroundColor: colors.white, display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <div style={{ width: 80, height: 24, borderRadius: 12, backgroundColor: colors.slate[900] }} />
        </div>
      )}

      {/* Content: mini version of app screens */}
      <div style={{ flex: 1, backgroundColor: colors.slate[50], overflow: 'hidden' }}>
        {type === 'tablet' && <MiniResultsView />}
        {type === 'phone' && <MiniWheelView />}
        {type === 'laptop' && <MiniDashboardView />}
      </div>
    </div>
  );
};

// Simplified weighted SVG donut for mini views
const MiniWeightedWheel: React.FC<{ size: number; strokeW: number }> = ({ size, strokeW }) => {
  const cx = size / 2;
  const cy = size / 2;
  const mid = (size - strokeW) / 2;
  const circ = 2 * Math.PI * mid;
  const gap = 2;
  const totalGap = gap * demoData.universes.length;
  const usable = circ - totalGap;
  const totalWeight = demoData.universes.reduce((s, u) => s + u.weight, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={mid} fill="none" stroke={colors.slate[100]} strokeWidth={strokeW} />
      {demoData.universes.map((u) => {
        const arc = (u.weight / totalWeight) * usable;
        const rot = -90 + (offset / circ) * 360;
        offset += arc + gap;
        return (
          <circle
            key={u.id}
            cx={cx}
            cy={cy}
            r={mid}
            fill="none"
            stroke={u.color}
            strokeWidth={strokeW - 1}
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeLinecap="butt"
            transform={`rotate(${rot}, ${cx}, ${cy})`}
          />
        );
      })}
    </svg>
  );
};

// Mini results view for tablet
const MiniResultsView: React.FC = () => (
  <div style={{ padding: 16 }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Logo size={24} />
      <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 12, color: colors.slate[900] }}>
        Résultats
      </span>
    </div>
    {/* Score circle */}
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          border: `6px solid ${colors.scoring.red}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 16, color: colors.scoring.red }}>57</span>
      </div>
    </div>
    {/* Mini weighted wheel */}
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <MiniWeightedWheel size={100} strokeW={16} />
    </div>
    {/* Mini cards */}
    {demoData.universes.slice(0, 3).map((u) => (
      <div
        key={u.id}
        style={{
          backgroundColor: colors.white,
          borderRadius: 8,
          padding: '8px 10px',
          marginBottom: 6,
          border: `1px solid ${colors.slate[200]}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: u.color }} />
        <span style={{ fontFamily: fonts.inter, fontSize: 9, color: colors.slate[700], flex: 1 }}>{u.label}</span>
        <span style={{ fontFamily: fonts.inter, fontSize: 9, fontWeight: 600, color: u.color }}>{u.badge}</span>
      </div>
    ))}
  </div>
);

// Mini wheel view for phone
const MiniWheelView: React.FC = () => (
  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24 }}>
    <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 11, color: colors.slate[900], marginBottom: 12 }}>
      Mon diagnostic
    </span>
    <MiniWeightedWheel size={120} strokeW={18} />
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        border: `4px solid ${colors.scoring.red}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
      }}
    >
      <span style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 14, color: colors.scoring.red }}>57</span>
    </div>
  </div>
);

// Mini dashboard view for laptop
const MiniDashboardView: React.FC = () => (
  <div style={{ padding: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <Logo size={18} />
      <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 9, color: colors.slate[900] }}>
        Tableau de bord
      </span>
    </div>
    {/* Mini stat cards */}
    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
      {[
        { v: '12', l: 'Clients', c: colors.primary[50] },
        { v: '8', l: 'Diagnostics', c: colors.emerald[50] },
        { v: '3', l: 'Actions', c: colors.amber[50] },
      ].map((s) => (
        <div
          key={s.l}
          style={{
            flex: 1,
            padding: '6px 8px',
            borderRadius: 6,
            backgroundColor: colors.white,
            border: `1px solid ${colors.slate[200]}`,
          }}
        >
          <div style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 12, color: colors.slate[900] }}>{s.v}</div>
          <div style={{ fontFamily: fonts.inter, fontSize: 7, color: colors.slate[500] }}>{s.l}</div>
        </div>
      ))}
    </div>
    {/* Mini client list */}
    {['Sophie M.', 'Thomas D.', 'Marie L.'].map((name, i) => (
      <div
        key={name}
        style={{
          padding: '5px 8px',
          backgroundColor: colors.white,
          borderRadius: 4,
          marginBottom: 3,
          border: `1px solid ${colors.slate[100]}`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: fonts.inter, fontSize: 8, color: colors.slate[700], flex: 1 }}>{name}</span>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: [colors.scoring.red, colors.scoring.amber, colors.scoring.green][i],
          }}
        />
      </div>
    ))}
  </div>
);
