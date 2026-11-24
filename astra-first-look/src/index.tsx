import React from "react";
import { Composition, registerRoot, Still } from "remotion";
import { Cover } from "./Cover";
import { Film } from "./Film";
import { FPS, H, SECONDS, W } from "./motion";

const Root: React.FC = () => (
  <>
    <Still id="AstraFirstLookCover" component={Cover} width={1080} height={1440} />
    <Composition id="AstraFirstLook" component={Film} durationInFrames={SECONDS * FPS} fps={FPS} width={W} height={H} />
  </>
);
registerRoot(Root);
