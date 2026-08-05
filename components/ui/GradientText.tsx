import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type GradientTextProps = {
  children: ReactNode;
  /** `em` for the hero's italic second line, `span` elsewhere. */
  as?: ElementType;
  className?: string;
};

/**
 * Design system §3 — the accent gradient carries one or two words per screen.
 * Never a large flat fill.
 */
export function GradientText({
  children,
  as: Tag = "span",
  className,
}: GradientTextProps) {
  return (
    <Tag className={cn("text-accent-grad", className)}>{children}</Tag>
  );
}
