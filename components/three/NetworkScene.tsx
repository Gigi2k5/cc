"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

import { useScrollSignals } from "@/lib/hooks/useScrollSignals";

import { PointField } from "./PointField";
import { WarmUpThenFreeze } from "./WarmUpThenFreeze";

/**
 * Couche réseau globale : un seul canvas fixe, derrière toute la page.
 *
 * Volontairement dépouillé — trois appels de dessin, pas de post-traitement,
 * pas de lumières. C'est un fond qui tourne en continu pendant tout le scroll :
 * le budget doit rester dérisoire.
 */

/** Section dont la proximité intensifie le réseau. */
const FOCUS_SECTION = "communaute";

export default function NetworkScene({
  quality,
  animate,
}: {
  quality: "high" | "low";
  animate: boolean;
}) {
  const signals = useScrollSignals(FOCUS_SECTION);
  const [visible, setVisible] = useState(true);

  /* Onglet en arrière-plan : on coupe la boucle. Le navigateur ralentit déjà
     requestAnimationFrame, mais autant ne rien demander du tout. */
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      frameloop={animate && visible ? "always" : "demand"}
      // Plus bas que le hero : un fond de points ne gagne rien à être rendu
      // en pleine densité de pixels.
      dpr={[1, quality === "high" ? 1.5 : 1]}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 9.5], fov: 32, near: 0.1, far: 60 }}
      style={{ pointerEvents: "none" }}
    >
      {!animate || !visible ? <WarmUpThenFreeze /> : null}
      <PointField preset={quality} animate={animate} signals={signals} />
    </Canvas>
  );
}
