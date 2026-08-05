"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDeviceTier } from "@/lib/hooks/useDeviceTier";
import { useInView } from "@/lib/hooks/useInView";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

import { HeroFallback } from "./HeroFallback";

/**
 * Frontière client/3D. La scène part dans son propre chunk chargé après
 * l'hydratation : three + drei + postprocessing ne touchent jamais le chemin
 * critique du hero, qui est du texte et doit s'afficher immédiatement.
 */
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  // Le repli CSS sert d'écran d'attente : jamais de trou noir.
  loading: () => <HeroFallback />,
});

/**
 * Où poser la puce dans le cadre, en coordonnées normalisées du canvas.
 * `x`/`y` : 0 = haut/gauche, 1 = bas/droite. `diameter` : fraction de la
 * hauteur du canvas.
 *
 * Même paramétrage que la maquette (`focal-x` / `focal-y`) : c'est la mise en
 * page qui décide où va la puce, pas la scène.
 */
export type ChipFocus = { x: number; y: number; diameter: number };

/** Desktop : à droite du titre, comme la maquette (66 % / 50 %, ~58 % de haut). */
const DESKTOP_FOCUS: ChipFocus = { x: 0.66, y: 0.5, diameter: 0.58 };

export function HeroCanvas({
  /**
   * Emplacement réservé dans le flux mobile. Quand il est présent, la puce s'y
   * cale au lieu de flotter derrière le texte — c'est la composition mobile
   * validée (la puce est un élément du flux, pas un fond).
   */
  slotRef,
}: {
  slotRef?: React.RefObject<HTMLElement | null>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const tier = useDeviceTier();
  const reduced = useReducedMotion();
  const inView = useInView(container);

  const [focus, setFocus] = useState<ChipFocus>(DESKTOP_FOCUS);

  const measure = useCallback(() => {
    const box = container.current?.getBoundingClientRect();
    const slot = slotRef?.current?.getBoundingClientRect();

    // Emplacement absent (ou masqué en desktop) : cadrage desktop.
    if (!box || !slot || slot.height === 0) {
      setFocus(DESKTOP_FOCUS);
      return;
    }

    setFocus({
      x: (slot.left + slot.width / 2 - box.left) / box.width,
      y: (slot.top + slot.height / 2 - box.top) / box.height,
      diameter: slot.height / box.height,
    });
  }, [slotRef]);

  useEffect(() => {
    measure();

    const observer = new ResizeObserver(measure);
    if (container.current) observer.observe(container.current);
    if (slotRef?.current) observer.observe(slotRef.current);

    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, slotRef]);

  const showScene = tier === "high" || tier === "low";

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {showScene ? (
        <HeroScene
          quality={tier === "high" ? "high" : "low"}
          animate={!reduced}
          parallax={tier === "high"}
          active={inView}
          focus={focus}
        />
      ) : (
        <HeroFallback />
      )}
    </div>
  );
}
