import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";

// Run from launch-film/: node scripts/stills.mjs <seconds> ...
// Half-size frames for inspection in out/stills/. SCALE=1 for full size,
// COMP=<id> for another composition, DIR=<folder>.
const dir = process.env.DIR ?? "out/stills";
fs.mkdirSync(dir, { recursive: true });
const id = process.env.COMP ?? "LaunchFilmSilent";
const scale = Number(process.env.SCALE ?? 0.5);
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: "src/index.ts", publicDir: "public", onProgress: () => {} });
const browser = await openBrowser("chrome");
try {
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  for (const seconds of times.length ? times : [0]) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(seconds * composition.fps));
    const name = `${id}-${seconds.toFixed(2).padStart(5, "0")}.png`;
    await renderStill({ serveUrl, composition, frame, output: `${dir}/${name}`, scale, puppeteerInstance: browser, logLevel: "error" });
    console.log(name);
  }
} finally {
  await browser.close({ silent: true });
}
