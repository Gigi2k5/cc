"use client";

import { useEffect, useRef, type RefObject } from "react";

export type ScrollSignals = {
  /** Position de scroll en px. */
  y: number;
  /**
   * 0 → 1 selon la proximité de la section cible avec le centre de l'écran.
   * Pilote l'intensification du réseau sur la section Communauté.
   */
  boost: number;
};

/**
 * Signaux de scroll exposés par une **ref** et non par un state : ils sont lus
 * dans une boucle de rendu WebGL à chaque frame, un setState par événement de
 * scroll ferait re-rendre React pour rien.
 */
export function useScrollSignals(focusId: string): RefObject<ScrollSignals> {
  const signals = useRef<ScrollSignals>({ y: 0, boost: 0 });

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      signals.current.y = window.scrollY;

      const target = document.getElementById(focusId);
      if (!target) {
        signals.current.boost = 0;
        return;
      }

      const rect = target.getBoundingClientRect();
      const viewport = window.innerHeight;
      /* Distance entre le centre de la section et celui de l'écran. La plage
         est plus courte qu'une hauteur d'écran (0,8) : sinon l'intensification
         déborde sur la FAQ voisine, dont le texte est dense. */
      const distance = Math.abs(rect.top + rect.height / 2 - viewport / 2);
      signals.current.boost = Math.max(0, 1 - distance / (viewport * 0.8));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        compute();
        frame = 0;
      });
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [focusId]);

  return signals;
}
