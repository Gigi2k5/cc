import { BRAND } from "@/lib/content";
import { cn } from "@/lib/utils";

import { GradientText } from "./GradientText";

type WordmarkProps = {
  /** Show the `[ C//C — BÉNIN ]` machine suffix (nav only). */
  withTag?: boolean;
  className?: string;
};

/**
 * « Comlan Community » — Instrument Serif, second word in the accent gradient.
 * Shared by the nav and the footer so the two never drift.
 */
export function Wordmark({ withTag = false, className }: WordmarkProps) {
  return (
    <span className={cn("flex items-baseline gap-3", className)}>
      <span className="font-display text-[1.1875rem] leading-none whitespace-nowrap lg:text-[1.4375rem]">
        {BRAND.name} <GradientText>{BRAND.nameAccent}</GradientText>
      </span>
      {withTag ? (
        <span className="hidden font-mono text-[0.625rem] tracking-[0.14em] text-gris-faible lg:inline">
          {BRAND.tag}
        </span>
      ) : null}
    </span>
  );
}
