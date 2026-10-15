import { Drama, Gift, GraduationCap, Handshake, Laptop } from "lucide-react";

import { Section } from "@/components/layout/Section";
import { Card, CardSpecs, CardText, CardTitle } from "@/components/ui/Card";
import { SpecChip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CE_QU_ON_FAIT } from "@/lib/content";

/**
 * Cinq cartes sur une grille de 6 colonnes : 3 × 2 colonnes puis 2 × 3, donc
 * les deux rangées sont pleines — pas de trou en fin de grille.
 */
const SPAN = [
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
];

/**
 * Les icônes, au trait et en `currentColor` : elles héritent de la couleur de
 * l'eyebrow, donc elles passent au rouge au survol de la carte sans qu'on ait
 * à gérer quoi que ce soit.
 *
 * `strokeWidth` à 1,5 pour tenir la ligne fine du site — l'épaisseur par
 * défaut de Lucide (2) jurerait avec les filets d'un pixel qui structurent
 * toute la page.
 *
 * Elles remplacent cinq emoji, qui étaient le seul élément générique du site
 * et le seul dont le dessin changeait d'un appareil à l'autre.
 */
const ICONES = {
  laptop: Laptop,
  gift: Gift,
  graduation: GraduationCap,
  /* Masques de théâtre : Loup-Garou est un jeu de rôle caché, pas un animal. */
  jeu: Drama,
  reseau: Handshake,
} as const;

export function CeQuOnFait() {
  return (
    <Section id="ce-quon-fait" ariaLabelledby="ce-quon-fait-title">
      <Reveal>
        <Eyebrow>{CE_QU_ON_FAIT.eyebrow}</Eyebrow>
        <SectionTitle id="ce-quon-fait-title" className="mt-6">
          {CE_QU_ON_FAIT.title}
        </SectionTitle>
      </Reveal>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {CE_QU_ON_FAIT.cards.map((card, index) => {
          const Icone = ICONES[card.icon];

          return (
            <Reveal
              as="li"
              key={card.slug}
              delay={index * 70}
              className={SPAN[index]}
            >
              <Card className="h-full">
                <Eyebrow
                  size="sm"
                  lead={
                    <Icone
                      aria-hidden="true"
                      strokeWidth={1.5}
                      className="size-4"
                    />
                  }
                  className="group-hover:text-rouge"
                >
                  {card.slug}
                </Eyebrow>
                <CardTitle>{card.title}</CardTitle>
                <CardText>{card.text}</CardText>
                {/* Chaque carte porte désormais sa ligne de specs : quatre sur
                    cinq finissaient sur un blanc, ce qui se lisait comme un
                    gabarit inachevé. La condition reste, pour qu'une carte
                    ajoutée plus tard sans specs ne rouvre pas le trou. */}
                {card.specs.length > 0 ? (
                  <CardSpecs>
                    {card.specs.map((spec) => (
                      <SpecChip key={spec}>{spec}</SpecChip>
                    ))}
                  </CardSpecs>
                ) : null}
              </Card>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
