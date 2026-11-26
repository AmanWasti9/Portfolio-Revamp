import { useRef } from "react";
import { useParams } from "react-router-dom";
import { gsap, useGSAP, reducedMotion } from "../lib/motion";
import { cover, hasCaseImage, imgSrc, imgSrcSet, projects } from "../content";
import { TLink, useRevealed } from "../components/Transition";
import { ImageReveal, Roll, SplitReveal } from "../components/Motion";
import { SketchToScreen } from "../components/SketchToScreen";
import NotFound from "./NotFound";

export default function CaseStudy() {
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return <NotFound />;
  return <Case key={slug} index={index} />;
}

function Case({ index }: { index: number }) {
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  // the device showcase is the hero when it exists; otherwise the laptop shot
  const hasShowcase = hasCaseImage(p.image, "showcase");
  const heroImg = hasShowcase ? `${p.image}-showcase` : p.image;
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      gsap.fromTo(
        ".case__meta > div",
        { autoAlpha: 0, y: rm ? 0 : 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, delay: 0.55 }
      );
      gsap.utils.toArray<HTMLElement>(".swatch").forEach((s, i) => {
        gsap.fromTo(
          s,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.1,
            ease: "expo.inOut",
            delay: i * 0.1,
            scrollTrigger: { trigger: ".case__palette", start: "top 80%", once: true },
          }
        );
      });
      gsap.fromTo(
        ".case__rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "expo.inOut", stagger: 0.1, scrollTrigger: { trigger: ".case__meta", start: "top 95%", once: true } }
      );
      if (rm) return;
      // next project image scales toward you as you reach the end
      gsap.fromTo(
        ".case__next-img img",
        { scale: 1.25 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: ".case__next", start: "top bottom", end: "bottom bottom", scrub: true } }
      );
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <main className="page case" ref={root}>
      <header className="case__head">
        <TLink to="/work" className="case__back link-line">
          <span aria-hidden="true">←</span> <Roll text="All work" />
        </TLink>
        <SplitReveal as="p" type="words" mode="intro" delay={0.2} className="case__kind">
          {`${p.kind}, ${p.year}`}
        </SplitReveal>
        <SplitReveal as="h1" type="chars" mode="intro" random className="case__title">
          {p.title}
        </SplitReveal>
        <SplitReveal as="p" type="lines" mode="intro" delay={0.45} className="case__summary">
          {p.summary}
        </SplitReveal>
      </header>

      <dl className="case__meta">
        <span className="case__rule" aria-hidden="true" />
        <div>
          <dt>Role</dt>
          <dd>{p.role}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{p.year}</dd>
        </div>
        <div>
          <dt>Tools</dt>
          <dd>{p.stack.join(", ")}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{p.kind}</dd>
        </div>
      </dl>

      <ImageReveal
        src={imgSrc(heroImg, 2000)}
        srcSet={imgSrcSet(heroImg)}
        alt={hasShowcase ? `${p.title} on desktop and mobile` : `${p.title} website shown on a laptop`}
        mode="intro"
        delay={0.35}
        parallax
        eager
        className="case__hero"
      />

      <section className="case__block">
        <h2 className="case__label">The problem</h2>
        <SplitReveal as="p" type="lines" className="case__lead">
          {p.problem}
        </SplitReveal>
      </section>

      {/* the wireframe becomes the finished page (only when both images exist) */}
      {hasCaseImage(p.image, "sketch") && hasCaseImage(p.image, "screen") && <SketchToScreen p={p} />}

      <div className="case__details">
        {p.details.map((pos, i) => {
          const slot = i === 0 ? "detail-1" : "detail-2";
          // a dedicated close-up if one exists, otherwise a zoomed crop of the main shot
          return hasCaseImage(p.image, slot) ? (
            <ImageReveal
              key={slot}
              src={imgSrc(`${p.image}-${slot}`, 1100)}
              srcSet={imgSrcSet(`${p.image}-${slot}`)}
              sizes="(min-width: 900px) 50vw, 100vw"
              alt={`${p.title} detail ${i + 1}`}
              className="case__detail"
            />
          ) : (
            <ImageReveal
              key={slot}
              src={imgSrc(p.image, 2000)}
              alt={`${p.title} detail ${i + 1}`}
              position={pos}
              zoom={1.4}
              className="case__detail"
            />
          );
        })}
      </div>

      <section className="case__block">
        <h2 className="case__label">The approach</h2>
        <div className="case__approach">
          {p.approach.map((a) => (
            <article key={a.title}>
              <SplitReveal as="h3" type="lines">
                {a.title}
              </SplitReveal>
              <SplitReveal as="p" type="lines">
                {a.body}
              </SplitReveal>
            </article>
          ))}
        </div>
      </section>

      {/* the showcase leads the page, so the original laptop scene takes this wide slot */}
      {hasShowcase && p.showPhoto !== false && (
        <ImageReveal
          src={imgSrc(p.image, 2000)}
          srcSet={imgSrcSet(p.image)}
          alt={`${p.title} website shown on a laptop`}
          parallax
          className="case__showcase"
        />
      )}

      <section className="case__block case__palette">
        <h2 className="case__label">Palette</h2>
        <div className="case__swatches">
          {p.colors.map((c) => (
            <div key={c.hex} className="swatch" style={{ background: c.hex, color: isLight(c.hex) ? "#151515" : "#fbfbf9" }}>
              <span>{c.name}</span>
              <span>{c.hex}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="case__block">
        <h2 className="case__label">The result</h2>
        <SplitReveal as="p" type="lines" className="case__lead case__lead--big">
          {p.outcome}
        </SplitReveal>
      </section>

      <TLink to={`/work/${next.slug}`} className="case__next" data-cursor="Next case">
        <span className="case__next-label">Next project</span>
        <SplitReveal as="span" type="chars" random className="case__next-title">
          {next.title}
        </SplitReveal>
        <div className="case__next-img">
          <img src={imgSrc(cover(next), 2000)} alt="" loading="lazy" />
        </div>
      </TLink>
    </main>
  );
}

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}
