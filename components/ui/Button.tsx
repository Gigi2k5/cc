import type { MouseEventHandler, ReactNode } from "react";

import { cn, isExternal } from "@/lib/utils";

type Variant = "primary" | "ghost";
type Size = "lg" | "md";

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Renders an <a> instead of a <button>. */
  href?: string;
  /** Force the new-tab behaviour instead of deriving it from the href. */
  external?: boolean;
  /** Works on both branches — the mobile panel closes itself on tap. */
  onClick?: MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
};

const BASE = cn(
  "inline-flex items-center justify-center gap-2 rounded-md font-sans text-center",
  // Tailwind v4 émet les propriétés indépendantes `translate` et `scale`,
  // pas `transform` : c'est bien celles-là qu'il faut faire transiter.
  "transition-[translate,scale,box-shadow,border-color,background-color]",
  "duration-[var(--duration-standard)] ease-standard",
  // Cibles tactiles ≥ 44px (§12).
  "min-h-11",
  "disabled:pointer-events-none disabled:opacity-50",
);

const VARIANTS: Record<Variant, string> = {
  // Dégradé accent + halo rouge directionnel : plus riche qu'un halo plat.
  primary: cn(
    "bg-accent-grad font-semibold text-white",
    "shadow-[0_10px_30px_rgba(250,21,0,0.18)]",
    "hover:-translate-y-[3px] hover:scale-[1.03]",
    "hover:shadow-[0_16px_38px_rgba(250,21,0,0.28)]",
    "active:translate-y-0 active:scale-100 active:bg-none active:bg-rouge-fonce",
    // Anneau clair : un anneau rouge serait illisible sur le dégradé.
    "focus-visible:outline-craie",
  ),
  ghost: cn(
    "border border-ligne font-medium text-craie backdrop-blur-[4px]",
    "hover:-translate-y-[3px] hover:border-rouge",
    "active:translate-y-0",
  ),
};

/** Le ghost porte 1px de bordure : on retire 1px de padding pour égaliser les hauteurs. */
const SIZES: Record<Size, Record<Variant, string>> = {
  lg: {
    primary: "px-[30px] py-[17px] text-[0.9375rem]",
    ghost: "px-[30px] py-4 text-[0.9375rem]",
  },
  md: {
    primary: "px-[22px] py-3 text-sm",
    ghost: "px-[22px] py-[11px] text-sm",
  },
};

/**
 * Design system §10 — primaire (dégradé + halo) et ghost (bordure → rouge).
 * Rend un <a> si `href` est fourni, un <button> sinon.
 *
 * ⚠️ `className` ne peut pas surcharger le `display` : `inline-flex` vient de
 * BASE et, entre deux utilitaires de la même famille, Tailwind tranche par
 * l'ordre dans la feuille générée, pas par l'ordre dans className. Pour
 * masquer un bouton selon le viewport, encadre-le d'un conteneur
 * (`<div className="hidden lg:block">`).
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  external,
  onClick,
  type = "button",
  disabled,
  ariaLabel,
  ariaExpanded,
  ariaControls,
}: ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size][variant], className);

  if (href !== undefined) {
    const opensNewTab = external ?? isExternal(href);

    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(opensNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {children}
    </button>
  );
}
