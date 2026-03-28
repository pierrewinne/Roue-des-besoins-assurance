import { BALOISE_LOGO_PATH } from '../../shared/brand/logo-path.ts'

interface BaloiseLogoProps {
  height?: number
  opacity?: number
}

export function BaloiseLogo({ height = 40, opacity = 1 }: BaloiseLogoProps) {
  return (
    <svg
      viewBox="0 0 419 85"
      height={height}
      style={{ display: 'block', opacity }}
      aria-label="Baloise"
    >
      <path d={BALOISE_LOGO_PATH} fill="#ffffff" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}
