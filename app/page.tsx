import { APropos } from "@/components/sections/APropos";
import { CeQuOnFait } from "@/components/sections/CeQuOnFait";
import { CommentCaMarche } from "@/components/sections/CommentCaMarche";
import { Communaute } from "@/components/sections/Communaute";
import { Contact } from "@/components/sections/Contact";
import { DeuxPourUn } from "@/components/sections/DeuxPourUn";
import { EnBref } from "@/components/sections/EnBref";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";

/** PHASE 6 — toutes les sections du site sont en place. */
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
      <Faq />
      <Contact />
    </main>
  );
}
