import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { scenes } from './design-tokens';

import { Scene1_Opening } from './scenes/Scene1_Opening';
import { Scene2_Introduction } from './scenes/Scene2_Introduction';
import { Scene3_Dashboard } from './scenes/Scene3_Dashboard';
import { Scene4_ClientDetail } from './scenes/Scene4_ClientDetail';
import { Scene5_Questionnaire } from './scenes/Scene5_Questionnaire';
import { Scene6_WheelReveal } from './scenes/Scene6_WheelReveal';
import { Scene7_ActionsPdf } from './scenes/Scene7_ActionsPdf';
import { Scene8_Responsive } from './scenes/Scene8_Responsive';
import { Scene9_Closing } from './scenes/Scene9_Closing';

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      <Sequence from={scenes.scene1.start} durationInFrames={scenes.scene1.duration} name="1 - Opening">
        <Scene1_Opening />
      </Sequence>

      <Sequence from={scenes.scene2.start} durationInFrames={scenes.scene2.duration} name="2 - Introduction">
        <Scene2_Introduction />
      </Sequence>

      <Sequence from={scenes.scene3.start} durationInFrames={scenes.scene3.duration} name="3 - Dashboard">
        <Scene3_Dashboard />
      </Sequence>

      <Sequence from={scenes.scene4.start} durationInFrames={scenes.scene4.duration} name="4 - Client Detail">
        <Scene4_ClientDetail />
      </Sequence>

      <Sequence from={scenes.scene5.start} durationInFrames={scenes.scene5.duration} name="5 - Questionnaire">
        <Scene5_Questionnaire />
      </Sequence>

      <Sequence from={scenes.scene6.start} durationInFrames={scenes.scene6.duration} name="6 - Wheel Reveal">
        <Scene6_WheelReveal />
      </Sequence>

      <Sequence from={scenes.scene7.start} durationInFrames={scenes.scene7.duration} name="7 - Actions + PDF">
        <Scene7_ActionsPdf />
      </Sequence>

      <Sequence from={scenes.scene8.start} durationInFrames={scenes.scene8.duration} name="8 - Responsive">
        <Scene8_Responsive />
      </Sequence>

      <Sequence from={scenes.scene9.start} durationInFrames={scenes.scene9.duration} name="9 - Closing">
        <Scene9_Closing />
      </Sequence>
    </AbsoluteFill>
  );
};
