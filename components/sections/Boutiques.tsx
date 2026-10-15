"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { BOUTIQUES, type Boutique } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Les vitrines e-commerce — un grand visuel, une description, un bouton, et
 * une bande pour passer de l'une à l'autre.
 *
 * ### Deux présentations, une seule source
 *
 * Au-dessus de 640 px : une boutique à la fois, choisie dans la bande. C'est
 * le principe d'Apparel Group, qui laisse au visuel la place d'exister.
 *
 * En dessous : **pas d'onglets**. Les deux boutiques s'empilent, chacune
 * complète. Cacher une boutique sur deux derrière un appui, sur un écran de
 * 360 px, ne fait économiser aucun défilement — et une bande d'onglets, une
 * cible de 44 px (§12) et une capture en 16:10 ne tiennent pas ensemble à
 * cette largeur.
 *
 * La **visibilité** est pilotée par CSS seul (`sm:hidden` sur les panneaux non
 * sélectionnés) : elle est donc juste dès le rendu serveur, avant toute
 * hydratation. Seules les **étiquettes ARIA** suivent `matchMedia`, parce
 * qu'elles ne peuvent pas être conditionnées par une media query : annoncer un
 * `tabpanel` dont l'onglet n'est pas affiché ferait mentir l'arbre
 * d'accessibilité. L'état initial est celui du bureau ; sur téléphone il se
 * corrige au montage, et comme la bande y est invisible, rien ne change à
 * l'écran.
 */
export function Boutiques() {
  const [actif, setActif] = useState(0);
  /* Vrai tant qu'on est en présentation « une boutique à la fois ». */
  const [onglets, setOnglets] = useState(true);

  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setOnglets(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Flèches, Début et Fin entre les onglets — motif WAI, identique à celui de
     l'accordéon de la FAQ. Le reste (Tab, Entrée, Espace) est déjà couvert par
     des <button> natifs. */
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: BOUTIQUES.items.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const wrapped = (next + BOUTIQUES.items.length) % BOUTIQUES.items.length;
    setActif(wrapped);
    tabs.current[wrapped]?.focus();
  };

  return (
    <Section id="boutiques" ariaLabelledby="boutiques-title">
      <Reveal>
        <Eyebrow>{BOUTIQUES.eyebrow}</Eyebrow>
        <SectionTitle id="boutiques-title" className="mt-6 max-w-[20ch]">
          {BOUTIQUES.title}
        </SectionTitle>
        <p className="mt-5 max-w-[48ch] text-[1.0625rem] leading-[1.7] text-gris">
          {BOUTIQUES.body}
        </p>
      </Reveal>

      <Reveal delay={80} className="mt-12">
        <div className="flex flex-col gap-5 sm:gap-0">
          {BOUTIQUES.items.map((boutique, index) => (
            <BoutiquePanel
              key={boutique.slug}
              boutique={boutique}
              /* Sur téléphone tous les panneaux sont visibles ; au-dessus de
                 640 px, seul le panneau sélectionné reste. Règle purement CSS,
                 donc déjà juste dans le HTML servi. */
              className={cn(index !== actif && "sm:hidden")}
              id={`${baseId}-panneau-${index}`}
              labelledBy={onglets ? `${baseId}-onglet-${index}` : undefined}
              role={onglets ? "tabpanel" : undefined}
            />
          ))}
        </div>

        {/* La bande. Statique, deux tuiles, pleine largeur : avec deux
            boutiques, un carrousel serait du mouvement sans information, et
            dupliquer les entrées pour « remplir » est hors de question.
            Au-delà de trois entrées, elle gagnera un défilement horizontal —
            une classe conditionnelle, pas un autre système. */}
        <div
          role={onglets ? "tablist" : undefined}
          aria-label={onglets ? BOUTIQUES.bandLabel : undefined}
          /* Repère stable pour le harnais : les classes utilitaires sont
             partagées par d'autres éléments de la section, un sélecteur bâti
             dessus attrape le titre avant la bande. */
          data-bande="boutiques"
          className="mt-6 hidden overflow-hidden rounded-md border border-ligne sm:grid sm:grid-cols-2"
        >
          {BOUTIQUES.items.map((boutique, index) => {
            const selectionne = index === actif;

            return (
              <button
                key={boutique.slug}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                id={`${baseId}-onglet-${index}`}
                role={onglets ? "tab" : undefined}
                aria-selected={onglets ? selectionne : undefined}
                aria-controls={
                  onglets ? `${baseId}-panneau-${index}` : undefined
                }
                /* Un seul arrêt clavier pour toute la bande : on entre par
                   l'onglet sélectionné, on circule aux flèches (motif WAI). */
                tabIndex={onglets && !selectionne ? -1 : 0}
                onClick={() => setActif(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "relative flex min-h-14 items-center justify-center gap-3 px-5 py-4",
                  "border-ligne font-mono text-[0.6875rem] tracking-[0.18em] uppercase",
                  "transition-colors duration-[var(--duration-micro)] ease-micro",
                  "not-first:border-l",
                  selectionne
                    ? "bg-surface-2 text-craie"
                    : "text-gris hover:bg-surface hover:text-craie",
                )}
              >
                {/* Filet d'accent en tête de tuile — le même signal que le
                    lien actif de la nav, pour que « sélectionné » se dise
                    partout de la même façon. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-accent-grad",
                    "transition-opacity duration-[var(--duration-standard)] ease-standard",
                    selectionne ? "opacity-100" : "opacity-0",
                  )}
                />
                {/* Le marqueur de sélection est un caractère plein, pas une
                    couleur seule : la couleur seule ne transmet pas une
                    information (§12). */}
                <span
                  aria-hidden="true"
                  className={selectionne ? "text-rouge" : "text-transparent"}
                >
                  ▸
                </span>
                {boutique.shortName}
              </button>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}

/**
 * Un panneau de boutique : le texte à gauche, les deux captures à droite.
 *
 * Les captures sont montées dans des cadres dessinés au vocabulaire du site —
 * barre d'URL en mono, angles nets — et non dans des mockups d'appareils
 * génériques. Le couple « grand écran + téléphone » vient d'Apparel Group :
 * il dit en un coup d'œil que la boutique marche sur les deux.
 */
function BoutiquePanel({
  boutique,
  className,
  id,
  labelledBy,
  role,
}: {
  boutique: Boutique;
  className?: string;
  id: string;
  labelledBy?: string;
  role?: "tabpanel";
}) {
  return (
    <div
      id={id}
      role={role}
      aria-labelledby={labelledBy}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-ligne bg-surface",
        "p-7 sm:p-10 lg:p-14",
        className,
      )}
    >
      {/* Pas de halo curseur ici : le design system le réserve aux cartes
          interactives, celles qui réagissent au survol. Un panneau de boutique
          ne se survole pas, il se lit — le harnais l'a signalé comme un halo
          sur surface non interactive, et il avait raison. */}
      <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
        <div>
          <h3 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.15] tracking-[-0.01em]">
            {boutique.name}
          </h3>

          <p className="mt-4 max-w-[44ch] text-[0.9375rem] leading-[1.7] text-gris sm:text-[1rem]">
            {boutique.description}
          </p>

          <div className="mt-8">
            <Magnetic>
              <Button
                href={boutique.href}
                size="lg"
                className="w-full sm:w-auto"
              >
                {BOUTIQUES.cta}
              </Button>
            </Magnetic>
          </div>

          {/* On annonce le domaine plutôt que de laisser la surprise au clic —
              même règle que la billetterie de la section Événements. */}
          <p className="mt-4 font-mono text-[0.6875rem] break-all text-gris-faible">
            {BOUTIQUES.hostPrefix} {boutique.host}
          </p>
          {boutique.note ? (
            <p className="mt-1.5 font-mono text-[0.6875rem] text-gris-faible">
              {boutique.note}
            </p>
          ) : null}
        </div>

        <figure className="relative mt-10 lg:mt-0">
          {/* Cadre « fenêtre machine » : la barre d'URL porte le vrai domaine,
              donc le cadre informe au lieu de décorer. */}
          <div className="overflow-hidden rounded-md border border-ligne bg-encre">
            <div className="flex items-center gap-2.5 border-b border-ligne px-3 py-2.5">
              <span aria-hidden="true" className="flex shrink-0 gap-1.5">
                <span className="size-2 rounded-pill bg-ligne" />
                <span className="size-2 rounded-pill bg-ligne" />
                <span className="size-2 rounded-pill bg-ligne" />
              </span>
              {/* Masquée sous 640px. Le domaine y mesure jusqu'à 42 caractères
                  pour un cadre de 260px : il ne tenait qu'en s'arrêtant sur une
                  ellipse (mesuré : 136px coupés à 320px), et une URL coupée se
                  lit comme une erreur plutôt que comme une adresse. Elle est
                  écrite en entier sous le bouton, où elle a la place. */}
              <span
                aria-hidden="true"
                className="hidden min-w-0 truncate font-mono text-[0.625rem] tracking-[0.08em] text-gris-faible sm:inline"
              >
                {boutique.host}
              </span>
            </div>
            <Image
              src={boutique.shots.desktop.src}
              alt={boutique.shots.alt}
              width={boutique.shots.desktop.width}
              height={boutique.shots.desktop.height}
              sizes="(min-width: 1024px) 620px, (min-width: 640px) 80vw, 90vw"
              className="h-auto w-full"
            />
          </div>

          {/* La capture téléphone en vignette posée sur l'angle. Masquée sous
              640 px : à cette largeur l'écran EST déjà un téléphone, montrer
              une maquette de téléphone dedans n'apprend rien et mange la
              moitié de la capture principale. */}
          <div className="absolute -right-2 -bottom-6 hidden w-[17%] min-w-[74px] overflow-hidden rounded-md border border-ligne bg-encre p-1 shadow-ombre sm:block">
            <Image
              src={boutique.shots.mobile.src}
              alt=""
              width={boutique.shots.mobile.width}
              height={boutique.shots.mobile.height}
              sizes="120px"
              className="h-auto w-full rounded-sm"
            />
          </div>
        </figure>
      </div>
    </div>
  );
}
