import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts, FPS } from '../design-tokens';
import { Logo } from '../components/Logo';
import { LucideIcon } from '../components/LucideIcon';
import { fadeIn, fadeOut } from '../components/animations';

// Scene 1: Opening / Problem statement (0:00 - 0:10, 300 frames)
export const Scene1_Opening: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Logo + title (frames 0-90, 0-3s)
  const logoAnim = fadeIn(frame, 0, 24);
  const titleAnim = fadeIn(frame, 18, 15, 20);
  const subtitleAnim = fadeIn(frame, 30, 15, 15);

  // Phase 2: Transition to illustration (frames 90-120)
  const phase1Opacity = fadeOut(frame, 90, 20);
  const phase2Opacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 3: Chaotic icons (frames 120-270)
  const iconNames = ['file-text', 'table', 'clock', 'clipboard', 'folder', 'file-spreadsheet', 'briefcase', 'list-checks', 'calculator', 'hash'];
  const iconPositions = iconNames.map((_, i) => ({
    x: 200 + Math.sin(i * 2.3) * 500 + Math.cos(i * 1.7) * 200,
    y: 150 + Math.cos(i * 1.9) * 250 + Math.sin(i * 3.1) * 100,
    delay: 120 + i * 8,
    rotation: (i * 37) % 360 - 180,
    scale: 0.7 + (i % 3) * 0.3,
  }));

  // Phase 4: Fade to white (frames 270-300)
  const whiteOverlay = interpolate(frame, [270, 300], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  // Background gradient with subtle pattern
  const gradientAngle = interpolate(frame, [0, 300], [0, 15], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {/* Navy gradient background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${135 + gradientAngle}deg, ${colors.primary[900]} 0%, ${colors.primary[700]} 60%, ${colors.primary[400]} 120%)`,
        }}
      />

      {/* Subtle geometric texture */}
      <AbsoluteFill style={{ opacity: 0.05 }}>
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

      {/* Phase 1: Logo + Title */}
      <AbsoluteFill
        style={{
          opacity: phase1Opacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            opacity: logoAnim.opacity,
            transform: `translateY(${logoAnim.translateY}px)`,
          }}
        >
          <Logo size={96} color="white" />
        </div>
        <div
          style={{
            opacity: titleAnim.opacity,
            transform: `translateY(${titleAnim.translateY}px)`,
          }}
        >
          <span
            style={{
              fontFamily: fonts.inter,
              fontWeight: 600,
              fontSize: 56,
              color: colors.white,
              letterSpacing: '-0.03em',
            }}
          >
            Roue des Besoins
          </span>
        </div>
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
              fontSize: 22,
              color: colors.slate[400],
            }}
          >
            Diagnostic assurance personnalisé
          </span>
        </div>
      </AbsoluteFill>

      {/* Phase 2-3: Chaotic icons illustration */}
      <AbsoluteFill
        style={{
          opacity: phase2Opacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Central desk illustration */}
        <div
          style={{
            position: 'relative',
            width: 1200,
            height: 600,
          }}
        >
          {/* Scattered icons */}
          {iconPositions.map((pos, i) => {
            const iconAnim = fadeIn(frame, pos.delay, 10, 30);
            const drift = Math.sin(frame * 0.03 + i) * 5;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y + drift,
                  opacity: iconAnim.opacity * 0.7,
                  transform: `translateY(${iconAnim.translateY}px) rotate(${pos.rotation * 0.3}deg)`,
                }}
              >
                <LucideIcon
                  name={iconNames[i]}
                  size={Math.round(36 * pos.scale)}
                  color={colors.slate[400]}
                  strokeWidth={1.5}
                />
              </div>
            );
          })}

          {/* "Complexity" text */}
          {frame > 180 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: interpolate(frame, [180, 210], [0, 0.6], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <span
                style={{
                  fontFamily: fonts.inter,
                  fontWeight: 300,
                  fontSize: 28,
                  color: colors.slate[400],
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Complexité · Intuition · Temps perdu
              </span>
            </div>
          )}
        </div>
      </AbsoluteFill>

      {/* White overlay for transition */}
      <AbsoluteFill
        style={{
          backgroundColor: colors.white,
          opacity: whiteOverlay,
        }}
      />
    </AbsoluteFill>
  );
};
