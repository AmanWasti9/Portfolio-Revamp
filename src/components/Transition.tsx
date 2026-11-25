import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate, type LinkProps } from "react-router-dom";
import { gsap, ScrollTrigger, lockScroll, reducedMotion, scrollToTop, initSmoothScroll } from "../lib/motion";
import { projects, site } from "../content";

// ─────────────────────────────────────────────────────────────
//  Full-viewport tile transition.
//  boot  → teal tiles + wordmark + counter, dissolve in random order
//  nav   → ink tiles (with a few teal "pixels") fill in random order,
//          the destination name rises in the middle, route changes,
//          tiles dissolve to reveal the new page.
// ─────────────────────────────────────────────────────────────

type TransitionCtx = {
  go: (to: string) => void;
  revealedPath: string | null;
};

const Ctx = createContext<TransitionCtx>({ go: () => {}, revealedPath: null });

export const useTransitionNav = () => useContext(Ctx).go;

/** True once the overlay has started revealing the current page. Page animations wait for this. */
export function useRevealed() {
  const { revealedPath } = useContext(Ctx);
  const { pathname } = useLocation();
  return revealedPath === pathname;
}

export function routeLabel(path: string) {
  if (path === "/") return "Home";
  if (path === "/work") return "Work";
  if (path === "/about") return "About";
  if (path === "/contact") return "Contact";
  if (path.startsWith("/work/")) {
    const p = projects.find((x) => `/work/${x.slug}` === path);
    if (p) return p.title;
  }
  return "Lost";
}

// Read once per hard load (module scope, so StrictMode double-effects can't flip it)
const FIRST_VISIT = typeof window !== "undefined" && !sessionStorage.getItem("am-booted");
if (typeof window !== "undefined") sessionStorage.setItem("am-booted", "1");

function useTileGrid() {
  const calc = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cols = w < 640 ? 6 : w < 1100 ? 10 : 14;
    const size = w / cols;
    return { cols, rows: Math.ceil(h / size) + 1 };
  };
  const [grid, setGrid] = useState(calc);
  useLayoutEffect(() => {
    let t: number;
    const onResize = () => {
      clearTimeout(t);
      t = window.setTimeout(() => setGrid(calc()), 150);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return grid;
}

function splitInto(el: HTMLElement, text: string) {
  el.innerHTML = "";
  for (const c of text) {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = c === " " ? " " : c;
    el.appendChild(s);
  }
  return el.querySelectorAll<HTMLElement>(".ch");
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [revealedPath, setRevealedPath] = useState<string | null>(null);
  const { cols, rows } = useTileGrid();

  const overlay = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const wordmark = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  const busy = useRef(true);
  const booted = useRef(false);
  const pendingNav = useRef(false);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  // ~14% of tiles get the alternate colour — random pixels in the dissolve
  const alt = useMemo(
    () => Array.from({ length: cols * rows }, () => Math.random() < 0.14),
    [cols, rows]
  );

  const tiles = () => overlay.current!.querySelectorAll<HTMLElement>(".overlay__tile");

  const reveal = useCallback(() => {
    const el = overlay.current!;
    const rm = reducedMotion();
    ScrollTrigger.refresh();
    const chars = label.current!.querySelectorAll(".ch");
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { autoAlpha: 0 });
        el.dataset.state = "idle";
        busy.current = false;
      },
    });
    if (chars.length)
      tl.to(chars, { yPercent: -110, duration: 0.4, ease: "power3.inOut", stagger: { amount: 0.12, from: "random" } });
    tl.to(
      tiles(),
      { opacity: 0, duration: rm ? 0.2 : 0.12, ease: "none", stagger: rm ? 0 : { amount: 0.5, from: "random" } },
      chars.length ? "-=0.2" : 0
    );
    // let the page start its entrance while the last tiles are still dissolving
    tl.call(() => setRevealedPath(pathRef.current), [], "<0.12");
    lockScroll(false);
  }, []);

  // ── Boot: runs once on every hard load (full version on first visit, short on reloads)
  useLayoutEffect(() => {
    initSmoothScroll();
    const el = overlay.current!;
    el.dataset.mode = "boot";
    el.dataset.state = "boot";
    lockScroll(true);
    scrollToTop(true);
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    // a direct visit to /work, /about… gets that page's title, the home page keeps the full one
    document.title =
      pathRef.current === "/" ? `${site.firstName} — ${site.role}` : `${routeLabel(pathRef.current)} — ${site.firstName}`;
    const rm = reducedMotion();

    const chars = splitInto(wordmark.current!, site.firstName);
    gsap.set(chars, { yPercent: 110 });
    const count = { v: 0 };

    let tl: gsap.core.Timeline | undefined;
    const start = () => {
      tl = gsap.timeline({
        onComplete: () => {
          booted.current = true;
          document.documentElement.classList.add("is-booted");
          el.dataset.mode = "nav";
          el.querySelector<HTMLElement>(".overlay__boot")!.style.display = "none";
          reveal();
        },
      });
      tl.to(chars, { yPercent: 0, duration: 0.7, ease: "expo.out", stagger: { amount: 0.3, from: "random" } }, 0.1);
      if (FIRST_VISIT && !rm) {
        tl.to(count, {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            counter.current!.textContent = String(Math.round(count.v)).padStart(3, "0");
          },
        }, 0);
        tl.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0);
      } else {
        counter.current!.textContent = "100";
        gsap.set(bar.current, { scaleX: 1 });
        tl.to({}, { duration: 0.35 });
      }
      tl.to(chars, { yPercent: -110, duration: 0.45, ease: "power3.inOut", stagger: { amount: 0.2, from: "random" } }, ">-0.05");
      tl.to(".overlay__meta", { autoAlpha: 0, duration: 0.25 }, "<");
    };

    // wait for the display font so the wordmark never swaps mid-animation
    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => !cancelled && start());
    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, [reveal]);

  // ── Route changes
  useLayoutEffect(() => {
    if (!booted.current) return;
    const el = overlay.current!;
    document.title = `${routeLabel(location.pathname)} — ${site.firstName}`;
    scrollToTop(true);
    if (pendingNav.current) {
      pendingNav.current = false;
    } else {
      // back / forward: cover instantly, then dissolve
      busy.current = true;
      el.dataset.mode = "nav";
      el.dataset.state = "cover";
      splitInto(label.current!, routeLabel(location.pathname));
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(tiles(), { opacity: 1 });
    }
    let r2 = 0;
    const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(reveal)));
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [location.pathname, reveal]);

  const go = useCallback(
    (to: string) => {
      const target = to.split("#")[0] || "/";
      if (busy.current) return;
      if (target === pathRef.current) {
        scrollToTop(false);
        return;
      }
      busy.current = true;
      const el = overlay.current!;
      const rm = reducedMotion();
      el.dataset.mode = "nav";
      el.dataset.state = "cover";
      lockScroll(true);
      const chars = splitInto(label.current!, routeLabel(target));
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(tiles(), { opacity: 0 });
      gsap.set(chars, { yPercent: 110 });
      gsap
        .timeline({
          onComplete: () => {
            pendingNav.current = true;
            navigate(to);
          },
        })
        .to(tiles(), { opacity: 1, duration: rm ? 0.2 : 0.08, ease: "none", stagger: rm ? 0 : { amount: 0.4, from: "random" } })
        .to(chars, { yPercent: 0, duration: 0.55, ease: "expo.out", stagger: { amount: 0.15, from: "random" } }, "-=0.18")
        .to({}, { duration: 0.12 });
    },
    [navigate]
  );

  // Pages build their scroll animations when they're revealed. Parent effects run after the
  // children's, so on the next frame every trigger (including ones below a pinned section)
  // is re-measured against the finished layout.
  useEffect(() => {
    if (!revealedPath) return;
    const r = requestAnimationFrame(() => {
      ScrollTrigger.sort(); // page order, so pins are measured before the triggers below them
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(r);
  }, [revealedPath]);

  const value = useMemo(() => ({ go, revealedPath }), [go, revealedPath]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="overlay" ref={overlay} aria-hidden="true">
        <div className="overlay__grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {alt.map((a, i) => (
            <span key={i} className={a ? "overlay__tile is-alt" : "overlay__tile"} />
          ))}
        </div>
        <div className="overlay__label">
          <span ref={label} />
        </div>
        <div className="overlay__boot">
          <span className="overlay__wordmark" ref={wordmark} />
          <div className="overlay__meta">
            <span>Portfolio ©{new Date().getFullYear()}</span>
            <span className="overlay__bar"><span ref={bar} /></span>
            <span ref={counter}>000</span>
          </div>
        </div>
      </div>
    </Ctx.Provider>
  );
}

type TLinkProps = Omit<LinkProps, "to"> & { to: string };

/** A router link that plays the tile transition before navigating. */
export function TLink({ to, onClick, ...rest }: TLinkProps) {
  const { go } = useContext(Ctx);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(to);
  };
  return <Link to={to} onClick={handle} {...rest} />;
}
