import { Sequence, AbsoluteFill } from 'remotion'
import { FPS, SCENES } from './constants'
import { Opening } from './scenes/Opening'
import { Quotes } from './scenes/Quotes'
import { Confusion } from './scenes/Confusion'
import { WheelTease } from './scenes/WheelTease'
import { PivotCard } from './scenes/PivotCard'
import { WheelReveal } from './scenes/WheelReveal'
import { AppTease } from './scenes/AppTease'
import { Reactions } from './scenes/Reactions'
import { Cliffhanger } from './scenes/Cliffhanger'
import { Signature } from './scenes/Signature'

export function RoueDesBesoinsVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000D6E' }}>
      {/* Scene 1: Opening (0-4s) */}
      <Sequence from={SCENES.OPENING_START} durationInFrames={SCENES.OPENING_END - SCENES.OPENING_START}>
        <Opening />
      </Sequence>

      {/* Scene 2: Testimonial quotes (4-48s) */}
      <Sequence from={SCENES.QUOTES_START} durationInFrames={SCENES.QUOTES_END - SCENES.QUOTES_START}>
        <Quotes />
      </Sequence>

      {/* Scene 3: Confusion montage (48-58s) */}
      <Sequence from={SCENES.CONFUSION_START} durationInFrames={SCENES.CONFUSION_END - SCENES.CONFUSION_START}>
        <Confusion />
      </Sequence>

      {/* Scene 4: Wheel tease (58-63s) */}
      <Sequence from={SCENES.WHEEL_TEASE_START} durationInFrames={SCENES.WHEEL_TEASE_END - SCENES.WHEEL_TEASE_START}>
        <WheelTease />
      </Sequence>

      {/* Scene 5: Pivot card (63-71s) */}
      <Sequence from={SCENES.PIVOT_START} durationInFrames={SCENES.PIVOT_END - SCENES.PIVOT_START}>
        <PivotCard />
      </Sequence>

      {/* Scene 6: Full wheel reveal (71-88s) */}
      <Sequence from={SCENES.WHEEL_REVEAL_START} durationInFrames={SCENES.WHEEL_REVEAL_END - SCENES.WHEEL_REVEAL_START}>
        <WheelReveal />
      </Sequence>

      {/* Scene 7: App UI teaser (88-100s) */}
      <Sequence from={SCENES.APP_TEASE_START} durationInFrames={SCENES.APP_TEASE_END - SCENES.APP_TEASE_START}>
        <AppTease />
      </Sequence>

      {/* Scene 8: Reaction quotes (100-110s) */}
      <Sequence from={SCENES.REACTIONS_START} durationInFrames={SCENES.REACTIONS_END - SCENES.REACTIONS_START}>
        <Reactions />
      </Sequence>

      {/* Scene 9: Cliffhanger (110-115s) */}
      <Sequence from={SCENES.CLIFFHANGER_START} durationInFrames={SCENES.CLIFFHANGER_END - SCENES.CLIFFHANGER_START}>
        <Cliffhanger />
      </Sequence>

      {/* Scene 10: Signature + CTA (115-120s) */}
      <Sequence from={SCENES.SIGNATURE_START} durationInFrames={SCENES.SIGNATURE_END - SCENES.SIGNATURE_START}>
        <Signature />
      </Sequence>
    </AbsoluteFill>
  )
}
