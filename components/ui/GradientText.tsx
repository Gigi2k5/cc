import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: ReactNode;
  /** `em` for the hero's italic second line, `span` elsewhere. */
  as?: "span" | "em";
  className?: string;
  /** Carries cascade variables such as `--rise-delay`. */
  style?: CSSProperties;
};

/**
 * Design system §3 — the accent gradient carries one or two words per screen.
 * Never a large flat fill.
 *
 * Branché explicitement plutôt que via une balise dynamique : avec `ElementType`
 * (ou même une union de balises), TypeScript intersecte les props des membres et
 * les résout à `never`.
 */
export function GradientText({
  children,
  as = "span",
  className,
  style,
}: GradientTextProps) {
  const classes = cn("text-accent-grad", className);

  if (as === "em") {
    return (
      <em className={classes} style={style}>
        {children}
      </em>
    );
  }

  return (
    <span className={classes} style={style}>
      {children}
    </span>
  );
}
