"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  type Group,
  type LineBasicMaterial,
  type PointsMaterial,
} from "three";

import type { ScrollSignals } from "@/lib/hooks/useScrollSignals";

import {
  buildPointField,
  createPointSprite,
  type PointFieldConfig,
} from "./pointField";

/**
 * Réseau de points 3D avec profondeur : deux couches distinctes plutôt qu'une
 * profondeur de champ en post-traitement (bien trop coûteuse pour du mobile).
 * Proche = gros et flou, lointain = petit et net.
 *
 * `zRange` s'arrête bien avant la caméra (z = 9,5) : plus près, l'atténuation
 * par la taille transforme un point en tache plein écran.
 */
export const FIELD_PRESETS: Record<"high" | "low", PointFieldConfig> = {
  high: {
    count: 1100,
    extent: [9.5, 7],
    zRange: [-9, 3],
    holeRadius: 2.2,
    linkDistance: 0.95,
    maxLinks: 380,
  },
  low: {
    count: 340,
    extent: [8.5, 7],
    zRange: [-8, 2.5],
    holeRadius: 1.8,
    linkDistance: 1.35,
    maxLinks: 150,
  },
};

/** Opacités de repos, multipliées par l'intensification au scroll. */
const BASE_OPACITY = { far: 0.7, near: 0.3, links: 0.1 };

export function PointField({
  preset,
  animate,
  /** Présent = couche globale : parallaxe au scroll et intensification. */
  signals,
}: {
  preset: "high" | "low";
  animate: boolean;
  signals?: RefObject<ScrollSignals>;
}) {
  const drift = useRef<Group>(null);
  const farMaterial = useRef<PointsMaterial>(null);
  const nearMaterial = useRef<PointsMaterial>(null);
  const linkMaterial = useRef<LineBasicMaterial>(null);

  const data = useMemo(() => buildPointField(FIELD_PRESETS[preset]), [preset]);

  const sprites = useMemo(() => {
    const soft = new CanvasTexture(createPointSprite(1));
    const crisp = new CanvasTexture(createPointSprite(0));
    return { soft, crisp };
  }, []);

  // Les textures ne sont pas libérées par R3F : on s'en charge.
  useEffect(
    () => () => {
      sprites.soft.dispose();
      sprites.crisp.dispose();
    },
    [sprites],
  );

  useFrame((state, delta) => {
    if (!drift.current) return;

    if (animate) {
      drift.current.rotation.y += delta * 0.012;
    }

    if (signals) {
      /* Parallaxe : le fond est fixe à l'écran, on le décale doucement à
         contre-sens du scroll pour qu'il paraisse lié à la page sans jamais
         la suivre au pixel. */
      const target = -(signals.current.y * 0.0016);
      drift.current.position.y +=
        (target - drift.current.position.y) * Math.min(1, delta * 4);

      // Le réseau s'intensifie sur la section Communauté (§ phase 5).
      const boost = 1 + signals.current.boost * 2.4;
      if (farMaterial.current) farMaterial.current.opacity = BASE_OPACITY.far * boost;
      if (nearMaterial.current) nearMaterial.current.opacity = BASE_OPACITY.near * boost;
      if (linkMaterial.current) linkMaterial.current.opacity = BASE_OPACITY.links * boost;
    } else if (animate) {
      drift.current.position.y = Math.sin(state.clock.elapsedTime * 0.11) * 0.28;
    }
  });

  return (
    <group ref={drift}>
      {/* Lointain : net, petit, discret. */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.far, 3]}
            count={data.farCount}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={farMaterial}
          map={sprites.crisp}
          size={0.055}
          sizeAttenuation
          transparent
          depthWrite={false}
          opacity={BASE_OPACITY.far}
          color="#8f8f8f"
        />
      </points>

      {/* Proche : plus gros, halo doux, additif pour la sensation de lumière. */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.near, 3]}
            count={data.nearCount}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={nearMaterial}
          map={sprites.soft}
          size={0.15}
          sizeAttenuation
          transparent
          depthWrite={false}
          opacity={BASE_OPACITY.near}
          blending={AdditiveBlending}
          color="#f5f3ef"
        />
      </points>

      {/* Liens de proximité — des filets, jamais un maillage. */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.links, 3]}
            count={data.linkCount * 2}
          />
        </bufferGeometry>
        <lineBasicMaterial
          ref={linkMaterial}
          color="#5a5a5a"
          transparent
          opacity={BASE_OPACITY.links}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
