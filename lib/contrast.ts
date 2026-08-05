/**
 * WCAG 2.1 contrast maths — used by the /dev audit table so the AA floor
 * (§12) is measured rather than assumed.
 */

function channelToLinear(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#rrggbb` colour. */
export function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = channelToLinear(parseInt(h.slice(0, 2), 16));
  const g = channelToLinear(parseInt(h.slice(2, 4), 16));
  const b = channelToLinear(parseInt(h.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two `#rrggbb` colours, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA large" | "échec";

/**
 * `large` is WCAG "large scale": ≥ 24px normal, or ≥ 18.66px bold.
 */
export function wcagLevel(ratio: number, large = false): WcagLevel {
  if (large) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "échec";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "échec";
}
