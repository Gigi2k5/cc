import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ChipProps = {
  children: ReactNode;
  className?: string;
};

const BASE = "inline-flex items-center font-mono rounded-sm border border-ligne bg-surface-2";

/**
 * Spec label used as a design brick (§2) — the "En bref" band, the
 * "délais typiques" note. Mono on surface-2, sharp 8px corners.
 */
export function Chip({ children, className }: ChipProps) {
  return (
    <span className={cn(BASE, "px-4 py-2.5 text-xs text-craie", className)}>
      {children}
    </span>
  );
}

/**
 * Smaller sibling for machine specs inside cards (Core i5 · 16 Go · SSD 512).
 */
export function SpecChip({ children, className }: ChipProps) {
  return (
    <span
      className={cn(BASE, "px-2.5 py-1.5 text-[0.65625rem] text-gris", className)}
    >
      {children}
    </span>
  );
}
