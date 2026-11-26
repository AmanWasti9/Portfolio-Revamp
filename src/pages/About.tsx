import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "../lib/motion";
import { about, journey, packages, site } from "../content";
import { TLink, useRevealed } from "../components/Transition";
import { Roll, SplitReveal } from "../components/Motion";
import { Journey } from "../components/Journey";
import { OpenSourceList, npmUrl } from "../components/OpenSource";

export default function About() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();

      // facts rows draw their rules in, one by one
      gsap.fromTo(
        ".facts__row",
        { autoAlpha: 0, y: rm ? 0 : 16 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.07, delay: 0.5 }
      );

      // the work reel slides sideways while the section is pinned
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        if (rm) return;
        const reel = root.current!.querySelector<HTMLElement>(".reel")!;
        const track = reel.querySelector<HTMLElement>(".reel__track")!;
        const distance = () => track.scrollWidth - reel.clientWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: reel,
            start: "center center",
            end: () => `+=${distance()}`,
            pin: true,
            // measured before the journey triggers below it, which were created earlier
            refreshPriority: 1,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });

      // principles: rule draws, then the row rises
      gsap.utils.toArray<HTMLElement>(".principle").forEach((row) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } })
          .fromTo(row.querySelector(".principle__rule"), { scaleX: 0 }, { scaleX: 1, duration: rm ? 0 : 1.2, ease: "expo.inOut" });
      });

      if (rm) return;
      // toolkit marquee, direction follows scroll
      const track = root.current!.querySelector<HTMLElement>(".marquee__track")!;
      const loop = gsap.to(track, { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        trigger: ".marquee",
        start: "top bottom",
        end: "bottom top",
        onUpdate(self) {
          if (self.direction !== dir) {
            dir = self.direction;
            gsap.to(loop, { timeScale: dir, duration: 0.6, ease: "power2.out", overwrite: true });
          }
        },
      });
    },
    { dependencies: [revealed], scope: root }
  );

  const tools = [...about.toolkit, ...about.toolkit];

  return (
    <main className="page about" ref={root}>
      <header className="about-head">
        <SplitReveal as="h1" type="chars" mode="intro" random className="page-head__title">
          About
        </SplitReveal>
        <SplitReveal as="p" type="lines" mode="intro" delay={0.35} className="about-head__lead">
          {about.lead}
        </SplitReveal>
      </header>

      <section className="about-intro">
        <dl className="facts">
          <div className="facts__row">
            <dt>Based</dt>
            <dd>{site.location}</dd>
          </div>
          <div className="facts__row">
            <dt>Focus</dt>
            <dd>{site.role}</dd>
          </div>
          <div className="facts__row">
            <dt>Currently</dt>
            <dd className="facts__now">
              <i className="facts__live" aria-hidden="true" />
              <span>{journey.currently}</span>
            </dd>
          </div>
          <div className="facts__row">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${site.email}`} className="link-line">
                <Roll text={site.email} />
              </a>
            </dd>
          </div>
          <div className="facts__row">
            <dt>Open source</dt>
            <dd className="facts__links">
              {packages.map((p) => (
                <a key={p.name} href={npmUrl(p.name)} target="_blank" rel="noreferrer">
                  <Roll text={p.name} />
                </a>
              ))}
            </dd>
          </div>
          <div className="facts__row">
            <dt>Elsewhere</dt>
            <dd className="facts__links">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  <Roll text={s.label} />
                </a>
              ))}
            </dd>
          </div>
        </dl>

        <div className="about-intro__text">
          {about.paragraphs.map((t) => (
            <SplitReveal key={t.slice(0, 20)} as="p" type="lines">
              {t}
            </SplitReveal>
          ))}
          <TLink to="/work" className="link-line" data-cursor="See the work">
            <Roll text="See the work" /> <span aria-hidden="true">↳</span>
          </TLink>
        </div>
      </section>

      {/* pencil drawings of how I work; the project covers already live on Home and Work */}
      <section className="reel" aria-labelledby="behind-title">
        <h2 className="case__label reel__label" id="behind-title">
          Behind the work
        </h2>
        <ul className="reel__track">
          {about.behind.map((b, i) => (
            <li key={b.img} className="reel__item" style={{ "--ar": b.w / b.h } as CSSProperties}>
              <span className="reel__img">
                <img
                  src={`/work/${b.img}-800.webp`}
                  srcSet={`/work/${b.img}-800.webp 800w, /work/${b.img}-1500.webp ${b.w}w`}
                  sizes="(min-width: 900px) 60vw, 86vw"
                  width={b.w}
                  height={b.h}
                  alt={`Pencil drawing: ${b.body}`}
                  loading="lazy"
                />
              </span>
              <span className="reel__meta">
                <span className="reel__num">({String(i + 1).padStart(2, "0")})</span>
                <b>{b.title}</b>
                <span className="reel__body">{b.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Journey />

      <OpenSourceList />

      <section className="principles">
        <h2 className="case__label">How I work</h2>
        <ul>
          {about.principles.map((pr) => (
            <li key={pr.title} className="principle">
              <span className="principle__rule" aria-hidden="true" />
              <SplitReveal as="h3" type="lines">
                {pr.title}
              </SplitReveal>
              <SplitReveal as="p" type="lines">
                {pr.body}
              </SplitReveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="marquee" aria-label="Toolkit">
        <h2 className="case__label marquee__label">Toolkit</h2>
        <div className="marquee__viewport">
          <ul className="marquee__track">
            {tools.map((t, i) => (
              <li key={i} aria-hidden={i >= about.toolkit.length ? true : undefined}>
                {t}
                <span className="marquee__dot" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
