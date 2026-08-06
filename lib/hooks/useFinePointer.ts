"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/** Côté serveur : on suppose l'absence de souris, donc aucune interaction curseur. */
const getServerSnapshot = () => false;

/**
 * Vrai souris/trackpad uniquement (§9 — les micro-interactions au curseur sont
 * réservées au desktop). Un écran tactile n'a ni survol ni pointeur fin : y
 * attacher une attraction magnétique ne produirait qu'un sursaut au tap.
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
