import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, reducedMotion, finePointer, scrollToEl } from "../lib/motion";
import { cover, imgSrc, process, projects, services, site } from "../content";
import { TLink, useRevealed } from "../components/Transition";
import { Roll, SplitReveal } from "../components/Motion";
import { TileField } from "../components/TileField";

export default function Home() {
  return (
    <main>
      <Hero />
      <Statement />
      <WorksList />
      <Services />
      <Process />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
//  Hero — role line, giant name, intro + two clear actions.
//  The tile field behind it is pure texture: it lights up under the pointer.
// ─────────────────────────────────────────────────────────────
function Hero() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      gsap.fromTo(
        ".hero__scribble path",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: rm ? 0 : 1.1, ease: "power2.inOut", delay: 0.85 }
      );
      gsap.fromTo(
        ".hero__fade",
        { autoAlpha: 0, y: rm ? 0 : 14 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay: 0.7 }
      );
      if (rm) return;
      // name drifts up and the field recedes as you scroll away
      gsap.to(".hero__name", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero .tf", {
        yPercent: 12,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <section className="hero" ref={root}>
      <TileField />

      <p className="hero__role">
        <SplitReveal as="span" type="words" mode="intro" delay={0.3}>
          {site.role}
        </SplitReveal>
        <svg className="hero__scribble" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M3 10C48 4 96 13 150 8s104-5 147 2" />
        </svg>
      </p>

      <h1 className="hero__title">
        <SplitReveal as="span" type="chars" mode="intro" random delay={0.05} className="hero__name">
          {site.firstName}
        </SplitReveal>
      </h1>

      <div className="hero__row">
        <SplitReveal as="p" type="lines" mode="intro" delay={0.55} className="hero__intro">
          {site.intro}
        </SplitReveal>

        <button className="hero__scroll hero__fade" onClick={() => scrollToEl(".statement")}>
          <span>Scroll</span>
          <i aria-hidden="true" />
        </button>

        <div className="hero__actions hero__fade">
          <TLink to="/contact" className="btn btn--ink">
            <Roll text="Start a project" /> <span className="btn__arrow" aria-hidden="true">↳</span>
          </TLink>
          <button className="btn btn--line" onClick={() => scrollToEl("#work")}>
            <Roll text="See my work" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
function Statement() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed || reducedMotion()) return;
      const split = SplitText.create(".statement__lines", { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: ".statement__lines", start: "top 78%", end: "bottom 55%", scrub: 0.6 },
        }
      );
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <section className="statement" ref={root}>
      <h2 className="statement__lines">
        <span className="l1">Good websites</span>
        <span className="l2">explain themselves</span>
        <span className="l3">in five seconds</span>
        <span className="l4">and stay with you</span>
        <span className="l5">much longer.</span>
      </h2>
      <div className="statement__aside">
        <SplitReveal as="p" type="lines">
          You work with one person the whole way. I plan it, design it, build it and launch it, and I stay around
          after it goes live.
        </SplitReveal>
        <TLink to="/about" className="link-line" data-cursor="About me">
          <Roll text="More about me" /> <span aria-hidden="true">↳</span>
        </TLink>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
function WorksList() {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const revealed = useRevealed();
  const [active, setActive] = useState<number | null>(null);
  const prev = useRef<number | null>(null);

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      gsap.utils.toArray<HTMLElement>(".works__row").forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } });
        tl.fromTo(row.querySelector(".works__rule"), { scaleX: 0 }, { scaleX: 1, duration: rm ? 0 : 1.2, ease: "expo.inOut" });
        tl.fromTo(
          row.querySelectorAll(".works__mask > *"),
          { yPercent: rm ? 0 : 110 },
          { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.05 },
          "<0.3"
        );
      });
    },
    { dependencies: [revealed], scope: root }
  );

  // floating preview follows the pointer
  useEffect(() => {
    if (!finePointer()) return;
    const el = preview.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
    const rTo = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "power3" });
    let lastX = 0;
    let px = -1;
    let py = -1;
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4));
      lastX = e.clientX;
      px = e.clientX;
      py = e.clientY;
    };

    // Scrolling moves rows under a still pointer without firing any pointer
    // events, so re-check which row (if any) is under the pointer on scroll.
    const rows = [...root.current!.querySelectorAll<HTMLElement>(".works__row")];
    let raf = 0;
    const onScroll = () => {
      if (px < 0 || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const row = document.elementFromPoint(px, py)?.closest<HTMLElement>(".works__row");
        const i = row ? rows.indexOf(row) : -1;
        setActive(i === -1 ? null : i);
      });
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const el = preview.current!;
    const imgs = el.querySelectorAll<HTMLElement>(".works__pimg");
    if (active === null) {
      gsap.to(el, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    } else {
      gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "expo.out", overwrite: "auto" });
      const img = imgs[active];
      gsap.set(img, { zIndex: 2 });
      if (prev.current !== null && prev.current !== active) gsap.set(imgs[prev.current], { zIndex: 1 });
      gsap.fromTo(
        img,
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.out", overwrite: true }
      );
      gsap.fromTo(img.querySelector("img"), { scale: 1.3 }, { scale: 1, duration: 0.9, ease: "expo.out", overwrite: true });
    }
    prev.current = active;
  }, [active]);

  return (
    <section className="works" ref={root} id="work">
      <header className="sec-head">
        <SplitReveal as="h2" type="chars" random className="sec-head__title">
          Selected work
        </SplitReveal>
        <span className="sec-head__count">({String(projects.length).padStart(2, "0")})</span>
      </header>

      <ul className="works__list" onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li key={p.slug}>
            <TLink
              to={`/work/${p.slug}`}
              className="works__row"
              data-cursor="View case"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            >
              <span className="works__rule" aria-hidden="true" />
              <span className="works__mask works__year">
                <span>{p.year}</span>
              </span>
              <span className="works__mask works__title">
                <span>{p.title}</span>
              </span>
              <span className="works__mask works__kind">
                <span>{p.kind}</span>
              </span>
              <img className="works__thumb" src={imgSrc(cover(p), 1100)} alt="" loading="lazy" />
            </TLink>
          </li>
        ))}
      </ul>

      <div className="works__preview" ref={preview} aria-hidden="true">
        {projects.map((p) => (
          <div key={p.slug} className="works__pimg">
            <img src={imgSrc(cover(p), 1100)} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      <div className="works__more">
        <TLink to="/work" className="link-line">
          <Roll text="See all projects" /> <span aria-hidden="true">↳</span>
        </TLink>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
function Services() {
  return (
    <section className="services">
      <header className="sec-head sec-head--center">
        <SplitReveal as="h2" type="chars" random className="sec-head__title">
          How I can help
        </SplitReveal>
      </header>
      <ul className="services__list">
        {services.map((s) => (
          <li key={s.title} className="services__item">
            <span className="services__fill" aria-hidden="true" />
            <SplitReveal as="h3" type="lines" className="services__title">
              {s.title}
            </SplitReveal>
            <div className="services__body">
              <SplitReveal as="p" type="lines">
                {s.body}
              </SplitReveal>
              <ul className="tags">
                {s.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Process — a pencil-sketch desk (public/work/process-*.webp) with a
//  teal path that draws itself as you scroll, visiting each step.
//  All coordinates are in the sketch's own pixel space (1100 × 1430) and
//  were picked to sit in the empty paper between the drawings.
// ─────────────────────────────────────────────────────────────
const SKETCH_W = 1100;
const SKETCH_H = 1430;

type Side = "left" | "right";
// dot  = point on the path beside the step title (also a waypoint below)
// box  = [x, width] of the text block
// side = which side of the dot the text sits on
const STEP_LAYOUT: { dot: [number, number]; box: [number, number]; side: Side }[] = [
  { dot: [392, 95], box: [412, 290], side: "right" }, // Discovery — right of the light bulb
  { dot: [695, 245], box: [470, 215], side: "left" }, // Planning — against the notebook's spiral
  { dot: [640, 478], box: [478, 144], side: "left" }, // Design — against the wireframe's left edge
  { dot: [400, 722], box: [418, 225], side: "right" }, // Development — right of the code card
  { dot: [708, 890], box: [470, 230], side: "left" }, // Testing — against the chart
  { dot: [505, 1130], box: [525, 375], side: "right" }, // Launch — right of the rocket
  { dot: [540, 1300], box: [560, 340], side: "right" }, // Reflection — left of the coffee
];

const WAYPOINTS: [number, number][] = [
  [392, 20], [392, 95], // → Discovery
  [392, 178], [450, 194], [640, 196], [688, 212], [695, 245], // → Planning
  [697, 330], [696, 410], [672, 448], [640, 478], // → Design
  [637, 545], [626, 612], [560, 640], [430, 646], [402, 680], [400, 722], // → Development
  [398, 790], [430, 818], [640, 824], [700, 845], [708, 890], // → Testing
  [708, 975], [690, 1040], [600, 1072], [530, 1084], [505, 1130], // → Launch
  [503, 1215], [520, 1268], [540, 1300], // → Reflection
  [540, 1385], [550, 1430],
];

/** Catmull-Rom → one cubic Bézier command per waypoint pair. */
function bezierSegments(p: [number, number][]) {
  const f = (n: number) => n.toFixed(1);
  return p.slice(0, -1).map((p1, i) => {
    const p0 = p[i - 1] ?? p1;
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  });
}

const SEGS = bezierSegments(WAYPOINTS);
const piece = (from: number, to: number) =>
  `M${WAYPOINTS[from][0]} ${WAYPOINTS[from][1]} ${SEGS.slice(from, to).join(" ")}`;
const TRACK_D = piece(0, WAYPOINTS.length - 1);

// waypoint index of every dot → the path is cut into pieces dot-to-dot:
// [start → dot 1], [dot 1 → dot 2] … [dot 7 → end]
const DOT_AT = STEP_LAYOUT.map(({ dot }) =>
  WAYPOINTS.findIndex(([x, y]) => x === dot[0] && y === dot[1])
);
const PIECES = [0, ...DOT_AT].map((from, i, arr) => piece(from, arr[i + 1] ?? WAYPOINTS.length - 1));

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
// The line's tip sits at this height of the viewport while you scroll.
const LINE_AT = "62%";

function Process() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      const map = root.current!.querySelector<HTMLElement>(".process__map")!;
      const steps = gsap.utils.toArray<HTMLElement>(".process__step");
      const dots = steps.map((s) => s.querySelector<HTMLElement>(".process__dot")!);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1100px)", () => {
        gsap.fromTo(
          ".process__sketch",
          { autoAlpha: 0, scale: rm ? 1 : 1.03 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.6,
            ease: "expo.out",
            scrollTrigger: { trigger: map, start: "top 85%", once: true },
          }
        );
        // each piece draws while its tip travels from one dot to the next
        gsap.utils.toArray<SVGPathElement>(".process__seg").forEach((seg, i) => {
          const from = i === 0 ? map : dots[i - 1];
          const to = dots[i] ?? map;
          gsap.fromTo(
            seg,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: from,
                start: i === 0 ? `top ${LINE_AT}` : `center ${LINE_AT}`,
                endTrigger: to,
                end: dots[i] ? `center ${LINE_AT}` : `bottom ${LINE_AT}`,
                scrub: rm ? true : 0.5,
              },
            }
          );
        });
      });

      mm.add("(max-width: 1099px)", () => {
        gsap.fromTo(
          ".process__line",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: map, start: `top ${LINE_AT}`, end: `bottom ${LINE_AT}`, scrub: rm ? true : 0.5 },
          }
        );
      });

      // a dot lights up the moment the line reaches it, and its step appears
      steps.forEach((step, i) => {
        // stays lit after you pass it; only goes out when you scroll back above it
        ScrollTrigger.create({
          trigger: dots[i],
          start: `center ${LINE_AT}`,
          onEnter: () => step.classList.add("is-on"),
          onLeaveBack: () => step.classList.remove("is-on"),
        });
        gsap.fromTo(
          step.querySelectorAll(".process__text > *"),
          { y: rm ? 0 : 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: { trigger: dots[i], start: `center ${LINE_AT}`, once: true },
          }
        );
      });
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <section className="process" ref={root}>
      <header className="sec-head">
        <SplitReveal as="h2" type="lines" className="sec-head__title process__heading">
          Seven steps from first call to launch and beyond
        </SplitReveal>
      </header>

      <div className="process__map">
        <img
          className="process__sketch"
          src="/work/process-1100.webp"
          srcSet="/work/process-760.webp 760w, /work/process-1100.webp 1100w"
          sizes="(min-width: 1240px) 1240px, 100vw"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <svg className="process__svg" viewBox={`0 0 ${SKETCH_W} ${SKETCH_H}`} aria-hidden="true">
          <path className="process__track" d={TRACK_D} />
          {PIECES.map((d, i) => (
            <path key={i} className="process__seg" d={d} pathLength={1} />
          ))}
        </svg>
        <span className="process__line" aria-hidden="true" />
        <ol className="process__steps">
          {process.map((s, i) => {
            const L = STEP_LAYOUT[i];
            const style = {
              "--dx": pct(L.dot[0], SKETCH_W),
              "--dy": pct(L.dot[1], SKETCH_H),
              "--bx": pct(L.box[0], SKETCH_W),
              "--bw": pct(L.box[1], SKETCH_W),
            } as CSSProperties;
            return (
              <li key={s.title} className={`process__step is-${L.side}`} style={style}>
                <span className="process__dot" aria-hidden="true" />
                <div className="process__text">
                  <span className="process__num">({String(i + 1).padStart(2, "0")})</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
