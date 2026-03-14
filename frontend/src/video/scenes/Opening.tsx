import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, FONT_BODY } from '../constants'
import { fadeIn, slideUp } from '../helpers'

/** Scene 1: Opening card — navy bg, question text */
export function Opening() {
  const frame = useCurrentFrame()

  const line1Opacity = fadeIn(frame, 15)
  const line1Y = slideUp(frame, 15, 25)
  const line2Opacity = fadeIn(frame, 35)
  const line2Y = slideUp(frame, 35, 25)
  const allFadeOut = frame > 100 ? fadeIn(frame, 100, 15) : 0

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
        opacity: 1 - allFadeOut,
      }}
    >
      {/* Horizontal light line */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: `${Math.min(frame * 8, 100)}%`,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
          opacity: frame < 15 ? frame / 15 : frame > 60 ? Math.max(0, 1 - (frame - 60) / 20) : 1,
        }}
      />

      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 32,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '0.08em',
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
          margin: 0,
          textAlign: 'center',
        }}
      >
        On a pos&eacute; une question simple
      </p>
      <p
        style={{
          fontFamily: FONT_HEADLINE,
          fontSize: 42,
          fontWeight: 700,
          color: WHITE,
          letterSpacing: '0.12em',
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          marginTop: 12,
          textAlign: 'center',
        }}
      >
        &agrave; 6 familles luxembourgeoises.
      </p>
    </div>
  )
}
