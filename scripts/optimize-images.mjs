// Converts the raw PNG shots in /assets into web-sized WebP files in /public/work.
// Run with: npm run images
import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve("assets");
const OUT = path.resolve("public/work");

const files = {
  "Beacon.png": "beacon",
  "Cogni AI Study Workspace.png": "cogni",
  "Pantry Tracker Laptop Hero Scene.png": "pantry",
  "The Pacer Laptop on Sunlit Concrete.png": "pacer",
  "dealboard.png": "dealboard",
};

await mkdir(OUT, { recursive: true });

// The drawings and cut-outs were painted with a teal accent. This turns only those
// teal pixels into the site's blue, keeping their shading. Greys and paper are untouched.
const TEAL_TO_BLUE = 54; // degrees of hue
async function bluify(input) {
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const ramp = (v, from, to) => Math.min(1, Math.max(0, (v - from) / (to - from)));
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b] = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    if (d < 0.04) continue;
    let h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    const l = (max + min) / 2;
    const s = d / (1 - Math.abs(2 * l - 1));
    // soft edges on both limits, so anti-aliased strokes don't keep a teal fringe
    const w = ramp(h, 120, 140) * (1 - ramp(h, 205, 220)) * ramp(s, 0.08, 0.2);
    if (!w) continue;
    const nh = (h + TEAL_TO_BLUE) % 360;
    const ns = Math.min(1, s * 1.25);
    // dark teal would turn navy, so lift it towards the brightness of the site's blue
    const nl = l + (1 - l) * 0.24;
    const c = (1 - Math.abs(2 * nl - 1)) * ns;
    const f = (n) => {
      const k = (n + nh / 30) % 12;
      return nl - (c / 2) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    [f(0), f(8), f(4)].forEach((v, j) => {
      data[i + j] = Math.round(data[i + j] * (1 - w) + v * 255 * w);
    });
  }
  const raw = { width: info.width, height: info.height, channels: info.channels };
  return sharp(data, { raw }).png().toBuffer();
}

for (const [file, slug] of Object.entries(files)) {
  const input = path.join(SRC, file);
  for (const width of [2000, 1100, 560]) {
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width > 1000 ? 82 : 76 })
      .toFile(path.join(OUT, `${slug}-${width}.webp`));
  }
  console.log("✓", slug);
}

// Process illustration: monochrome, paper tone lifted to white so it can be
// multiplied onto the site's own paper colour.
for (const width of [1100, 760]) {
  await sharp(path.join(SRC, "Process Sketch.png"))
    .resize({ width })
    .grayscale()
    .linear(1.3, -30)
    .webp({ quality: 84 })
    .toFile(path.join(OUT, `process-${width}.webp`));
}
console.log("✓ process");

// ── Case-study images ────────────────────────────────────────
// Drop files into assets/case-studies/<project>/ named:
//   hero.*      replaces the main laptop shot everywhere
//   detail-1.*  first tall close-up (4:5)
//   detail-2.*  second tall close-up (4:5)
//   showcase.*  wide image after "The approach" (16:9)
// Any of .png .jpg .jpeg .webp works. Missing slots fall back to the old crops.
// screen + sketch: the "sketch to screen" pair, made by `npm run sketches`
const SLOTS = ["hero", "detail-1", "detail-2", "showcase", "screen", "sketch"];
const CASES = path.join(SRC, "case-studies");
const manifest = {};
const ratios = {};
for (const base of ["beacon", "cogni", "pacer", "pantry", "dealboard"]) {
  const dir = path.join(CASES, base);
  if (!existsSync(dir)) continue;
  const names = await readdir(dir);
  for (const slot of SLOTS) {
    const file = names.find((n) => n.toLowerCase().replace(/\.(png|jpe?g|webp)$/, "") === slot);
    if (!file) continue;
    const out = slot === "hero" ? base : `${base}-${slot}`;
    for (const width of [2000, 1100, 560]) {
      await sharp(path.join(dir, file))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width > 1000 ? 82 : 76 })
        .toFile(path.join(OUT, `${out}-${width}.webp`));
    }
    (manifest[base] ??= []).push(slot);
    // real proportions of the sketch-to-screen pair, so the page can reserve
    // the right space before the image loads (the section pins on scroll)
    if (slot === "screen") {
      const m = await sharp(path.join(dir, file)).metadata();
      ratios[base] = +(m.width / m.height).toFixed(4);
    }
    console.log("✓", base, slot);
  }
}
await writeFile(path.resolve("src/generated/case-images.json"), JSON.stringify(manifest, null, 2) + "\n");
await writeFile(path.resolve("src/generated/screen-ratios.json"), JSON.stringify(ratios, null, 2) + "\n");

// About page "Behind the work" drawings (assets/about/*.png).
// Each channel is scaled so the drawing's paper becomes the site's own paper
// colour (--paper #e8e8e4). The images then sit on the page with no visible box.
// (CSS multiply can't do this here: the About strip slides with a transform.)
const PAGE = [232, 232, 228];
const ABOUT = {
  "The desk.png": "about-desk",
  "Hands at work.png": "about-hands",
  "The planning wall.png": "about-wall",
  "From sketch to screen.png": "about-sketch",
  "SaaS video work.png": "about-video",
};
for (const [file, slug] of Object.entries(ABOUT)) {
  const input = path.join(SRC, "about", file);
  // paper colour = the 90th percentile of each channel
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const paper = [0, 1, 2].map((c) => {
    const vals = [];
    for (let i = c; i < data.length; i += info.channels * 7) vals.push(data[i]);
    vals.sort((a, b) => a - b);
    return vals[Math.floor(vals.length * 0.9)];
  });
  const blue = await bluify(input);
  for (const width of [1500, 800]) {
    await sharp(blue)
      .removeAlpha()
      .linear(paper.map((p, c) => PAGE[c] / p), [0, 0, 0])
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(OUT, `${slug}-${width}.webp`));
  }
  console.log("✓", slug, "paper", paper.join(","));
}

// Decorative cut-outs for the services section: trim the empty transparent border, keep alpha.
for (const name of ["computer", "mouse"]) {
  const blue = await bluify(path.join(SRC, `${name}.png`));
  for (const width of [900, 500]) {
    await sharp(blue)
      .trim({ threshold: 1 })
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(path.join(OUT, `${name}-${width}.webp`));
  }
  console.log("✓", name);
}
