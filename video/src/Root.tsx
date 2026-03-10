import React from 'react';
import { Composition } from 'remotion';
import { Video } from './Video';
import { FPS, TOTAL_FRAMES } from './design-tokens';

// Individual scene imports for preview
import { Scene1_Opening } from './scenes/Scene1_Opening';
import { Scene2_Introduction } from './scenes/Scene2_Introduction';
import { Scene3_Dashboard } from './scenes/Scene3_Dashboard';
import { Scene4_ClientDetail } from './scenes/Scene4_ClientDetail';
import { Scene5_Questionnaire } from './scenes/Scene5_Questionnaire';
import { Scene6_WheelReveal } from './scenes/Scene6_WheelReveal';
import { Scene7_ActionsPdf } from './scenes/Scene7_ActionsPdf';
import { Scene8_Responsive } from './scenes/Scene8_Responsive';
import { Scene9_Closing } from './scenes/Scene9_Closing';
import { scenes } from './design-tokens';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Full video composition */}
      <Composition
        id="MotionDesignVideo"
        component={Video}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* Individual scene compositions for preview/editing */}
      <Composition
        id="Scene1-Opening"
        component={Scene1_Opening}
        durationInFrames={scenes.scene1.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene2-Introduction"
        component={Scene2_Introduction}
        durationInFrames={scenes.scene2.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene3-Dashboard"
        component={Scene3_Dashboard}
        durationInFrames={scenes.scene3.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene4-ClientDetail"
        component={Scene4_ClientDetail}
        durationInFrames={scenes.scene4.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene5-Questionnaire"
        component={Scene5_Questionnaire}
        durationInFrames={scenes.scene5.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene6-WheelReveal"
        component={Scene6_WheelReveal}
        durationInFrames={scenes.scene6.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene7-ActionsPdf"
        component={Scene7_ActionsPdf}
        durationInFrames={scenes.scene7.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene8-Responsive"
        component={Scene8_Responsive}
        durationInFrames={scenes.scene8.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene9-Closing"
        component={Scene9_Closing}
        durationInFrames={scenes.scene9.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
