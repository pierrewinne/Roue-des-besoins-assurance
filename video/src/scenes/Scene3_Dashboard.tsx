import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts, demoData } from '../design-tokens';
import { Logo } from '../components/Logo';
import { LucideIcon } from '../components/LucideIcon';
import { DeviceFrame } from '../components/DeviceFrame';
import { fadeIn, staggerDelay } from '../components/animations';

// Scene 3: Advisor Dashboard (0:20-0:38, 540 frames)

const clients = [
  { name: 'Sophie Martin', score: 57, date: '10 mars 2026', color: colors.scoring.red },
  { name: 'Thomas Dupont', score: 32, date: '8 mars 2026', color: colors.scoring.amber },
  { name: 'Marie Lefebvre', score: 18, date: '5 mars 2026', color: colors.scoring.green },
  { name: 'Jean Moreau', score: 65, date: '3 mars 2026', color: colors.scoring.red },
  { name: 'Claire Bernard', score: 44, date: '28 fév. 2026', color: colors.scoring.amber },
  { name: 'Philippe Petit', score: 12, date: '25 fév. 2026', color: colors.scoring.green },
];

const statCards = [
  { icon: 'users', value: '12', label: 'Clients', color: colors.primary[700], bg: colors.primary[50] },
  { icon: 'badge-check', value: '8', label: 'Diagnostics réalisés', color: colors.emerald[600], bg: colors.emerald[50] },
  { icon: 'alert-triangle', value: '3', label: 'Actions requises', color: colors.amber[600], bg: colors.amber[50] },
];

export const Scene3_Dashboard: React.FC = () => {
  const frame = useCurrentFrame();

  // Dashboard fade in
  const dashOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Zoom toward Sophie Martin (frames 360-540)
  const zoomScale = interpolate(frame, [360, 500], [1, 1.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomX = interpolate(frame, [360, 500], [0, -60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomY = interpolate(frame, [360, 500], [0, -80], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Sophie Martin row highlight
  const highlightOpacity = interpolate(frame, [300, 330, 480, 510], [0, 1, 1, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.slate[50] }}>
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: dashOpacity,
          transform: `scale(${zoomScale}) translate(${zoomX}px, ${zoomY}px)`,
        }}
      >
        <DeviceFrame width={1440} height={900}>
          <div style={{ width: '100%', height: '100%', backgroundColor: colors.slate[50] }}>
            {/* Header */}
            <div
              style={{
                height: 64,
                backgroundColor: colors.white,
                borderBottom: `1px solid ${colors.slate[200]}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                gap: 16,
                boxShadow: '0 1px 3px rgba(0,7,57,0.05)',
              }}
            >
              <Logo size={36} />
              <span
                style={{
                  fontFamily: fonts.inter,
                  fontWeight: 600,
                  fontSize: 18,
                  color: colors.slate[900],
                }}
              >
                Roue des Besoins
              </span>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  backgroundColor: colors.primary[50],
                  border: `1px solid ${colors.primary[700]}20`,
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.inter,
                    fontWeight: 500,
                    fontSize: 12,
                    color: colors.primary[700],
                  }}
                >
                  Conseiller
                </span>
              </div>
            </div>

            {/* Content area */}
            <div style={{ padding: '28px 32px' }}>
              {/* Page title */}
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: fonts.inter,
                    fontWeight: 700,
                    fontSize: 26,
                    color: colors.slate[900],
                  }}
                >
                  Tableau de bord
                </span>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
                {statCards.map((card, i) => {
                  const anim = fadeIn(frame, 30 + staggerDelay(i, 5), 15, 20);
                  return (
                    <div
                      key={card.label}
                      style={{
                        flex: 1,
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        padding: '20px 24px',
                        border: `1px solid ${colors.slate[200]}`,
                        boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                        opacity: anim.opacity,
                        transform: `translateY(${anim.translateY}px)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: card.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LucideIcon name={card.icon} size={22} color={card.color} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: fonts.inter,
                            fontWeight: 700,
                            fontSize: 28,
                            color: colors.slate[900],
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {card.value}
                        </div>
                        <div
                          style={{
                            fontFamily: fonts.inter,
                            fontWeight: 500,
                            fontSize: 13,
                            color: colors.slate[500],
                          }}
                        >
                          {card.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clients list */}
              <div
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  border: `1px solid ${colors.slate[200]}`,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                }}
              >
                {/* List header */}
                <div
                  style={{
                    padding: '14px 24px',
                    borderBottom: `1px solid ${colors.slate[200]}`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 600,
                      fontSize: 15,
                      color: colors.slate[900],
                    }}
                  >
                    Mes clients
                  </span>
                </div>

                {/* Client rows */}
                {clients.map((client, i) => {
                  const rowAnim = fadeIn(frame, 60 + staggerDelay(i, 3), 12, 15);
                  const isHighlighted = i === 0;

                  return (
                    <div
                      key={client.name}
                      style={{
                        padding: '14px 24px',
                        borderBottom: i < clients.length - 1 ? `1px solid ${colors.slate[100]}` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: rowAnim.opacity,
                        transform: `translateY(${rowAnim.translateY}px)`,
                        backgroundColor: isHighlighted
                          ? `rgba(0, 13, 110, ${0.03 * highlightOpacity})`
                          : 'transparent',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: colors.primary[50],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: fonts.inter,
                            fontWeight: 600,
                            fontSize: 13,
                            color: colors.primary[700],
                          }}
                        >
                          {client.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>

                      {/* Name */}
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontFamily: fonts.inter,
                            fontWeight: 600,
                            fontSize: 14,
                            color: colors.slate[900],
                          }}
                        >
                          {client.name}
                        </span>
                      </div>

                      {/* Date */}
                      <span
                        style={{
                          fontFamily: fonts.inter,
                          fontSize: 13,
                          color: colors.slate[400],
                          marginRight: 20,
                        }}
                      >
                        {client.date}
                      </span>

                      {/* Score badge */}
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          backgroundColor: `${client.color}15`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: fonts.inter,
                            fontWeight: 600,
                            fontSize: 13,
                            color: client.color,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {client.score}/100
                        </span>
                      </div>

                      {/* Chevron */}
                      <span
                        style={{
                          marginLeft: 12,
                          color: isHighlighted ? colors.primary[400] : colors.slate[400],
                          fontSize: 18,
                        }}
                      >
                        ›
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DeviceFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
