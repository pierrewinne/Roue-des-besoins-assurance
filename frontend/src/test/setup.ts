import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// lottie-web requires canvas at import time — mock globally for jsdom
vi.mock('lottie-web/build/player/lottie_light', () => ({
  default: { loadAnimation: () => ({ destroy: vi.fn() }) },
}))
