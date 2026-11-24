import { TLink } from "../components/Transition";
import { Roll, SplitReveal } from "../components/Motion";
import { TileField } from "../components/TileField";

export default function NotFound() {
  return (
    <main className="lost">
      <TileField density={1.2} />
      <div className="lost__inner">
        <SplitReveal as="h1" type="chars" mode="intro" random className="lost__title">
          Oops!
        </SplitReveal>
        <SplitReveal as="p" type="lines" mode="intro" delay={0.4}>
          This page doesn't exist. It may have moved, or the link has a typo.
        </SplitReveal>
        <TLink to="/" className="btn btn--ink">
          <Roll text="Back to home" /> <span className="btn__arrow" aria-hidden="true">↳</span>
        </TLink>
      </div>
    </main>
  );
}
