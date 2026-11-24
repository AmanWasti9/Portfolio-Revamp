import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { gsap, ScrollTrigger, useGSAP, lockScroll, reducedMotion } from "../lib/motion";
import { site } from "../content";
import { TLink, useRevealed } from "./Transition";
import { Roll } from "./Motion";

const links = [
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Nav() {
  const { pathname } = useLocation();
  const revealed = useRevealed();
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // entrance after every reveal
  useGSAP(
    () => {
      if (!revealed) return;
      gsap.fromTo(
        ".nav__item",
        { yPercent: -120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.05, delay: 0.45 }
      );
    },
    { dependencies: [revealed], scope: bar }
  );

  // hide on scroll down, show on scroll up
  useEffect(() => {
    const el = bar.current!;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const y = self.scroll();
        el.classList.toggle("is-scrolled", y > 40);
        el.classList.toggle("is-hidden", self.direction === 1 && y > 240);
      },
    });
    return () => st.kill();
  }, []);

  // menu open / close (skip the first run so we never unlock scroll during the preloader)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const el = menu.current!;
    const rm = reducedMotion();
    lockScroll(open);
    if (open) {
      gsap
        .timeline()
        .set(el, { visibility: "visible" })
        .fromTo(el, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: rm ? 0.01 : 0.8, ease: "expo.inOut" })
        .fromTo(".menu__link .roll", { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, "-=0.35")
        .fromTo(".menu__foot", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, "-=0.6");
    } else if (el.style.visibility === "visible") {
      gsap.to(el, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: rm ? 0.01 : 0.6,
        ease: "expo.inOut",
        onComplete: () => gsap.set(el, { visibility: "hidden" }),
      });
    }
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className="nav" ref={bar}>
        <TLink to="/" className="nav__brand nav__item" aria-label={`${site.firstName}, home`}>
          <Roll text={site.firstName} />
          <sup>©{String(new Date().getFullYear()).slice(2)}</sup>
        </TLink>

        <p className="nav__status nav__item">
          <i aria-hidden="true" /> Available for new projects
        </p>

        <nav className="nav__links" aria-label="Main">
          {links.map((l) => (
            <TLink
              key={l.to}
              to={l.to}
              className={`nav__link nav__item ${pathname.startsWith(l.to) ? "is-active" : ""}`}
              aria-current={pathname.startsWith(l.to) ? "page" : undefined}
            >
              <Roll text={l.label} />
            </TLink>
          ))}
        </nav>

        <button
          className="nav__burger nav__item"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          <Roll text={open ? "Close" : "Menu"} />
        </button>
      </header>

      <div className="menu" id="menu" ref={menu} style={{ visibility: "hidden" }}>
        <nav className="menu__links" aria-label="Mobile">
          {[{ to: "/", label: "Home" }, ...links].map((l) => (
            <TLink key={l.to} to={l.to} className="menu__link" onClick={() => setOpen(false)}>
              <Roll text={l.label} />
            </TLink>
          ))}
        </nav>
        <div className="menu__foot">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <div>
            {site.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
