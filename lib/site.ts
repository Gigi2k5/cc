/**
 * URL publique du site — indispensable au lien canonique, à `og:url`, à
 * l'URL absolue de l'image de partage, au sitemap et au robots.txt.
 *
 * Trois niveaux, dans cet ordre :
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — le domaine définitif, dès qu'il est arrêté.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — injectée par Vercel au build, elle vaut
 *    le domaine de production réel du projet. Ce repli existe parce qu'une
 *    valeur devinée à la main est pire que pas de valeur du tout : elle a
 *    pointé le canonique et l'image OG vers un domaine appartenant à un tiers,
 *    et l'aperçu de partage ne se chargeait pas.
 * 3. `http://localhost:3000` — développement local.
 *
 * ⚠️ `VERCEL_PROJECT_PRODUCTION_URL` n'est pas préfixée `NEXT_PUBLIC_` : elle
 * n'existe que côté serveur. Ce module ne doit donc être importé que depuis du
 * code serveur (layout, robots, sitemap) — ce qui est le cas aujourd'hui.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, "");
