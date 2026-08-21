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
npm run check:responsive  # 320 / 360 / 390 / 414 + desktop : chevauchements,
                          #   troncatures, débordements, cibles tactiles
npm run check:responsive:touch  # le même, en pointeur grossier
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

### Le rendre voyant sans le rendre criard

Une section au 7ᵉ écran ne sert à rien : quelqu'un qui arrive par WhatsApp,
regarde le hero et repart n'a jamais su qu'il y avait une soirée. Trois niveaux
répondent à ça, tous alimentés par `upcomingEvenements()` — ils s'allument et
s'éteignent ensemble.

1. **La bande d'annonce** (`components/layout/AlertBar.tsx`), tout en haut,
   avant le logo. **Le levier retenu n'est pas le rouge, c'est l'inversion** :
   sur un site intégralement quasi-noir, un aplat craie est ce qu'on peut faire
   de plus voyant — et ça ne consomme rien du capital d'accent, que §3 réserve
   à un ou deux mots par écran. C'est une exception assumée à « sombre
   partout », arbitrée pour ça et pour rien d'autre. Le seul rouge y est la
   pastille et la pilule de réservation. La bande **entière** est le lien : un
   seul arrêt clavier, et une cible tactile de sa hauteur complète.
2. **Le bloc compte à rebours du hero** (`components/sections/HeroEvent.tsx`),
   dernier de la chorégraphie de chargement, avec un halo qui respire. Reprend
   le traitement du bloc `[ TOTAL ]` de la section 2-pour-1. Desktop seulement :
   le hero mobile tient déjà tout juste en une hauteur d'écran, et là-bas c'est
   la bande qui porte l'annonce. **Ce n'est pas un dispositif au-dessus de la
   ligne de flottaison** — voir la mesure plus bas.
3. **La pastille sur le lien « Événements »** de la nav, pour ceux qui balaient
   la navigation sans lire le hero.

Trois points qui ont demandé un arbitrage :

- **Pas de texte défilant.** Un ruban aurait été plus voyant encore, mais il
  aurait déclenché le WCAG 2.2.2 et obligé à fournir un bouton pause. Le seul
  mouvement est une pastille décorative — et elle reste **visible** en
  animations réduites, ce qui demande une règle explicite (même piège que le
  caret du hero).
- **Ni pop-up ni cookie.** Rien à fermer, donc rien à mémoriser : le dispositif
  disparaît de lui-même. Le site n'écrit toujours aucune donnée.
- **La bande n'est pas collante**, et c'est un choix reconduit. La rendre
  collante coûterait 48 px de chaque écran en permanence : sur un 360×640 —
  taille Android courante — la bande plus la nav confisqueraient 112 px, soit
  17 % de l'écran, pour toute la visite. La pastille sur « Événements » dans la
  nav est déjà le rappel persistant, et elle ne coûte rien.
- **`--alert-h`**, déclaré dans `globals.css` et basculé par un `data-alert`
  sur le `body`, vaut 0 le reste de l'année. Le hero le retranche de sa hauteur
  utile : sans ça la bande pousserait son bas sous la ligne de flottaison.

#### Le bloc du hero contre la ligne de flottaison

Bas du bloc contre la hauteur de fenêtre, mesuré sur le build de production :

| Fenêtre | Bas du bloc | Marge |
|---|---|---|
| 1280×720 | 897 px | −177 px |
| 1366×768 | 902 px | −134 px |
| 1440×800 | 906 px | −106 px |
| 1512×850 | 911 px | −61 px |
| 1440×900 | 906 px | −6 px |
| 1920×1080 | 950 px | +130 px |

Le bloc n'est donc entier au-dessus de la ligne de flottaison qu'à partir de
~910 px de fenêtre. **Décision : on le garde tel quel, et on cesse de le
présenter comme un dispositif d'accueil.**

La colonne de texte du hero fait 688 px à elle seule, et le hero mesure 841 à
948 px selon la largeur : il a **toujours** dépassé l'écran sur toutes ces
fenêtres — un `min-h` est un plancher, pas un plafond. Le bloc est le dernier
temps du hero, pas un badge. Le faire tenir à 768 px demanderait de retirer
~135 px à la composition, c'est-à-dire de rogner le `h1` ou le rythme des CTA :
on échangerait l'atout le plus fort de la page contre la quatrième mention du
même événement dans le même écran. Et sur desktop l'annonce est **déjà**
imratable à l'arrivée — la bande craie est à `y=0`, avant le logo, sur toutes
les fenêtres. Rogner 14 px de padding du hero ferait passer la seule bande
900 px au-dessus du pli : un gain d'une classe de fenêtre contre une retouche
de la composition signature. Non.

Le compte à rebours est calculé côté serveur, en jours calendaires du Bénin :
« J−16 », puis « DEMAIN », « AUJOURD'HUI » et « EN COURS » pendant la soirée.
Il est doublé d'une forme parlée — un lecteur d'écran entend « dans 16 jours »
et non « J moins 16 ».

## Mobile & responsive

Le trafic vient surtout de WhatsApp, donc du téléphone, et c'est là que ce site
a mordu trois fois. `check:responsive` rejoue **320 / 360 / 390 / 414 px et le
desktop**, avec des hauteurs d'appareils réelles plutôt qu'un 900 px commode :
c'est la hauteur qui décide de ce qui passe sous la ligne de flottaison.

### La méthode, parce qu'elle a coûté cher

Ne **jamais** tester un débordement avec `scrollWidth > clientWidth` : ces deux
propriétés valent **0 sur un élément `inline`**, et la moitié des textes du site
sont des `<span>`. Une sonde qui ne peut pas échouer ne vérifie rien.

On mesure donc le texte lui-même avec un `Range` (`tools/visual/lib/probe.mjs`).
Ses `getClientRects()` sont des quads de *layout* : ni rognés par
`overflow: hidden`, ni raccourcis par `text-overflow: ellipsis` — ce sont deux
opérations de peinture. D'où deux lectures qu'il faut tenir séparées :

- la géométrie **brute** dit si un texte dépasse sa boîte (troncature,
  débordement) ;
- la même géométrie **intersectée** avec les boîtes de rognage de tous les
  ancêtres dit ce qui est réellement **peint**, seule base valable pour parler
  de chevauchement. Sans cette distinction, chaque `truncate` de la bande
  d'annonce serait signalé comme un chevauchement : le texte tronqué s'étend en
  layout jusque sous ses voisins alors qu'à l'écran il s'arrête sur l'ellipse.

Et le seuil de chevauchement est un **ratio**, pas des pixels. Un quad de texte
est la boîte de ligne, pas l'encre : dès que l'interlignage est serré, deux
lignes successives d'un même titre se recouvrent toujours un peu. Relevé ici :
titre du hero, quad 58,0 px pour une avance de 47,9 px → 10,1 px (17 %) ; titre
de Communauté, quad 50,0 px pour 40,3 px → 9,7 px (19 %). Une vraie collision
côte à côte partage ~100 % de la hauteur de ligne. Le seuil est à **55 %**. La
première version de la sonde, à 2 px, ne remontait que des faux positifs — trois
défauts sur quatre étaient dans le harnais, une fois de plus.

**Superpositions voulues, à écarter avant de crier au bug** : la nav collante,
le filigrane terminal de Communauté (3,5 % d'opacité), le grain global, les
`canvas`, et les panneaux de FAQ repliés (`inert`). La sonde les exclut
nommément.

### Trois défauts trouvés, dont un bloquant

1. **Le panneau de nav mobile était sans issue sur les téléphones courts.** Six
   liens en 36 px, un CTA et la signature faisaient 692 px de haut ; le panneau
   ne défilait pas (`overflow` par défaut) et le scroll du `body` est verrouillé
   à l'ouverture. Mesuré : bas de panneau à **753 px pour un écran de 640 px**
   (360×640, une des tailles Android les plus courantes) — le bouton « Parler
   sur WhatsApp » était **hors d'atteinte**, et à 320×568 « Contact » lui-même
   était coupé. Corrigé sur trois fronts : `overflow-y-auto` (le filet qui ne
   peut pas échouer), rythme vertical resserré (692 → 642 px, donc ça tient sans
   défiler dès 667 px de haut — iPhone SE 2/3, iPhone 8), et la hauteur réservée
   en haut qui suit désormais la bande : elle valait toujours
   `--nav-h + --alert-h` alors que la bande a défilé dès le premier pixel, soit
   48 px de vide pris sur ce qui doit tenir dans l'écran.

   Le test qui le prouve **défile pour de vrai** jusqu'au bout du panneau et
   vérifie que le CTA est dans l'écran. Piège au passage : `overflow: hidden`
   reste défilable **par script**. Vérifier `element.scrollTop` sans vérifier
   `overflow-y` ne prouve rien — le premier test négatif écrit ici passait
   aussi bien sur le code cassé que sur le code corrigé.

2. **La bande d'annonce dégradait en « 3E ÉDIT… » à 320 px.** Le groupe central
   dispose de 138 px et il lui en faut 153 (pastille de date 75 + gouttière 8 +
   titre 70). Gratter les 15 px sur les gouttières et l'interlettrage faisait
   tomber le calcul à 2 px près, soit un pile ou face selon la police réellement
   chargée. Le titre est donc **masqué sous 360 px** : la date, le compte à
   rebours et l'action portent le message, et le nom accessible du lien ne change
   pas d'un pixel. Un mot coupé dans une bande de promo se lit comme un bug.

3. **Sept cibles tactiles sous 44 px** : le wordmark de la nav (132×19) et les
   six liens réseaux du panneau de contact et du pied de page (~90×20). Le
   harnais ne les mesurait pas — `check:faq` ne couvrait que les en-têtes de FAQ
   et le bouton du groupe, alors que ce README annonçait la règle comme mesurée.
   Corrigé par `min-h-11`, sans rien déplacer à l'écran.

**Le plancher tactile dépend du pointeur, pas de la largeur** : 44 px au doigt
(§12), 24 px à la souris (WCAG 2.5.8 AA). Un lien de nav desktop de 36 px de haut
n'est pas un défaut, et le signaler noierait les vrais. Restent exemptés les
liens de colonne du pied de page : `<a>` en ligne dans un `<li>`, 20 px de haut
mais 32 px de pas vertical — ils passent 2.5.8 par la **clause d'espacement**,
pas par la taille. C'est le seul endroit du site où §12 est lu au sens de la
norme plutôt qu'au pied de la lettre.

### Les chips du programme

Elles s'empilaient une par ligne sous 640 px, aux bords droits tous différents.
Ce n'est pas rattrapable en resserrant : à 320 px la carte n'offre que 216 px de
contenu et les étiquettes mesurent de 106 à 185 px. Elles passent donc en
**plaques pleine largeur** sous `sm` — la même information devient une pile
régulière qui parle la langue de la fiche technique juste au-dessus (§2), et
pour exactement la même hauteur : 7 × 41 px + 6 × 8 px de gouttière contre
7 × 46 px avant. Le nuage d'étiquettes revient dès 640 px.

### Le paysage

C'est l'orientation la plus vite oubliée, et celle où la hauteur utile fond de
moitié. Un 844×390 (iPhone 14 couché) reste en mode burger — la nav ne passe en
liens qu'à 1024 px — donc un panneau de 642 px doit tenir dans 390 px d'écran.
C'est exactement le cas que le défilement du panneau rend viable, et
`check:responsive` le vérifie au même titre que les autres : aucun
chevauchement, aucune troncature, CTA atteignable. Le programme y retrouve son
nuage d'étiquettes (4 + 3), puisqu'on est au-dessus de `sm`.

### Ce qui reste hors de portée

Aucune de ces mesures ne remplace un vrai téléphone, et il faut le dire plutôt
que le laisser oublier. Chrome headless ne donne ni le rendu de police d'Android,
ni le clavier virtuel, ni le scroll tactile réel, ni les fps, ni les barres
d'interface qui mangent la hauteur de fenêtre. **À contrôler sur un appareil
avant mise en ligne**, en priorité : le panneau de nav sur un écran court, la
bande d'annonce à 320 px, et le programme de la section Événements.

Un point qui ne se voit qu'en vrai : le `viewport` ne déclare pas
`viewport-fit=cover`, donc iOS garde le contenu dans la zone sûre — pas de
recouvrement par l'encoche, mais une bande à la couleur du thème (`#080808`)
au-dessus de la bande craie. C'est le comportement voulu et le plus sûr ;
à confirmer à l'œil sur un iPhone à encoche.

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
| JS critique (bloque le 1er rendu) | 146 Ko | ≤ 180 Ko |
| JS différé (scène 3D) | 363 Ko | hors chemin critique |
| CSS | 11 Ko | ≤ 20 Ko |
| Polices préchargées | 117 Ko | ≤ 140 Ko |
| Total page | 697 Ko en 20 requêtes | < 800 Ko |
| CLS | 0 | < 0,02 |

Le CSS est passé de 9 à 11 Ko avec la passe responsive (variantes de largeur
supplémentaires) — 2 Ko pour trois défauts mobiles, dont un bloquant.

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
chacun —, hiérarchie de titres continue, repères sémantiques,
`prefers-reduced-motion` respecté partout.

Les **cibles tactiles** sont désormais mesurées pour de bon, par
`check:responsive`, sur tous les éléments interactifs de la page et non plus sur
deux d'entre eux : 44 px au doigt (§12), 24 px à la souris (WCAG 2.5.8 AA). Sept
cibles étaient sous le plancher sans que rien ne le signale — voir « Mobile &
responsive ». Seule exception assumée : les liens de colonne du pied de page,
qui passent par la clause d'espacement de 2.5.8 plutôt que par la taille.

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
- **Vrai téléphone** — voir « Ce qui reste hors de portée » : le panneau de nav
  sur écran court, la bande à 320 px et le programme de la section Événements
  sont les trois points à confirmer à la main.
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
- [x] Phase 10 — passe mobile-first : 320 / 360 / 390 / 414 / paysage / desktop,
      sonde de chevauchement et de troncature au `Range`, cibles tactiles
      réellement mesurées

Suite complète : **290/290 vérifications** sur les 11 scripts du harnais.

| Script | Vérifications |
|---|---|
| `check:shell` | 26 |
| `check:hero` | 23 |
| `check:content` | 22 |
| `check:community` | 23 |
| `check:evenements` | 37 |
| `check:faq` | 29 |
| `check:motion` | 21 |
| `check:audit` | 28 |
| `check:breakpoints` | 20 |
| `check:touch` | 6 |
| `check:responsive` | 55 |

`check:responsive:touch` rejoue les 55 mêmes vérifications en pointeur grossier.
