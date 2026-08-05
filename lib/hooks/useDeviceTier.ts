"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "unknown" | "none" | "low" | "high";

type NavigatorWithHints = Navigator & { deviceMemory?: number };

/**
 * Sondé une seule fois par chargement de page et mémorisé au niveau module :
 * `getSnapshot` doit renvoyer une valeur stable, et créer un contexte WebGL de
 * sonde à chaque rendu serait absurde.
 */
let cached: DeviceTier | null = null;

function probe(): DeviceTier {
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    cached = "none";
    return cached;
  }
  // Libère le contexte de sonde : les navigateurs en plafonnent le nombre.
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  const nav = navigator as NavigatorWithHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 1024;

  const weak = cores <= 4 || memory <= 4 || (coarsePointer && narrow);
  cached = weak ? "low" : "high";
  return cached;
}

/** La capacité de l'appareil ne change pas en cours de route. */
const subscribe = () => () => {};

const getServerSnapshot = (): DeviceTier => "unknown";

/**
 * Coarse local capability probe — no benchmark download, no network.
 * (drei's `useDetectGPU` fetches a benchmark JSON from a CDN; we don't.)
 *
 * - `none` : no WebGL2 at all → static fallback, never a broken canvas.
 * - `low`  : few cores / little RAM / touch-only → fewer points, no bloom.
 * - `high` : full scene.
 */
export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(subscribe, probe, getServerSnapshot);
}
