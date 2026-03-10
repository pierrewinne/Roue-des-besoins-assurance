import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts, demoData } from '../design-tokens';
import { InsuranceWheel } from '../components/InsuranceWheel';
import { ScoreGauge } from '../components/ScoreGauge';
import { LucideIcon } from '../components/LucideIcon';
import { fadeIn, staggerDelay } from '../components/animations';

// Scene 6: Wheel Reveal — CLIMAX (1:06-1:26, 600 frames)
export const Scene6_WheelReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Isolated wheel on clean background (0-240 frames, 0-8s)
  const phase1Opacity = interpolate(frame, [240, 280], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 2: Full results page layout (240-600 frames)
  const phase2Opacity = interpolate(frame, [240, 280], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Score gauge animation
  const gaugeStart = 45;

  // Wheel animation
  const wheelStart = 60;

  // Universe cards (phase 2)
  const cardsStart = 300;

  // Legend
  const legendStart = 420;
  const legendOpacity = interpolate(frame, [legendStart, legendStart + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      {/* Phase 1: Isolated reveal */}
      <AbsoluteFill
        style={{
          opacity: phase1Opacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        {/* Score gauge — centered above wheel */}
        <ScoreGauge size={180} startFrame={gaugeStart} duration={36} />

        {/* Label under score */}
        {frame > gaugeStart + 30 && (
          <div
            style={{
              padding: '6px 16px',
              borderRadius: 8,
              backgroundColor: `${colors.scoring.red}12`,
              opacity: interpolate(frame, [gaugeStart + 30, gaugeStart + 40], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <span
              style={{
                fontFamily: fonts.inter,
                fontWeight: 500,
                fontSize: 16,
                color: colors.scoring.red,
              }}
            >
              Lacunes significatives identifiées
            </span>
          </div>
        )}

        {/* The Wheel — hero element */}
        <InsuranceWheel
          size={380}
          startFrame={wheelStart}
          showLabels={true}
          revealDuration={18}
          delayBetweenSegments={12}
        />
      </AbsoluteFill>

      {/* Phase 2: Full results layout */}
      <AbsoluteFill
        style={{
          opacity: phase2Opacity,
          display: 'flex',
          padding: '60px 80px',
          gap: 60,
        }}
      >
        {/* Left: Score + Wheel (compact) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: 480,
          }}
        >
          <ScoreGauge size={140} score={demoData.globalScore} startFrame={0} duration={1} />

          <InsuranceWheel
            size={320}
            startFrame={0}
            showLabels={true}
            revealDuration={1}
            delayBetweenSegments={0}
          />

          {/* Legend */}
          <div
            style={{
              opacity: legendOpacity,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              width: '100%',
              padding: '0 20px',
            }}
          >
            {[
              { color: colors.scoring.green, label: 'Bien couvert', desc: '0-25' },
              { color: colors.scoring.amber, label: 'À améliorer', desc: '26-50' },
              { color: colors.scoring.red, label: 'Action requise', desc: '51-75' },
              { color: colors.scoring.darkRed, label: 'Action requise (critique)', desc: '76-100' },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  opacity: interpolate(
                    frame,
                    [legendStart + i * 5, legendStart + i * 5 + 10],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                  ),
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: fonts.inter, fontWeight: 500, fontSize: 13, color: colors.slate[700] }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.slate[400] }}>
                  ({item.desc})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Universe Cards (client view — no detail bars) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: fonts.inter,
              fontWeight: 700,
              fontSize: 24,
              color: colors.slate[900],
              marginBottom: 8,
              opacity: interpolate(frame, [cardsStart - 10, cardsStart], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            Vos résultats par univers
          </span>

          {demoData.universes.map((u, i) => {
            const cardStart = cardsStart + staggerDelay(i, 8);
            const cardAnim = fadeIn(frame, cardStart, 15, 25);

            return (
              <div
                key={u.id}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: '20px 24px',
                  border: `1px solid ${colors.slate[200]}`,
                  boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: cardAnim.opacity,
                  transform: `translateX(${cardAnim.translateY}px)`, // Slide from right
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: `${u.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LucideIcon name={u.icon} size={24} color={u.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 600,
                      fontSize: 16,
                      color: colors.slate[900],
                      display: 'block',
                    }}
                  >
                    {u.label}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontSize: 13,
                      color: colors.slate[500],
                      display: 'block',
                      marginTop: 2,
                    }}
                  >
                    {u.message}
                  </span>
                </div>

                {/* Badge */}
                <div
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    backgroundColor: `${u.color}15`,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 600,
                      fontSize: 13,
                      color: u.color,
                    }}
                  >
                    {u.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
