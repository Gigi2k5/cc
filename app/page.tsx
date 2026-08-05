import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { TerminalLine, TerminalKeyword } from "@/components/ui/TerminalLine";
import { CTA, WHATSAPP } from "@/lib/content";

/**
 * PHASE 2 — le shell est réel (nav + footer) ; les sections ci-dessous sont
 * des repères ancrés qui rendent le scroll-spy et le scroll doux testables.
 * Elles sont remplacées par le vrai contenu aux phases 3 à 6.
 */

const PLACEHOLDERS = [
  {
    id: "a-propos",
    eyebrow: "À propos",
    title: "Plus qu'un vendeur de PC.",
    phase: "phase 4",
  },
  {
    id: "ce-quon-fait",
    eyebrow: "Ce qu'on fait",
    title: "Cinq façons de te servir.",
    phase: "phase 4",
  },
  {
    id: "communaute",
    eyebrow: "L'univers Comlan",
    title: "Ici, on n'achète pas qu'un PC.",
    phase: "phase 5",
  },
  {
    id: "faq",
    eyebrow: "FAQ",
    title: "Questions fréquentes.",
    phase: "phase 6",
  },
  {
    id: "contact",
    eyebrow: "Contact",
    title: "On en parle sur WhatsApp ?",
    phase: "phase 6",
  },
] as const;

export default function Home() {
  return (
    <main id="top" className="flex-1">
      {/* Repère de hero — la vraie scène 3D arrive en phase 3. */}
      <Section className="min-h-[calc(100svh-var(--nav-h))] content-center">
        <Eyebrow>Système Comlan</Eyebrow>

        <h1 className="mt-8 font-display text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.98] tracking-[-0.015em]">
          <span className="block">Le PC qu&apos;il te faut.</span>
          <GradientText as="em" className="block">
            Deux pour le prix d&apos;un.
          </GradientText>
        </h1>

        <p className="mt-8 max-w-[30rem] text-[1.125rem] text-craie-2">
          Des PC neufs et reconditionnés adaptés à ton besoin, un accompagnement
          réel, et une communauté qui va au-delà de la simple vente.
        </p>

        <TerminalLine className="mt-7">
          comlan --pack étudiant --budget{" "}
          <TerminalKeyword>250k</TerminalKeyword>
        </TerminalLine>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button href={WHATSAPP.primary.href} size="lg">
            {CTA.advisor}
          </Button>
          <Button href={WHATSAPP.group.href} size="lg" variant="ghost">
            {CTA.community}
          </Button>
        </div>
      </Section>

      {PLACEHOLDERS.map((placeholder) => (
        <Section
          key={placeholder.id}
          id={placeholder.id}
          className="min-h-[70svh] content-center border-t border-ligne-faible"
        >
          <Eyebrow>{placeholder.eyebrow}</Eyebrow>
          <h2 className="mt-6 font-impact text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">
            {placeholder.title}
          </h2>
          <p className="mt-6 font-mono text-xs tracking-[0.14em] text-gris-faible uppercase">
            repère de section · contenu en {placeholder.phase}
          </p>
        </Section>
      ))}
    </main>
  );
}
