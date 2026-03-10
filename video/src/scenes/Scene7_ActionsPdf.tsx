import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { colors, fonts, demoData } from '../design-tokens';
import { fadeIn, staggerDelay, progressFill } from '../components/animations';

// Scene 7: Actions + PDF (1:26-1:44, 540 frames)

const typeColors: Record<string, { bg: string; text: string }> = {
  'Immédiate': { bg: `${colors.scoring.red}15`, text: colors.scoring.red },
  'Différée': { bg: `${colors.scoring.amber}15`, text: colors.scoring.amber },
  'Événement': { bg: colors.slate[100], text: colors.slate[500] },
};

export const Scene7_ActionsPdf: React.FC = () => {
  const frame = useCurrentFrame();

  // Phase 1: Actions list (frames 0-270)
  const actionsOpacity = interpolate(frame, [280, 310], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 2: PDF split screen (frames 270-540)
  const pdfOpacity = interpolate(frame, [270, 310], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.slate[50] }}>
      {/* Phase 1: Actions */}
      <AbsoluteFill
        style={{
          opacity: actionsOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
          padding: '60px 200px',
        }}
      >
        <span
          style={{
            fontFamily: fonts.inter,
            fontWeight: 700,
            fontSize: 28,
            color: colors.slate[900],
            alignSelf: 'flex-start',
            marginBottom: 8,
          }}
        >
          Actions recommandées
        </span>

        {demoData.actions.map((action, i) => {
          const cardAnim = fadeIn(frame, 20 + staggerDelay(i, 5), 15, 25);
          const priorityFill = progressFill(frame, 40 + staggerDelay(i, 5), 18, (action.priority / 5) * 100);

          return (
            <div
              key={action.title}
              style={{
                width: '100%',
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: '24px 28px',
                border: `1px solid ${colors.slate[200]}`,
                boxShadow: '0 1px 3px rgba(0,7,57,0.06)',
                opacity: cardAnim.opacity,
                transform: `translateY(${cardAnim.translateY}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
              }}
            >
              {/* Priority indicator */}
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: 5,
                      height: 20,
                      borderRadius: 3,
                      backgroundColor: j < action.priority ? colors.scoring.red : `${colors.scoring.red}30`,
                      opacity: priorityFill > (j / 5) * 100 ? 1 : 0.3,
                    }}
                  />
                ))}
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
                  {action.title}
                </span>
                <span
                  style={{
                    fontFamily: fonts.inter,
                    fontSize: 13,
                    color: colors.slate[500],
                    display: 'block',
                    marginTop: 4,
                  }}
                >
                  {action.description}
                </span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {/* Universe badge */}
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 5,
                    backgroundColor: colors.primary[50],
                  }}
                >
                  <span style={{ fontFamily: fonts.inter, fontWeight: 500, fontSize: 12, color: colors.primary[700] }}>
                    {action.universe}
                  </span>
                </div>
                {/* Type badge */}
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 5,
                    backgroundColor: typeColors[action.type]?.bg || colors.slate[100],
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.inter,
                      fontWeight: 500,
                      fontSize: 12,
                      color: typeColors[action.type]?.text || colors.slate[500],
                    }}
                  >
                    {action.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Phase 2: PDF split screen */}
      <AbsoluteFill
        style={{
          opacity: pdfOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          padding: '40px 80px',
        }}
      >
        {/* Client PDF */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 14, color: colors.slate[500] }}>
            Version client
          </span>
          <PdfMockup type="client" frame={frame} startFrame={310} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 500, backgroundColor: colors.slate[200] }} />

        {/* Advisor PDF */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 14, color: colors.slate[500] }}>
              Version conseiller
            </span>
            <div
              style={{
                padding: '3px 10px',
                borderRadius: 5,
                backgroundColor: colors.primary[700],
              }}
            >
              <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 11, color: colors.white }}>
                CONSEILLER
              </span>
            </div>
          </div>
          <PdfMockup type="advisor" frame={frame} startFrame={330} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Mini PDF mockup component
const PdfMockup: React.FC<{ type: 'client' | 'advisor'; frame: number; startFrame: number }> = ({
  type,
  frame,
  startFrame,
}) => {
  const anim = fadeIn(frame, startFrame, 20, 30);

  return (
    <div
      style={{
        width: 380,
        backgroundColor: colors.white,
        borderRadius: 8,
        boxShadow: '0 10px 40px rgba(0,7,57,0.12)',
        overflow: 'hidden',
        opacity: anim.opacity,
        transform: `translateY(${anim.translateY}px)`,
      }}
    >
      {/* PDF header */}
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.slate[100]}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: colors.primary[700],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: colors.white, fontFamily: fonts.inter, fontWeight: 700, fontSize: 11 }}>RB</span>
          </div>
          <span style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 14, color: colors.slate[900] }}>
            Diagnostic Assurance
          </span>
        </div>
        <span style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.slate[500] }}>
          Sophie Martin · 10 mars 2026
        </span>
      </div>

      {/* Score summary */}
      <div style={{ padding: '16px 24px', display: 'flex', gap: 12 }}>
        {[
          { label: 'Score global', value: '57', bg: colors.slate[50] },
          { label: 'Univers actifs', value: '4', bg: colors.slate[50] },
          { label: 'Actions immédiates', value: '2', bg: colors.slate[50] },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 8,
              backgroundColor: item.bg,
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: fonts.inter, fontWeight: 700, fontSize: 20, color: colors.slate[900] }}>
              {item.value}
            </div>
            <div style={{ fontFamily: fonts.inter, fontSize: 10, color: colors.slate[500], marginTop: 2 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Wheel placeholder */}
      <div style={{ padding: '8px 24px', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            border: `12px solid ${colors.slate[100]}`,
            borderTopColor: colors.scoring.green,
            borderRightColor: colors.scoring.red,
            borderBottomColor: colors.scoring.darkRed,
            borderLeftColor: colors.scoring.amber,
          }}
        />
      </div>

      {/* Special block for advisor */}
      {type === 'advisor' && (
        <div style={{ padding: '12px 24px' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: colors.emerald[50],
              border: `1px solid ${colors.emerald[600]}30`,
            }}
          >
            <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 12, color: colors.emerald[600] }}>
              Opportunités commerciales
            </span>
            <div style={{ marginTop: 6 }}>
              {['Prévoyance familiale', 'GAV propriétaire'].map((opp) => (
                <div key={opp} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.emerald[600] }} />
                  <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.emerald[600] }}>{opp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Client "Prochaines étapes" block */}
      {type === 'client' && (
        <div style={{ padding: '12px 24px' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: colors.primary[100],
            }}
          >
            <span style={{ fontFamily: fonts.inter, fontWeight: 600, fontSize: 12, color: colors.primary[700] }}>
              Prochaines étapes
            </span>
            <div style={{ marginTop: 6 }}>
              {['Prendre rendez-vous', 'Réunir vos contrats'].map((step) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary[700] }} />
                  <span style={{ fontFamily: fonts.inter, fontSize: 11, color: colors.primary[700] }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page indicator */}
      <div style={{ padding: '8px 24px 16px', display: 'flex', justifyContent: 'center', gap: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary[700] }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.slate[200] }} />
        {type === 'advisor' && (
          <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.slate[200] }} />
        )}
      </div>
    </div>
  );
};
