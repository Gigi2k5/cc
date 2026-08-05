type ClassValue = string | false | null | undefined;

/** Joins class names, dropping falsy branches. Keeps variant maps readable. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}

/** True for links that must open in a new tab with a safe rel. */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}
