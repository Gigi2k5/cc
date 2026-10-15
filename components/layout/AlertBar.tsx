import { ALERTE, WHATSAPP } from "@/lib/content";
import { cn } from "@/lib/utils";
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

  /* Sans billetterie ouverte, la bande mène au groupe WhatsApp : c'est là que
     la date et les inscriptions tomberont. Le libellé suit — annoncer
     « Réserver » pour aboutir à une conversation serait une promesse en l'air. */
  const destination = event.ticket?.href ?? WHATSAPP.group.href;
  const cta = event.ticket ? ALERTE.cta : ALERTE.ctaSansBilletterie;
  const dateFerme = event.dateStatus === "confirme";
  /* La bande porte deux formes du titre — longue et courte — dont une seule est
     affichée selon la largeur. Les deux restent dans le DOM, donc sans ce nom
     accessible explicite un lecteur d'écran annoncerait le titre DEUX fois.
     Le visuel devient décoratif et cette phrase dit tout, une fois, et mieux :
     « dans 16 jours » plutôt que « J moins 16 ». */
  const nomAccessible = `${ALERTE.label} : ${event.heroTitle}, ${event.heroMeta}, ${countdownSpoken(event)}. ${cta}.`;

  return (
    <aside aria-label={ALERTE.label} className="relative z-50 bg-craie text-encre">
      <a
        href={destination}
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
              « 3E ÉDITION ». La troncature n'est plus qu'un filet de sécurité.

              Le titre disparaît sous 360 px, et ce n'est pas de la place qu'on
              gagne au rabais. Mesuré à 320 px : le groupe central dispose de
              138 px et il lui en faut 153 (pastille de date 75 + gouttière 8 +
              titre 70) — il manque 15 px, et le filet rendait « 3E ÉDIT… ».
              Un mot coupé dans une bande de promo se lit comme un bug ; en
              gratter les 15 px sur les gouttières et l'interlettrage faisait
              tomber le calcul à 2 px près, soit un pile ou face selon la police
              réellement chargée. Le titre est ce qui se sacrifie le mieux : la
              date, le compte à rebours et l'action, eux, portent le message —
              et le nom accessible du lien, lui, ne change pas d'un pixel. */}
          <span className="hidden min-w-0 truncate min-[360px]:block sm:hidden">
            {event.alertTitleShort}
          </span>
          <span className="hidden min-w-0 truncate sm:inline">{event.alertTitle}</span>
          {/* Le point médian n'existe que s'il a quelque chose à séparer :
              une édition sans métadonnée arrêtée (places, tarif) laisserait
              sinon un séparateur orphelin au milieu de la bande. */}
          {event.alertMeta ? (
            <>
              <span aria-hidden="true" className="hidden shrink-0 text-encre/45 sm:inline">
                ·
              </span>
              <span className="hidden shrink-0 text-encre/70 sm:inline">
                {event.alertMeta}
              </span>
            </>
          ) : null}
        </span>

        <span aria-hidden="true" className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-5">
          {/* Le compte à rebours reste visible même sur le plus petit écran :
              c'est lui qui crée l'urgence.

              Sauf quand il n'y en a pas. Sans date arrêtée, ce qui s'affiche
              ici est le mois — « DÉCEMBRE 2026 », quatre fois plus large qu'un
              « J−16 ». Mesuré à 320px : il venait se poser sur la pastille
              « [ 12.26 ] » (8×13px de recouvrement) et rognait 64px du titre à
              360px. Or la pastille dit DÉJÀ le mois : le répéter coûtait la
              place du titre pour zéro information. Il réapparaît à 640px, où
              la bande a de quoi le porter. */}
          <span
            className={cn(
              "font-mono text-[0.625rem] font-medium tracking-[0.1em] sm:text-xs sm:tracking-[0.16em]",
              dateFerme ? "" : "hidden sm:inline",
            )}
          >
            {countdown}
          </span>
          <span className="flex items-center gap-1.5 rounded-pill bg-accent-grad px-3 py-1.5 font-sans text-[0.6875rem] font-semibold text-white sm:px-4 sm:py-2 sm:text-[0.8125rem]">
            {cta}
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
