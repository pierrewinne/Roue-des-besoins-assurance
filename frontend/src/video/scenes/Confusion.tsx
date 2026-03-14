import { useCurrentFrame } from 'remotion'
import { NAVY, FONT_BODY, FPS } from '../constants'
import { fadeIn, fadeOut } from '../helpers'

const JARGON_WORDS = [
  { text: 'RC ?', x: 15, y: 20, delay: 0, size: 28 },
  { text: 'franchise', x: 60, y: 35, delay: 8, size: 24 },
  { text: 'plafond', x: 30, y: 65, delay: 16, size: 22 },
  { text: 'exclusion', x: 70, y: 15, delay: 24, size: 26 },
  { text: 'conditions\ng\u00e9n\u00e9rales', x: 45, y: 50, delay: 12, size: 20 },
  { text: 'avenant', x: 80, y: 70, delay: 32, size: 22 },
  { text: 'indexation', x: 20, y: 80, delay: 20, size: 20 },
  { text: 'surprime', x: 55, y: 25, delay: 36, size: 24 },
  { text: 'd\u00e9ch\u00e9ance', x: 85, y: 50, delay: 28, size: 22 },
  { text: 'sinistre ?', x: 40, y: 40, delay: 4, size: 26 },
  { text: 'police', x: 10, y: 45, delay: 40, size: 20 },
  { text: 'r\u00e9siliation', x: 65, y: 80, delay: 44, size: 22 },
  { text: 'prime nette', x: 25, y: 55, delay: 48, size: 20 },
  { text: 'tacite\nreconduction', x: 75, y: 60, delay: 52, size: 18 },
]

export function Confusion() {
  const frame = useCurrentFrame()
  const totalFrames = 10 * FPS

  // Converge all words to center at the end
  const convergeStart = totalFrames - 20
  const converging = frame > convergeStart

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: NAVY,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Central question */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 28,
            color: 'rgba(255,255,255,0.15)',
            textAlign: 'center',
            fontStyle: 'italic',
            opacity: fadeIn(frame, 30, 30),
          }}
        >
          Savez-vous vraiment ce que couvrent vos assurances ?
        </p>
      </div>

      {/* Floating jargon words */}
      {JARGON_WORDS.map((w, i) => {
        const wordLife = 4 * FPS // Each word lives ~4s
        const wordStart = w.delay
        const wordOpacity = fadeIn(frame, wordStart, 12)
          * (frame > wordStart + wordLife ? fadeOut(frame, wordStart + wordLife, 10) : 1)
          * (converging ? fadeOut(frame, convergeStart, 15) : 1)

        // Gentle floating
        const floatY = Math.sin((frame + i * 30) * 0.03) * 8
        const floatX = Math.cos((frame + i * 20) * 0.02) * 5

        // Converge to center
        const cx = converging
          ? w.x + (50 - w.x) * Math.min(1, (frame - convergeStart) / 15)
          : w.x
        const cy = converging
          ? w.y + (50 - w.y) * Math.min(1, (frame - convergeStart) / 15)
          : w.y

        // Density increases over time
        const densityScale = Math.min(1, frame / (3 * FPS))

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${cx + floatX * 0.2}%`,
              top: `${cy + floatY * 0.2}%`,
              transform: `translate(-50%, -50%) rotate(${(i % 2 === 0 ? 1 : -1) * 2}deg)`,
              fontFamily: FONT_BODY,
              fontSize: w.size,
              color: `rgba(255,255,255,${0.15 + densityScale * 0.2})`,
              fontWeight: 300,
              opacity: wordOpacity,
              whiteSpace: 'pre-line',
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}
          >
            {w.text}
          </div>
        )
      })}

      {/* Density counter — subtle number of visible terms */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 80,
          fontFamily: FONT_BODY,
          fontSize: 14,
          color: 'rgba(255,255,255,0.12)',
          opacity: fadeIn(frame, 60, 20),
        }}
      >
        {Math.min(JARGON_WORDS.length, Math.floor(frame / 8) + 1)} termes
      </div>
    </div>
  )
}
