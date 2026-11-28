import { useRef, type CSSProperties } from "react";
import { gsap, useGSAP, reducedMotion } from "../lib/motion";
import { imgSrc, imgSrcSet, type Project } from "../content";
import { useRevealed } from "./Transition";
import { SplitReveal } from "./Motion";
import ratios from "../generated/screen-ratios.json";

// ─────────────────────────────────────────────────────────────
//  Sketch to screen — the pencil wireframe of a project's first screen
//  turns into the finished page as you scroll. Both images are the same
//  size and layout (made by `npm run sketches`), so every box lines up.
//  Desktop: the frame pins while a blue line sweeps across it.
//  Phones: no pin; the sweep follows the frame through the screen.
// ─────────────────────────────────────────────────────────────
export function SketchToScreen({ p }: { p: Project }) {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();
  // width ÷ height of this project's screen, written by `npm run images`
  const ratio = (ratios as Record<string, number>)[p.image] ?? 16 / 9;

  useGSAP(
    () => {
      if (!revealed) return;
      const el = root.current!;
      const sketch = el.querySelector<HTMLElement>(".s2s__sketch")!;
      const wipe = el.querySelector<HTMLElement>(".s2s__wipe")!;
      const tags = el.querySelectorAll<HTMLElement>(".s2s__tag");
      // the sketch is cut away from the left, so the screen appears behind the line
      const at = (pct: number) => {
        sketch.style.clipPath = `inset(0 0 0 ${pct}%)`;
        wipe.style.left = `${pct}%`;
        tags[0].style.opacity = pct > 12 ? "1" : "0"; // "Screen" (left)
        tags[1].style.opacity = pct < 88 ? "1" : "0"; // "Sketch" (right)
      };

      if (reducedMotion()) {
        at(50); // no movement: show both halves
        return;
      }
      at(0);
      const state = { v: 0 };
      const mm = gsap.matchMedia();
      const sweep = (scrollTrigger: ScrollTrigger.Vars) =>
        gsap
          .timeline({ scrollTrigger })
          .to({}, { duration: 0.12 }) // a beat on the sketch first
          .to(state, { v: 100, duration: 1, ease: "power1.inOut", onUpdate: () => at(state.v) })
          .to({}, { duration: 0.12 }); // and a beat on the finished page

      mm.add("(min-width: 900px)", () => {
        sweep({ trigger: el, start: "center center", end: "+=130%", pin: true, scrub: 0.6, refreshPriority: 1 });
      });
      mm.add("(max-width: 899px)", () => {
        sweep({ trigger: el.querySelector(".s2s__frame"), start: "top 80%", end: "bottom 30%", scrub: 0.5 });
      });
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <section className="s2s" ref={root} aria-labelledby={`s2s-${p.slug}`}>
      <header className="s2s__head">
        <h2 className="case__label" id={`s2s-${p.slug}`}>
          From sketch to screen
        </h2>
        <SplitReveal as="p" type="lines" className="s2s__lead">
          The wireframe and the finished page, drawn to the same layout. Scroll to watch one become the other.
        </SplitReveal>
      </header>

      <div className="s2s__frame" style={{ "--r": ratio } as CSSProperties}>
        {/* the browser bar also says which side is which, so the tags never cover the page */}
        <div className="s2s__bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span className="s2s__tag s2s__tag--screen">← Screen</span>
          <span className="s2s__tag s2s__tag--sketch">Sketch →</span>
        </div>
        <div className="s2s__view">
          <img
            className="s2s__screen"
            src={imgSrc(`${p.image}-screen`, 2000)}
            srcSet={imgSrcSet(`${p.image}-screen`)}
            sizes="(min-width: 900px) 80vw, 100vw"
            alt={`${p.title}: the finished first screen`}
            loading="lazy"
          />
          <img
            className="s2s__sketch"
            src={imgSrc(`${p.image}-sketch`, 2000)}
            srcSet={imgSrcSet(`${p.image}-sketch`)}
            sizes="(min-width: 900px) 80vw, 100vw"
            alt={`${p.title}: the same screen as a pencil wireframe`}
            loading="lazy"
          />
          <span className="s2s__wipe" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
