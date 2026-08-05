"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether an element is on screen. Used to stop the WebGL render loop the
 * moment the hero scrolls away — the single biggest perf win of the page.
 */
export function useInView(
  ref: RefObject<HTMLElement | null>,
  rootMargin = "200px",
): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
