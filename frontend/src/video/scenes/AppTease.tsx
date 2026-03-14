import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { NAVY, NAVY_MID, WHITE, GREY_300, QUADRANT_COLORS, FONT_HEADLINE, FONT_BODY, FPS } from '../constants'
import { fadeIn, slideUp, fadeOut } from '../helpers'

/** Scene 7: App UI teaser — mock question screen + partial result */
export function AppTease() {
  const frame = useCurrentFrame()

  // Phase 1: Mock question card (0-6s)
  const cardOpacity = fadeIn(frame, 5, 18)
  const cardY = slideUp(frame, 5, 30)
  const cardExit = frame > 5 * FPS ? fadeOut(frame, 5 * FPS, 12) : 1

  // Phase 2: Mock result preview (6-12s)
  const resultOpacity = fadeIn(frame, 6 * FPS, 18)
  const resultY = slideUp(frame, 6 * FPS, 25)
  const resultExit = frame > 10.5 * FPS ? fadeOut(frame, 10.5 * FPS, 12) : 1

  // Typing animation for question answer
  const typingProgress = interpolate(frame, [2 * FPS, 3.5 * FPS], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
  const answerText = 'Propriétaire'
  const visibleChars = Math.floor(typingProgress * answerText.length)

  // Cursor blink
  const cursorVisible = frame % 20 < 12 && frame < 4 * FPS

  // Mini bar chart animation (result phase)
  const bars = [
    { label: 'Biens', color: QUADRANT_COLORS.biens.base, target: 0.72 },
    { label: 'Personnes', color: QUADRANT_COLORS.personnes.base, target: 0.58 },
    { label: 'Projets', color: QUADRANT_COLORS.projets.base, target: 0.85 },
    { label: 'Futur', color: QUADRANT_COLORS.futur.base, target: 0.43 },
  ]
  const barStart = 7 * FPS
  const barProgress = interpolate(frame, [barStart, barStart + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // Blur overlay at end
  const blurOpacity = fadeIn(frame, 9 * FPS, 20)

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
        position: 'relative',
      }}
    >
      {/* Phase 1: Question card */}
      <div
        style={{
          position: 'absolute',
          opacity: cardOpacity * cardExit,
          transform: `translateY(${cardY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Mock header bar */}
        <div
          style={{
            width: 700,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${QUADRANT_COLORS.biens.base}, ${QUADRANT_COLORS.personnes.base}, ${QUADRANT_COLORS.projets.base}, ${QUADRANT_COLORS.futur.base})`,
            marginBottom: 40,
            opacity: 0.7,
          }}
        />

        {/* Question number */}
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 18,
            color: GREY_300,
            margin: 0,
            marginBottom: 12,
            letterSpacing: '0.1em',
          }}
        >
          QUESTION 3 / 32
        </p>

        {/* Question text */}
        <p
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 36,
            fontWeight: 700,
            color: WHITE,
            textAlign: 'center',
            margin: 0,
            marginBottom: 40,
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          {'Êtes-vous propriétaire ou locataire de votre logement ?'}
        </p>

        {/* Answer input mock */}
        <div
          style={{
            width: 500,
            padding: '18px 28px',
            borderRadius: 8,
            border: '2px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 24,
              color: WHITE,
              opacity: 0.9,
            }}
          >
            {answerText.slice(0, visibleChars)}
          </span>
          {cursorVisible && (
            <span
              style={{
                width: 2,
                height: 28,
                backgroundColor: WHITE,
                marginLeft: 2,
                opacity: 0.7,
              }}
            />
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 500,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginTop: 30,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${9.4}%`,
              height: '100%',
              borderRadius: 2,
              backgroundColor: QUADRANT_COLORS.biens.light,
            }}
          />
        </div>
      </div>

      {/* Phase 2: Result preview */}
      <div
        style={{
          position: 'absolute',
          opacity: resultOpacity * resultExit,
          transform: `translateY(${resultY}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 28,
            fontWeight: 700,
            color: WHITE,
            margin: 0,
            marginBottom: 50,
            letterSpacing: '0.04em',
          }}
        >
          Votre diagnostic
        </p>

        {/* Bar chart */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', height: 200 }}>
          {bars.map((bar, i) => {
            const h = bar.target * 180 * barProgress
            const barDelay = i * 6
            const barOpacity = fadeIn(frame, barStart + barDelay, 15)
            return (
              <div
                key={bar.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: barOpacity,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: h,
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: bar.color,
                    opacity: 0.85,
                  }}
                />
                <p
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    color: GREY_300,
                    marginTop: 10,
                  }}
                >
                  {bar.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Blur overlay — hides details, teases */}
      {blurOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: NAVY,
            opacity: blurOpacity * 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              fontFamily: FONT_HEADLINE,
              fontSize: 34,
              fontWeight: 700,
              color: WHITE,
              opacity: fadeIn(frame, 9.5 * FPS, 15),
              letterSpacing: '0.02em',
            }}
          >
            {'8 minutes. Pas une de plus.'}
          </p>
        </div>
      )}
    </div>
  )
}
