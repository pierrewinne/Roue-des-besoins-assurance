import { Composition } from 'remotion'
import { RoueDesBesoinsVideo } from './Composition'
import { WIDTH, HEIGHT, FPS, TOTAL_FRAMES } from './constants'

export function RemotionRoot() {
  return (
    <Composition
      id="RoueDesBesoins"
      component={RoueDesBesoinsVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  )
}
