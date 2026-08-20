import { ALERTE } from "@/lib/content";
import {
  countdownLabel,
  countdownSpoken,
  upcomingEvenements,
} from "@/lib/evenements";

/**
 * Bande d'annonce, tout en haut — avant le logo.
 *
 * Le levier n'est pas le rouge, c'est **l'inversion** : sur un site
 * intégralement quasi-noir, un aplat craie est ce qu'on peut faire de plus
 * voyant, et ça ne consomme rien du capital d'accent (§3 : le rouge reste un
 * accent, jamais la vedette). Le seul rouge ici est la pastille qui pulse et
 * la pilule de réservation — deux petites surfaces.
 *
 * La bande **entière** est le lien : un seul arrêt clavier, et une cible
 * tactile qui fait toute sa hauteur plutôt qu'une pilule de 32 px (§12).
 *
 * Elle n'est pas collante : elle défile avec la page. Elle est vue à
 * l'arrivée, elle ne confisque pas l'écran ensuite.
 *
 * Rien à masquer, rien à mémoriser : elle disparaît d'elle-même quand
 * l'édition est passée, donc pas de bouton « fermer » et pas de stockage.
 */
export function AlertBar() {
  const [event] = upcomingEvenements();
  if (!event) return null;

  const countdown = countdownLabel(event);
  /* La bande porte deux formes du titre — longue et courte — dont une seule est
     affichée selon la largeur. Les deux restent dans le DOM, donc sans ce nom
     accessible explicite un lecteur d'écran annoncerait le titre DEUX fois.
     Le visuel devient décoratif et cette phrase dit tout, une fois, et mieux :
     « dans 16 jours » plutôt que « J moins 16 ». */
  const nomAccessible = `${ALERTE.label} : ${event.heroTitle}, ${event.heroMeta}, ${countdownSpoken(event)}. ${ALERTE.cta}.`;

  return (
    <aside aria-label={ALERTE.label} className="relative z-50 bg-craie text-encre">
      <a
        href={event.ticket.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={nomAccessible}
        className="group mx-auto flex h-[var(--alert-h)] max-w-page items-center gap-3 px-[var(--gutter)] sm:gap-5"
      >
        <span aria-hidden="true" className="alert-dot shrink-0" />

        <span
          aria-hidden="true"
          className="flex min-w-0 items-center gap-2 font-mono text-[0.625rem] tracking-[0.1em] uppercase sm:gap-3.5 sm:text-xs sm:tracking-[0.16em]"
        >
          <span className="shrink-0 rounded-sm bg-encre px-1.5 py-0.5 text-craie sm:px-2 sm:py-1">
            [ {event.dateShort} ]
          </span>
          {/* `min-w-0` + `truncate` : en flex, un texte `nowrap` qui ne rentre
              pas ne se coupe pas — il DÉBORDE par-dessus ses voisins. C'est ce
              qui se produisait à 320 et 360 px, où « J−16 » venait se poser sur
              « 3E ÉDITION ». Les tailles ci-dessus suffisent à ce que ça tienne
              partout ; la troncature n'est que le filet de sécurité. */}
          <span className="min-w-0 truncate sm:hidden">{event.alertTitleShort}</span>
          <span className="hidden min-w-0 truncate sm:inline">{event.alertTitle}</span>
          <span aria-hidden="true" className="hidden shrink-0 text-encre/45 sm:inline">
            ·
          </span>
          <span className="hidden shrink-0 text-encre/70 sm:inline">
            {event.alertMeta}
          </span>
        </span>

        <span aria-hidden="true" className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-5">
          {/* Le compte à rebours reste visible même sur le plus petit écran :
              c'est lui qui crée l'urgence. */}
          <span className="font-mono text-[0.625rem] font-medium tracking-[0.1em] sm:text-xs sm:tracking-[0.16em]">
            {countdown}
          </span>
          <span className="flex items-center gap-1.5 rounded-pill bg-accent-grad px-3 py-1.5 font-sans text-[0.6875rem] font-semibold text-white sm:px-4 sm:py-2 sm:text-[0.8125rem]">
            {ALERTE.cta}
            <span
              aria-hidden="true"
              className="hidden transition-transform duration-[var(--duration-standard)] ease-standard group-hover:translate-x-0.5 sm:inline"
            >
              →
            </span>
          </span>
        </span>
      </a>
    </aside>
  );
}
