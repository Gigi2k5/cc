import { Section } from "@/components/layout/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Reveal } from "@/components/ui/Reveal";
import { DEUX_POUR_UN } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * L'équation du concept. Les trois blocs s'assemblent de gauche à droite au
 * scroll ; les opérateurs « + » et « = » arrivent en dernier, une fois les
 * termes posés.
 */
const BLOCK_DELAY = [0, 160, 320];
const OPERATOR_DELAY = [480, 560];

export function DeuxPourUn() {
  const [first, second, total] = DEUX_POUR_UN.blocks;

  return (
    <Section ariaLabelledby="deux-pour-un-title">
      <div className="relative overflow-hidden rounded-lg border border-ligne bg-surface p-8 sm:p-12 lg:px-18 lg:py-20">
        {/* Filigrane machine dans le coin. Purement décoratif : masqué sous
            1024px, où il viendrait chevaucher l'eyebrow. */}
        <p
          aria-hidden="true"
          className="absolute top-7 right-8 hidden font-mono text-[0.6875rem] tracking-[0.18em] text-gris-faible/60 lg:block"
        >
          {"// "}
          {DEUX_POUR_UN.watermark}
        </p>

        <Reveal>
          <Eyebrow>{DEUX_POUR_UN.eyebrow}</Eyebrow>
          <h2
            id="deux-pour-un-title"
            className="mt-6 font-impact text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1]"
          >
            {DEUX_POUR_UN.title}
          </h2>
          <p className="mt-5 max-w-[34rem] text-[1.0625rem] leading-[1.7] text-gris">
            {DEUX_POUR_UN.body}
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col items-stretch gap-4 lg:mt-14 lg:flex-row lg:gap-6">
          <Reveal className="flex-1" delay={BLOCK_DELAY[0]}>
            <Block {...first} />
          </Reveal>

          <Reveal
            className="flex items-center justify-center lg:justify-normal"
            delay={OPERATOR_DELAY[0]}
          >
            <GradientText className="font-accent text-[2.25rem] leading-none lg:text-[2.75rem]">
              +
            </GradientText>
          </Reveal>

          <Reveal className="flex-1" delay={BLOCK_DELAY[1]}>
            <Block {...second} />
          </Reveal>

          <Reveal
            className="flex items-center justify-center lg:justify-normal"
            delay={OPERATOR_DELAY[1]}
          >
            <span className="font-mono text-sm text-gris">=</span>
          </Reveal>

          <Reveal className="flex-1" delay={BLOCK_DELAY[2]}>
            <Block {...total} highlight />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Block({
  label,
  title,
  note,
  highlight = false,
}: {
  label: string;
  title: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-sm border p-7 sm:p-8",
        highlight
          ? "border-rouge bg-rouge/4"
          : "border-ligne bg-surface-2",
      )}
    >
      <p
        className={cn(
          "font-mono text-[0.6875rem] tracking-[0.18em]",
          highlight ? "text-rouge" : "text-gris",
        )}
      >
        {label}
      </p>
      <p className="mt-3 font-display text-[1.75rem] leading-tight lg:text-[2rem]">
        {title}
      </p>
      <p className="mt-2.5 font-mono text-xs text-gris">{note}</p>
    </div>
  );
}
