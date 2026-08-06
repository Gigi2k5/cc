/**
 * Valeurs de mouvement partagées (§9).
 *
 * ⚠️ `app/globals.css` reste la source de vérité : les tokens `--duration-*` et
 * `--ease-*` y sont déclarés et c'est eux que consomme tout le CSS. Ce fichier
 * en est le **miroir pour le JS**, là où une valeur numérique est indispensable
 * (WebGL, calculs de curseur). Une vérification du harnais compare les deux
 * pour qu'ils ne dérivent pas.
 */

/** Durées en millisecondes. */
export const DURATION = {
  micro: 150,
  standard: 300,
  reveal: 700,
} as const;

export const EASE = {
  micro: "ease-out",
  standard: "cubic-bezier(0.22, 0.68, 0, 1)",
  reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/** Décalage entre deux éléments d'une cascade au scroll (§9 : 60–80 ms). */
export const CASCADE_STEP = 70;

/** Attraction magnétique des boutons, au pointeur fin uniquement. */
export const MAGNETIC = {
  /** Fraction de la distance au centre reportée sur le déplacement. */
  strength: 0.22,
  /** Déplacement maximal en px — au-delà le bouton « décolle » du curseur. */
  max: 7,
} as const;

/** Rayon du halo qui suit le curseur sur les cartes, en px. */
export const SPOTLIGHT_RADIUS = 340;
