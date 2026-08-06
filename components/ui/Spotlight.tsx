"use client";

import { useEffect, useRef } from "react";

import { useFinePointer } from "@/lib/hooks/useFinePointer";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Halo qui suit le curseur à l'intérieur de la carte (§9 — micro-interactions).
 *
 * Écoute son parent plutôt que lui-même : c'est la carte entière qui doit
 * réagir, et ça évite de rendre Card client uniquement pour poser un écouteur.
 *
 * Au doigt il n'y a pas de survol, donc rien à faire ; en animations réduites
 * on n'attache rien et le halo n'est jamais rendu visible.
 */
export function Spotlight() {
  const overlay = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const card = overlay.current?.parentElement;
    if (!card || !fine || reduced) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      });
    };

    card.addEventListener("pointermove", onMove);
    return () => {
      card.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
      card.style.removeProperty("--spot-x");
      card.style.removeProperty("--spot-y");
    };
  }, [fine, reduced]);

  // Rien du tout au doigt ou en animations réduites : pas de nœud inutile.
  if (!fine || reduced) return null;

  return <span ref={overlay} aria-hidden="true" className="card-spotlight" />;
}
