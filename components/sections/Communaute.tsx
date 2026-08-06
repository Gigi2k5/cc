import type { CSSProperties } from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Reveal } from "@/components/ui/Reveal";
import { COMMUNAUTE, CTA, WHATSAPP } from "@/lib/content";

/** Titre révélé mot à mot : ~55 ms entre chaque mot. */
const WORD_STEP = 55;

/**
 * L'univers Comlan. Fond très sombre, motif terminal en filigrane qui se tape
 * ligne à ligne puis dérive lentement, et le réseau global qui s'intensifie ici
 * (piloté par NetworkScene, qui vise cette section).
 *
 * Le fond est semi-transparent : la couche réseau fixe passe derrière lui, elle
 * ne doit pas être masquée.
 */
export function Communaute() {
  const words = COMMUNAUTE.title.join(" ").split(" ");

  return (
    <section
      id="communaute"
      aria-labelledby="communaute-title"
      className="relative overflow-hidden border-t border-ligne-faible bg-[#050505]/78 py-[calc(var(--section-y)/2)]"
    >
      <TerminalWatermark />

      <Container className="relative text-center">
        <Reveal>
          <Eyebrow className="justify-center">{COMMUNAUTE.eyebrow}</Eyebrow>
        </Reveal>

        {/* Le nom accessible porte la phrase entière : le découpage en mots
            est purement visuel et reste masqué aux lecteurs d'écran.
            Le Reveal englobant déclenche les mots, qui gardent chacun son
            délai — voir la règle descendante dans globals.css. */}
        <Reveal>
        <h2
          id="communaute-title"
          aria-label={`${COMMUNAUTE.title.join(" ")} ${COMMUNAUTE.titleAccent}`}
          className="mx-auto mt-8 max-w-[18ch] font-display text-[clamp(2.4rem,6.5vw,4.5rem)] leading-[1.05] tracking-[-0.01em]"
        >
          <span aria-hidden="true">
            {words.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="reveal inline-block"
                data-word-reveal
                style={{ "--reveal-delay": `${index * WORD_STEP}ms` } as CSSProperties}
              >
                {word}
                {" "}
              </span>
            ))}
            <GradientText
              as="em"
              className="reveal inline-block"
              style={
                { "--reveal-delay": `${words.length * WORD_STEP}ms` } as CSSProperties
              }
            >
              {COMMUNAUTE.titleAccent}
            </GradientText>
          </span>
        </h2>
        </Reveal>

        <Reveal delay={260}>
          <p className="mx-auto mt-8 max-w-[35rem] text-[1.0625rem] leading-[1.7] text-gris lg:text-[1.125rem]">
            {COMMUNAUTE.body}
          </p>
        </Reveal>

        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {COMMUNAUTE.tags.map((tag, index) => (
            <Reveal as="li" key={tag} delay={340 + index * 70}>
              <Chip>{tag}</Chip>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={580}>
          <p className="mt-11">
            <Button href={WHATSAPP.group.href} size="lg">
              {CTA.community}
            </Button>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Motif terminal en filigrane (~3,5 %). Chaque ligne se tape une fois, puis le
 * bloc entier dérive très lentement. Les lignes sont doublées pour que la
 * dérive boucle sans saut.
 */
function TerminalWatermark() {
  const lines = [...COMMUNAUTE.terminal, ...COMMUNAUTE.terminal];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035]"
    >
      <div className="terminal-drift px-[var(--gutter)] py-10">
        {lines.map((line, index) => (
          <p key={index} className="leading-[2.6] text-craie">
            <span
              className="terminal-type font-mono text-[0.8125rem]"
              style={
                {
                  "--type-chars": line.length + 2,
                  "--rise-delay": `${(index % COMMUNAUTE.terminal.length) * 500}ms`,
                } as CSSProperties
              }
            >
              &gt; {line}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}
