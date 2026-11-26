// "Sketch to screen" images for the case studies.
// For each HTML mockup it captures the desktop first screen twice, at exactly the same size:
//   screen.png  the real page
//   sketch.png  the same page turned into a pencil wireframe (same layout, so the two line up)
// into assets/case-studies/<project>/ — then run `npm run images`.
// Run with: npm run sketches            (all)   ·   npm run sketches -- pacer   (one)
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PROJECTS = { dealboard: "dealboard", beacon: "beacon", cogni: "cogni", pacer: "pacer", pantry: "pantry" };
const only = process.argv[2];

// Runs inside the page. Turns the first screen into a graphite wireframe WITHOUT changing
// any size or position: only colours, outlines, text rendering and overlays.
function sketchify() {
  const INK = "#2b2b2b";
  const PAPER = "#f4f2ed";
  const vw = innerWidth;
  const vh = innerHeight;

  // hand-drawn wobble + paper grain
  const svgNS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(svgNS, "svg");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.style.position = "absolute";
  defs.innerHTML = `
    <filter id="rough" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
  document.body.append(defs);

  const rgba = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(/[ ,/]+/).filter(Boolean);
    return { r: +r, g: +g, b: +b, a: +a };
  };
  const visibleBg = (cs) => {
    const c = rgba(cs.backgroundColor);
    return (c && c.a > 0.05) || (cs.backgroundImage !== "none" && cs.backgroundImage.includes("gradient"));
  };

  // overlay layer for drawn boxes (photos, image placeholders)
  const layer = document.createElement("div");
  Object.assign(layer.style, { position: "absolute", left: "0", top: "0", width: "0", height: "0", zIndex: "99999", pointerEvents: "none" });
  document.body.append(layer);
  const drawBox = (r, radius) => {
    const d = document.createElement("div");
    Object.assign(d.style, {
      position: "absolute",
      left: `${r.left + scrollX}px`,
      top: `${r.top + scrollY}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      borderRadius: radius,
      boxShadow: `inset 0 0 0 1.6px ${INK}`,
      // the classic wireframe cross for "image goes here"
      background: `linear-gradient(to top right, transparent calc(50% - 0.8px), ${INK}99 calc(50% - 0.8px), ${INK}99 calc(50% + 0.8px), transparent calc(50% + 0.8px)),
                   linear-gradient(to bottom right, transparent calc(50% - 0.8px), ${INK}99 calc(50% - 0.8px), ${INK}99 calc(50% + 0.8px), transparent calc(50% + 0.8px))`,
    });
    layer.append(d);
  };

  const all = [...document.body.querySelectorAll("*")].filter((el) => el !== layer && !layer.contains(el) && el !== defs && !defs.contains(el));
  // read everything first, then write, so changes don't affect later measurements
  const plan = all.map((el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { el, cs: { bg: visibleBg(cs), bgImg: cs.backgroundImage, border: parseFloat(cs.borderTopWidth) + parseFloat(cs.borderLeftWidth) > 0, radius: cs.borderRadius, fs: parseFloat(cs.fontSize), display: cs.display, weight: +cs.fontWeight }, r };
  });

  for (const { el, cs, r } of plan) {
    if (el.dataset?.sk === "line") continue; // already drawn as a pencil line with its sentence
    const tag = el.tagName.toLowerCase();
    const onScreen = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    const s = el.style;
    s.setProperty("box-shadow", "none", "important");
    s.setProperty("text-shadow", "none", "important");
    s.setProperty("filter", "none", "important");
    s.setProperty("backdrop-filter", "none", "important");
    s.setProperty("color", INK, "important");
    s.setProperty("border-color", INK, "important");
    s.setProperty("caret-color", INK, "important");

    const isPhoto = tag === "img" || tag === "video" || tag === "canvas" || (cs.bgImg.includes("url(") && r.width > 40 && r.height > 40);
    if (isPhoto) {
      if (onScreen) drawBox(r, cs.radius);
      s.setProperty("opacity", "0", "important");
      continue;
    }

    // backgrounds become outlines (big page-wide sections just disappear).
    // Cards keep a paper fill, so a card in front hides what's behind it, like on paper.
    const huge = r.width * r.height > vw * vh * 0.45;
    const boxed = (cs.bg || cs.border) && !huge && r.width > 6 && r.height > 6;
    s.setProperty("background", cs.bg && !huge ? PAPER : "transparent", "important");
    if (boxed) s.setProperty("box-shadow", `inset 0 0 0 1.6px ${INK}`, "important");

    if (tag === "svg") {
      // icons and charts as line drawings
      for (const n of el.querySelectorAll("*")) {
        const ncs = getComputedStyle(n);
        const hasFill = ncs.fill && ncs.fill !== "none";
        const hasStroke = ncs.stroke && ncs.stroke !== "none";
        n.style.setProperty("fill", n.tagName.toLowerCase() === "text" ? INK : "none", "important");
        if (hasFill || hasStroke) {
          n.style.setProperty("stroke", INK, "important");
          if (!hasStroke) n.style.setProperty("stroke-width", "1.4", "important");
        }
      }
      continue;
    }

    // text: only elements that hold text directly
    const ownNodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!ownNodes.length) continue;
    const text = el.textContent.trim();
    if (cs.fs >= 26) {
      // big headlines: hollow, as if traced in pencil. The stroke is painted first and the
      // paper fill on top, which hides the overlapping contours some fonts have inside letters.
      s.setProperty("-webkit-text-stroke", `${cs.fs >= 48 ? 3.2 : 2.2}px ${INK}`, "important");
      s.setProperty("-webkit-text-fill-color", PAPER, "important");
      s.setProperty("paint-order", "stroke fill", "important");
    } else if (text.length > 34 && cs.fs < 24) {
      // running text: grey pencil lines where the words were. Each text run is wrapped in
      // its own span (no layout change), because a line-through on the element itself
      // would spread to everything inside it, like price tags in a table row.
      for (const n of ownNodes) {
        const span = document.createElement("span");
        span.style.cssText = `-webkit-text-fill-color:transparent;text-decoration:line-through;text-decoration-color:#9a9893;text-decoration-thickness:0.42em;text-decoration-skip-ink:none`;
        n.replaceWith(span);
        span.append(n);
      }
      // inline children (a bold word inside the sentence) get the same treatment
      for (const c of el.querySelectorAll("b, strong, em, i, a, span")) {
        if (getComputedStyle(c).display === "inline" && !c.children.length) {
          c.dataset.sk = "line";
          c.style.cssText += `;-webkit-text-fill-color:transparent;text-decoration:line-through;text-decoration-color:#9a9893;text-decoration-thickness:0.42em;text-decoration-skip-ink:none`;
        }
      }
    } else {
      // short labels (nav, buttons, chips) stay readable, in graphite
      s.setProperty("-webkit-text-fill-color", INK, "important");
    }
  }

  const st = document.createElement("style");
  st.textContent = `
    *::before, *::after { background: transparent !important; box-shadow: none !important; border-color: ${INK} !important; color: ${INK} !important; }
    html, body { background: ${PAPER} !important; }
    body { filter: url(#rough) grayscale(1); } /* grayscale also catches colour emoji */
    ::selection { background: transparent; }`;
  document.head.append(st);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
for (const [name, out] of Object.entries(PROJECTS)) {
  if (only && only !== name) continue;
  const url = pathToFileURL(path.resolve("mockups", name, "index.html")).href;
  const dest = path.resolve("assets/case-studies", out);
  await mkdir(dest, { recursive: true });

  // same sizing as render-mockups: the viewport is exactly the hero's height
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const heroH = await page.evaluate(() => Math.min(900, Math.round(document.querySelector(".hero").getBoundingClientRect().height)));
  await page.setViewport({ width: 1440, height: heroH, deviceScaleFactor: 2 });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(dest, "screen.png") });

  await page.evaluate(sketchify);
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(dest, "sketch.png") });
  console.log("✓", name, `1440×${heroH}`);
}
await browser.close();
