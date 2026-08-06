"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

/** Rendus nécessaires pour que matériaux et environnement se résolvent. */
const WARMUP_FRAMES = 8;

/**
 * En mode « demand » (animations réduites, ou onglet caché), on force quelques
 * rendus puis l'image reste figée — sans ça la scène ne s'affiche jamais.
 *
 * Enchaînement de requestAnimationFrame et non setInterval : chaque invalidate
 * suit une frame réellement produite. Avec un timer, sur une machine lente (ou
 * un rendu logiciel), les appels s'accumulent plus vite qu'ils ne se consomment
 * et la scène continue de rendre longtemps après.
 */
export function WarmUpThenFreeze() {
  const invalidate = useThree((state) => state.invalidate);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    let rendered = 0;
    let frame = 0;

    const step = () => {
      invalidate();
      if (++rendered < WARMUP_FRAMES) frame = requestAnimationFrame(step);
      else done.current = true;
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [invalidate]);

  return null;
}
