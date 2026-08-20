import { SectionRule } from "@/components/layout/SectionRule";
import { APropos } from "@/components/sections/APropos";
import { CeQuOnFait } from "@/components/sections/CeQuOnFait";
import { CommentCaMarche } from "@/components/sections/CommentCaMarche";
import { Communaute } from "@/components/sections/Communaute";
import { Contact } from "@/components/sections/Contact";
import { DeuxPourUn } from "@/components/sections/DeuxPourUn";
import { EnBref } from "@/components/sections/EnBref";
import { Evenements } from "@/components/sections/Evenements";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";

/**
 * La page porte du contenu daté (section Événements) : on la régénère toutes
 * les heures pour qu'une édition passée sorte d'elle-même, sans redéploiement.
 * La valeur doit rester un littéral, Next l'analyse statiquement.
 */
export const revalidate = 3600;

/** Toutes les sections du site, séparées par les filets de transition (§9). */
export default function Home() {
  return (
    <main id="top" className="relative z-10 flex-1">
      <Hero />
      <EnBref />
      <APropos />
      <SectionRule />
      <CeQuOnFait />
      <SectionRule />
      <DeuxPourUn />
      <SectionRule />
      <CommentCaMarche />
      <Communaute />
      <SectionRule />
      <Evenements />
      <SectionRule />
      <Faq />
      <Contact />
    </main>
  );
}
