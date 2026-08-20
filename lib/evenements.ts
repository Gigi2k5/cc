import { EVENEMENTS, type Evenement } from "./content";

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
