/**
 * Composition: 36-second "Reveal Concentrique" teaser
 * 5 scenes assembled via Remotion <Sequence>
 */
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion'
import { S, NAVY } from './constants'
import { fadeIn, fadeOut } from './helpers'
import { Origin } from './scenes/Origin'
import { WheelBuild } from './scenes/WheelBuild'
import { Diagnostic } from './scenes/Diagnostic'
import { Results } from './scenes/Results'
import { Close } from './scenes/Close'
import { BaloiseLogo } from './scenes/BaloiseLogo'

function LogoOverlay() {
  const frame = useCurrentFrame()
  // Fade in at scene 2 start (3s), fade out before Close scene (27s)
  const opacity = fadeIn(frame, S.BUILD_START + 10, 20) * fadeOut(frame, S.CLOSE_START - 15, 15)
  if (opacity <= 0) return null
  return (
    <div style={{
      position: 'absolute',
      top: 36, left: 48,
      zIndex: 10,
      opacity,
    }}>
      <BaloiseLogo height={28} />
    </div>
  )
}

export function RoueDesBesoinsVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Sequence from={S.ORIGIN_START} durationInFrames={S.ORIGIN_END - S.ORIGIN_START}>
        <Origin />
      </Sequence>

      <Sequence from={S.BUILD_START} durationInFrames={S.BUILD_END - S.BUILD_START}>
        <WheelBuild />
      </Sequence>

      <Sequence from={S.DIAG_START} durationInFrames={S.DIAG_END - S.DIAG_START}>
        <Diagnostic />
      </Sequence>

      <Sequence from={S.RESULTS_START} durationInFrames={S.RESULTS_END - S.RESULTS_START}>
        <Results />
      </Sequence>

      <Sequence from={S.CLOSE_START} durationInFrames={S.CLOSE_END - S.CLOSE_START}>
        <Close />
      </Sequence>

      {/* Persistent Baloise logo top-left (scenes 2-4) */}
      <LogoOverlay />
    </AbsoluteFill>
  )
}
