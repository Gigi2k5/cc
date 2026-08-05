/**
 * Repli sans WebGL — composition CSS, pas une image de secours. Reprend le
 * langage de la scène (couches empilées, cœur rouge, réseau de points) pour que
 * ce soit une variante assumée du design, jamais un trou.
 *
 * Purement décoratif : aucune information n'y est portée (§12).
 */
export function HeroFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Réseau de points statique, en deux densités pour suggérer la profondeur. */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,243,239,0.5) 0.9px, transparent 1px)",
          backgroundSize: "38px 38px",
          maskImage:
            "radial-gradient(70% 60% at 62% 48%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(70% 60% at 62% 48%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 80%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(245,243,239,0.7) 1.4px, transparent 1.5px)",
          backgroundSize: "97px 97px",
          maskImage:
            "radial-gradient(60% 55% at 62% 48%, #000 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(60% 55% at 62% 48%, #000 0%, transparent 75%)",
        }}
      />

      {/* La puce, en couches empilées dans l'espace. */}
      <div
        className="absolute top-1/2 left-1/2 size-[min(62vw,340px)] -translate-x-1/2 -translate-y-1/2"
        style={{ perspective: "900px" }}
      >
        <div
          className="relative size-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(-22deg) rotateZ(14deg)",
          }}
        >
          {/* Substrat */}
          <div
            className="absolute inset-0 rounded-[14%] border border-ligne"
            style={{
              background:
                "linear-gradient(140deg, #151515 0%, #0b0b0b 55%, #070707 100%)",
              boxShadow: "0 40px 90px rgba(0,0,0,0.7)",
            }}
          />
          {/* Couture émissive, plus large que la couche du dessus */}
          <div
            className="absolute inset-[10%] rounded-[13%]"
            style={{
              transform: "translateZ(10px)",
              background: "linear-gradient(105deg,#FA1500,#EA441A)",
              boxShadow: "0 0 46px 10px rgba(250,21,0,0.42)",
            }}
          />
          {/* Interposeur */}
          <div
            className="absolute inset-[13%] rounded-[12%] border border-ligne"
            style={{
              transform: "translateZ(20px)",
              background:
                "linear-gradient(140deg, #1b1b1b 0%, #101010 60%, #0a0a0a 100%)",
            }}
          />
          {/* Die */}
          <div
            className="absolute inset-[30%] rounded-[10%] border border-ligne-faible"
            style={{
              transform: "translateZ(32px)",
              background:
                "linear-gradient(140deg, #1e1e1e 0%, #0e0e0e 70%, #0b0b0b 100%)",
            }}
          />
          {/* Cœur */}
          <div
            className="absolute inset-[38%] rounded-[8%]"
            style={{
              transform: "translateZ(40px)",
              background: "linear-gradient(105deg,#FF4A22,#FA1500)",
              boxShadow:
                "0 0 30px 6px rgba(250,21,0,0.55), 0 0 80px 24px rgba(234,68,26,0.22)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
