import { Section } from "@/components/layout/Section";
import { APropos } from "@/components/sections/APropos";
import { CeQuOnFait } from "@/components/sections/CeQuOnFait";
import { CommentCaMarche } from "@/components/sections/CommentCaMarche";
import { Communaute } from "@/components/sections/Communaute";
import { DeuxPourUn } from "@/components/sections/DeuxPourUn";
import { EnBref } from "@/components/sections/EnBref";
import { Hero } from "@/components/sections/Hero";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * PHASE 5 — hero, sections de contenu et Communauté réels. FAQ et Contact
 * restent des repères ancrés (scroll-spy testable), remplacés en phase 6.
 */

const PLACEHOLDERS = [
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
    <main id="top" className="relative z-10 flex-1">
      <Hero />
      <EnBref />
      <APropos />
      <CeQuOnFait />
      <DeuxPourUn />
      <CommentCaMarche />
      <Communaute />

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
