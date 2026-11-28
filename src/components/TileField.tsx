import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion, finePointer } from "../lib/motion";
import { useRevealed } from "./Transition";

// ─────────────────────────────────────────────────────────────
//  A field of blue squares. Tiles light up under the pointer
//  and fade back, leaving a short trail. Decorative only.
// ─────────────────────────────────────────────────────────────

type Props = { className?: string; density?: number };

export function TileField({ className = "", density = 1 }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const revealed = useRevealed();
  const [grid, setGrid] = useState({ cols: 14, rows: 9, size: 100 });

  useLayoutEffect(() => {
    const el = root.current!;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cols = Math.round((w < 640 ? 6 : w < 1100 ? 10 : 14) * density);
      const size = w / cols;
      setGrid({ cols, rows: Math.ceil(h / size), size });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [density]);

  const { cols, rows, size } = grid;

  // brighter near the top, random per tile — a pixel gradient
  const base = useMemo(
    () =>
      Array.from({ length: cols * rows }, (_, i) => {
        const r = Math.floor(i / cols) / Math.max(1, rows - 1);
        const v = Math.random();
        const falloff = 1 - r * 0.9;
        return v < 0.2 ? 0 : Math.min(0.85, (0.08 + v * 0.55) * falloff);
      }),
    [cols, rows]
  );

  useGSAP(
    () => {
      const el = root.current!;
      const tiles = gsap.utils.toArray<HTMLElement>(".tf__tile", el);
      if (!revealed) {
        gsap.set(tiles, { opacity: 0 });
        return;
      }
      const rm = reducedMotion();
      gsap.to(tiles, {
        opacity: (i) => base[i],
        duration: rm ? 0.4 : 0.25,
        ease: "none",
        stagger: rm ? 0 : { amount: 0.9, from: "random" },
      });

      if (rm || !finePointer()) return;

      // pointer trail
      let last = -1;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const c = Math.floor((e.clientX - r.left) / size);
        const rr = Math.floor((e.clientY - r.top) / size);
        if (c < 0 || rr < 0 || c >= cols || rr >= rows) return;
        const i = rr * cols + c;
        if (i === last) return;
        last = i;
        const t = tiles[i];
        if (!t) return;
        gsap.killTweensOf(t);
        gsap.set(t, { opacity: 1 });
        gsap.to(t, { opacity: base[i], duration: 1.6, ease: "power2.out", delay: 0.15 });
      };
      const host = el.closest("section, main") ?? el;
      host.addEventListener("pointermove", onMove as EventListener);
      return () => host.removeEventListener("pointermove", onMove as EventListener);
    },
    { dependencies: [revealed, cols, rows, size], scope: root }
  );

  return (
    <div className={`tf ${className}`} ref={root} aria-hidden="true">
      <div className="tf__grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {base.map((_, i) => (
          <span key={i} className="tf__tile" />
        ))}
      </div>
    </div>
  );
}
