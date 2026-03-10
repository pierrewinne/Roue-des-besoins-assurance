import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts } from '../design-tokens';
import { Logo } from '../components/Logo';
import { LucideIcon } from '../components/LucideIcon';
import { fadeIn, staggerDelay } from '../components/animations';

// Scene 9: Closing — Benefits + CTA (1:50-2:10, 600 frames)

const benefits = [
  { icon: 'timer', title: 'Gagnez du temps', desc: 'Un diagnostic structuré en 10 minutes.' },
  { icon: 'shield-check', title: 'Renforcez votre crédibilité', desc: 'Des rapports professionnels qui inspirent confiance.' },
  { icon: 'trending-up', title: 'Ne manquez plus aucune opportunité', desc: 'Identifiez automatiquement le cross-selling pertinent.' },
];

export const Scene9_Closing: React.FC = () => {
  const frame = useCurrentFrame();

  // Background gradient (same as Scene 1 for symmetry)
  const gradientAngle = interpolate(frame, [0, 600], [0, 10], {
    extrapolateRight: 'clamp',
  });

  // Phase 1: Benefits appearing (frames 0-270, 0-9s)
  const benefitsVisible = frame < 270;

  // Phase 2: Morph to centered logo + title (frames 270-360)
  const morphProgress = interpolate(frame, [270, 360], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  // Phase 3: Title + CTA (frames 360-480)
  const titleAnim = fadeIn(frame, 370, 18, 20);
  const subtitleAnim = fadeIn(frame, 395, 15, 15);
  const ctaAnim = fadeIn(frame, 420, 18, 20);

  // CTA pulse
  const ctaPulse = frame > 440
    ? interpolate(
        frame % 45,
        [0, 15, 30, 45],
        [0, 6, 0, 0],
        { extrapolateRight: 'clamp' }
      )
    : 0;

  // Final fade (frames 540-600)
  const finalFade = interpolate(frame, [560, 600], [1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: finalFade }}>
      {/* Navy gradient background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${135 + gradientAngle}deg, ${colors.primary[900]} 0%, ${colors.primary[700]} 60%, ${colors.primary[400]} 130%)`,
        }}
      />

      {/* Subtle geometric texture */}
      <AbsoluteFill style={{ opacity: 0.04 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: i * 54,
              height: 1,
              backgroundColor: colors.white,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Phase 1: Benefits */}
      {benefitsVisible && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            padding: '0 200px',
          }}
        >
          {benefits.map((benefit, i) => {
            const anim = fadeIn(frame, staggerDelay(i, 15) + 10, 18, 30);

            return (
              <div
                key={benefit.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28,
                  opacity: anim.opacity,
                  transform: `translateY(${anim.translateY}px)`,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LucideIcon name={benefit.icon} size={28} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 700,
                      fontSize: 26,
                      color: colors.white,
                      display: 'block',
                    }}
                  >
                    {benefit.title}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 400,
                      fontSize: 17,
                      color: colors.slate[400],
                      display: 'block',
                      marginTop: 4,
                    }}
                  >
                    {benefit.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {/* Phase 2-3: Logo + Title + CTA */}
      {morphProgress > 0 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            opacity: morphProgress,
          }}
        >
          {/* Logo */}
          <div
            style={{
              transform: `scale(${interpolate(morphProgress, [0, 1], [1.2, 1])})`,
            }}
          >
            <Logo size={80} color="white" />
          </div>

          {/* Title */}
          <div
            style={{
              opacity: titleAnim.opacity,
              transform: `translateY(${titleAnim.translateY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: fonts.inter,
                fontWeight: 700,
                fontSize: 48,
                color: colors.white,
                letterSpacing: '-0.03em',
              }}
            >
              Roue des Besoins
            </span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              opacity: subtitleAnim.opacity,
              transform: `translateY(${subtitleAnim.translateY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: fonts.inter,
                fontWeight: 400,
                fontSize: 20,
                color: colors.slate[400],
              }}
            >
              Votre outil de diagnostic assurance.
            </span>
          </div>

          {/* CTA Button (video-only element — does not exist in the app) */}
          <div
            style={{
              opacity: ctaAnim.opacity,
              transform: `translateY(${ctaAnim.translateY}px)`,
              marginTop: 16,
            }}
          >
            <div
              style={{
                padding: '14px 36px',
                borderRadius: 8,
                backgroundColor: colors.white,
                boxShadow: `0 0 0 0 rgba(255,255,255,0.3), 0 4px 14px rgba(0,0,0,0.15), 0 0 ${ctaPulse}px ${ctaPulse * 2}px rgba(255,255,255,0.15)`,
              }}
            >
              <span
                style={{
                  fontFamily: fonts.inter,
                  fontWeight: 600,
                  fontSize: 17,
                  color: colors.primary[700],
                }}
              >
                Commencer maintenant
              </span>
            </div>
          </div>

          {/* Reduced benefits as small icons below */}
          {morphProgress > 0.8 && (
            <div
              style={{
                display: 'flex',
                gap: 40,
                marginTop: 40,
                opacity: interpolate(morphProgress, [0.8, 1], [0, 0.5], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              {benefits.map((b) => (
                <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LucideIcon name={b.icon} size={16} color={colors.slate[400]} strokeWidth={1.5} />
                  <span style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.slate[400] }}>
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
