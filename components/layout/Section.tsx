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
 * Design system §5 — vertical section rhythm: clamp(80px, 12vw, 160px),
 * held in the `--section-y` token.
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
      className={`relative py-[var(--section-y)] ${className}`.trim()}
    >
      {bleed ? (
        children
      ) : (
        <Container className={containerClassName}>{children}</Container>
      )}
    </section>
  );
}
