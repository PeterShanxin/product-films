import React from "react";
import { Composition, Html5Audio, Still, staticFile } from "remotion";
import { Cover } from "./Cover";
import { FPS, H, SECONDS, W } from "./clock";
import { Lang } from "./copy";
import { Film } from "./Film";

const WithSound: React.FC<{ lang: Lang }> = ({ lang }) => (
  <>
    <Film lang={lang} />
    <Html5Audio src={staticFile("audio/mix.wav")} pauseWhenBuffering />
  </>
);

const frames = Math.round(SECONDS * FPS);

export const RemotionRoot: React.FC = () => (
  <>
    {/* Preview with the master; releases are rendered silent and muxed (scripts/mux.py). */}
    <Composition id="LaunchFilm" component={WithSound} defaultProps={{ lang: "en" as Lang }} durationInFrames={frames} fps={FPS} width={W} height={H} />
    <Composition id="LaunchFilmZh" component={WithSound} defaultProps={{ lang: "zh" as Lang }} durationInFrames={frames} fps={FPS} width={W} height={H} />
    <Composition id="LaunchFilmSilent" component={Film} defaultProps={{ lang: "en" as Lang }} durationInFrames={frames} fps={FPS} width={W} height={H} />
    <Composition id="LaunchFilmZhSilent" component={Film} defaultProps={{ lang: "zh" as Lang }} durationInFrames={frames} fps={FPS} width={W} height={H} />
    <Still id="Cover" component={Cover} defaultProps={{ lang: "en" as Lang }} width={W} height={H} />
    <Still id="CoverZh" component={Cover} defaultProps={{ lang: "zh" as Lang }} width={W} height={H} />
  </>
);
