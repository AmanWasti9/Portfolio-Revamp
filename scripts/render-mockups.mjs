// Renders the HTML product mockups in /mockups into case-study images.
//   1. captures the live page (desktop hero, mobile view and UI pieces) into mockups/<name>/raw/
//   2. screenshots the presentation frames in mockups/<name>/shots.html
//   3. writes them to assets/case-studies/<folder>/ — then run `npm run images`
// Run with: npm run mockups            (all)   ·   npm run mockups -- pacer   (one)
// Set CHROME_PATH if Chrome is installed somewhere else.
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FRAMES = ["showcase", "detail-1", "detail-2"];

const MOCKUPS = {
  dealboard: {
    out: "dealboard",
    pieces: { board: "#app-board", ai: "#ai-card", undo: "#undo", lead: "#lead-panel", forecast: "#forecast" },
    // capture the board without its undo toast; the toast is placed separately in the frame
    isolate: true,
  },
  beacon: {
    out: "beacon",
    pieces: { post1: "#post-1", post3: "#post-3", article: "#article", editor: "#editor", note: ".hero-art .note" },
  },
  cogni: {
    out: "cogni",
    pieces: { chat: ".chat", summary: ".sumbox", deck: ".deck", ask: ".ask" },
  },
  pacer: {
    out: "pacer",
    pieces: {
      buybox: ".pdp .buybox",
      stage: ".pdp .stagebox",
      card1: "#products .card:nth-child(1)",
      card2: "#products .card:nth-child(2)",
      card3: "#products .card:nth-child(3)",
      card4: "#products .card:nth-child(4)",
    },
  },
  pantry: {
    out: "pantry",
    pieces: {
      pantry: "#screen-pantry",
      expiry: "#screen-expiry",
      shopping: "#screen-shopping",
      low: "#notif-low",
      added: "#notif-added",
    },
    // straighten the tilted hero phone and clear page backgrounds so phones keep their round corners
    prep: () => {
      for (const el of document.querySelectorAll("#screen-pantry, .trio .phone")) el.style.transform = "none";
      const st = document.createElement("style");
      st.textContent = "html,body,.hero,section,.wrap,.stage,.trio{background:transparent!important}.blob{display:none}.phone,.notif{box-shadow:none!important}";
      document.head.append(st);
    },
    // capture each piece alone, so overlapping notifications don't bleed into the phone shots
    isolate: true,
  },
};

const only = process.argv[2];

// The link-preview card (public/og.png) is a single frame, not a product mockup.
if (!only || only === "og") {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1300, height: 700, deviceScaleFactor: 1 });
  await pg.goto(pathToFileURL(path.resolve("mockups/og/index.html")).href, { waitUntil: "networkidle0" });
  await pg.evaluate(() => document.fonts.ready);
  await (await pg.$("#card")).screenshot({ path: path.resolve("public/og.png") });
  await b.close();
  console.log("✓ og card → public/og.png");
  if (only === "og") process.exit(0);
}
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();

for (const [name, cfg] of Object.entries(MOCKUPS)) {
  if (only && only !== name) continue;
  const dir = path.resolve("mockups", name);
  const raw = path.join(dir, "raw");
  const out = path.resolve("assets/case-studies", cfg.out);
  await mkdir(raw, { recursive: true });
  await mkdir(out, { recursive: true });
  const url = pathToFileURL(path.join(dir, "index.html")).href;

  // desktop: the viewport is exactly the hero's height so the browser frame has no empty strip
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const heroH = await page.evaluate(() => Math.min(900, Math.round(document.querySelector(".hero").getBoundingClientRect().height)));
  await page.setViewport({ width: 1440, height: heroH, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(raw, "desktop.png") });

  if (cfg.prep) await page.evaluate(cfg.prep);
  const sels = Object.values(cfg.pieces);
  for (const [file, sel] of Object.entries(cfg.pieces)) {
    const el = await page.$(sel);
    if (!el) throw new Error(`${name}: nothing matches ${sel}`);
    if (cfg.isolate)
      await page.evaluate((all, keep) => {
        for (const s of all) for (const n of document.querySelectorAll(s)) n.style.visibility = s === keep ? "visible" : "hidden";
      }, sels, sel);
    await el.screenshot({ path: path.join(raw, `${file}.png`), omitBackground: true });
  }

  // mobile first screen
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(raw, "mobile.png") });

  // presentation frames
  await page.setViewport({ width: 1800, height: 1000, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(path.join(dir, "shots.html")).href, { waitUntil: "networkidle0" });
  for (const id of FRAMES) {
    const el = await page.$(`#${id}`);
    await el.screenshot({ path: path.join(out, `${id}.png`) });
    console.log("✓", name, id);
  }
}

await browser.close();
