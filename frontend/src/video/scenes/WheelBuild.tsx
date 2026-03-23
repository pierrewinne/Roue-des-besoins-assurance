/**
 * Act 2: Wheel Build (5-12s / 210 frames)
 * Wheel constructs from center outward with micro-rotation on arcs,
 * labels overlapping with arc construction, icons staggered.
 */
import { useCurrentFrame, interpolate, Easing } from 'remotion'
import { fadeIn, arcDraw } from '../helpers'
import { WheelSVG } from './WheelSVG'

const STAGGER = 15 // frames between each quadrant

export function WheelBuild() {
  const frame = useCurrentFrame()

  // Quadrant arcs build sequentially (15-90 relative) — order: biens→personnes→projets→futur
  const quadrantProgress = [0, 1, 2, 3].map(i =>
    arcDraw(frame, 15 + i * STAGGER, 35)
  )

  // Micro-rotation: each arc rotates from -8° to 0° during its build
  const quadrantRotation = [0, 1, 2, 3].map(i => {
    const progress = quadrantProgress[i]
    return interpolate(progress, [0, 1], [-8, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
  })

  // Labels overlap with arcs — start 10 frames AFTER each quadrant's arc start
  const labelOpacity = [0, 1, 2, 3].map(i =>
    fadeIn(frame, 25 + i * STAGGER, 18)
  )

  // Icons scale up after labels (90-160 relative)
  const iconOpacity = [0, 1, 2, 3].map(i =>
    fadeIn(frame, 90 + i * STAGGER, 18)
  )

  // Glow builds up with arcs
  const glowOpacity = [0, 1, 2, 3].map(i => {
    const p = quadrantProgress[i]
    return p > 0.3 ? 0.45 * fadeIn(frame, 30 + i * STAGGER, 30) : 0
  })

  // Overall scale: slight grow from 0.92 to 1 with overshoot
  const overallScale = interpolate(frame, [0, 25], [0.88, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.03)),
  })

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <WheelSVG
        quadrantProgress={quadrantProgress}
        quadrantRotation={quadrantRotation}
        opacity={1}
        scale={overallScale}
        centerText="VOUS"
        showIcons={true}
        iconOpacity={iconOpacity}
        labelOpacity={labelOpacity}
        glowOpacity={glowOpacity}
      />
    </div>
  )
}
