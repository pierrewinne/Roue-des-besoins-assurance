import { interpolate, Easing } from 'remotion';

// Fade in with optional slide up
export function fadeIn(
  frame: number,
  startFrame: number,
  duration: number = 15,
  slideY: number = 0
) {
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const translateY = slideY
    ? interpolate(frame, [startFrame, startFrame + duration], [slideY, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  return { opacity, translateY };
}

// Fade out
export function fadeOut(frame: number, startFrame: number, duration: number = 12) {
  return interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
}

// Scale animation
export function scaleIn(
  frame: number,
  startFrame: number,
  duration: number = 15,
  from: number = 0.95
) {
  return interpolate(frame, [startFrame, startFrame + duration], [from, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}

// Counter animation (number counting up)
export function counter(
  frame: number,
  startFrame: number,
  duration: number,
  target: number,
  from: number = 0
) {
  const value = interpolate(frame, [startFrame, startFrame + duration], [from, target], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return Math.round(value);
}

// Progress bar fill animation
export function progressFill(
  frame: number,
  startFrame: number,
  duration: number = 24,
  targetPercent: number
) {
  return interpolate(frame, [startFrame, startFrame + duration], [0, targetPercent], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
}

// Stagger delay for a group of items
export function staggerDelay(index: number, delayPerItem: number = 5) {
  return index * delayPerItem;
}

// Ease constants matching the brief (x2 slowdown for video)
export const VIDEO_TRANSITION_DURATION = 12; // 400ms at 30fps (200ms app × 2)
export const VIDEO_PROGRESS_DURATION = 18;   // 600ms at 30fps (300ms app × 2)
