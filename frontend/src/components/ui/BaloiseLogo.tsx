interface BaloiseLogoProps {
  /** 'dark' = white logo (for dark backgrounds), 'light' = navy logo (for light backgrounds) */
  variant?: 'dark' | 'light'
  /** Height of the logo in pixels */
  height?: number
  className?: string
}

import { BALOISE_LOGO_PATH } from '../../shared/brand/logo-path.ts'

const NAVY = '#000D6E'

export default function BaloiseLogo({ variant = 'light', height = 28, className }: BaloiseLogoProps) {
  const fill = variant === 'dark' ? '#ffffff' : NAVY

  return (
    <svg
      viewBox="0 0 419 85"
      height={height}
      className={className}
      aria-label="Baloise"
      role="img"
      style={{ display: 'block' }}
    >
      <path d={BALOISE_LOGO_PATH} fill={fill} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}
