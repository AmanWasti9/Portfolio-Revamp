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
  "Pantry Traker Laptop Hero Scene.png": "pantry",
  "The Pacer Laptop on Sunlit Concrete.png": "pacer",
};

await mkdir(OUT, { recursive: true });

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
const SLOTS = ["hero", "detail-1", "detail-2", "showcase"];
const CASES = path.join(SRC, "case-studies");
const manifest = {};
for (const base of ["beacon", "cogni", "pacer", "pantry"]) {
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
    console.log("✓", base, slot);
  }
}
await writeFile(path.resolve("src/generated/case-images.json"), JSON.stringify(manifest, null, 2) + "\n");
