import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TerminalLineProps = {
  children: ReactNode;
  /** Hide the caret on lines that are not the active one. */
  caret?: boolean;
  className?: string;
};

/**
 * Design system §10 — the terminal motif: `>` prefix in chalk, body in grey,
 * blinking red caret. Elegant and premium, never a dev cliché (§2).
 *
 * The caret keeps a static, *visible* state under prefers-reduced-motion —
 * see `.terminal-caret` in globals.css.
 */
export function TerminalLine({
  children,
  caret = true,
  className,
}: TerminalLineProps) {
  return (
    <p
      className={cn(
        "font-mono text-[0.8125rem] leading-[1.7] text-gris",
        className,
      )}
    >
      <span aria-hidden="true" className="text-craie">
        &gt;
      </span>{" "}
      {children}
      {caret ? <span aria-hidden="true" className="terminal-caret" /> : null}
    </p>
  );
}

/** A highlighted token inside a terminal line. */
export function TerminalKeyword({ children }: { children: ReactNode }) {
  return <span className="text-craie">{children}</span>;
}
