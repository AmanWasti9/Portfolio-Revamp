import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "../lib/motion";
import { packages, type NpmPackage } from "../content";
import { useRevealed } from "./Transition";
import { Roll, SplitReveal } from "./Motion";

// ─────────────────────────────────────────────────────────────
//  Open source — npm packages with live download stats.
//  Counts come from api.npmjs.org (public, CORS-enabled). If the request
//  fails, the fallback numbers in content.ts are shown instead.
// ─────────────────────────────────────────────────────────────

type Stats = { total: number; monthly: number[]; live: boolean };

const iso = (d: Date) => d.toISOString().slice(0, 10);
export const npmUrl = (name: string) => `https://www.npmjs.com/package/${name}`;
const fmt = (n: number) => n.toLocaleString("en-US");

async function fetchStats(p: NpmPackage): Promise<Stats> {
  const today = new Date();
  // the npm range API covers at most 18 months
  const earliest = new Date(today.getTime() - 540 * 864e5);
  const start = new Date(Math.max(new Date(p.published).getTime(), earliest.getTime()));
  const res = await fetch(`https://api.npmjs.org/downloads/range/${iso(start)}:${iso(today)}/${p.name}`);
  if (!res.ok) throw new Error(String(res.status));
  const data: { downloads: { day: string; downloads: number }[] } = await res.json();
  const byMonth = new Map<string, number>();
  let total = 0;
  for (const d of data.downloads) {
    total += d.downloads;
    const m = d.day.slice(0, 7);
    byMonth.set(m, (byMonth.get(m) ?? 0) + d.downloads);
  }
  return { total, monthly: [...byMonth.values()], live: true };
}

function useNpmStats(p: NpmPackage) {
  const [stats, setStats] = useState<Stats>({ ...p.fallback, live: false });
  useEffect(() => {
    let alive = true;
    fetchStats(p)
      .then((s) => alive && s.total >= p.fallback.total && setStats(s))
      .catch(() => {}); // keep the fallback
    return () => {
      alive = false;
    };
  }, [p]);
  return stats;
}

/** Monthly downloads as a smooth area line. */
function Spark({ values }: { values: number[] }) {
  const W = 320;
  const H = 70;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const pts = values.map((v, i) => [i * step, H - 6 - (v / max) * (H - 14)] as const);
  const line = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    const mx = (px + x) / 2;
    return `${d} C${mx} ${py} ${mx} ${y} ${x} ${y}`;
  }, "");
  const last = pts[pts.length - 1]; // the dot marks the latest month
  return (
    <div className="oss__spark" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path className="oss__area" d={`${line} L${W} ${H} L0 ${H} Z`} />
        <path className="oss__line" d={line} />
      </svg>
      {/* an HTML dot, so the stretched chart can't squash it into an oval */}
      <span className="oss__peak" style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%` }} />
    </div>
  );
}

function Package({ p, index }: { p: NpmPackage; index: number }) {
  const stats = useNpmStats(p);
  const num = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  const cmd = `npm i ${p.name}`;

  // The number is written by hand, not rendered by React, because the
  // count-up animation also writes to it. Before the count-up runs (or after it
  // finished) a live update just sets the new total.
  useEffect(() => {
    const el = num.current!;
    const pkg = el.closest<HTMLElement>(".oss__pkg")!;
    if (!pkg.dataset.counting) el.textContent = fmt(stats.total);
  }, [stats.total]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const first = new Date(p.published).toLocaleString("en-US", { month: "short", year: "numeric" });

  return (
    <li className="oss__pkg" data-total={stats.total}>
      <span className="oss__rule" aria-hidden="true" />
      {/* Layout (desktop): name across the top; the data under it on the left, so the
          chart's timeline starts on the same edge as the name; what it does and how to
          install it on the right. Phones: name → text → data. */}
      <div className="oss__top">
        <span className="oss__idx">({String(index + 1).padStart(2, "0")})</span>
        <h3 className="oss__name">
          <a href={npmUrl(p.name)} target="_blank" rel="noreferrer" data-cursor="View on npm">
            {p.name}
          </a>
        </h3>
      </div>
      <div className="oss__text">
        {/* two groups: "what it is" aligns with the top of the number,
            "get it" aligns with the facts row at the bottom */}
        <div className="oss__about">
          <p className="oss__summary">{p.summary}</p>
          <ul className="oss__tags">
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div className="oss__get">
          <div className="oss__cmd">
            <code>
              <span aria-hidden="true">$</span> {cmd}
            </code>
            <button onClick={copy} aria-label={`Copy install command for ${p.name}`}>
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="sr-only" role="status">
              {copied ? "Install command copied" : ""}
            </span>
          </div>
          <a className="link-line oss__npm" href={npmUrl(p.name)} target="_blank" rel="noreferrer">
            <Roll text="View on npm" /> <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="oss__stats">
        <div className="oss__big">
          <span className="oss__count" ref={num} />
          <span className="oss__label">
            downloads since {first}
            {stats.live && <i className="oss__live" title="Live from npm" />}
          </span>
        </div>
        <Spark values={stats.monthly} />
        <dl className="oss__facts">
          <div>
            <dt>Size</dt>
            <dd>{p.gzip} gzip</dd>
          </div>
          <div>
            <dt>Dependencies</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{p.version}</dd>
          </div>
          <div>
            <dt>Types</dt>
            <dd>TypeScript</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

export function OpenSource() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      gsap.utils.toArray<HTMLElement>(".oss__pkg").forEach((pkg) => {
        const count = pkg.querySelector<HTMLElement>(".oss__count")!;
        const tl = gsap.timeline({ scrollTrigger: { trigger: pkg, start: "top 80%", once: true } });
        tl.fromTo(pkg.querySelector(".oss__rule"), { scaleX: 0 }, { scaleX: 1, duration: rm ? 0 : 1.2, ease: "expo.inOut" })
          .fromTo(
            pkg.querySelectorAll(".oss__top > *, .oss__about > *, .oss__get > *"),
            { y: rm ? 0 : 22, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.06 },
            "<0.3"
          )
          // the chart wipes in left to right, then the "latest month" dot pops
          .fromTo(
            pkg.querySelector(".oss__spark"),
            { clipPath: "inset(-10% 100% -10% 0%)" },
            { clipPath: "inset(-10% -2% -10% 0%)", duration: rm ? 0 : 1.4, ease: "power2.inOut" },
            "<0.1"
          )
          .fromTo(pkg.querySelector(".oss__peak"), { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, ">-0.1");

        // count up to the current total (the live number if it has arrived)
        const counter = { v: 0 };
        tl.to(
          counter,
          {
            v: () => Number(pkg.dataset.total) || 0,
            duration: rm ? 0 : 1.6,
            ease: "power3.out",
            onStart() {
              pkg.dataset.counting = "1";
              count.textContent = "0";
            },
            onUpdate() {
              count.textContent = fmt(Math.round(counter.v));
            },
            onComplete() {
              count.textContent = fmt(Number(pkg.dataset.total) || 0);
              delete pkg.dataset.counting;
            },
          },
          0.3
        );
      });
    },
    { dependencies: [revealed], scope: root }
  );

  const total = packages.reduce((n, p) => n + p.fallback.total, 0);

  return (
    <section className="oss" ref={root} id="open-source">
      <header className="sec-head oss__head">
        <SplitReveal as="h2" type="chars" random className="sec-head__title">
          Open source
        </SplitReveal>
        <span className="sec-head__count">({String(packages.length).padStart(2, "0")})</span>
        <SplitReveal as="p" type="lines" className="oss__intro">
          {`Small React hooks I built and published on npm for other developers to use. ${fmt(total)}+ downloads so far, zero dependencies, fully typed.`}
        </SplitReveal>
      </header>
      <ul className="oss__list">
        {packages.map((p, i) => (
          <Package key={p.name} p={p} index={i} />
        ))}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  Compact list for the About page: one row per package, same live stats.
// ─────────────────────────────────────────────────────────────
function PackageRow({ p }: { p: NpmPackage }) {
  const stats = useNpmStats(p);
  return (
    <li className="oss-row">
      <span className="oss-row__rule" aria-hidden="true" />
      <a className="oss-row__name" href={npmUrl(p.name)} target="_blank" rel="noreferrer" data-cursor="View on npm">
        {p.name}
      </a>
      <p className="oss-row__summary">{p.summary}</p>
      <div className="oss-row__stats">
        <b>
          {fmt(stats.total)}
          {stats.live && <i className="oss__live" title="Live from npm" />}
        </b>
        <span>downloads · {p.gzip} · 0 deps</span>
      </div>
      <span className="oss-row__arrow" aria-hidden="true">
        ↗
      </span>
    </li>
  );
}

export function OpenSourceList() {
  const root = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      if (!revealed) return;
      const rm = reducedMotion();
      gsap.utils.toArray<HTMLElement>(".oss-row").forEach((row) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } })
          .fromTo(row.querySelector(".oss-row__rule"), { scaleX: 0 }, { scaleX: 1, duration: rm ? 0 : 1.2, ease: "expo.inOut" })
          .fromTo(
            row.querySelectorAll(".oss-row__name, .oss-row__summary, .oss-row__stats"),
            { y: rm ? 0 : 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.06 },
            "<0.3"
          );
      });
    },
    { dependencies: [revealed], scope: root }
  );

  return (
    <section className="oss-mini" ref={root} aria-label="Open source">
      <h2 className="case__label">Open source</h2>
      <p className="oss-mini__intro">React hooks I've published on npm for other developers.</p>
      <ul>
        {packages.map((p) => (
          <PackageRow key={p.name} p={p} />
        ))}
      </ul>
    </section>
  );
}
