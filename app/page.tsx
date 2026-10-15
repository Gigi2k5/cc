import { SectionRule } from "@/components/layout/SectionRule";
import { APropos } from "@/components/sections/APropos";
import { Boutiques } from "@/components/sections/Boutiques";
import { CeQuOnFait } from "@/components/sections/CeQuOnFait";
import { CommentCaMarche } from "@/components/sections/CommentCaMarche";
import { Communaute } from "@/components/sections/Communaute";
import { Contact } from "@/components/sections/Contact";
import { DeuxPourUn } from "@/components/sections/DeuxPourUn";
import { EnBref } from "@/components/sections/EnBref";
import { Evenements } from "@/components/sections/Evenements";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { WHATSAPP } from "@/lib/content";
import {
  countdownLabel,
  countdownSpoken,
  upcomingEvenements,
} from "@/lib/evenements";

/**
 * La page porte du contenu daté (section Événements) : on la régénère toutes
 * les heures pour qu'une édition passée sorte d'elle-même, sans redéploiement.
 * La valeur doit rester un littéral, Next l'analyse statiquement.
 */
export const revalidate = 3600;

/** Toutes les sections du site, séparées par les filets de transition (§9). */
export default function Home() {
  /* Calculé ici, côté serveur, et transmis au hero : celui-ci est un composant
     client, il ne doit surtout pas lire l'horloge lui-même. */
  const [prochain] = upcomingEvenements();
  const evenement = prochain
    ? {
        /* Pas de date arrêtée, pas de compte à rebours : `countdownLabel`
           renverrait le mois, qui n'a rien à faire dans l'emplacement réservé
           au décompte. La voix, elle, le dit — « en décembre 2026 ». */
        countdown:
          prochain.dateStatus === "confirme" ? countdownLabel(prochain) : null,
        countdownSpoken: countdownSpoken(prochain),
        title: prochain.heroTitle,
        meta: prochain.heroMeta,
        /* Pas de billetterie ouverte : le hero renvoie au groupe, comme la
           bande d'annonce. Voir AlertBar. */
        href: prochain.ticket?.href ?? WHATSAPP.group.href,
      }
    : null;

  return (
    <main id="top" className="relative z-10 flex-1">
      <Hero evenement={evenement} />
      <EnBref />
      <APropos />
      <SectionRule />
      <CeQuOnFait />
      <SectionRule />
      <DeuxPourUn />
      {/* L'entonnoir : ce qu'on fait → l'avantage → OÙ acheter → comment ça
          marche. Les boutiques se placent donc avant le mode d'emploi, pas
          après. */}
      <Boutiques />
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
