import type { ReactNode } from "react";

import { Container } from "./Container";

type SectionProps = {
  children: ReactNode;
  /** Anchor target for the nav (À propos, Ce qu'on fait, …). */
  id?: string;
  /** Accessible name, wired to the section's own heading id when there is one. */
  ariaLabelledby?: string;
  /** Classes on the <section> itself — background, overflow, stacking. */
  className?: string;
  /** Classes on the inner container — grid, alignment. */
  containerClassName?: string;
  /**
   * Skip the 1200px container so the section can bleed edge to edge
   * (hero WebGL canvas, community background, network layer).
   * Children then own their own containment.
   */
  bleed?: boolean;
};

/**
 * Design system §5 — rythme vertical porté par `--section-y`.
 *
 * La moitié en haut, la moitié en bas : deux sections consécutives sont donc
 * séparées d'exactement `--section-y`. Appliquer la valeur pleine des deux
 * côtés doublerait l'écart (320px en desktop) là où la maquette validée en
 * montre ~130.
 */
export function Section({
  children,
  id,
  ariaLabelledby,
  className = "",
  containerClassName = "",
  bleed = false,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`relative py-[calc(var(--section-y)/2)] ${className}`.trim()}
    >
      {bleed ? (
        children
      ) : (
        <Container className={containerClassName}>{children}</Container>
      )}
    </section>
  );
}
