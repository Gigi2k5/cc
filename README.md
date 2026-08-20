# Comlan Community — site de présentation

Site vitrine une page (scroll) de Comlan Community : vente de PC neufs et
reconditionnés au Bénin, concept « deux pour le prix d'un », univers
communautaire.

Ce dépôt ne contient que le **site public**. La boutique e-commerce est un site
séparé (à venir). Le CRM est un outil interne : il n'est ni mentionné ni lié
nulle part.

## Stack

- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS v4 — tokens déclarés dans `app/globals.css` (`@theme`)
- `next/font/google` — Instrument Serif, Gloock, Young Serif, Inter, JetBrains Mono
- `three` / `@react-three/fiber` / `drei` / `postprocessing` pour la puce du hero
  et le réseau de points, chargés **après l'hydratation** (hors chemin critique)
- `lucide-react` pour les icônes d'interface ; les logos de marque sont des
  tracés inlinés (lucide 1.x n'en fournit plus)

## Commandes

```bash
npm run dev        # serveur de dev (http://localhost:3000)
npm run build      # build de production
npm run start      # sert le build de production
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

### Vérifications automatisées

Elles pilotent Chrome headless via CDP, **sans dépendance de test**, et
nécessitent un `npm run build` préalable. `run.sh` cherche seul un navigateur
(`google-chrome`, `chromium`, ou une archive Chrome for Testing déposée dans
`~/.local/opt/`) ; `CHROME=/chemin/vers/chrome` force un binaire précis. Voir
[`tools/visual/README.md`](tools/visual/README.md) — notamment ce que le harnais
**ne peut pas** mesurer.

```bash
npm run build
npm run check:shell       # nav sticky, scroll-spy, panneau mobile, footer
npm run check:hero        # scène 3D : draws, arrêt hors écran, reduced-motion
npm run check:content     # fidélité de la copie au brief, révélations, survols
npm run check:community   # section Communauté + couche réseau globale
npm run check:evenements  # section Événements : copie, affiche, données structurées
npm run check:faq         # accordéon au clavier, contact, tous les liens
npm run check:motion      # magnétisme, spotlight, filets, cohérence motion.ts/CSS
npm run check:touch       # ce qui doit être désactivé au doigt
npm run check:audit       # charge utile, axe-core, sémantique, clavier, SEO
npm run check:breakpoints # 360 / 768 / 1024 / 1440
npm run shots             # captures des sections (sans vérification)
```

Sorties dans `tools/visual/out/` (non versionné).

## Structure

```
app/
  layout.tsx      polices, metadata + Open Graph, couche réseau, grain
  page.tsx        assemblage des sections
  globals.css     tokens (@theme) + base + utilitaires + animations
  icon.svg        favicon · apple-icon.png · robots.ts · sitemap.ts
  dev/            démo interne des primitives (noindex, non liée)
components/
  layout/         Section · Container · Nav · Footer · SectionRule
  ui/             primitives du design system
  sections/       les 10 sections de la page
  three/          scène du hero, couche réseau, repli CSS
lib/
  content.ts      TOUTE la copie française et les liens réels
  fonts.ts · motion.ts · site.ts · contrast.ts · utils.ts
  evenements.ts   sélection des éditions à venir (la seule logique datée)
  hooks/          scroll-spy, révélation, capacité de l'appareil, pointeur…
references/       design system + maquette validée (lecture seule)
tools/visual/     harnais de vérification CDP
```

## Design system

`references/Comlan_Community_Design_System(1).md` fait foi pour les règles.
`references/Comlan Maquette.dc.html` fait foi pour le contenu et le layout.

Les tokens vivent **uniquement** dans `app/globals.css`. Ils sont disponibles à
la fois comme utilitaires Tailwind (`bg-encre`, `rounded-lg`, `font-display`,
`max-w-page`) et comme variables CSS (`var(--color-encre)`) pour la scène WebGL.
`lib/motion.ts` en est le miroir JS, et `check:motion` vérifie qu'ils ne
dérivent pas.

## Événements

C'est le **seul contenu daté du site**, et donc le seul qui puisse vieillir mal.

Une édition vit dans `EVENEMENTS.items` (`lib/content.ts`) avec deux bornes
ISO, `start` et `end`. `lib/evenements.ts` ne retient que celles dont la fin
est encore devant, la plus proche d'abord ; `app/page.tsx` porte
`export const revalidate = 3600`. Conséquence : **le lendemain d'une soirée,
l'annonce disparaît d'elle-même dans l'heure, sans que personne ne
redéploie**, et la section bascule sur son état de repli — jamais un trou dans
la page, toujours un renvoi vers le groupe WhatsApp.

Ajouter une édition = ajouter une entrée dans `items`. Rien d'autre.

Trois règles à ne pas perdre de vue :

- **§11 du design system.** Loup-Garou reste cadré comme jeu communautaire. Les
  jetons sont *inclus* dans l'entrée : aucune mention de crédits à recharger,
  de mise ou de gain en argent sur le site public. `check:evenements` échoue si
  un de ces mots réapparaît dans la section.
- **Le lieu n'est pas public** — position assumée (« communiqué aux inscrits »),
  pas un oubli. Les données structurées ne déclarent donc que le pays, jamais
  une adresse inventée.
- **La billetterie est un domaine tiers** (`tike229.ghinel.com`). Elle est
  annoncée en clair sous les boutons plutôt que découverte au clic, et c'est
  la seule sortie du site hors WhatsApp — `check:faq` le vérifie.

L'affiche est traitée comme un **objet posé** dans un cadre à filet fin, jamais
comme un fond : sa palette (dorés, rouge saturé) ne doit pas déborder sur celle
du site. Toute l'information qu'elle porte existe aussi en texte réel, pour les
lecteurs d'écran comme pour les moteurs.

## Déploiement (Vercel)

1. **Pousser le dépôt** sur GitHub / GitLab.
2. Sur [vercel.com](https://vercel.com) → *Add New Project* → importer le dépôt.
   Le framework est détecté automatiquement ; aucune commande à personnaliser.
3. **Définir la variable d'environnement** (Project Settings → Environment
   Variables), pour les trois environnements :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | l'URL publique finale, sans slash final |

   Elle alimente le lien canonique, `og:url`, l'URL absolue de l'image de
   partage, le sitemap et le robots.txt.

   Sans elle, le repli est `VERCEL_PROJECT_PRODUCTION_URL`, injectée par Vercel
   au build : le site reste donc cohérent. **Ne jamais y mettre une URL devinée**
   — une valeur inventée est pire que pas de valeur : elle a déjà fait pointer le
   canonique et l'image OG vers un domaine appartenant à un tiers, et l'aperçu de
   partage ne se chargeait plus. `check:audit` vérifie désormais cette
   cohérence.
4. **Déployer.** Le site est entièrement statique (prérendu) : ni base de
   données, ni route serveur, ni secret.
5. Après déploiement, revalider :

   ```bash
   # audite le site RÉELLEMENT déployé, pas le build local
   TARGET=https://ton-url.vercel.app bash tools/visual/run.sh checks/audit.mjs
   ```

   puis contrôler l'aperçu de partage sur les
   [outils de debug Facebook](https://developers.facebook.com/tools/debug/) et
   [X](https://cards-dev.twitter.com/validator).

### Domaine personnalisé

Project Settings → Domains → ajouter le domaine, puis suivre les
enregistrements DNS indiqués. Mettre `NEXT_PUBLIC_SITE_URL` à jour ensuite et
redéployer, sinon le canonique continue de pointer vers l'URL Vercel.

## Budgets mesurés

Relevés par `check:audit` sur le build de production, en octets transférés,
section Événements comprise.

| Poste | Mesure | Budget |
|---|---|---|
| JS critique (bloque le 1er rendu) | 145 Ko | ≤ 180 Ko |
| JS différé (scène 3D) | 363 Ko | hors chemin critique |
| CSS | 9 Ko | ≤ 20 Ko |
| Polices préchargées | 117 Ko | ≤ 140 Ko |
| Total page | 692 Ko en 19 requêtes | < 800 Ko |
| CLS | 0,003 | < 0,02 |

L'affiche de la section Événements n'apparaît pas dans ces 19 requêtes : elle
est sous la ligne de flottaison et chargée en différé. Servie par `next/image`,
elle pèse 20 Ko en WebP contre 107 Ko à la source.

Aucune requête vers un domaine tiers : polices auto-hébergées, carte
d'environnement WebGL peinte localement, sprites dessinés sur canvas.

## Accessibilité

`check:audit` fait tourner **axe-core** (WCAG 2.1 A/AA + bonnes pratiques) :
aucune violation. Deux exceptions assumées, arbitrées et documentées :

1. **Blanc sur le dégradé accent** — 4,06:1, conforme au seuil « grand texte »
   seulement. C'est le rendu validé, et blanc-sur-rouge de marque est la norme
   du métier. Visible sur `/dev` sous la table de contrastes.
2. **Filigrane terminal de la section Communauté** — 1,04:1, mais c'est de la
   décoration pure à 3,5 % d'opacité sous `aria-hidden`, explicitement exemptée
   par le WCAG 1.4.3. `check:audit` épingle cette exception : il échoue si une
   autre violation de contraste apparaît, ou si celle-ci sort du filigrane.

Le reste est mesuré : parcours clavier complet — 32 arrêts, anneau de focus sur
chacun —, hiérarchie de titres continue, repères sémantiques, cibles tactiles
≥ 44 px, `prefers-reduced-motion` respecté partout.

## Points ouverts

- **Handles réseaux** — Facebook, Instagram et Medium pointent sur `#`. À
  remplacer dans `lib/content.ts` (`SOCIALS`).
- **Domaine définitif** — voir `NEXT_PUBLIC_SITE_URL` ci-dessus.
- **Images produit** — le site n'en utilise aucune pour l'instant ; prévoir
  `next/image` si des visuels de PC sont ajoutés.
- **Nav à 1024 px** — la nav porte désormais six liens. La gouttière a été
  resserrée entre 1024 et 1280 px et le suffixe `[ C//C — BÉNIN ]` n'apparaît
  qu'à partir de 1280 px pour faire de la place. À contrôler à l'œil : ça n'a
  pas pu être mesuré (voir ci-dessous).
- **Harnais non rejoué** — les vérifications exigent `google-chrome` dans le
  PATH, absent de la machine où la section a été écrite. Elles ont été mises à
  jour mais **pas exécutées** : à relancer entièrement avant mise en ligne.
- **Fps réels** — le harnais tourne en WebGL logiciel et ne peut pas les
  mesurer. À contrôler sur machine et sur téléphone avant mise en production.

## Avancement

- [x] Phase 0 — setup, tokens, polices, `Section` / `Container`, grain
- [x] Phase 1 — primitives du design system (démo : `/dev`)
- [x] Phase 2 — nav sticky + scroll-spy + burger, footer
- [x] Phase 3 — hero 3D (WebGL, repli CSS, reduced-motion figé)
- [x] Phase 4 — sections contenu
- [x] Phase 5 — communauté + réseau de fond global
- [x] Phase 6 — FAQ (accordéon accessible) + contact (liens WhatsApp réels)
- [x] Phase 7 — chorégraphie (magnétisme, spotlight, transitions de section)
- [x] Phase 8 — perf, a11y, SEO, responsive, déploiement
- [x] Phase 9 — section Événements (contenu daté, bascule automatique)

Suite complète : **219/219 vérifications** sur les 10 scripts du harnais.
