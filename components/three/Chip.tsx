"use client";

import { Float, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { Group, InstancedMesh, PerspectiveCamera } from "three";

import type { ChipFocus } from "./HeroCanvas";

/**
 * Puce stylisée : substrat, couches empilées, die, et un cœur émissif rouge
 * qui « fuit » par les coutures — la couche émissive est volontairement plus
 * large que celle posée dessus, donc la lumière déborde sur tout le pourtour.
 */

/** Toutes les cotes en un point : le rayon englobant en découle. */
const D = {
  substrate: { w: 3.2, t: 0.2, r: 0.16, z: 0 },
  seam: { w: 2.78, t: 0.05, r: 0.03, z: 0.125 },
  interposer: { w: 2.6, t: 0.14, r: 0.1, z: 0.22 },
  die: { w: 1.46, t: 0.1, r: 0.06, z: 0.34 },
  core: { w: 1.05, t: 0.03, r: 0.02, z: 0.405 },
  trace: { w: 0.055, len: 0.34, t: 0.028, perSide: 7 },
  /** Plots BGA sous le substrat : la face arrière ne doit jamais être lisse. */
  pad: { radius: 0.052, perRow: 8, span: 2.34, z: -0.118 },
} as const;

/** Amplitude du flottement, à provisionner dans le rayon englobant. */
const FLOAT_RANGE = 0.12;

/**
 * Rayon de la sphère englobante autour de l'origine du groupe. La puce tournant
 * autour de son centre, ce rayon est invariant par rotation : s'il tient dans
 * le cadre, l'objet n'est jamais coupé, quel que soit l'angle.
 */
export const CHIP_RADIUS =
  Math.hypot(D.substrate.w / 2, D.substrate.w / 2, D.core.z + D.core.t / 2) +
  FLOAT_RANGE;

function Traces() {
  const traces = useMemo(() => {
    const items: { position: [number, number, number]; rotation: number }[] = [];
    const half = D.substrate.w / 2;
    const span = D.substrate.w * 0.62;

    for (let side = 0; side < 4; side++) {
      const angle = (side * Math.PI) / 2;
      for (let i = 0; i < D.trace.perSide; i++) {
        const offset =
          (i / (D.trace.perSide - 1) - 0.5) * span;
        const out = half + D.trace.len / 2 - 0.04;
        // Position sur le côté 0 (x sortant), puis pivotée sur les 4 côtés.
        const x = Math.cos(angle) * out - Math.sin(angle) * offset;
        const y = Math.sin(angle) * out + Math.cos(angle) * offset;
        items.push({ position: [x, y, -0.02], rotation: angle });
      }
    }
    return items;
  }, []);

  const mesh = useRef<InstancedMesh>(null);

  /* 28 pistes = 1 seul appel de dessin. En meshes séparés c'en était 28, soit
     l'essentiel du coût par frame de la puce. */
  useLayoutEffect(() => {
    if (!mesh.current) return;

    const matrix = new Matrix4();
    const euler = new Euler();
    const quaternion = new Quaternion();
    const position = new Vector3();
    const scale = new Vector3(1, 1, 1);

    traces.forEach((trace, index) => {
      euler.set(0, 0, trace.rotation);
      quaternion.setFromEuler(euler);
      position.set(...trace.position);
      matrix.compose(position, quaternion, scale);
      mesh.current!.setMatrixAt(index, matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  }, [traces]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, traces.length]}
      frustumCulled={false}
    >
      <boxGeometry args={[D.trace.len, D.trace.w, D.trace.t]} />
      <meshStandardMaterial
        color="#242424"
        metalness={0.95}
        roughness={0.24}
        envMapIntensity={1.6}
      />
    </instancedMesh>
  );
}

/**
 * Grille de plots sous le substrat. La puce faisant un tour complet, on voit son
 * dos la moitié du temps : sans ces plots, c'est une dalle noire sans intérêt.
 * 64 instances = 1 appel de dessin.
 */
function Pads() {
  const mesh = useRef<InstancedMesh>(null);
  const count = D.pad.perRow * D.pad.perRow;

  useLayoutEffect(() => {
    if (!mesh.current) return;

    const matrix = new Matrix4();
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3(1, 1, 1);
    const step = D.pad.span / (D.pad.perRow - 1);

    let index = 0;
    for (let row = 0; row < D.pad.perRow; row++) {
      for (let col = 0; col < D.pad.perRow; col++) {
        position.set(
          -D.pad.span / 2 + col * step,
          -D.pad.span / 2 + row * step,
          D.pad.z,
        );
        matrix.compose(position, quaternion, scale);
        mesh.current.setMatrixAt(index++, matrix);
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      {/* Peu de segments : à cette taille à l'écran, personne ne les compte. */}
      <sphereGeometry args={[D.pad.radius, 8, 6]} />
      <meshStandardMaterial
        color="#2a2a2a"
        metalness={0.95}
        roughness={0.22}
        envMapIntensity={1.4}
      />
    </instancedMesh>
  );
}

export function Chip({
  animate,
  focus,
}: {
  animate: boolean;
  focus: ChipFocus;
}) {
  const spin = useRef<Group>(null);
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const size = useThree((state) => state.size);

  /* Position et taille dictées par la mise en page (`focus`), converties en
     unités monde.

     Bornes anti-rognage : une sphère de rayon R centrée à la distance d tient
     dans un frustum de demi-angle θ si R ≤ d·sin θ. Mesurer la largeur visible
     au plan z = 0 ne suffirait pas : en tournant, des parties de la puce
     passent devant ce plan, là où le frustum est plus étroit. Le centre étant
     hors axe, on retranche son décalage. */
  const { offset, scale } = useMemo(() => {
    const distance = camera.position.z;
    const thetaV = (camera.fov * Math.PI) / 360;
    const aspect = size.width / size.height;
    const thetaH = Math.atan(Math.tan(thetaV) * aspect);

    const visibleHeight = 2 * distance * Math.tan(thetaV);
    const visibleWidth = 2 * distance * Math.tan(thetaH);

    const offsetX = (focus.x - 0.5) * visibleWidth;
    const offsetY = (0.5 - focus.y) * visibleHeight;

    const designScale = (visibleHeight * focus.diameter) / 2 / CHIP_RADIUS;
    const maxVertical =
      (distance * Math.sin(thetaV) - Math.abs(offsetY) * Math.cos(thetaV)) /
      CHIP_RADIUS;
    const maxHorizontal =
      (distance * Math.sin(thetaH) - Math.abs(offsetX) * Math.cos(thetaH)) /
      CHIP_RADIUS;

    return {
      offset: [offsetX, offsetY, 0] as [number, number, number],
      // 8 % de marge sur les bornes : le rognage doit être impossible, pas juste
      // improbable.
      scale: Math.max(
        0.05,
        Math.min(designScale, maxVertical * 0.92, maxHorizontal * 0.92),
      ),
    };
  }, [camera, size.width, size.height, focus]);

  useFrame((_, delta) => {
    if (!animate || !spin.current) return;
    spin.current.rotation.y += delta * 0.11;
  });

  return (
    <group position={offset} scale={scale}>
      <Float
        enabled={animate}
        speed={1.1}
        rotationIntensity={0.16}
        floatIntensity={0.5}
        floatingRange={[-FLOAT_RANGE, FLOAT_RANGE]}
        /* Float invalide la boucle à chaque frame par défaut : en mode
           « demand » (animations réduites) ça relancerait le rendu en continu
           au lieu de laisser une image figée. */
        autoInvalidate={false}
      >
        {/* Inclinaison fixe reprise de la maquette, puis rotation lente. */}
        <group rotation={[-0.42, 0.78, 0.12]}>
          <group ref={spin}>
            <RoundedBox
              args={[D.substrate.w, D.substrate.w, D.substrate.t]}
              radius={D.substrate.r}
              smoothness={4}
              position={[0, 0, D.substrate.z]}
            >
              <meshStandardMaterial
                color="#101010"
                metalness={0.92}
                roughness={0.38}
                envMapIntensity={1.5}
              />
            </RoundedBox>

            <Traces />
            <Pads />

            {/* Couture émissive — plus large que l'interposeur posé dessus. */}
            <RoundedBox
              args={[D.seam.w, D.seam.w, D.seam.t]}
              radius={D.seam.r}
              smoothness={2}
              position={[0, 0, D.seam.z]}
            >
              <meshStandardMaterial
                color="#FA1500"
                emissive="#FA1500"
                emissiveIntensity={1.35}
                toneMapped={false}
              />
            </RoundedBox>

            <RoundedBox
              args={[D.interposer.w, D.interposer.w, D.interposer.t]}
              radius={D.interposer.r}
              smoothness={4}
              position={[0, 0, D.interposer.z]}
            >
              <meshStandardMaterial
                color="#1a1a1a"
                metalness={0.9}
                roughness={0.26}
                envMapIntensity={1.8}
              />
            </RoundedBox>

            <RoundedBox
              args={[D.die.w, D.die.w, D.die.t]}
              radius={D.die.r}
              smoothness={4}
              position={[0, 0, D.die.z]}
            >
              <meshStandardMaterial
                color="#141414"
                metalness={0.7}
                roughness={0.13}
                envMapIntensity={2.2}
              />
            </RoundedBox>

            {/* Cœur : le point le plus lumineux, c'est lui que le bloom prend. */}
            <RoundedBox
              args={[D.core.w, D.core.w, D.core.t]}
              radius={D.core.r}
              smoothness={2}
              position={[0, 0, D.core.z]}
            >
              <meshStandardMaterial
                color="#FF4A22"
                emissive="#FA1500"
                emissiveIntensity={2.1}
                toneMapped={false}
              />
            </RoundedBox>

            {/* Repère de coin, comme sur un vrai processeur. */}
            <mesh position={[-0.56, -0.56, D.core.z]}>
              <boxGeometry args={[0.1, 0.1, 0.02]} />
              <meshStandardMaterial
                color="#FA1500"
                emissive="#FA1500"
                emissiveIntensity={1.1}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}
