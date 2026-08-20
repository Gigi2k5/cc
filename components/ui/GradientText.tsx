import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: ReactNode;
  /** `em` for the hero's italic second line, `span` elsewhere. */
  as?: "span" | "em";
  className?: string;
  /** Carries cascade variables such as `--rise-delay`. */
  style?: CSSProperties;
  /** Le mot est purement visuel : son sens est porté ailleurs. */
  "aria-hidden"?: boolean;
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
  "aria-hidden": ariaHidden,
}: GradientTextProps) {
  const classes = cn("text-accent-grad", className);

  if (as === "em") {
    return (
      <em className={classes} style={style} aria-hidden={ariaHidden}>
        {children}
      </em>
    );
  }

  return (
    <span className={classes} style={style} aria-hidden={ariaHidden}>
      {children}
    </span>
  );
}
