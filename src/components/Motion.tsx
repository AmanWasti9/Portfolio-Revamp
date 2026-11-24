import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, reducedMotion, finePointer } from "../lib/motion";
import { useRevealed } from "./Transition";

// ─────────────────────────────────────────────────────────────
//  SplitReveal — masked lines / words / chars rising into place.
//  mode "intro": plays as the page is revealed (hero copy)
//  mode "scroll": plays once when it enters the viewport
// ─────────────────────────────────────────────────────────────
type SplitProps = {
  as?: ElementType;
  type?: "lines" | "words" | "chars";
  mode?: "intro" | "scroll";
  delay?: number;
  random?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  [key: string]: unknown;
};

export function SplitReveal({
  as: Tag = "div",
  type = "lines",
  mode = "scroll",
  delay = 0,
  random = false,
  className,
  children,
  ...rest
}: SplitProps) {
  const ref = useRef<HTMLElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !revealed) return;
      if (reducedMotion()) {
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, delay: mode === "intro" ? delay : 0 });
        return;
      }
      SplitText.create(el, {
        type: type === "lines" ? "lines" : type === "words" ? "words,lines" : "chars,words,lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "split-line",
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          const targets = type === "lines" ? self.lines : type === "words" ? self.words : self.chars;
          const each = type === "lines" ? 0.08 : type === "words" ? 0.03 : 0.018;
          return gsap.from(targets, {
            yPercent: 115,
            duration: type === "lines" ? 1 : 0.9,
            ease: "expo.out",
            delay,
            stagger: random
              ? { amount: Math.min(0.5, targets.length * each), from: "random" }
              : each,
            scrollTrigger: mode === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
        },
      });
    },
    { dependencies: [revealed], scope: ref }
  );

  return (
    <Tag ref={ref} className={className} data-split="" {...rest}>
      {children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────
//  ImageReveal — clip-path wipe up + inner scale settle,
//  optional scroll parallax on the inner image.
// ─────────────────────────────────────────────────────────────
type ImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  parallax?: boolean;
  mode?: "intro" | "scroll";
  delay?: number;
  position?: string;
  zoom?: number;
  eager?: boolean;
};

export function ImageReveal({
  src,
  srcSet,
  sizes = "100vw",
  alt,
  className = "",
  parallax = false,
  mode = "scroll",
  delay = 0,
  position = "50% 50%",
  zoom = 1,
  eager = false,
}: ImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useRevealed();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !revealed) return;
      const img = el.querySelector("img")!;
      if (reducedMotion()) {
        gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      gsap
        .timeline({
          delay,
          scrollTrigger: mode === "scroll" ? { trigger: el, start: "top 90%", once: true } : undefined,
        })
        .fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }
        )
        .fromTo(img, { scale: zoom * 1.25 }, { scale: zoom * (parallax ? 1.12 : 1), duration: 1.6, ease: "expo.out" }, "<0.15");

      if (parallax) {
        gsap.fromTo(
          img,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }
    },
    { dependencies: [revealed], scope: ref }
  );

  return (
    <div ref={ref} className={`img-reveal ${className}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{ objectPosition: position, transformOrigin: position }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Roll — letters roll up on hover (CSS only, staggered per char)
// ─────────────────────────────────────────────────────────────
export function Roll({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`roll ${className}`} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} className="roll__c" aria-hidden="true" style={{ "--i": i } as CSSProperties}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  CursorLabel — a pill that follows the pointer over [data-cursor]
// ─────────────────────────────────────────────────────────────
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!finePointer()) return;
    const el = ref.current!;
    const text = el.querySelector("span")!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
    let active: string | null = null;
    let px = -1;
    let py = -1;

    const update = (target: Element | null) => {
      const label = target?.closest?.("[data-cursor]")?.getAttribute("data-cursor") ?? null;
      if (label !== active) {
        active = label;
        if (label) text.textContent = label;
        gsap.to(el.firstElementChild, {
          scale: label ? 1 : 0.6,
          autoAlpha: label ? 1 : 0,
          duration: label ? 0.35 : 0.2,
          ease: label ? "back.out(2)" : "power2.out",
          overwrite: true,
        });
      }
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      xTo(px);
      yTo(py);
      update(e.target as Element | null);
    };
    // content scrolls under a still pointer without pointer events: re-check on scroll
    let raf = 0;
    const onScroll = () => {
      if (px < 0 || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update(document.elementFromPoint(px, py));
      });
    };
    const leave = () => {
      active = null;
      px = -1;
      gsap.to(el.firstElementChild, { autoAlpha: 0, scale: 0.6, duration: 0.2, overwrite: true });
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <div className="cursor__pill">
        <span />
      </div>
    </div>
  );
}
