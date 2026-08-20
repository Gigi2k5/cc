import { ALERTE, EVENEMENTS, type Evenement } from "./content";

/**
 * Les éditions encore à venir, la plus proche en premier.
 *
 * L'heure est lue ici plutôt que dans le composant : c'est une décision de
 * domaine, pas de rendu. La fonction n'est appelée que depuis un composant
 * serveur, donc elle s'évalue au prérendu puis à chaque revalidation de la
 * page — jamais dans le navigateur, où une seconde lecture d'horloge pourrait
 * diverger du HTML déjà servi.
 *
 * `now` est injectable pour rendre la bascule vérifiable sans attendre le
 * 6 septembre.
 */
export function upcomingEvenements(now = Date.now()): readonly Evenement[] {
  return EVENEMENTS.items
    .filter((item) => new Date(item.end).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/** Bénin : UTC+1 toute l'année, sans heure d'été. */
const BENIN_OFFSET_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * Numéro du jour calendaire au Bénin. On compte en jours et non en heures :
 * à 23 h la veille, il reste « 1 jour », pas « 0 » — c'est ce que lit un
 * humain sur un compte à rebours.
 */
function dayIndex(ms: number): number {
  return Math.floor((ms + BENIN_OFFSET_MS) / DAY_MS);
}

/** Jours calendaires restants avant le début. Négatif une fois passé. */
export function daysUntil(iso: string, now = Date.now()): number {
  return dayIndex(new Date(iso).getTime()) - dayIndex(now);
}

/**
 * Le compte à rebours, en voix machine : « J−16 », puis « DEMAIN »,
 * « AUJOURD'HUI », et « EN COURS » pendant la soirée.
 *
 * Calculé côté serveur, au prérendu puis à chaque revalidation horaire : le
 * navigateur ne recalcule rien, donc rien ne peut diverger du HTML servi.
 */
export function countdownLabel(event: Evenement, now = Date.now()): string {
  if (now >= new Date(event.start).getTime()) return ALERTE.countdown.ongoing;

  const days = daysUntil(event.start, now);
  if (days <= 0) return ALERTE.countdown.today;
  if (days === 1) return ALERTE.countdown.tomorrow;
  return `${ALERTE.countdown.prefix}${days}`;
}

/**
 * Le compte à rebours tel qu'il doit être *entendu*. « J−16 » est une notation
 * visuelle : une synthèse vocale la lit « J moins seize ». Le nom accessible
 * dit donc « dans 16 jours ».
 */
export function countdownSpoken(event: Evenement, now = Date.now()): string {
  if (now >= new Date(event.start).getTime()) return "en cours";

  const days = daysUntil(event.start, now);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "demain";
  return `dans ${days} jours`;
}
