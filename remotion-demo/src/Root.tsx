import { Composition } from 'remotion';
import { ClawReformDemo } from './ClawReformDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ClawReformDemo"
        component={ClawReformDemo}
        durationInFrames={5400}  // 3 minutes at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
