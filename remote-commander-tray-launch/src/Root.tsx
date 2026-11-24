import React from "react";
import { Composition, Html5Audio, Still, staticFile } from "remotion";
import { Cover } from "./Cover";
import { FPS, H, SECONDS, W } from "./clock";
import { Film } from "./Film";

const WithSound: React.FC = () => (
  <>
    <Film />
    <Html5Audio src={staticFile("audio/mix.wav")} pauseWhenBuffering />
  </>
);

export const RemotionRoot: React.FC = () => (
  <>
    {/* Preview with the master; the release is rendered silent and muxed (scripts/mux.py). */}
    <Composition id="LaunchFilm" component={WithSound} durationInFrames={Math.round(SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Still id="Cover" component={Cover} width={W} height={H} />
    <Composition id="LaunchFilmSilent" component={Film} durationInFrames={Math.round(SECONDS * FPS)} fps={FPS} width={W} height={H} />
  </>
);
