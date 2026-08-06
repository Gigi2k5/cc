"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

import { useRevealed } from "@/lib/hooks/useRevealed";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Décalage de la cascade en ms (§9 : 60–80 ms entre éléments). */
  delay?: number;
  className?: string;
  /** `li`, `div`… selon le contexte sémantique. */
  as?: "div" | "li" | "span";
};

/**
 * Révélation au scroll : fade + 24px vers le haut, cascade par `delay` (§9).
 *
 * IntersectionObserver + CSS plutôt que framer-motion : pour un fondu-montée,
 * c'est le même rendu sans embarquer une librairie d'animation dans le bundle.
 *
 * L'état initial invisible est déclaré sous `@media (scripting: enabled)` : si
 * le JS ne s'exécute pas, le contenu s'affiche normalement au lieu de rester
 * invisible pour toujours (§12 — lisible sans les effets).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const element = useRef<HTMLElement>(null);
  const revealed = useRevealed(element);

  return (
    <Tag
      ref={element as React.Ref<never>}
      className={cn("reveal", className)}
      data-revealed={revealed ? "true" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
