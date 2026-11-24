import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "../lib/motion";
import { about, cover, imgSrc, imgSrcSet, journey, projects, site } from "../content";
import { TLink, useRevealed } from "../components/Transition";
import { Roll, SplitReveal } from "../components/Motion";
import { Journey } from "../components/Journey";

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
            <dd>
              <i className="facts__live" aria-hidden="true" />
              {journey.entries[0].title}
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

      <section className="reel" aria-label="Selected work">
        <ul className="reel__track">
          {projects.map((p) => (
            <li key={p.slug}>
              <TLink to={`/work/${p.slug}`} className="reel__item" data-cursor="View case">
                <span className="reel__img">
                  <img
                    src={imgSrc(cover(p), 1100)}
                    srcSet={imgSrcSet(cover(p))}
                    sizes="(min-width: 900px) 56vw, 86vw"
                    alt={`${p.title}, ${p.kind}`}
                    loading="lazy"
                  />
                </span>
                <span className="reel__meta">
                  <b>{p.title}</b>
                  <span>{p.kind}</span>
                </span>
              </TLink>
            </li>
          ))}
        </ul>
      </section>

      <Journey />

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
