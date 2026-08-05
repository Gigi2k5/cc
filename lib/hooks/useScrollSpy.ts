"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently owning the top of the viewport,
 * or null while the hero is in view (no nav link should be highlighted then).
 *
 * Règle : **la dernière section dont le haut a franchi la ligne d'activation
 * gagne.** Avec un IntersectionObserver, deux sections voisines intersectent
 * souvent la même bande et il faut alors arbitrer ; « la première dans l'ordre
 * du document » se trompe dès qu'une section est plus courte que la bande.
 * Une comparaison de positions ne souffre pas de ce cas.
 *
 * @param ids      Section ids in document order.
 * @param offsetPx Height of the sticky nav — pushes the activation line down.
 */
export function useScrollSpy(
  ids: readonly string[],
  offsetPx: number,
): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const compute = () => {
      const line = window.scrollY + offsetPx + 24;
      let current: string | null = null;

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;

        const top = element.getBoundingClientRect().top + window.scrollY;
        if (top > line) break;
        current = id;
      }

      setActive(current);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        compute();
        frame = 0;
      });
    };

    // Premier calcul via rAF aussi : pas de setState synchrone dans l'effet.
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, offsetPx]);

  return active;
}
