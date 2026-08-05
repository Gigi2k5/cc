"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** Côté serveur on suppose le pire : rien n'anime avant de connaître le choix. */
const getServerSnapshot = () => true;

/**
 * Tracks `prefers-reduced-motion` (§9).
 *
 * `useSyncExternalStore` plutôt qu'un effet : matchMedia est exactement le
 * genre de source externe pour lequel ce primitif existe, et ça évite le
 * rendu en cascade d'un setState synchrone dans un effet.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
