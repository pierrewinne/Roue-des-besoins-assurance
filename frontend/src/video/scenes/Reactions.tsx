import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE, GREY_300, FONT_HEADLINE, FONT_BODY, QUADRANT_COLORS, FPS } from '../constants'
import { fadeIn, fadeOut, slideUp } from '../helpers'

interface Reaction {
  persona: string
  text: string
  accentColor: string
  durationFrames: number
}

const REACTIONS: Reaction[] = [
  {
    persona: 'Lucas',
    text: '"Ah, j\'avais pas pens\u00e9 \u00e0 \u00e7a."',
    accentColor: QUADRANT_COLORS.projets.light,
    durationFrames: Math.floor(2.5 * FPS),
  },
  {
    persona: 'Nadia',
    text: '"C\'est tellement clair."',
    accentColor: QUADRANT_COLORS.personnes.light,
    durationFrames: Math.floor(2.5 * FPS),
  },
  {
    persona: 'Marie',
    text: '"C\'est la premi\u00e8re fois qu\'on voit tout... ensemble."',
    accentColor: QUADRANT_COLORS.biens.light,
    durationFrames: Math.floor(2.5 * FPS),
  },
  {
    persona: 'Thomas',
    text: '"En fait, j\'\u00e9tais pas du tout couvert pour..."',
    accentColor: QUADRANT_COLORS.futur.light,
    durationFrames: Math.floor(2.5 * FPS),
  },
]

export function Reactions() {
  const frame = useCurrentFrame()

  let accum = 0
  let currentIdx = 0
  let localFrame = frame
  for (let i = 0; i < REACTIONS.length; i++) {
    if (frame < accum + REACTIONS[i].durationFrames) {
      currentIdx = i
      localFrame = frame - accum
      break
    }
    accum += REACTIONS[i].durationFrames
    if (i === REACTIONS.length - 1) {
      currentIdx = i
      localFrame = frame - accum
    }
  }

  const r = REACTIONS[currentIdx]
  const textOpacity = fadeIn(localFrame, 5, 12) * (localFrame > r.durationFrames - 10 ? fadeOut(localFrame, r.durationFrames - 10, 8) : 1)
  const textY = slideUp(localFrame, 5, 20)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: NAVY,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 200px',
      }}
    >
      {/* Colored accent bar at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: r.accentColor,
          opacity: fadeIn(localFrame, 0, 8),
        }}
      />

      {/* Persona */}
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 20,
          color: GREY_300,
          opacity: fadeIn(localFrame, 3, 10) * textOpacity,
          margin: 0,
          marginBottom: 20,
          letterSpacing: '0.06em',
        }}
      >
        {r.persona}
      </p>

      {/* Reaction text */}
      <p
        style={{
          fontFamily: FONT_HEADLINE,
          fontSize: 46,
          fontWeight: 700,
          color: WHITE,
          textAlign: 'center',
          lineHeight: 1.4,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          margin: 0,
        }}
      >
        {r.text}
      </p>

      {/* Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          display: 'flex',
          gap: 10,
        }}
      >
        {REACTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentIdx ? 28 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIdx ? r.accentColor : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
