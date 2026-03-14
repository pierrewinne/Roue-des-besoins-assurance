import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { NAVY, WHITE, SCORE_COLORS, FONT_HEADLINE, FONT_BODY, FPS } from '../constants'
import { fadeIn, slideUp } from '../helpers'

/** Scene 9: Cliffhanger — partial score gauge + reaction quote */
export function Cliffhanger() {
  const frame = useCurrentFrame()
  const totalFrames = 5 * FPS

  // Quote: "Ah quand même..."
  const quoteOpacity = fadeIn(frame, 5, 15)
  const quoteY = slideUp(frame, 5, 20)

  // Score gauge appears at 1.5s
  const gaugeStart = Math.floor(1.5 * FPS)
  const gaugeProgress = interpolate(frame, [gaugeStart, gaugeStart + 40], [0, 0.55], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  // Gauge then cuts abruptly
  const gaugeCutFrame = gaugeStart + 50
  const gaugeVisible = frame < gaugeCutFrame

  // "On devrait peut-être appeler..." appears after gauge cut
  const followUpOpacity = fadeIn(frame, gaugeCutFrame + 5, 12)
  const followUpY = slideUp(frame, gaugeCutFrame + 5, 15)

  // SVG gauge params
  const gaugeR = 120
  const gaugeStroke = 14
  const circumference = 2 * Math.PI * gaugeR

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
      {/* Quote */}
      <p
        style={{
          fontFamily: FONT_HEADLINE,
          fontSize: 52,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          opacity: quoteOpacity,
          transform: `translateY(${quoteY}px)`,
          margin: 0,
          marginBottom: 60,
        }}
      >
        &laquo; Ah quand m&ecirc;me... &raquo;
      </p>

      {/* Score gauge (truncated) */}
      {gaugeVisible && gaugeProgress > 0 && (
        <svg width={300} height={300} style={{ opacity: fadeIn(frame, gaugeStart, 10) }}>
          {/* Background track */}
          <circle
            cx={150}
            cy={150}
            r={gaugeR}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={gaugeStroke}
          />
          {/* Progress arc — amber color, incomplete */}
          <circle
            cx={150}
            cy={150}
            r={gaugeR}
            fill="none"
            stroke={SCORE_COLORS.moderate}
            strokeWidth={gaugeStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - gaugeProgress)}
            transform={`rotate(-90 150 150)`}
          />
          {/* Score number — shows "?" since we cut before revealing */}
          <text
            x={150}
            y={158}
            textAnchor="middle"
            fill={WHITE}
            fontSize={48}
            fontWeight={700}
            fontFamily="'Inter',sans-serif"
            opacity={0.4}
          >
            ?
          </text>
        </svg>
      )}

      {/* Follow-up quote */}
      <p
        style={{
          fontFamily: FONT_BODY,
          fontSize: 28,
          color: 'rgba(255,255,255,0.6)',
          fontStyle: 'italic',
          textAlign: 'center',
          opacity: followUpOpacity,
          transform: `translateY(${followUpY}px)`,
          marginTop: 40,
        }}
      >
        &laquo; On devrait peut-&ecirc;tre appeler... &raquo;
      </p>
    </div>
  )
}
