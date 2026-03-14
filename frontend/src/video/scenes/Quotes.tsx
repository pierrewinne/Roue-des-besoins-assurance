import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE, GREY_300, FONT_HEADLINE, FONT_BODY, FPS } from '../constants'
import { fadeIn, fadeOut, slideUp } from '../helpers'

interface Quote {
  persona: string
  age: string
  text: string
  highlight?: string
  durationFrames: number
}

const QUOTES: Quote[] = [
  {
    persona: 'Marie & Jean',
    age: '62 ans',
    text: '"Euh... oui. Enfin... globalement."',
    highlight: '"Non."',
    durationFrames: 8 * FPS,
  },
  {
    persona: 'Lucas & Sophie',
    age: '31 ans',
    text: '"J\'ai un fichier Excel quelque part..."',
    highlight: '"...mais je ne sais pas ce qu\'il y a dedans."',
    durationFrames: 8 * FPS,
  },
  {
    persona: 'Nadia',
    age: '42 ans, maman solo',
    text: '"Mes enfants sont assurés, ça oui."',
    highlight: '"Moi ? Je sais pas trop."',
    durationFrames: 7 * FPS,
  },
  {
    persona: 'Thomas',
    age: '28 ans',
    text: '"Mon courtier m\'a tout expliqué. Mais c\'était il y a trois ans."',
    highlight: '3 ans',
    durationFrames: 7 * FPS,
  },
  {
    persona: 'Anne & Patrick',
    age: '55 ans',
    text: '"On a tellement de contrats différents..."',
    highlight: '"...qu\'on ne sait plus ce qui couvre quoi."',
    durationFrames: 7 * FPS,
  },
]

export function Quotes() {
  const frame = useCurrentFrame()

  // Find which quote to show
  let accum = 0
  let currentIdx = 0
  let localFrame = frame
  for (let i = 0; i < QUOTES.length; i++) {
    if (frame < accum + QUOTES[i].durationFrames) {
      currentIdx = i
      localFrame = frame - accum
      break
    }
    accum += QUOTES[i].durationFrames
    if (i === QUOTES.length - 1) {
      currentIdx = i
      localFrame = frame - accum
    }
  }

  const q = QUOTES[currentIdx]
  const halfDuration = Math.floor(q.durationFrames * 0.55)

  // Text animations
  const mainOpacity = fadeIn(localFrame, 8) * (localFrame > q.durationFrames - 12 ? fadeOut(localFrame, q.durationFrames - 12) : 1)
  const mainY = slideUp(localFrame, 8, 20)

  const highlightOpacity = q.highlight
    ? fadeIn(localFrame, halfDuration) * (localFrame > q.durationFrames - 12 ? fadeOut(localFrame, q.durationFrames - 12) : 1)
    : 0
  const highlightY = slideUp(localFrame, halfDuration, 15)

  // Persona label
  const personaOpacity = fadeIn(localFrame, 3) * (localFrame > q.durationFrames - 12 ? fadeOut(localFrame, q.durationFrames - 12) : 1)

  // Progress dots
  const dotY = 920

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
      {/* Persona label */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          opacity: personaOpacity,
        }}
      >
        <span
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 22,
            fontWeight: 700,
            color: WHITE,
          }}
        >
          {q.persona}
        </span>
        <span
          style={{
            fontFamily: FONT_BODY,
            fontSize: 20,
            color: GREY_300,
          }}
        >
          {q.age}
        </span>
      </div>

      {/* Main quote */}
      <p
        style={{
          fontFamily: FONT_HEADLINE,
          fontSize: 48,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          lineHeight: 1.4,
          opacity: mainOpacity,
          transform: `translateY(${mainY}px)`,
          margin: 0,
        }}
      >
        {q.text}
      </p>

      {/* Highlight quote */}
      {q.highlight && (
        <p
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: currentIdx === 3 ? 72 : 52,
            fontWeight: 700,
            color: WHITE,
            textAlign: 'center',
            opacity: highlightOpacity,
            transform: `translateY(${highlightY}px)`,
            marginTop: 32,
            ...(currentIdx === 3
              ? { textDecoration: 'line-through', textDecorationColor: 'rgba(217,48,76,0.7)' }
              : {}),
          }}
        >
          {q.highlight}
        </p>
      )}

      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          top: dotY,
          display: 'flex',
          gap: 12,
        }}
      >
        {QUOTES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentIdx ? 32 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIdx ? WHITE : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
