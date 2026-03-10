import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts } from '../design-tokens';
import { Logo } from '../components/Logo';
import { DeviceFrame } from '../components/DeviceFrame';
import { fadeIn, scaleIn } from '../components/animations';

// Scene 2: Introduction — "Et si vous aviez la vue d'ensemble ?" (0:10-0:20, 300 frames)
export const Scene2_Introduction: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Headline text (frames 0-90)
  const headlineAnim = fadeIn(frame, 8, 18, 30);
  const headlineOpacity = interpolate(frame, [100, 130], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 2: Device frame with login page (frames 100-300)
  const deviceAnim = fadeIn(frame, 110, 24, 20);
  const deviceScale = scaleIn(frame, 110, 24, 0.95);

  // Cursor animation — click on "Conseiller" toggle
  const cursorX = interpolate(frame, [180, 210], [500, 590], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const cursorY = interpolate(frame, [180, 210], [250, 215], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const toggleState = frame > 215 ? 'conseiller' : 'client';

  return (
    <AbsoluteFill style={{ backgroundColor: colors.white }}>
      {/* Phase 1: Headline */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: headlineOpacity,
        }}
      >
        <div
          style={{
            opacity: headlineAnim.opacity,
            transform: `translateY(${headlineAnim.translateY}px)`,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: fonts.inter,
              fontWeight: 700,
              fontSize: 64,
              color: colors.slate[900],
              lineHeight: 1.2,
            }}
          >
            Et si vous aviez la{' '}
            <span style={{ color: colors.primary[700] }}>vue d'ensemble</span> ?
          </span>
        </div>
      </AbsoluteFill>

      {/* Phase 2: Login page mockup */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: deviceAnim.opacity,
          transform: `scale(${deviceScale}) translateY(${deviceAnim.translateY}px)`,
        }}
      >
        <DeviceFrame width={1440} height={900}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: colors.slate[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Login card */}
            <div
              style={{
                width: 400,
                backgroundColor: colors.white,
                borderRadius: 16,
                padding: 40,
                boxShadow: '0 4px 24px rgba(0,7,57,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
              }}
            >
              <Logo size={56} />
              <span
                style={{
                  fontFamily: fonts.inter,
                  fontWeight: 700,
                  fontSize: 22,
                  color: colors.slate[900],
                }}
              >
                Connexion
              </span>

              {/* Toggle Client/Conseiller */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: colors.slate[100],
                  borderRadius: 8,
                  padding: 3,
                  width: '100%',
                }}
              >
                {['Client', 'Conseiller'].map((label) => {
                  const isActive =
                    (label === 'Conseiller' && toggleState === 'conseiller') ||
                    (label === 'Client' && toggleState === 'client');
                  return (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '8px 0',
                        borderRadius: 6,
                        fontFamily: fonts.inter,
                        fontWeight: 500,
                        fontSize: 14,
                        backgroundColor: isActive ? colors.white : 'transparent',
                        color: isActive ? colors.slate[900] : colors.slate[500],
                        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>

              {/* Email field */}
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    fontFamily: fonts.inter,
                    fontSize: 13,
                    fontWeight: 500,
                    color: colors.slate[700],
                    marginBottom: 6,
                  }}
                >
                  Email
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 40,
                    borderRadius: 8,
                    border: `1px solid ${colors.slate[200]}`,
                    backgroundColor: colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 12,
                  }}
                >
                  {frame > 230 && (
                    <span
                      style={{
                        fontFamily: fonts.inter,
                        fontSize: 14,
                        color: colors.slate[900],
                      }}
                    >
                      sophie.martin@cabinet-conseil.fr
                    </span>
                  )}
                </div>
              </div>

              {/* Password field (only in Conseiller mode) */}
              {toggleState === 'conseiller' && (
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      fontFamily: fonts.inter,
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.slate[700],
                      marginBottom: 6,
                    }}
                  >
                    Mot de passe
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 40,
                      borderRadius: 8,
                      border: `1px solid ${colors.slate[200]}`,
                      backgroundColor: colors.white,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 12,
                    }}
                  >
                    {frame > 250 && (
                      <span
                        style={{
                          fontFamily: fonts.inter,
                          fontSize: 14,
                          color: colors.slate[900],
                          letterSpacing: '0.15em',
                        }}
                      >
                        ••••••••••
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Login button */}
              <div
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: colors.primary[700],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.inter,
                    fontWeight: 600,
                    fontSize: 15,
                    color: colors.white,
                  }}
                >
                  Se connecter
                </span>
              </div>
            </div>
          </div>
        </DeviceFrame>

        {/* Animated cursor */}
        {frame > 170 && frame < 280 && (
          <div
            style={{
              position: 'absolute',
              left: cursorX,
              top: cursorY,
              width: 20,
              height: 20,
              opacity: interpolate(frame, [170, 180, 270, 280], [0, 1, 1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path
                d="M4 1L4 16L8 12L13 16L15 13L10 9L16 9L4 1Z"
                fill={colors.slate[900]}
                stroke={colors.white}
                strokeWidth={1}
              />
            </svg>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
