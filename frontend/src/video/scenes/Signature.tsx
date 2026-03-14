import { useCurrentFrame } from 'remotion'
import { NAVY, WHITE, FONT_HEADLINE, FONT_BODY, FPS } from '../constants'
import { fadeIn, slideUp, scaleIn } from '../helpers'

/** Scene 10: Signature + Logo + CTA */
export function Signature() {
  const frame = useCurrentFrame()

  // Signature text
  const sig1Opacity = fadeIn(frame, 10, 18)
  const sig2Opacity = fadeIn(frame, 30, 18)
  const sig2Y = slideUp(frame, 30, 15, 18)

  // Logo
  const logoOpacity = fadeIn(frame, 65, 20)
  const logoScale = scaleIn(frame, 65, 20)

  // CTA
  const ctaOpacity = fadeIn(frame, 95, 18)
  const ctaY = slideUp(frame, 95, 12, 18)

  // CTA button pulse
  const btnPulse = frame > 110
    ? 0.7 + Math.sin((frame - 110) * 0.08) * 0.3
    : 0

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
      }}
    >
      {/* Signature line 1 */}
      <p
        style={{
          fontFamily: FONT_HEADLINE,
          fontSize: 38,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          opacity: sig1Opacity,
          margin: 0,
          textAlign: 'center',
        }}
      >
        On ne prot&egrave;ge bien
      </p>

      {/* Signature line 2 */}
      <p
        style={{
          fontFamily: FONT_HEADLINE,
          fontSize: 46,
          fontWeight: 700,
          color: WHITE,
          opacity: sig2Opacity,
          transform: `translateY(${sig2Y}px)`,
          margin: 0,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        que ce qu&rsquo;on comprend.
      </p>

      {/* Baloise Logo (SVG text) */}
      <div
        style={{
          marginTop: 70,
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <svg width={260} height={52} viewBox="0 0 419 85">
          <path
            d="M36.5 0C16.3 0 0 16.3 0 36.5v12C0 68.7 16.3 85 36.5 85h12C68.7 85 85 68.7 85 48.5v-12C85 16.3 68.7 0 48.5 0h-12zm9.8 20.5c7.6 0 12.8 4 12.8 10.4 0 4.4-2.4 7.6-6.4 9.2 5.2 1.2 8.4 5.2 8.4 10.4 0 7.6-6 12-14.4 12H28.5v-42h17.8zm-2.4 16.4c4 0 6.4-2 6.4-5.2s-2.4-5.2-6.4-5.2h-9v10.4h9zm1.2 19.2c4.4 0 7.2-2.4 7.2-6s-2.8-5.6-7.2-5.6h-10.2v11.6h10.2zM127.7 42.5c0-13.2-8.4-22.4-20-22.4-5.6 0-10 2-13.2 5.2V3.5h-6.8v60h6.4v-4.4c3.2 3.6 7.6 5.6 13.2 5.6 12 0 20.4-9.6 20.4-22.2zm-7.2 0c0 9.6-6 16-14.4 16-8 0-14-6.4-14-16s6-15.6 14-15.6c8.4 0 14.4 6 14.4 15.6zM156.9 20.1c-12.4 0-21.6 9.6-21.6 22.4s9.2 22.4 21.6 22.4c8 0 14.8-4 18.4-10l-5.6-3.2c-2.8 4.4-7.2 7.2-12.8 7.2-8.4 0-14-5.6-14.8-13.2h34.8c.4-1.2.4-2.4.4-3.6 0-12.4-8.4-22-20.4-22zm-14.4 18.8c1.2-7.2 6.8-12.8 14-12.8 7.6 0 12.8 5.2 13.6 12.8h-27.6zM182.1 3.5v60h6.8v-60h-6.8zM219.7 20.1c-12.8 0-22.4 9.6-22.4 22.4s9.6 22.4 22.4 22.4 22.4-9.6 22.4-22.4-9.6-22.4-22.4-22.4zm0 38.4c-9.2 0-15.6-6.8-15.6-16s6.4-16 15.6-16 15.6 6.8 15.6 16-6.4 16-15.6 16zM256.1 17.7c-3.6 0-7.2 1.6-9.6 4V3.5h-6.8v60h6.8V48.1c0-9.6 4-15.6 11.2-15.6 6 0 9.6 4 9.6 10.8v20.4h6.8V42.1c0-10-5.6-17.2-14.4-17.2l-3.6-7.2zM303.7 20.1c-12.4 0-21.6 9.6-21.6 22.4s9.2 22.4 21.6 22.4c8 0 14.8-4 18.4-10l-5.6-3.2c-2.8 4.4-7.2 7.2-12.8 7.2-8.4 0-14-5.6-14.8-13.2h34.8c.4-1.2.4-2.4.4-3.6 0-12.4-8.4-22-20.4-22zm-14.4 18.8c1.2-7.2 6.8-12.8 14-12.8 7.6 0 12.8 5.2 13.6 12.8h-27.6z"
            fill={WHITE}
          />
        </svg>
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: 50,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize: 22,
            color: 'rgba(255,255,255,0.75)',
            margin: 0,
            marginBottom: 12,
          }}
        >
          D&eacute;couvrez le diagnostic complet
        </p>
        <div
          style={{
            display: 'inline-block',
            border: `2px solid rgba(255,255,255,${btnPulse > 0 ? btnPulse : 0.6})`,
            borderRadius: 6,
            padding: '14px 36px',
          }}
        >
          <span
            style={{
              fontFamily: FONT_HEADLINE,
              fontSize: 24,
              fontWeight: 700,
              color: WHITE,
            }}
          >
            D&eacute;mo live &mdash; 8 minutes
          </span>
        </div>
      </div>
    </div>
  )
}
