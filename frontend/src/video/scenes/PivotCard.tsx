import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, FONT_BODY } from '../constants'
import { fadeIn, slideUp } from '../helpers'

/** Scene 5: Pivot card — "Le problème, ce n'est pas vos assurances..." */
export function PivotCard() {
  const frame = useCurrentFrame()

  // Wave 1: "Le problème, ce n'est pas vos assurances."
  const w1Opacity = fadeIn(frame, 10, 18)
  const w1Y = slideUp(frame, 10, 20, 18)
  const w1Fade = frame > 80 ? 0.3 : 1

  // Wave 2: "C'est que personne ne vous a donné une vue d'ensemble."
  const w2SubOpacity = fadeIn(frame, 90, 15)
  const w2MainOpacity = fadeIn(frame, 105, 18)
  const w2Y = slideUp(frame, 105, 20, 18)

  // "ensemble" letter-spacing animation
  const ensembleTracking = frame > 120
    ? 0.14 + Math.min(0.08, (frame - 120) / 200)
    : 0.14

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
        padding: '0 180px',
      }}
    >
      {/* Wave 1 */}
      <div
        style={{
          opacity: w1Opacity * w1Fade,
          transform: `translateY(${w1Y}px) scale(${frame > 80 ? 0.88 : 1})`,
          textAlign: 'center',
          transition: 'transform 0.5s',
        }}
      >
        <span
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 40,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          Le probl&egrave;me,{' '}
        </span>
        <span
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 40,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          ce n&rsquo;est pas vos assurances.
        </span>
      </div>

      {/* Wave 2 */}
      <div
        style={{
          marginTop: 50,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 26,
            color: 'rgba(255,255,255,0.6)',
            opacity: w2SubOpacity,
            margin: 0,
            marginBottom: 14,
          }}
        >
          C&rsquo;est que personne ne vous a donn&eacute;
        </p>
        <p
          style={{
            fontFamily: FONT_HEADLINE,
            fontSize: 48,
            fontWeight: 700,
            color: WHITE,
            opacity: w2MainOpacity,
            transform: `translateY(${w2Y}px)`,
            margin: 0,
          }}
        >
          une vue d&rsquo;
          <span style={{ letterSpacing: `${ensembleTracking}em` }}>ensemble</span>.
        </p>
      </div>
    </div>
  )
}
