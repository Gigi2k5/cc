import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Design system §7 — max 1200px, side gutter 20px (mobile) / 40px (desktop).
 * The gutter comes from the `--gutter` token so it stays in one place.
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-page px-[var(--gutter)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
