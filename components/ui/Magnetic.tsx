"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { MAGNETIC } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Attraction magnétique légère (§9). Le déplacement est porté par ce conteneur
 * et non par l'enfant : le Button a déjà ses propres `translate` et `scale` au
 * survol, et Tailwind v4 les écrit sur la propriété `translate` — les deux
 * s'écraseraient.
 *
 * Désactivée au doigt et en animations réduites : dans ces cas le conteneur ne
 * fait rien du tout, pas même écouter.
 */
export function Magnetic({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const wrapper = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = wrapper.current;
    if (!element || !fine || reduced) return;

    let frame = 0;

    const apply = (x: number, y: number) => {
      element.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
    };

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const clamp = (value: number) =>
          Math.max(-MAGNETIC.max, Math.min(MAGNETIC.max, value * MAGNETIC.strength));
        apply(clamp(dx), clamp(dy));
      });
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      apply(0, 0);
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);

    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      element.style.translate = "";
    };
  }, [fine, reduced]);

  return (
    <span
      ref={wrapper}
      data-magnetic={fine && !reduced ? "on" : undefined}
      className={cn(
        // 150 ms (§9 « micro ») : la transition sert de lissage entre deux
        // frames de pointeur. Plus long, le bouton traîne derrière le curseur.
        "inline-block transition-[translate] duration-[var(--duration-micro)] ease-micro",
        className,
      )}
    >
      {children}
    </span>
  );
}
