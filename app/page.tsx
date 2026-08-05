import { Section } from "@/components/layout/Section";
import { Hero } from "@/components/sections/Hero";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * PHASE 3 — le hero est réel. Les sections ci-dessous restent des repères
 * ancrés (scroll-spy testable), remplacés aux phases 4 à 6.
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
      <Hero />

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
