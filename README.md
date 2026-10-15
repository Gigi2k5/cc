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
npm run check:evenements  # Événements : deux blocs, date à confirmer, orbite, JSON-LD
npm run check:boutiques   # Boutiques : URL exactes, onglets, bascule mobile
npm run check:faq         # accordéon au clavier, contact, tous les liens
npm run check:motion      # magnétisme, spotlight, filets, cohérence motion.ts/CSS
npm run check:touch       # ce qui doit être désactivé au doigt
npm run check:audit       # charge utile, axe-core, sémantique, clavier, SEO
npm run check:breakpoints # 360 / 768 / 1024 / 1280 / 1440
npm run check:responsive  # 320 / 360 / 390 / 414 + desktop : chevauchements,
                          #   troncatures, débordements, cibles tactiles
npm run check:responsive:touch  # le même, en pointeur grossier
npm run shots             # captures des sections (sans vérification)
npm run shots:sections    # captures d'Événements et Boutiques (sans vérification)
npm run shots:boutiques   # recapture les vitrines e-commerce (accès réseau requis)
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
  sections/       les 11 sections de la page + l'orbite d'affiches
  three/          scène du hero, couche réseau, repli CSS
lib/
  content.ts      TOUTE la copie française et les liens réels
  fonts.ts · motion.ts · site.ts · contrast.ts · utils.ts
  evenements.ts   éditions à venir / passées (la seule logique datée)
  hooks/          scroll-spy, révélation, capacité de l'appareil, pointeur…
references/       design system + maquette validée (lecture seule)
tools/visual/     harnais de vérification CDP + capture des vitrines
public/
  evenements/     affiche de l'édition · orbite/ = affiches · photos/ = coin photo
  boutiques/      captures des vitrines, bureau et téléphone
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

La section porte **deux blocs** : les éditions à venir, puis l'historique.
Pas d'onglets — sur une page unique, le scroll *est* la navigation, et des
onglets cacheraient la moitié de la section au visiteur comme aux moteurs.

Une édition vit dans `EVENEMENTS.items` (`lib/content.ts`) avec deux bornes
ISO, `start` et `end`. `lib/evenements.ts` expose deux fonctions strictement
complémentaires sur la même borne `end` — `upcomingEvenements()` et
`pastEvenements()` — donc aucune édition ne peut tomber dans les deux listes,
ni dans aucune. `app/page.tsx` porte `export const revalidate = 3600`.

Conséquence : **le lendemain d'une soirée, l'édition descend d'elle-même dans
l'historique, dans l'heure, sans que personne ne redéploie**. Elle ne disparaît
jamais du site : elle change de bloc. Et s'il n'y a plus rien à venir, le
premier bloc bascule sur son état de repli — jamais un trou dans la page,
toujours un renvoi vers le groupe WhatsApp.

Ajouter une édition = ajouter une entrée dans `items`. Rien d'autre.

### Une édition dont la date n'est pas arrêtée

C'est le cas de la 4ᵉ édition : décembre 2026, jour non décidé. Le champ
`dateStatus` porte cette distinction, et le type l'impose — `Evenement` est une
union discriminée, si bien qu'une édition `"a-confirmer"` **ne compile pas**
sans son libellé de repli. Impossible d'en ajouter une en laissant un trou dans
la bande et dans le hero.

Ce qu'une date non arrêtée change, partout :

- la fiche affiche `décembre 2026 · à confirmer`, jamais une date inventée ;
- **aucun compte à rebours** : `start` n'est qu'une borne de tri, en compter
  les jours reviendrait à annoncer une date qu'on n'a pas. La bande d'annonce
  affiche le mois, et le grand emplacement du hero — fait pour un nombre court
  en Young Serif — reste vide plutôt que d'avaler « DÉCEMBRE 2026 » ;
- **aucune `startDate` déclarée** en données structurées : un moteur
  l'afficherait telle quelle ;
- tarif, programme, affiche et billetterie sont **optionnels**. Sans affiche, la
  fiche prend toute la largeur au lieu de réserver une colonne vide ; sans
  billetterie, le CTA mène au groupe WhatsApp et la bande cesse de promettre
  « Réserver ».

Le jour où la date tombe : trois champs changent, et le compte à rebours, la
bande et les données structurées se rallument seuls.

### L'anneau d'images

L'en-tête de section est un **anneau** : treize visuels posés sur un cercle,
le titre au centre. Les affiches des campagnes y alternent avec les portraits
du **coin photo** de la 3ᵉ édition — le coin photo était au programme de la
soirée, ces visages sont donc la soirée elle-même.

Le centre vide est tout l'intérêt de la forme. La version précédente dispersait
les affiches *derrière* le texte, ce qui obligeait à les voiler pour garder le
titre lisible — donc à les rendre invisibles, ce qui était le reproche. Un
anneau n'a rien derrière le texte : le titre se pose sur l'encre pure, et les
images peuvent être montrées franchement, sans voile ni désaturation.
`check:evenements` mesure ce vide (≥ 180 px libres au centre) : si l'anneau se
resserrait, le contraste du titre redeviendrait une loterie.

La géométrie vit dans `globals.css` (`.photo-ring`), pas en JavaScript — c'est
une chaîne de transformations CSS, et le composant reste rendu côté serveur :

```
translate(-50%,-50%)   centre la carte
rotate(var(--a))       position angulaire
translateY(-r)         sur le cercle
rotate(-a * 0.72)      redressement partiel
```

**Ce dernier facteur est le seul réglage qui compte.** À 0, les cartes restent
tangentes au cercle : joli sur des images abstraites, mais nos portraits se
retrouvent la tête en bas dans toute la moitié basse. À 1, tout est droit et
l'anneau devient une grille circulaire sans vie. À 0,72, l'inclinaison suit le
cercle et aucun visage ne dépasse ~25°.

Pour la même raison, l'anneau **ne tourne pas** : il respire de ±5° sur 30 s.
Un tour complet finit toujours par renverser les visages, quel que soit le
redressement.

Le rayon et la taille des cartes sont des variables réglées par palier (320 /
390 / 640 / 1024 / 1280 px) : aucune position n'est réécrite. Au-dessus de
1024 px le titre se tient au centre ; en dessous le centre ne fait plus que
~210 px et le titre passe sous l'anneau, les deux centrés.

Le bloc est `aria-hidden` : treize images sans rôle individuel n'ont rien à
annoncer une par une.

### Les photos du coin photo

Les mêmes huit portraits reviennent dans la carte de l'édition passée — et là,
ils portent un vrai texte alternatif, situé et numéroté (« Portrait pris au coin
photo de la 3ᵉ édition présentiel. 3 sur 8. »). C'est la distinction qui compte :
dans l'anneau ils sont du décor, dans la carte ils sont de l'information.

Le nombre affiché est **compté**, jamais écrit en dur : une photo ajoutée ne
doit pas laisser un compte faux derrière elle. `check:evenements` le vérifie.

Ajouter des photos à une édition = une entrée `photos` dans `items`.

## Boutiques

Deux vitrines e-commerce, dans `BOUTIQUES` (`lib/content.ts`) :

| Boutique | URL |
|---|---|
| Comlan Community \| PC & Solutions | `comlan-community-pc-solutions.biggigui.com` (place de marché Biggigui) |
| 2G HUB | `2ghub.tech/computers` |

Comme pour la billetterie, **le domaine est annoncé en clair sous le bouton**
plutôt que découvert au clic. `check:boutiques` compare les URL à celles du
brief, recopiées dans le test : remplacer un lien dans `lib/content.ts` fait
tomber la vérification au lieu de passer inaperçu.

### Les captures ne se prennent pas à la main

`npm run shots:boutiques` pilote un Chrome au profil vide, en 1440×900 et
390×844, et écrit dans `public/boutiques/`. Ce n'est pas du confort : une
capture prise à la main embarque la barre d'onglets de celui qui la prend —
messagerie, webmail, comptes ouverts — et publie ces informations privées sur
le site. Le script ne capture qu'après avoir attendu que chaque `<img>` soit
complète, et après un aller-retour de défilement qui déclenche les chargements
différés (sans lui, le bandeau de Biggigui reste un aplat gris).

### Deux présentations, une seule source

Au-dessus de 640 px : une boutique à la fois, choisie dans une bande de deux
tuiles. Statique — avec deux boutiques, un carrousel serait du mouvement sans
information, et dupliquer les entrées pour « remplir » est exclu. La bande est
un vrai `tablist` (`aria-selected`, flèches clavier), au même motif WAI que
l'accordéon de la FAQ.

En dessous de 640 px : **pas d'onglets**. Les deux boutiques s'empilent,
chacune complète. Cacher une boutique sur deux derrière un appui, sur un écran
de 360 px, ne fait économiser aucun défilement.

La pièce délicate est là, et elle mérite d'être comprise avant d'y toucher :

- la **visibilité** est pilotée par CSS seul (`sm:hidden` sur les panneaux non
  sélectionnés), donc elle est juste dès le rendu serveur, avant toute
  hydratation ;
- seules les **étiquettes ARIA** suivent `matchMedia`, parce qu'une media query
  ne peut pas les conditionner. Annoncer un `tabpanel` dont l'onglet n'est pas
  affiché ferait mentir l'arbre d'accessibilité.

`check:boutiques` vérifie les deux présentations et leur sémantique, à 1440,
390 et 320 px.

Ajouter une boutique = une entrée dans `BOUTIQUES.items` et un slug dans
`tools/visual/shoot-boutiques.mjs`. Au-delà de trois, la bande gagnera un
défilement horizontal — une classe conditionnelle, pas un autre système.

## Hiérarchie des titres

Les onze sections portaient exactement le même titre : même police, même
`clamp`, même position en haut à gauche. Pris un par un les blocs tiennent ;
enchaînés, la page s'aplatissait, parce que rien ne disait ce qui porte la
proposition et ce qui l'accompagne.

`components/ui/SectionTitle.tsx` porte désormais cette décision, et elle seule :

- **`majeur`** (inchangé) — à propos, ce qu'on fait, le concept, les boutiques,
  la communauté, les événements ;
- **`appui`** (un cran en dessous) — comment ça marche, la FAQ : des sections
  qui répondent à une question qu'on ne se pose qu'une fois convaincu.

Rien d'autre ne change : ni la copie, ni la mise en page, ni la couleur. Le
`clamp` était recopié dans sept fichiers, dont deux avaient déjà divergé ; il
n'existe plus qu'à un endroit. Contact garde son traitement propre (Instrument
Serif, plus grand) : c'est la section de clôture, elle a le droit.

### Icônes plutôt qu'emoji

Les cartes de « Ce qu'on fait » portaient cinq emoji. C'était le seul élément
générique du site, et le seul dont le dessin changeait d'un appareil à l'autre —
au milieu d'un design system qui impose une police par rôle et des angles nets.
Elles viennent maintenant de `lucide-react`, déjà installé : au trait, en
`strokeWidth` 1,5 pour tenir la ligne fine du site, et en `currentColor`, donc
elles passent au rouge au survol de la carte sans qu'on gère quoi que ce soit.

Dans la foulée, les cinq cartes portent chacune leur ligne de specs : quatre sur
cinq finissaient sur un blanc. Chaque libellé ajouté est repris d'une copie déjà
validée ailleurs — « surcoût = 0 » du bloc 2 pour 1, « depuis 2022 » de la bande
En bref, « partie hebdo » du filigrane Communauté — donc aucune promesse
nouvelle n'a été avancée.

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
liens qu'à 1280 px — donc un panneau de 678 px doit tenir dans 390 px d'écran.
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
3. **Ne rien définir tant qu'il n'y a pas de domaine personnalisé.** Sans
   `NEXT_PUBLIC_SITE_URL`, `lib/site.ts` lit `VERCEL_PROJECT_PRODUCTION_URL`,
   que Vercel injecte au build avec le domaine de production réel — c'est le
   réglage le plus sûr, il ne peut pas se désynchroniser.

   Le jour où un domaine définitif existe (Project Settings → Environment
   Variables, pour les trois environnements) :

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

- **Handles réseaux** — Instagram est branché sur le vrai compte. **Facebook et
  Medium pointent encore sur `#`** : à remplacer dans `lib/content.ts`
  (`SOCIALS`). `check:faq` compte les placeholders restants (4) pour qu'on ne
  les oublie pas, et vérifie qu'aucune URL de réseau ne traîne de paramètre de
  suivi.
- **Domaine définitif** — la production tourne aujourd'hui sur
  `cc-five-sigma.vercel.app`, résolu automatiquement par
  `VERCEL_PROJECT_PRODUCTION_URL`. `NEXT_PUBLIC_SITE_URL` ne doit être définie
  que pour un vrai domaine personnalisé : le gabarit a longtemps documenté
  `comlan-community.vercel.app`, qui répond 404. Voir `.env.example`.
- **Images produit** — le site n'en utilise aucune pour l'instant ; prévoir
  `next/image` si des visuels de PC sont ajoutés.
- **Date de la 4ᵉ édition** — décembre 2026, jour non arrêté. Voir « Une
  édition dont la date n'est pas arrêtée » : trois champs à remplir dans
  `EVENEMENTS.items` et tout se rallume.
- **Affiche de décembre** — absente pour l'instant. Le champ est optionnel, la
  fiche prend toute la largeur sans elle.
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
- [x] Phase 11 — section Boutiques (deux vitrines, bande d'onglets, captures
      automatisées), section Événements à deux blocs avec historique et orbite
      d'affiches, édition sans date ferme, nav à 1280 px
- [x] Phase 12 — passe visuelle : emoji remplacés par des icônes au trait,
      specs sur les cinq cartes, hiérarchie des titres de section
- [x] Phase 13 — anneau d'images en en-tête des Événements, photos du coin
      photo intégrées en galerie, Instagram branché

Suite complète : **338/338 vérifications** sur les 12 scripts du harnais.

| Script | Vérifications |
|---|---|
| `check:shell` | 26 |
| `check:hero` | 23 |
| `check:content` | 22 |
| `check:community` | 23 |
| `check:evenements` | 42 |
| `check:boutiques` | 37 |
| `check:faq` | 30 |
| `check:motion` | 21 |
| `check:audit` | 28 |
| `check:breakpoints` | 25 |
| `check:touch` | 6 |
| `check:responsive` | 55 |

`check:responsive:touch` rejoue les 55 mêmes vérifications en pointeur grossier.
