import { Section } from "@/components/layout/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ } from "@/lib/content";

/** Titre à gauche, accordéon à droite — comme la maquette (1fr / 1.4fr). */
export function Faq() {
  return (
    <Section
      id="faq"
      ariaLabelledby="faq-title"
      containerClassName="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-20"
    >
      <Reveal>
        <Eyebrow>{FAQ.eyebrow}</Eyebrow>
        <h2
          id="faq-title"
          className="mt-6 font-impact text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.1]"
        >
          {FAQ.title}
        </h2>
      </Reveal>

      <Reveal delay={80}>
        <Accordion items={FAQ.items} />
      </Reveal>
    </Section>
  );
}
