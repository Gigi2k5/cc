import { Section } from "@/components/layout/Section";
import { Card, CardSpecs, CardText, CardTitle } from "@/components/ui/Card";
import { SpecChip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
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

export function CeQuOnFait() {
  return (
    <Section id="ce-quon-fait" ariaLabelledby="ce-quon-fait-title">
      <Reveal>
        <Eyebrow>{CE_QU_ON_FAIT.eyebrow}</Eyebrow>
        <h2
          id="ce-quon-fait-title"
          className="mt-6 font-impact text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.1]"
        >
          {CE_QU_ON_FAIT.title}
        </h2>
      </Reveal>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {CE_QU_ON_FAIT.cards.map((card, index) => (
          <Reveal
            as="li"
            key={card.slug}
            delay={index * 70}
            className={SPAN[index]}
          >
            <Card className="h-full">
              <Eyebrow
                size="sm"
                lead={card.lead}
                className="group-hover:text-rouge"
              >
                {card.slug}
              </Eyebrow>
              <CardTitle>{card.title}</CardTitle>
              <CardText>{card.text}</CardText>
              {card.specs.length > 0 ? (
                <CardSpecs>
                  {card.specs.map((spec) => (
                    <SpecChip key={spec}>{spec}</SpecChip>
                  ))}
                </CardSpecs>
              ) : null}
            </Card>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
