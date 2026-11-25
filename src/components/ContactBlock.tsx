import { useRef } from "react";
import { gsap, useGSAP, reducedMotion, finePointer, scrollToTop } from "../lib/motion";
import { site } from "../content";
import { TLink, useRevealed } from "./Transition";
import { Roll, SplitReveal } from "./Motion";

// kept to the outer columns so they never cross the links in the middle
const floating = [
  { w: "Concept", x: 8, y: 16 },
  { w: "Story", x: 20, y: 34 },
  { w: "Motion", x: 12, y: 56 },
  { w: "Launch", x: 6, y: 80 },
  { w: "Typography", x: 76, y: 12 },
  { w: "Grid", x: 88, y: 34 },
  { w: "Details", x: 74, y: 60 },
  { w: "Colour", x: 86, y: 80 },
];

/** The teal "start a project" block + footer, shared by every page. */
export function ContactBlock({ compact = false }: { compact?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();

      // the hand-drawn underline under "fill out the form" draws in
      gsap.fromTo(
        ".cb__form path",
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          duration: rm ? 0 : 1.1,
          ease: "power2.inOut",
          scrollTrigger: { trigger: ".cb__form", start: "top 90%", once: true },
        }
      );
      // the big links rise in one by one
      gsap.fromTo(
        ".cb__links li",
        { yPercent: rm ? 0 : 40, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: ".cb__links", start: "top 85%", once: true },
        }
      );

      // the giant word slides up out of the bottom edge as you arrive
      gsap.fromTo(
        ".cb__giant span",
        { yPercent: rm ? 0 : 60 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom bottom", scrub: 0.6 },
        }
      );

      if (rm) return;
      const words = gsap.utils.toArray<HTMLElement>(".cb__float");
      words.forEach((w, i) => {
        gsap.to(w, {
          y: (i % 2 ? -1 : 1) * (8 + (i % 3) * 5),
          rotation: (i % 2 ? -1 : 1) * 3,
          duration: 2.4 + (i % 4) * 0.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      if (!finePointer()) return;
      const movers = words.map((w, i) => ({
        x: gsap.quickTo(w, "x", { duration: 1.4, ease: "power3" }),
        k: (i % 2 ? -1 : 1) * (14 + (i % 4) * 8),
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        movers.forEach((m) => m.x(nx * m.k));
      };
      root.current!.addEventListener("pointermove", onMove);
      return () => root.current?.removeEventListener("pointermove", onMove);
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <footer className={`cb ${compact ? "cb--compact" : ""}`} ref={root}>
      {!compact && (
        <div className="cb__stage">
          {floating.map((f) => (
            <span key={f.w} className="cb__float" style={{ left: `${f.x}%`, top: `${f.y}%` }} aria-hidden="true">
              {f.w}
            </span>
          ))}

          <div className="cb__center">
            <SplitReveal as="p" className="cb__kicker" type="words">
              Have an idea in mind?
            </SplitReveal>

            <ul className="cb__links">
              <li>
                <a href={`mailto:${site.email}`} data-cursor={site.email}>
                  <Roll text="Email" />
                </a>
              </li>
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" data-cursor={`Open ${s.label}`}>
                    <Roll text={s.label} />
                    <span className="cb__arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>

            <TLink to="/contact" className="cb__form">
              <Roll text="fill out the form" /> <span aria-hidden="true">↳</span>
              <svg viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
                <path pathLength={1000} d="M3 10C48 4 96 13 150 8s104-5 147 2" />
              </svg>
            </TLink>
          </div>
        </div>
      )}

      <div className="cb__bottom">
        {compact ? (
          <div className="cb__socials">
            {site.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                <Roll text={s.label} />
              </a>
            ))}
          </div>
        ) : (
          <a className="cb__email" href={`mailto:${site.email}`}>
            <Roll text={site.email} />
          </a>
        )}
        <p>© {new Date().getFullYear()} {site.firstName}. Designed and built by me.</p>
        <button className="cb__top" onClick={() => scrollToTop(false)}>
          <Roll text="Back to top" /> <span aria-hidden="true">↑</span>
        </button>
      </div>

      <div className="cb__giant" aria-hidden="true">
        <span>Let's talk</span>
      </div>
    </footer>
  );
}
