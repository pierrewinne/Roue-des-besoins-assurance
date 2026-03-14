import { interpolate, Easing } from 'remotion'

/** Fade in opacity over a frame range */
export function fadeIn(frame: number, start: number, duration = 20): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}

/** Fade out opacity */
export function fadeOut(frame: number, start: number, duration = 15): number {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  })
}

/** Slide up from offset */
export function slideUp(frame: number, start: number, distance = 30, duration = 20): number {
  return interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}

/** Scale with overshoot */
export function scaleIn(frame: number, start: number, duration = 18): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.2)),
  })
}

/** Arc draw — returns 0-1 for stroke-dashoffset animation */
export function arcDraw(frame: number, start: number, duration = 25): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}

/** Subtle pulse for "breathing" elements */
export function pulse(frame: number, speed = 0.02, amount = 0.005): number {
  return 1 + Math.sin(frame * speed * Math.PI * 2) * amount
}
