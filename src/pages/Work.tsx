import { cover, imgSrc, imgSrcSet, projects } from "../content";
import { TLink } from "../components/Transition";
import { ImageReveal, SplitReveal } from "../components/Motion";

export default function Work() {
  return (
    <main className="page page-work">
      <header className="page-head">
        <SplitReveal as="h1" type="chars" mode="intro" random className="page-head__title">
          Work
        </SplitReveal>
        <span className="page-head__count">({String(projects.length).padStart(2, "0")})</span>
        <SplitReveal as="p" type="lines" mode="intro" delay={0.4} className="page-head__lead">
          A few things I've designed and built, from AI tools to online stores.
        </SplitReveal>
      </header>

      <div className="wgrid">
        {projects.map((p, i) => (
          <TLink key={p.slug} to={`/work/${p.slug}`} className="wcard" data-cursor="View case">
            <ImageReveal
              src={imgSrc(cover(p), 1100)}
              srcSet={imgSrcSet(cover(p))}
              sizes="(min-width: 900px) 50vw, 100vw"
              alt={`${p.title}, ${p.kind}`}
              mode={i < 2 ? "intro" : "scroll"}
              delay={i < 2 ? 0.2 + i * 0.12 : 0}
              eager={i < 2}
              className="wcard__img"
            />
            <div className="wcard__meta">
              <SplitReveal as="h2" type="chars" random mode={i < 2 ? "intro" : "scroll"} delay={i < 2 ? 0.5 : 0.1}>
                {p.title}
              </SplitReveal>
              <span>{p.kind}</span>
              <span>{p.year}</span>
            </div>
          </TLink>
        ))}
      </div>
    </main>
  );
}
