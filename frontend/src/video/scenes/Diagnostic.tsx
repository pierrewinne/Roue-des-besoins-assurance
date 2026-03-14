/**
 * Act 3: Analyse flash (12-17s / 150 frames)
 * Abstract data flow converging toward the wheel — blurred text pills
 * move inward, triggering simultaneous quadrant fills.
 * Message: "c'est intelligent, c'est rapide, c'est fait."
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { WHITE, FONT_BODY, DEMO_FILL_TARGETS, DEMO_FILL_COLORS } from '../constants'
import { fadeIn, fadeOut } from '../helpers'
import { WheelSVG } from './WheelSVG'

const BALOISE_EASE = Easing.bezier(0.25, 0.8, 0.5, 1)

// Data pills — blurred text converging toward center
const DATA_PILLS = [
  { text: 'Propriétaire', fromX: -620, fromY: -120, quadrant: 0, start: 5 },
  { text: '2 enfants', fromX: 560, fromY: 60, quadrant: 1, start: 16 },
  { text: 'Véhicule récent', fromX: -480, fromY: 180, quadrant: 0, start: 28 },
  { text: 'Voyages', fromX: 600, fromY: -160, quadrant: 1, start: 38 },
  { text: 'Épargne', fromX: -540, fromY: -40, quadrant: 2, start: 50 },
  { text: 'Retraite', fromX: 440, fromY: 140, quadrant: 3, start: 60 },
  { text: 'Projet immo', fromX: -380, fromY: 120, quadrant: 2, start: 70 },
  { text: 'Prévoyance', fromX: 520, fromY: -80, quadrant: 3, start: 80 },
]

// Scan line sweeps across during analysis
const SCAN_START = 10
const SCAN_DURATION = 50

export function Diagnostic() {
  const frame = useCurrentFrame()

  // Fill progress — starts early, each quadrant fills as its pills arrive
  // Biens fills from frame 15, Personnes from 26, Projets from 60, Futur from 70
  const fillStart = [15, 26, 60, 70]
  const fillProgress = DEMO_FILL_TARGETS.map((target, i) =>
    interpolate(frame, [fillStart[i], fillStart[i] + 50], [0, target], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: BALOISE_EASE,
    })
  )

  // Completion pulse when all fills are done (after frame 120)
  const pulseScale = frame > 115
    ? 1 + Math.sin((frame - 115) * 0.12) * 0.012
    : 1

  // Scan line position
  const scanY = interpolate(frame, [SCAN_START, SCAN_START + SCAN_DURATION], [-50, 110], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: BALOISE_EASE,
  })
  const scanOpacity = fadeIn(frame, SCAN_START, 8) * fadeOut(frame, SCAN_START + SCAN_DURATION - 10, 10)

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Wheel — centered, fills progressively */}
      <div style={{
        position: 'absolute',
        left: '50%', top: '50%',
        transform: `translate(-50%, -50%) scale(${pulseScale})`,
      }}>
        <WheelSVG
          fillProgress={fillProgress}
          fillColors={DEMO_FILL_COLORS as unknown as string[]}
          centerText="VOUS"
        />
      </div>

      {/* Data pills — blurred text converging toward center */}
      {DATA_PILLS.map((pill, i) => {
        const moveD = 30 // frames to reach center
        const progress = interpolate(frame, [pill.start, pill.start + moveD], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: BALOISE_EASE,
        })
        const pillOpacity = fadeIn(frame, pill.start, 8) * fadeOut(frame, pill.start + moveD - 8, 10)
        const x = pill.fromX * (1 - progress)
        const y = pill.fromY * (1 - progress)
        const blur = 2 + (1 - progress) * 3 // more blurred at start, sharper near center
        const pillScale = 0.7 + progress * 0.3

        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${pillScale})`,
            opacity: pillOpacity,
            filter: `blur(${blur}px)`,
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '8px 20px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{
                color: WHITE,
                fontSize: 16,
                fontFamily: FONT_BODY,
                fontWeight: 400,
                letterSpacing: '0.03em',
              }}>
                {pill.text}
              </span>
            </div>
          </div>
        )
      })}

      {/* Scan line */}
      {scanOpacity > 0 && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          top: `${scanY}%`,
          height: 1,
          background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.15) 50%, transparent 90%)',
          opacity: scanOpacity,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
