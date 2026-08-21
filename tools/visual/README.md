# Vérifications visuelles et comportementales

Pilote Chrome headless via le protocole CDP, avec le `WebSocket` natif de
Node 22 — **aucune dépendance** (ni Puppeteer, ni Playwright).

**Prérequis** : un navigateur de la famille Chrome. `run.sh` le cherche seul
— `google-chrome`, `google-chrome-stable`, `chromium`, `chromium-browser`,
puis `~/.local/opt/chrome-linux64/chrome` et `/opt/google/chrome/chrome` — et
`CHROME=/chemin/vers/chrome` force un binaire précis. Sans navigateur il
abandonne avec un message clair plutôt que d'échouer obscurément : ce n'est pas
un détail d'installation, c'est tout le filet de sécurité qui tombe.

Sans droits root, [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/)
se déballe dans `~/.local/opt/` et `run.sh` le trouve tout seul.

Sert à vérifier ce qu'une capture d'écran ne montre pas : scroll-spy, cycle
d'ouverture d'un panneau, focus clavier, arrêt de la boucle de rendu WebGL,
états `prefers-reduced-motion`.

## Usage

```bash
npm run build                          # obligatoire : le harnais sert le build de prod
bash tools/visual/run.sh checks/shell.mjs   # nav, panneau mobile, footer
bash tools/visual/run.sh checks/hero.mjs    # scène 3D du hero
bash tools/visual/run.sh checks/content.mjs # fidélité de la copie, révélations, survols
bash tools/visual/run.sh checks/community.mjs # section Communauté + couche réseau
bash tools/visual/run.sh checks/evenements.mjs # section Événements
bash tools/visual/run.sh checks/faq-contact.mjs # accordéon FAQ au clavier + contact + liens
bash tools/visual/run.sh checks/motion.mjs  # magnétisme, spotlight, filets de section
bash tools/visual/run.sh checks/audit.mjs   # charge utile, axe-core, sémantique, clavier, SEO
bash tools/visual/run.sh checks/breakpoints.mjs # 360 / 768 / 1024 / 1440
bash tools/visual/run.sh checks/responsive.mjs # 320/360/390/414 + desktop :
                                            #   chevauchements, troncatures,
                                            #   débordements, cibles tactiles
bash tools/visual/run.sh checks/shots.mjs   # captures des sections (sans vérification)

# Chemin tactile — ce qui doit être DÉSACTIVÉ au doigt.
POINTER=coarse bash tools/visual/run.sh checks/touch.mjs

# Auditer un site DÉJÀ déployé au lieu du build local.
TARGET=https://exemple.vercel.app bash tools/visual/run.sh checks/audit.mjs
```

Sortie : résumé en console (code de sortie non nul si un échec) et captures PNG
dans `tools/visual/out/` (non versionné).

## Mesure de la charge utile

Le partage critique / différé se fait contre le **HTML servi** (relu par
`fetch(location.href)`), pas contre le DOM : le DOM contient aussi les scripts
injectés par le loader, ce qui ferait passer un chunk différé pour du critique.
Erreur commise une première fois, d'où la précision.

## Mesurer un débordement, un chevauchement, une troncature

`tools/visual/lib/probe.mjs`, consommée par `checks/responsive.mjs`. Deux règles
qui ont chacune coûté un aller-retour :

**`scrollWidth > clientWidth` ne vaut rien.** Ces deux propriétés valent **0 sur
un élément `inline`**, et la moitié des textes du site sont des `<span>`. La
sonde ne pouvait pas échouer, donc elle ne vérifiait rien. On mesure le texte
lui-même avec un `Range` : ses `getClientRects()` sont des quads de *layout*, ni
rognés par `overflow: hidden`, ni raccourcis par `text-overflow: ellipsis` — ce
sont des opérations de peinture. La géométrie **brute** dit si le texte dépasse
sa boîte ; la même géométrie **intersectée** avec les boîtes de rognage des
ancêtres dit ce qui est réellement **peint**, et c'est la seule base valable
pour parler de chevauchement. Sans cette séparation, chaque `truncate` de la
bande d'annonce serait signalé comme un chevauchement.

**Un chevauchement se juge en ratio, pas en pixels.** Un quad de texte est la
boîte de ligne, pas l'encre : dès que l'interlignage est serré, deux lignes
successives d'un même titre se recouvrent. Relevé sur cette page : titre du
hero, quad 58,0 px pour une avance de 47,9 px → 10,1 px (17 %) ; titre de
Communauté, quad 50,0 px pour 40,3 px → 9,7 px (19 %). Une vraie collision côte
à côte partage ~100 % de la hauteur. Seuil retenu : **55 %**, soit trois fois la
marge au-dessus du bleed observé et deux fois sous une vraie collision. À 2 px,
la première version ne remontait que des faux positifs.

Et il faut écarter nommément les superpositions **voulues** : nav collante,
filigrane terminal de Communauté, grain global, `canvas`, panneaux de FAQ
repliés (`inert`).

## Ce que le harnais ne peut pas mesurer

Chrome headless n'a pas de GPU : `run.sh` active **SwiftShader**, un rendu
logiciel, seul moyen d'obtenir WebGL2 sans écran. Conséquences :

- **Les FPS n'ont aucune valeur ici** (~3 img/s en logiciel). Le critère
  « ≥ 50 fps desktop » doit être vérifié sur une vraie machine. À la place, le
  harnais compte les **appels de dessin par frame**, qui est le bon indicateur
  de coût GPU et qui, lui, est valide.
- Toute transition CSS met bien plus longtemps que sa durée nominale à se
  stabiliser : une transition de 150 ms était encore en vol après 200 ms et ne
  s'est fixée qu'après ~1,2 s. Les mesures d'états animés attendent donc 2,5 s.
- Un rendu prenant ~370 ms, les frames « en vol » mettent longtemps à
  s'écouler. Les mesures d'arrêt de boucle se font donc en **deux fenêtres** :
  la première absorbe le drainage, la seconde doit être strictement vide.

## Pièges appris à la dure

- `pkill -f <motif>` **se reconnaît lui-même** si le motif apparaît dans la
  ligne de commande appelante, et tue le shell. Les motifs restent donc dans
  `run.sh`.
- Des serveurs `next start` orphelins qui squattent le port servent un build
  supprimé et renvoient des 500 sur les chunks : la page tourne sans CSS ni JS
  et **tous les résultats deviennent faux, sans avoir l'air faux**. `run.sh`
  nettoie les ports et **abandonne si le CSS ne répond pas 200**.
- Chrome met la page en cache disque : le client CDP force
  `Network.setCacheDisabled`. Un profil neuf est créé à chaque exécution.
- Sans dispositif de pointage, Chrome headless rapporte `hover: none`. Or
  Tailwind v4 encapsule **toutes** ses variantes `hover:` dans
  `@media (hover: hover)` : sans correctif, aucun état de survol n'existe et les
  tests correspondants passent à côté du sujet en croyant tester quelque chose.
  `Emulation.setEmulatedMedia` ne gère pas ces features — `run.sh` les force via
  `--blink-settings=primaryHoverType=2,…`.
- Corollaire longtemps passé inaperçu : ce forçage vaut pour **tous** les
  viewports, donc le viewport « mobile » du harnais rapporte quand même un
  pointeur fin. Tout ce qui doit être désactivé au doigt n'était donc jamais
  exercé. D'où `POINTER=coarse`, qui simule un écran tactile.
- Le forçage du pointeur fin a une conséquence de plus, découverte en rejouant
  la suite sur une machine confortable : `useDeviceTier` conclut **`high`** même
  en viewport mobile (12 cœurs, 32 Go, pointeur fin), donc la scène rend
  légitimement en dpr 2 et non 1,5. `check:hero` affirmait « dpr mobile plafonné
  à 1,5 » sans le savoir : il ne passait que sur une machine à ≤ 4 cœurs ou
  ≤ 4 Go. Il recalcule désormais le palier et vérifie le plafond correspondant ;
  le vrai chemin « low » s'exerce avec `POINTER=coarse`.
- Les états animés se posent **beaucoup** plus lentement qu'en nominal. La
  cascade mot à mot de Communauté (9 segments, 700 ms de transition) n'atteint
  l'opacité 1 qu'à ~2,5 s après la séquence complète du script. Mesurée à 1,8 s
  puis à 2,5 s, elle tombait pile sur la ligne d'arrivée : l'attente est
  passée à 3,5 s pour avoir une marge franche plutôt qu'un pile ou face.
- **Ne jamais figer une valeur qui change chaque jour.** `check:evenements`
  attendait « J−16 » en dur, à cinq endroits. Au premier changement de date,
  quatre vérifications sont tombées sans qu'une ligne du site ait bougé. Le
  compte à rebours est désormais recalculé dans le script — mais par une
  **seconde route indépendante** de `lib/evenements.ts` : la date de début est
  recopiée du brief et la règle de comptage (jours calendaires au Bénin, UTC+1
  sans heure d'été) réécrite sur place. Importer `countdownLabel` ferait du test
  un miroir du code, qui ne vérifierait plus rien.
- **`overflow: hidden` reste défilable par script.** Un test négatif qui pose
  `element.scrollTop = element.scrollHeight` passe donc aussi bien sur le code
  cassé que sur le code corrigé : le premier test écrit pour le panneau de nav
  l'a fait, et n'a rien prouvé. Le vrai état cassé était `overflow: visible` —
  là, `scrollTop` reste à 0. Une sonde d'atteignabilité doit donc vérifier
  `overflow-y` **et** défiler pour de vrai avant de mesurer.
- **Un viewport mobile large mais haut cache les défauts de hauteur.**
  `check:breakpoints` teste 360 px de large sur 900 px de haut : le panneau de
  nav y tenait, alors qu'il débordait de 113 px sur un vrai 360×640. Les
  largeurs de `checks/responsive.mjs` sont donc associées à des hauteurs
  d'appareils réelles (320×568, 360×640, 390×844, 414×896).
- `Input.dispatchKeyEvent` en `rawKeyDown` ne fait pas cliquer un `<button>` :
  il faut `keyDown` avec `text` (`\r` pour Entrée, espace pour Espace). Entrée
  déclenche le clic au keydown, Espace au keyup.
