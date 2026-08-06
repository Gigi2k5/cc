"use client";

import dynamic from "next/dynamic";

import { useDeviceTier } from "@/lib/hooks/useDeviceTier";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const NetworkScene = dynamic(() => import("./NetworkScene"), { ssr: false });

/**
 * Couche de fond fixe qui traverse toute la page (§ phase 5). Elle assure la
 * continuité visuelle entre les sections : le réseau ne réapparaît pas, il n'a
 * jamais disparu.
 *
 * Pas de repli statique ici, contrairement au hero : c'est une texture de fond.
 * Sans WebGL on ne montre rien plutôt qu'un ersatz, et la page reste entière.
 */
export function NetworkLayer() {
  const tier = useDeviceTier();
  const reduced = useReducedMotion();

  if (tier !== "high" && tier !== "low") return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <NetworkScene
        quality={tier === "high" ? "high" : "low"}
        animate={!reduced}
      />
    </div>
  );
}
