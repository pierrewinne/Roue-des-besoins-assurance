import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts, demoData } from '../design-tokens';
import { Logo } from '../components/Logo';
import { LucideIcon } from '../components/LucideIcon';
import { ScoreGauge } from '../components/ScoreGauge';
import { InsuranceWheel } from '../components/InsuranceWheel';
import { DeviceFrame } from '../components/DeviceFrame';
import { fadeIn, staggerDelay, progressFill } from '../components/animations';

// Scene 4: Client Detail Page — Advisor view (0:38-0:46, 240 frames)
export const Scene4_ClientDetail: React.FC = () => {
  const frame = useCurrentFrame();

  const pageOpacity = interpolate(frame, [0, 15], [0, 1], {
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
          opacity: pageOpacity,
        }}
      >
        <DeviceFrame width={1440} height={900}>
          <div style={{ width: '100%', height: '100%', backgroundColor: colors.slate[50] }}>
            {/* Header (same as dashboard) */}
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
              <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 18, color: colors.slate[900] }}>
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
                <span style={{ fontFamily: fonts.inter, fontWeight: 500, fontSize: 12, color: colors.primary[700] }}>
                  Conseiller
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 32px', display: 'flex', gap: 24 }}>
              {/* Left column: Score + Wheel */}
              <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Client name */}
                <div>
                  <span style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 22, color: colors.slate[900] }}>
                    Sophie Martin
                  </span>
                  <div style={{ fontFamily: fonts.inter, fontSize: 13, color: colors.slate[500], marginTop: 4 }}>
                    38 ans · En couple, 2 enfants
                  </div>
                </div>

                {/* Score gauge */}
                <div
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    padding: 20,
                    border: `1px solid ${colors.slate[200]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <ScoreGauge size={130} startFrame={10} duration={30} />
                  <div
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      backgroundColor: `${colors.scoring.red}12`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: fonts.inter,
                        fontWeight: 500,
                        fontSize: 12,
                        color: colors.scoring.red,
                      }}
                    >
                      Lacunes significatives identifiées
                    </span>
                  </div>
                </div>

                {/* Mini wheel */}
                <div
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    padding: 16,
                    border: `1px solid ${colors.slate[200]}`,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <InsuranceWheel size={200} startFrame={20} showLabels={false} revealDuration={10} delayBetweenSegments={5} />
                </div>
              </div>

              {/* Right column: Universe cards with details */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 16, color: colors.slate[900] }}>
                  Détail par univers
                </span>

                {demoData.universes.map((u, i) => {
                  const cardAnim = fadeIn(frame, 30 + staggerDelay(i, 6), 12, 20);
                  const exposureFill = progressFill(frame, 50 + staggerDelay(i, 6), 24, u.exposure);
                  const coverageFill = progressFill(frame, 55 + staggerDelay(i, 6), 24, u.coverage);

                  return (
                    <div
                      key={u.id}
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        padding: '16px 20px',
                        border: `1px solid ${colors.slate[200]}`,
                        boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                        opacity: cardAnim.opacity,
                        transform: `translateY(${cardAnim.translateY}px)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        {/* Icon circle */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: `${u.color}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LucideIcon name={u.icon} size={18} color={u.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 14, color: colors.slate[900] }}>
                            {u.label}
                          </span>
                        </div>
                        {/* Score number */}
                        <span
                          style={{
                            fontFamily: fonts.inter,
                            fontWeight: 700,
                            fontSize: 18,
                            color: u.color,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {u.score}
                        </span>
                        {/* Badge */}
                        <div
                          style={{
                            padding: '3px 8px',
                            borderRadius: 5,
                            backgroundColor: `${u.color}15`,
                          }}
                        >
                          <span style={{ fontFamily: fonts.inter, fontWeight: 500, fontSize: 11, color: u.color }}>
                            {u.badge}
                          </span>
                        </div>
                      </div>

                      {/* Exposure bar */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.slate[500] }}>
                            Exposition au risque
                          </span>
                          <span style={{ fontFamily: fonts.inter, fontSize: 11, fontWeight: 600, color: colors.scoring.amber }}>
                            {u.exposure}%
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.slate[100], overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${exposureFill}%`,
                              borderRadius: 3,
                              backgroundColor: colors.scoring.amber,
                            }}
                          />
                        </div>
                      </div>

                      {/* Coverage bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.slate[500] }}>
                            Niveau de couverture
                          </span>
                          <span style={{ fontFamily: fonts.inter, fontSize: 11, fontWeight: 600, color: colors.primary[400] }}>
                            {u.coverage}%
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, backgroundColor: colors.slate[100], overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${coverageFill}%`,
                              borderRadius: 3,
                              backgroundColor: colors.primary[400],
                            }}
                          />
                        </div>
                      </div>
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
