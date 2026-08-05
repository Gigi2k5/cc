"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently owning the top of the viewport,
 * or null while the hero is in view (no nav link should be highlighted then).
 *
 * IntersectionObserver rather than a scroll handler: no work on frames where
 * nothing crosses a boundary.
 *
 * @param ids      Section ids in document order.
 * @param offsetPx Height of the sticky nav — shrinks the band from the top.
 */
export function useScrollSpy(
  ids: readonly string[],
  offsetPx: number,
): string | null {
  const [visible, setVisible] = useState<readonly string[]>([]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisible((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            if (entry.isIntersecting) next.add(entry.target.id);
            else next.delete(entry.target.id);
          }
          return ids.filter((id) => next.has(id));
        });
      },
      {
        // Bande d'activation : du bas de la nav à 45 % de la hauteur d'écran.
        rootMargin: `-${offsetPx}px 0px -55% 0px`,
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, offsetPx]);

  // La première section visible dans l'ordre du document gagne.
  return visible[0] ?? null;
}
