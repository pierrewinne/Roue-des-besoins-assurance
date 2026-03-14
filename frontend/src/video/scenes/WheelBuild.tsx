/**
 * Scene 2: Wheel Build (3-10s / frames 90-300)
 * Wheel constructs from center outward — dividers, inner ring CW, outer ring CCW,
 * labels staggered fade-in, icons scale-up staggered.
 */
import { useCurrentFrame } from 'remotion'
import { NAVY, WHEEL } from '../constants'
import { fadeIn, arcDraw, scaleIn } from '../helpers'
import { WheelSVG } from './WheelSVG'

const STAGGER = 12 // frames between each quadrant

export function WheelBuild() {
  const frame = useCurrentFrame()

  // Center appears first (0-20 relative)
  const centerOpacity = fadeIn(frame, 0, 20)

  // Quadrant arcs build sequentially (20-120 relative)
  const quadrantProgress = [0, 1, 2, 3].map(i =>
    arcDraw(frame, 20 + i * STAGGER, 35)
  )

  // Labels fade in after arcs are mostly drawn (80-140 relative)
  const labelOpacity = [0, 1, 2, 3].map(i =>
    fadeIn(frame, 80 + i * STAGGER, 20)
  )

  // Icons scale up after labels (100-170 relative)
  const iconOpacity = [0, 1, 2, 3].map(i =>
    fadeIn(frame, 100 + i * STAGGER, 18)
  )

  // Glow builds up gently
  const glowOpacity = [0, 1, 2, 3].map(i => {
    const p = quadrantProgress[i]
    return p > 0.5 ? 0.3 * fadeIn(frame, 50 + i * STAGGER, 30) : 0
  })

  // Overall scale: slight grow from 0.92 to 1
  const overallScale = 0.92 + centerOpacity * 0.08

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: NAVY,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <WheelSVG
        quadrantProgress={quadrantProgress}
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
