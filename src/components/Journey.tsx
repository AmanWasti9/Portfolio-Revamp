import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "../lib/motion";
import { journey } from "../content";
import { useRevealed } from "./Transition";
import { SplitReveal } from "./Motion";

// ─────────────────────────────────────────────────────────────
//  Journey — a giant year stays pinned on the left and rolls to the
//  entry that is crossing the middle of the screen.
// ─────────────────────────────────────────────────────────────
export function Journey() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();
  const [active, setActive] = useState(0);
  const n = journey.entries.length;

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      gsap.utils.toArray<HTMLElement>(".journey__item").forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 88%", once: true } })
          .fromTo(item.querySelector(".journey__rule"), { scaleX: 0 }, { scaleX: 1, duration: rm ? 0 : 1.2, ease: "expo.inOut" })
          .fromTo(
            item.querySelectorAll(".journey__when, h3, p"),
            { y: rm ? 0 : 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.07 },
            "<0.25"
          );
      });
    },
    { dependencies: [revealed], scope: root }
  );

  // roll the pinned year to the active entry
  useEffect(() => {
    gsap.to(root.current!.querySelector(".journey__years"), {
      yPercent: (-100 * active) / n,
      duration: reducedMotion() ? 0 : 0.9,
      ease: "expo.out",
      overwrite: true,
    });
  }, [active, n]);

  return (
    <section className="journey" ref={root} id="journey">
      <header className="journey__head">
        <SplitReveal as="h2" type="chars" random className="sec-head__title">
          {journey.title}
        </SplitReveal>
        <div className="journey__intro">
          {journey.intro.map((t) => (
            <SplitReveal key={t.slice(0, 16)} as="p" type="lines">
              {t}
            </SplitReveal>
          ))}
        </div>
      </header>

      <div className="journey__grid">
        <div className="journey__pin" aria-hidden="true">
          <div className="journey__mask">
            <div className="journey__years">
              {journey.entries.map((e) => (
                <span key={e.year}>{e.year}</span>
              ))}
            </div>
          </div>
        </div>

        <ol className="journey__list">
          {journey.entries.map((e, i) => (
            <li key={e.year} className={`journey__item ${i === active ? "is-active" : ""}`}>
              <span className="journey__rule" aria-hidden="true" />
              <span className="journey__when">
                {e.year === "Now" && <i aria-hidden="true" />}
                {e.year}
              </span>
              <h3>{e.title}</h3>
              <p>{e.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

