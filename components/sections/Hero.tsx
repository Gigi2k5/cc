"use client";

import { useRef, type CSSProperties } from "react";

import { Container } from "@/components/layout/Container";
import { HeroEvent, type HeroEventData } from "@/components/sections/HeroEvent";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Magnetic } from "@/components/ui/Magnetic";
import { TerminalKeyword, TerminalLine } from "@/components/ui/TerminalLine";
import { CTA, WHATSAPP } from "@/lib/content";

/** Commande du motif terminal — sa longueur pilote la durée du type-on. */
const COMMAND_PREFIX = "comlan --pack étudiant --budget ";
const COMMAND_VALUE = "250k";
const COMMAND_LENGTH = (COMMAND_PREFIX + COMMAND_VALUE).length;

/** Cascade au chargement (§9) : specs, titre, texte, terminal, CTA, légende. */
const delay = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * Deux compositions, comme la maquette :
 * - desktop : texte à gauche, puce à droite (66 % / 50 %) ;
 * - mobile  : tout centré et la puce dans son propre bloc du flux, entre le
 *   paragraphe et la ligne terminal. C'est ce bloc que la scène vise, donc la
 *   puce est un élément de la mise en page et non un fond derrière le texte.
 */
export function Hero({
  /** Prochaine édition, calculée côté serveur. `null` le reste de l'année. */
  evenement,
}: {
  evenement?: HeroEventData | null;
}) {
  const chipSlot = useRef<HTMLDivElement>(null);

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-var(--nav-h)-var(--alert-h))] items-center overflow-hidden"
    >
      {/* Lumière du fond : évite le noir uniforme, comme dans la maquette. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            /* Semi-transparent : la couche réseau fixe passe derrière le hero,
               un aplat opaque la masquerait. */
            "radial-gradient(1100px 750px at 66% 46%, rgba(20,16,16,0.82) 0%, rgba(10,9,9,0.62) 45%, rgba(7,7,7,0.42) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-[6%] left-[44%] size-[min(760px,90vw)]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(234,68,26,0.10), rgba(234,68,26,0.03) 45%, transparent 68%)",
        }}
      />

      <HeroCanvas slotRef={chipSlot} />

      {/* Voile latéral desktop : le réseau ne doit jamais concurrencer le titre.
          Inutile en mobile, où la puce a son propre espace. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-1 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.86) 24%, rgba(8,8,8,0.48) 42%, transparent 58%)",
        }}
      />

      <Container className="relative z-2 py-[clamp(40px,6vw,96px)]">
        <div className="lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <Eyebrow
              className="hero-fade justify-center lg:justify-start"
              style={delay(150)}
            >
              Système Comlan
            </Eyebrow>

            <h1
              id="hero-title"
              className="mt-6 font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[1.03] tracking-[-0.015em] lg:mt-8 lg:leading-[1]"
            >
              <span className="hero-line">
                <span style={delay(300)}>Le PC qu&apos;il te faut.</span>
              </span>
              <span className="hero-line">
                <GradientText as="em" className="block" style={delay(470)}>
                  Deux pour le prix d&apos;un.
                </GradientText>
              </span>
            </h1>

            <p
              className="hero-fade mx-auto mt-4 max-w-[20rem] text-[0.9375rem] leading-[1.6] text-craie-2 sm:max-w-[30rem] sm:text-[1.0625rem] lg:mx-0 lg:mt-8 lg:text-[1.125rem] lg:leading-[1.65]"
              style={delay(700)}
            >
              Des PC neufs et reconditionnés adaptés à ton besoin, un
              accompagnement réel, et une communauté qui va au-delà de la simple
              vente.
            </p>

            {/* Emplacement de la puce en mobile. Vide et sans style : c'est un
                repère de mise en page que la scène 3D mesure et vise. */}
            <div
              ref={chipSlot}
              aria-hidden="true"
              className="h-[min(62vw,250px)] lg:hidden"
            />

            <div className="hero-fade lg:mt-7" style={delay(880)}>
              <TerminalLine className="lg:text-left">
                <span
                  className="terminal-type"
                  style={
                    {
                      "--type-chars": COMMAND_LENGTH,
                      "--rise-delay": "980ms",
                    } as CSSProperties
                  }
                >
                  {COMMAND_PREFIX}
                  <TerminalKeyword>{COMMAND_VALUE}</TerminalKeyword>
                </span>
              </TerminalLine>
            </div>

            <div
              className="hero-fade mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 lg:mt-10 lg:justify-start"
              style={delay(1150)}
            >
              {/* `w-full` sur le bouton : le conteneur magnétique s'étire comme
                  enfant de flex, mais le Button reste dimensionné par son
                  contenu — sans ça les CTA cessent d'être pleine largeur en
                  mobile. */}
              <Magnetic>
                <Button
                  href={WHATSAPP.primary.href}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {CTA.advisor}
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  href={WHATSAPP.group.href}
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
                  {CTA.community}
                </Button>
              </Magnetic>
            </div>

            {/* Dernier de la cascade : les CTA sont posés, l'œil est libre. */}
            {evenement ? (
              <div className="hero-fade" style={delay(1320)}>
                <HeroEvent event={evenement} />
              </div>
            ) : null}
          </div>

          {/* Colonne droite desktop : réservée à la puce, portée par le canvas. */}
          <div aria-hidden="true" className="hidden lg:block" />
        </div>
      </Container>

      <p
        aria-hidden="true"
        className="hero-fade absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[0.625rem] tracking-[0.16em] text-gris-faible whitespace-nowrap lg:bottom-8 lg:left-[66%]"
        style={delay(1450)}
      >
        la machine · et tout l&apos;univers autour
      </p>
    </section>
  );
}
