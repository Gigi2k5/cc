import { Section } from "@/components/layout/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { A_PROPOS } from "@/lib/content";

/** Grille 2 colonnes : titre d'impact à gauche, propos et signature à droite. */
export function APropos() {
  return (
    <Section
      id="a-propos"
      ariaLabelledby="a-propos-title"
      containerClassName="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-20"
    >
      <Reveal>
        <Eyebrow>{A_PROPOS.eyebrow}</Eyebrow>
        <h2
          id="a-propos-title"
          className="mt-6 font-impact text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.1]"
        >
          {A_PROPOS.title}
        </h2>
      </Reveal>

      <div>
        <Reveal delay={80}>
          <p className="text-[1.0625rem] leading-[1.75] text-craie-2 lg:text-[1.125rem]">
            {A_PROPOS.body}
          </p>
        </Reveal>

        <Reveal delay={160}>
          {/* Bloc signature — voix machine, filet rouge à gauche. */}
          <p className="mt-8 border-l-2 border-rouge pl-4 font-mono text-[0.8125rem] leading-[1.8] text-gris">
            {A_PROPOS.signature.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
