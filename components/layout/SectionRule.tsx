"use client";

import { useRef } from "react";

import { Container } from "@/components/layout/Container";
import { useRevealed } from "@/lib/hooks/useRevealed";

/**
 * Transition entre deux sections : un filet qui se trace de gauche à droite en
 * entrant dans le cadre, amorcé par un court segment en dégradé accent.
 *
 * Purement décoratif — il ne sépare rien sémantiquement, les sections le font
 * déjà. D'où `aria-hidden` et aucun rôle de séparateur.
 *
 * En animations réduites la règle globale annule la transition : le filet est
 * simplement là, entier, dès le départ.
 */
export function SectionRule() {
  const rule = useRef<HTMLDivElement>(null);
  const revealed = useRevealed(rule);

  return (
    <Container>
      <div
        ref={rule}
        aria-hidden="true"
        className="section-rule"
        data-revealed={revealed ? "true" : undefined}
      />
    </Container>
  );
}
