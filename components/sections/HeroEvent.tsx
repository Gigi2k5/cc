import { GradientText } from "@/components/ui/GradientText";
import { ALERTE } from "@/lib/content";

export type HeroEventData = {
  countdown: string;
  /** Forme entendue du compte à rebours : « dans 16 jours », pas « J−16 ». */
  countdownSpoken: string;
  title: string;
  meta: string;
  href: string;
};

/**
 * Le bloc événement du hero — le « avant-première » du dispositif.
 *
 * Reprend le traitement du bloc `[ TOTAL ]` de la section 2-pour-1, déjà
 * validé : bordure rouge sur un voile à 4 %. Le compte à rebours est en Young
 * Serif dégradé, à la taille d'un chiffre clé (§4 : accents rares — c'est le
 * seul Young Serif du hero).
 *
 * Le bloc entier est le lien : pas de troisième bouton qui viendrait
 * concurrencer les deux CTA du hero, et un seul arrêt clavier de plus.
 *
 * **Desktop uniquement.** Le hero mobile tient déjà tout juste en une hauteur
 * d'écran ; en dessous de 1024 px c'est la bande d'annonce, en haut de page,
 * qui porte l'information — et elle est plus voyante encore.
 */
export function HeroEvent({ event }: { event: HeroEventData }) {
  return (
    <a
      href={event.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${ALERTE.heroEyebrow} : ${event.title}, ${event.meta}, ${event.countdownSpoken}.`}
      className="group glow-breathe mt-7 hidden items-center gap-5 rounded-sm border border-rouge bg-rouge/4 px-6 py-4 transition-[border-color,translate,background-color] duration-[var(--duration-standard)] ease-standard hover:-translate-y-0.5 hover:bg-rouge/8 lg:flex"
    >
      <GradientText aria-hidden className="shrink-0 font-accent text-[2rem] leading-none">
        {event.countdown}
      </GradientText>

      <span aria-hidden="true" className="min-w-0">
        <span className="flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.2em] text-rouge uppercase">
          <span aria-hidden="true">{"//"}</span>
          {ALERTE.heroEyebrow}
        </span>
        <span className="mt-1 block truncate font-mono text-[0.75rem] text-craie">
          {event.title}
          <span aria-hidden="true" className="text-gris">
            {" · "}
          </span>
          <span className="text-gris">{event.meta}</span>
        </span>
      </span>

      <span
        aria-hidden="true"
        className="ml-auto shrink-0 font-mono text-sm text-rouge transition-transform duration-[var(--duration-standard)] ease-standard group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  );
}
