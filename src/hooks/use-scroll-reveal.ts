import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Observes every element carrying a `data-reveal` attribute and toggles the
 * `is-visible` class when it scrolls into view. One observer covers the whole
 * page, so sections can opt in declaratively without wiring up their own refs.
 */
export function useScrollReveal() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!elements.length) return;

    if (prefersReducedMotion()) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/**
 * Counts up from 0 to `target` once the returned ref enters the viewport.
 * Respects reduced-motion by jumping straight to the final value.
 */
export function useCountUp(target: number, durationMs = 1600) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          // easeOutCubic for a natural deceleration.
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return { ref, value };
}

/**
 * Tracks vertical scroll progress (0–1) of the whole document for the top
 * progress bar. Uses rAF throttling to stay cheap during fast scrolling.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}
