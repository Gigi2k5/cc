import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Spotlight } from "./Spotlight";

type CardProps = {
  children: ReactNode;
  className?: string;
  /**
   * Adds the interactive hover treatment: border → red, elevation, -4px.
   * Leave off for purely static panels.
   */
  interactive?: boolean;
};

/**
 * Design system §10 — surface, hairline border, 22px radius, 32px padding.
 * Structure: Eyebrow → title → copy → specs pushed to the bottom.
 *
 * `group` lets a child Eyebrow turn red on hover via `group-hover:text-rouge`.
 */
export function Card({ children, className, interactive = true }: CardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3.5 rounded-lg border border-ligne bg-surface p-8",
        interactive &&
          cn(
            // `translate`, pas `transform` : voir la note dans Button.tsx.
            "transition-[translate,border-color,box-shadow]",
            "duration-[var(--duration-standard)] ease-standard",
            "hover:-translate-y-1 hover:border-rouge hover:shadow-ombre",
          ),
        className,
      )}
    >
      {/* Halo curseur — seulement sur les cartes interactives. */}
      {interactive ? <Spotlight /> : null}
      {children}
    </div>
  );
}

/** Card heading — Inter 600, 19px (§4 H3). Never a serif inside a card. */
export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-[1.1875rem] font-semibold text-craie", className)}>
      {children}
    </h3>
  );
}

/** Card body copy. */
export function CardText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[0.90625rem] leading-[1.65] text-gris", className)}>
      {children}
    </p>
  );
}

/** Spec row pinned to the bottom of the card. */
export function CardSpecs({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-auto flex flex-wrap gap-2 pt-2.5", className)}>
      {children}
    </div>
  );
}
