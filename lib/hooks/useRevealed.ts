"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Passe à `true` la première fois que l'élément entre dans le cadre, et le
 * reste. Un seul déclencheur pour toutes les révélations du site (contenu,
 * transitions de section), afin qu'elles partagent exactement le même seuil.
 */
export function useRevealed(ref: RefObject<HTMLElement | null>): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      // Déclenche un peu avant l'entrée réelle : la cascade a le temps de
      // démarrer plutôt que de surgir sous les yeux.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, revealed]);

  return revealed;
}
