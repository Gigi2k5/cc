import { Section } from "@/components/layout/Section";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Reveal } from "@/components/ui/Reveal";
import { COMMENT_CA_MARCHE } from "@/lib/content";

/** Trois étapes, numéros en Young Serif dégradé (accent rare, §4). */
export function CommentCaMarche() {
  return (
    <Section ariaLabelledby="comment-ca-marche-title">
      <Reveal>
        <Eyebrow>{COMMENT_CA_MARCHE.eyebrow}</Eyebrow>
        <h2
          id="comment-ca-marche-title"
          className="mt-6 font-impact text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.1]"
        >
          {COMMENT_CA_MARCHE.title}
        </h2>
      </Reveal>

      <ol className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-5">
        {COMMENT_CA_MARCHE.steps.map((step, index) => (
          <Reveal as="li" key={step.number} delay={index * 80}>
            <div className="border-t border-ligne pt-7">
              <GradientText className="block font-accent text-[2.5rem] leading-none lg:text-[2.75rem]">
                {step.number}
              </GradientText>
              <h3 className="mt-4 text-[1.125rem] font-semibold text-craie">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[0.90625rem] leading-[1.65] text-gris">
                {step.text}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={260}>
        <p className="mt-10">
          <Chip>{COMMENT_CA_MARCHE.note}</Chip>
        </p>
      </Reveal>
    </Section>
  );
}
