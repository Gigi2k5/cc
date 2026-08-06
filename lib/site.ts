/**
 * URL publique du site. Nécessaire pour les URL absolues d'Open Graph et le
 * lien canonique.
 *
 * Le domaine définitif n'est pas arrêté (point ouvert du design system) : la
 * valeur de repli est le domaine Vercel par défaut. À définir dans
 * NEXT_PUBLIC_SITE_URL avant la mise en production — voir le README.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://comlan-community.vercel.app"
).replace(/\/$/, "");
