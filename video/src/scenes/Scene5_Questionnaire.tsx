import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts } from '../design-tokens';
import { Logo } from '../components/Logo';
import { InsuranceWheel } from '../components/InsuranceWheel';
import { DeviceFrame } from '../components/DeviceFrame';
import { fadeIn } from '../components/animations';

// Scene 5: Questionnaire — Client view (0:46-1:06, 600 frames)

const steps = [
  'Situation personnelle',
  'Situation patrimoniale',
  'Mobilité',
  'Objets de valeur',
  'Couvertures existantes',
];

const questions = [
  {
    label: 'Quelle est votre tranche d\'âge ?',
    options: ['Moins de 25 ans', '25-30 ans', '30-40 ans', '40-50 ans', '50-65 ans', 'Plus de 65 ans'],
    selected: 2, // 30-40 ans
    selectFrame: 180,
  },
  {
    label: 'Quelle est votre situation familiale ?',
    options: ['Célibataire', 'En couple sans enfant', 'En couple avec enfants', 'Famille monoparentale'],
    selected: 2, // En couple avec enfants
    selectFrame: 330,
  },
];

export const Scene5_Questionnaire: React.FC = () => {
  const frame = useCurrentFrame();

  // Badge morph transition (frames 0-45)
  const transitionOpacity = interpolate(frame, [0, 15, 30, 45], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const badgeText = frame < 22 ? 'Conseiller' : 'Client';
  const badgeBg = frame < 22 ? colors.primary[50] : colors.primary[100];
  const badgeColor = frame < 22 ? colors.primary[700] : colors.primary[400];

  // Main content (after transition)
  const contentOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Current step progression
  const currentStep = frame < 400 ? 0 : frame < 480 ? 2 : 3;

  // Current question index
  const currentQ = frame < 270 ? 0 : 1;
  const question = questions[currentQ];

  // Wheel in sidebar starts building after second answer
  const wheelStartFrame = 350;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.slate[50] }}>
      {/* Badge morph transition overlay */}
      {frame < 50 && (
        <AbsoluteFill
          style={{
            backgroundColor: colors.primary[700],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: transitionOpacity,
          }}
        >
          <div
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              backgroundColor: badgeBg,
            }}
          >
            <span
              style={{
                fontFamily: fonts.inter,
                fontWeight: 600,
                fontSize: 24,
                color: badgeColor,
              }}
            >
              {badgeText}
            </span>
          </div>
        </AbsoluteFill>
      )}

      {/* Main questionnaire content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: contentOpacity,
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
              <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 18, color: colors.slate[900] }}>
                Roue des Besoins
              </span>
              <div style={{ flex: 1 }} />
              {frame > 45 && (
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    backgroundColor: colors.primary[100],
                    border: `1px solid ${colors.primary[400]}20`,
                    opacity: interpolate(frame, [45, 55], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                >
                  <span style={{ fontFamily: fonts.inter, fontWeight: 500, fontSize: 12, color: colors.primary[400] }}>
                    Client
                  </span>
                </div>
              )}
            </div>

            <div style={{ padding: '24px 32px' }}>
              {/* Page header */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 24, color: colors.slate[900] }}>
                  Mon diagnostic assurance
                </span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: fonts.inter, fontSize: 14, color: colors.slate[500] }}>
                  Répondez aux questions pour découvrir vos besoins.
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
                {steps.map((step, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <React.Fragment key={step}>
                      {i > 0 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            backgroundColor: isCompleted ? colors.primary[700] : colors.slate[200],
                          }}
                        />
                      )}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: isCompleted
                            ? colors.primary[700]
                            : isCurrent
                            ? colors.white
                            : colors.slate[100],
                          border: isCurrent ? `2px solid ${colors.primary[700]}` : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? (
                          <span style={{ color: colors.white, fontSize: 16, fontWeight: 700 }}>✓</span>
                        ) : (
                          <span
                            style={{
                              fontFamily: fonts.inter,
                              fontWeight: 600,
                              fontSize: 13,
                              color: isCurrent ? colors.primary[700] : colors.slate[400],
                            }}
                          >
                            {i + 1}
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Main content area: question + sidebar wheel */}
              <div style={{ display: 'flex', gap: 24 }}>
                {/* Question card */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    padding: 32,
                    border: `1px solid ${colors.slate[200]}`,
                    boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 600,
                      fontSize: 17,
                      color: colors.slate[900],
                      display: 'block',
                      marginBottom: 24,
                    }}
                  >
                    {question.label}
                  </span>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {question.options.map((opt, j) => {
                      const isSelected = j === question.selected && frame > question.selectFrame;
                      const optAnim = fadeIn(
                        frame,
                        (currentQ === 0 ? 80 : 280) + j * 4,
                        10,
                        15
                      );

                      return (
                        <div
                          key={opt}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: `2px solid ${isSelected ? colors.primary[700] : colors.slate[200]}`,
                            backgroundColor: isSelected ? colors.primary[50] : colors.white,
                            opacity: optAnim.opacity,
                            transform: `translateY(${optAnim.translateY}px)`,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: fonts.inter,
                              fontWeight: isSelected ? 600 : 400,
                              fontSize: 14,
                              color: isSelected ? colors.primary[700] : colors.slate[700],
                            }}
                          >
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, gap: 12 }}>
                    {currentQ > 0 && (
                      <div
                        style={{
                          padding: '10px 20px',
                          borderRadius: 8,
                          border: `1px solid ${colors.slate[200]}`,
                          backgroundColor: colors.white,
                        }}
                      >
                        <span style={{ fontFamily: fonts.inter, fontWeight: 500, fontSize: 14, color: colors.slate[700] }}>
                          Précédent
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        padding: '10px 24px',
                        borderRadius: 8,
                        backgroundColor: colors.primary[700],
                      }}
                    >
                      <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 14, color: colors.white }}>
                        Suivant
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sidebar: wheel preview */}
                <div style={{ width: 260 }}>
                  <div
                    style={{
                      backgroundColor: colors.white,
                      borderRadius: 12,
                      padding: 16,
                      border: `1px solid ${colors.slate[200]}`,
                      boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 13, color: colors.slate[700] }}>
                      Aperçu en temps réel
                    </span>
                    {frame > wheelStartFrame ? (
                      <InsuranceWheel
                        size={200}
                        startFrame={Math.max(0, frame - wheelStartFrame)}
                        showLabels={false}
                        revealDuration={20}
                        delayBetweenSegments={12}
                      />
                    ) : (
                      <div
                        style={{
                          width: 200,
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            border: `20px solid ${colors.slate[100]}`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DeviceFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
