"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef, type ReactNode } from "react";
import type { Group, PointLight } from "three";

import { Chip } from "./Chip";
import type { ChipFocus } from "./HeroCanvas";
import { PointField } from "./PointField";

/**
 * La scène du hero. Montée uniquement côté client par HeroCanvas, jamais en SSR.
 *
 * Rien n'est chargé depuis le réseau : la carte d'environnement est peinte
 * localement avec des Lightformer, et les sprites de points sont dessinés sur
 * un canvas. Zéro requête, zéro CDN.
 */

type Quality = "high" | "low";

/** Parallaxe au curseur — désactivée au doigt et en animations réduites. */
function PointerParallax({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!enabled || !group.current) return;
    const targetX = state.pointer.y * 0.1;
    const targetY = state.pointer.x * 0.16;
    const ease = Math.min(1, delta * 2.6);
    group.current.rotation.x += (targetX - group.current.rotation.x) * ease;
    group.current.rotation.y += (targetY - group.current.rotation.y) * ease;
  });

  return <group ref={group}>{children}</group>;
}

/** Lumière focale : casse le noir uniforme et suit doucement le curseur. */
function FocalLight({ reactive }: { reactive: boolean }) {
  const light = useRef<PointLight>(null);

  useFrame((state, delta) => {
    if (!reactive || !light.current) return;
    const targetX = 2.6 + state.pointer.x * 1.4;
    const targetY = 1.8 + state.pointer.y * 1;
    const ease = Math.min(1, delta * 2);
    light.current.position.x += (targetX - light.current.position.x) * ease;
    light.current.position.y += (targetY - light.current.position.y) * ease;
  });

  return (
    <pointLight
      ref={light}
      position={[2.6, 1.8, 4.2]}
      intensity={46}
      distance={16}
      decay={2}
      color="#fff4ec"
    />
  );
}

/** Nombre de rendus nécessaires pour que la carte d'environnement et les
 *  matériaux se résolvent, avant de figer l'image. */
const WARMUP_FRAMES = 8;

/**
 * En animations réduites, la boucle est en « demand » : on force quelques
 * rendus, puis l'image reste figée.
 *
 * Enchaînement de requestAnimationFrame et non setInterval : chaque invalidate
 * suit une frame réellement produite. Avec un timer, sur une machine lente
 * (ou un rendu logiciel), les appels s'accumulent plus vite qu'ils ne se
 * consomment et la scène continue de rendre longtemps après.
 */
function WarmUpThenFreeze() {
  const invalidate = useThree((state) => state.invalidate);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;

    let rendered = 0;
    let frame = 0;

    const step = () => {
      invalidate();
      if (++rendered < WARMUP_FRAMES) frame = requestAnimationFrame(step);
      else done.current = true;
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [invalidate]);

  return null;
}

export default function HeroScene({
  quality,
  animate,
  parallax,
  active,
  focus,
}: {
  quality: Quality;
  /** false en animations réduites : image figée. */
  animate: boolean;
  /** false au doigt : pas de parallaxe curseur. */
  parallax: boolean;
  /** false quand le hero est hors écran : la boucle s'arrête. */
  active: boolean;
  /** Où poser la puce, décidé par la mise en page (voir HeroCanvas). */
  focus: ChipFocus;
}) {
  const frameloop = !animate ? "demand" : active ? "always" : "never";

  return (
    <Canvas
      frameloop={frameloop}
      // Plafonné : sur un écran 3x, rendre à 3x coûte 9x pour rien ici.
      dpr={[1, quality === "high" ? 2 : 1.5]}
      gl={{
        alpha: true,
        antialias: quality === "high",
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 9.5], fov: 32, near: 0.1, far: 60 }}
      style={{ pointerEvents: "none" }}
    >
      {!animate ? <WarmUpThenFreeze /> : null}

      <ambientLight intensity={0.24} color="#b5b3af" />
      <FocalLight reactive={animate && parallax} />

      {/* Rim-light rouge-orange, à contre-jour : détache la puce du fond. */}
      <directionalLight
        position={[-4.5, -1.5, -3]}
        intensity={2.2}
        color="#EA441A"
      />
      <directionalLight
        position={[-2, 3.5, -2]}
        intensity={0.7}
        color="#FA1500"
      />

      {/* Carte d'environnement peinte à la main, cuite une seule fois. */}
      <Environment resolution={quality === "high" ? 256 : 128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.9}
          color="#ffffff"
          position={[4, 3, 5]}
          scale={[7, 7, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.7}
          color="#EA441A"
          position={[-5, -1, -3]}
          scale={[9, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={0.9}
          color="#b5b3af"
          position={[0, 5, -4]}
          scale={5}
          target={[0, 0, 0]}
        />
      </Environment>

      <PointerParallax enabled={animate && parallax}>
        <PointField preset={quality} animate={animate} />
        <Chip animate={animate} focus={focus} />
      </PointerParallax>

      {/* Bloom discret. Allégé en basse qualité, jamais un halo qui bave. */}
      <EffectComposer enabled multisampling={quality === "high" ? 4 : 0}>
        <Bloom
          intensity={quality === "high" ? 0.85 : 0.5}
          luminanceThreshold={0.42}
          luminanceSmoothing={0.28}
          radius={0.72}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
