"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, CanvasTexture, type Group } from "three";

import {
  buildPointField,
  createPointSprite,
  type PointFieldConfig,
} from "./pointField";

/**
 * Réseau de points 3D avec profondeur : deux couches distinctes plutôt qu'une
 * profondeur de champ en post-traitement (bien trop coûteuse pour du mobile).
 * Proche = gros et flou, lointain = petit et net.
 */

/**
 * `zRange` s'arrête bien avant la caméra (z = 9,5) : plus près, l'atténuation
 * par la taille transforme un point en tache plein écran.
 */
export const FIELD_PRESETS: Record<"high" | "low", PointFieldConfig> = {
  high: {
    count: 1100,
    extent: [8.5, 5.5],
    zRange: [-9, 3],
    holeRadius: 2.5,
    linkDistance: 0.95,
    maxLinks: 380,
  },
  low: {
    count: 320,
    extent: [7.5, 6],
    zRange: [-8, 2.5],
    holeRadius: 2.1,
    linkDistance: 1.35,
    maxLinks: 150,
  },
};

export function PointField({
  preset,
  animate,
}: {
  preset: "high" | "low";
  animate: boolean;
}) {
  const drift = useRef<Group>(null);

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
    if (!animate || !drift.current) return;
    drift.current.rotation.y += delta * 0.012;
    drift.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.11) * 0.28;
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
          map={sprites.crisp}
          size={0.055}
          sizeAttenuation
          transparent
          depthWrite={false}
          opacity={0.7}
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
          map={sprites.soft}
          size={0.15}
          sizeAttenuation
          transparent
          depthWrite={false}
          opacity={0.3}
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
          color="#5a5a5a"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
