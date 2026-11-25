import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { gsap, SplitText, useGSAP, reducedMotion } from "../lib/motion";
import { testimonials } from "../content";
import { useRevealed } from "./Transition";
import { SplitReveal } from "./Motion";

// ─────────────────────────────────────────────────────────────
//  Testimonials — one big quote at a time. Lines rise in on change,
//  the previous quote's lines lift out. Arrows, progress bars and
//  swipe (touch) move between quotes. No auto-play.
// ─────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

export function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const whoRef = useRef<HTMLElement>(null);
  const revealed = useRevealed();
  const [idx, setIdx] = useState(0);
  const busy = useRef(false);
  const split = useRef<SplitText | null>(null);
  const first = useRef(true);
  const n = testimonials.length;
  const t = testimonials[idx];

  // section entrance: the bars draw in
  useGSAP(
    () => {
      if (!revealed) return;
      gsap.fromTo(
        ".tm__bar",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: reducedMotion() ? 0 : 1,
          ease: "expo.inOut",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        }
      );
    },
    { dependencies: [revealed], scope: root }
  );

  // every new quote: split into masked lines and raise them in
  useLayoutEffect(() => {
    const q = quoteRef.current!;
    split.current?.revert();
    if (reducedMotion()) {
      gsap.fromTo([q, whoRef.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      busy.current = false;
      return;
    }
    split.current = SplitText.create(q, { type: "lines", mask: "lines" });
    const lines = split.current.lines;
    // first quote waits for the section to scroll into view
    const st = first.current ? { trigger: q, start: "top 85%", once: true } : undefined;
    first.current = false;
    const tl = gsap
      .timeline({ scrollTrigger: st, onComplete: () => void (busy.current = false) })
      .set(q, { autoAlpha: 1 })
      .from(lines, { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.06 })
      .fromTo(whoRef.current!.children, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: 0.05 }, "<0.2");
    return () => {
      tl.kill();
    };
  }, [idx]);

  const go = useCallback(
    (next: number) => {
      const target = (next + n) % n;
      if (busy.current || target === idx) return;
      busy.current = true;
      if (reducedMotion() || !split.current) {
        setIdx(target);
        return;
      }
      gsap
        .timeline({ onComplete: () => setIdx(target) })
        .to(split.current.lines, { yPercent: -110, duration: 0.45, ease: "power3.inOut", stagger: 0.03 })
        .to(whoRef.current!.children, { autoAlpha: 0, duration: 0.25 }, 0);
    },
    [idx, n]
  );

  // swipe on touch screens
  const startX = useRef<number | null>(null);
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") startX.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="tm" ref={root} aria-roledescription="carousel" aria-label="What clients say">
      <header className="sec-head">
        <SplitReveal as="h2" type="chars" random className="sec-head__title">
          Kind words
        </SplitReveal>
        <span className="sec-head__count">({pad(n)})</span>
      </header>

      <div className="tm__stage" onPointerDown={onDown} onPointerUp={onUp}>
        <span className="tm__mark" aria-hidden="true">
          “
        </span>
        <figure className="tm__item" aria-live="polite">
          {/* invisible copies of every quote reserve the height of the longest one */}
          <div className="tm__quotebox">
            {testimonials.map((x, i) => (
              <p key={i} className="tm__quote tm__ghost" aria-hidden="true">
                {x.quote}
              </p>
            ))}
            <blockquote className="tm__quote" ref={quoteRef} key={idx}>
              {t.quote}
            </blockquote>
          </div>
          <figcaption className="tm__who" ref={whoRef}>
            <b>{t.name}</b>
            <span>{t.role}</span>
            {t.source && (
              <span className="tm__src">
                {t.rating ? `★ ${t.rating.toFixed(1)} on ${t.source}` : `via ${t.source}`}
              </span>
            )}
            {t.sample && <span className="tm__sample">Sample</span>}
          </figcaption>
        </figure>
      </div>

      <div className="tm__controls">
        <div className="tm__bars">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`tm__bar ${i === idx ? "is-on" : ""}`}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === idx ? "true" : undefined}
              onClick={() => go(i)}
            >
              <i />
            </button>
          ))}
        </div>
        <span className="tm__count">
          {pad(idx + 1)} / {pad(n)}
        </span>
        <div className="tm__arrows">
          <button className="tm__arrow" aria-label="Previous testimonial" onClick={() => go(idx - 1)}>
            ←
          </button>
          <button className="tm__arrow" aria-label="Next testimonial" onClick={() => go(idx + 1)}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}
