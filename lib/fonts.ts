import {
  Gloock,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Young_Serif,
} from "next/font/google";

/**
 * Design system §4 — one job per typeface, strictly.
 * Each font exposes a CSS variable consumed by the `--font-*` theme tokens
 * in `app/globals.css`, so components only ever touch semantic names
 * (`font-display`, `font-impact`, `font-accent`, `font-sans`, `font-mono`).
 *
 * Preload budget: only the three fonts present above the fold are preloaded.
 * Gloock and Young Serif are accent faces used further down the page.
 */

/** Hero + large editorial headings. Dominant serif. Italic used for gradient lines. */
export const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

/** High-impact section statements. */
export const gloock = Gloock({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-gloock",
});

/** Rare accents only: key figures, the "+" of the 2-for-1 panel. */
export const youngSerif = Young_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-young-serif",
});

/** Body copy, UI, buttons, lists. */
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

/** The machine voice: eyebrows, specs, labels, terminal motif. */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

/** Applied once on <html> in the root layout. */
export const fontVariables = [
  instrumentSerif.variable,
  gloock.variable,
  youngSerif.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
