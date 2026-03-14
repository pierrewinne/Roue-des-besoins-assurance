/**
 * Composition V2: 36-second "Reveal Concentrique" teaser
 * 5 acts assembled via Remotion <Sequence> with gradient background + cross-fades.
 */
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion'
import { S, NAVY, NAVY_DARK, NAVY_MID } from './constants'
import { fadeIn, fadeOut } from './helpers'
import { Origin } from './scenes/Origin'
import { WheelBuild } from './scenes/WheelBuild'
import { Diagnostic } from './scenes/Diagnostic'
import { Results } from './scenes/Results'
import { Close } from './scenes/Close'
import { BaloiseLogo } from './scenes/BaloiseLogo'

/** Animated radial gradient background — never flat navy */
function GradientBackground() {
  const frame = useCurrentFrame()

  // Subtle focal point shift based on frame (follows narrative)
  // Acts 1-3: centered, Act 4: shifts left (following wheel), Act 5: re-centers
  const focalX = frame < S.ACT4_START
    ? 50
    : frame < S.ACT5_START
      ? 50 - (frame - S.ACT4_START) / (S.ACT5_START - S.ACT4_START) * 15
      : 35 + (frame - S.ACT5_START) / (S.ACT5_END - S.ACT5_START) * 15

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse 130% 130% at ${focalX}% 50%, ${NAVY_MID} 0%, ${NAVY} 40%, ${NAVY_DARK} 100%)`,
    }} />
  )
}

/** Persistent Baloise logo top-left (acts 2-4) */
function LogoOverlay() {
  const frame = useCurrentFrame()
  // Fade in at act 2 start, fade out before Close
  const opacity = fadeIn(frame, S.ACT2_START + 10, 20) * fadeOut(frame, S.ACT5_START - 15, 15)
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

/** Cross-fade wrapper — fades in at start, fades out at end of each scene */
function SceneFade({ children, durationInFrames, fadeInDur = 10, fadeOutDur = 10 }: {
  children: React.ReactNode
  durationInFrames: number
  fadeInDur?: number
  fadeOutDur?: number
}) {
  const frame = useCurrentFrame()
  const inOp = fadeInDur > 0 ? fadeIn(frame, 0, fadeInDur) : 1
  const outOp = fadeOutDur > 0 ? fadeOut(frame, durationInFrames - fadeOutDur, fadeOutDur) : 1
  return <div style={{ width: '100%', height: '100%', opacity: inOp * outOp }}>{children}</div>
}

export function RoueDesBesoinsVideo() {
  const act1Duration = S.ACT1_END - S.ACT1_START
  const act2Duration = S.ACT2_END - S.ACT2_START
  const act3Duration = S.ACT3_END - S.ACT3_START
  const act4Duration = S.ACT4_END - S.ACT4_START
  const act5Duration = S.ACT5_END - S.ACT5_START

  return (
    <AbsoluteFill>
      {/* Animated gradient background */}
      <GradientBackground />

      {/* Act 1: L'angle mort (0-5s) */}
      <Sequence from={S.ACT1_START} durationInFrames={act1Duration}>
        <SceneFade durationInFrames={act1Duration} fadeInDur={5} fadeOutDur={0}>
          <Origin />
        </SceneFade>
      </Sequence>

      {/* Act 2: Wheel Build (5-12s) */}
      <Sequence from={S.ACT2_START} durationInFrames={act2Duration}>
        <SceneFade durationInFrames={act2Duration} fadeInDur={8} fadeOutDur={8}>
          <WheelBuild />
        </SceneFade>
      </Sequence>

      {/* Act 3: Analyse flash (12-17s) */}
      <Sequence from={S.ACT3_START} durationInFrames={act3Duration}>
        <SceneFade durationInFrames={act3Duration} fadeInDur={8} fadeOutDur={8}>
          <Diagnostic />
        </SceneFade>
      </Sequence>

      {/* Act 4: Révélation (17-30s) */}
      <Sequence from={S.ACT4_START} durationInFrames={act4Duration}>
        <SceneFade durationInFrames={act4Duration} fadeInDur={0} fadeOutDur={10}>
          <Results />
        </SceneFade>
      </Sequence>

      {/* Act 5: Close (30-36s) */}
      <Sequence from={S.ACT5_START} durationInFrames={act5Duration}>
        <SceneFade durationInFrames={act5Duration} fadeInDur={12} fadeOutDur={0}>
          <Close />
        </SceneFade>
      </Sequence>

      {/* Persistent Baloise logo top-left (acts 2-4) */}
      <LogoOverlay />
    </AbsoluteFill>
  )
}
