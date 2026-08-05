import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EyebrowProps = {
  /** Written naturally — the component uppercases it. */
  children: ReactNode;
  /** `md` for section eyebrows, `sm` inside cards. */
  size?: "md" | "sm";
  /** Optional emoji placed before the `//`. Decorative. */
  lead?: ReactNode;
  /** Cards pass `group-hover:text-rouge` here. */
  className?: string;
  id?: string;
};

/**
 * The machine voice (§2) — mono, uppercase, tracked out, `//` in red.
 *
 * The `//` must be a JSX expression: written bare, JSX parses it as a comment.
 */
export function Eyebrow({
  children,
  size = "md",
  lead,
  className,
  id,
}: EyebrowProps) {
  return (
    <p
      id={id}
      className={cn(
        "flex items-center font-mono text-gris uppercase transition-colors duration-[var(--duration-micro)] ease-micro",
        size === "md"
          ? "gap-3.5 text-xs tracking-[0.22em]"
          : "gap-2.5 text-[0.6875rem] tracking-[0.18em]",
        className,
      )}
    >
      {lead ? <span aria-hidden="true">{lead}</span> : null}
      <span aria-hidden="true" className="text-rouge">
        {"//"}
      </span>
      <span>{children}</span>
    </p>
  );
}
