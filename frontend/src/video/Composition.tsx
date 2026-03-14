/**
 * Composition: 36-second "Reveal Concentrique" teaser
 * 5 scenes assembled via Remotion <Sequence>
 */
import { AbsoluteFill, Sequence } from 'remotion'
import { S, NAVY } from './constants'
import { Origin } from './scenes/Origin'
import { WheelBuild } from './scenes/WheelBuild'
import { Diagnostic } from './scenes/Diagnostic'
import { Results } from './scenes/Results'
import { Close } from './scenes/Close'

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
    </AbsoluteFill>
  )
}
