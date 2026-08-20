# Vérifications visuelles et comportementales

Pilote Chrome headless via le protocole CDP, avec le `WebSocket` natif de
Node 22 — **aucune dépendance** (ni Puppeteer, ni Playwright).

**Prérequis** : `google-chrome` doit être dans le `PATH`. Sans lui `run.sh`
n'a rien à piloter et aucune vérification ne peut tourner — ce n'est pas un
détail d'installation, c'est tout le filet de sécurité qui tombe.

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
- `Input.dispatchKeyEvent` en `rawKeyDown` ne fait pas cliquer un `<button>` :
  il faut `keyDown` avec `text` (`\r` pour Entrée, espace pour Espace). Entrée
  déclenche le clic au keydown, Espace au keyup.
