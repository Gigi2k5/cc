# Vérifications visuelles et comportementales

Pilote Chrome headless via le protocole CDP, avec le `WebSocket` natif de
Node 22 — **aucune dépendance** (ni Puppeteer, ni Playwright).

Sert à vérifier ce qu'une capture d'écran ne montre pas : scroll-spy, cycle
d'ouverture d'un panneau, focus clavier, arrêt de la boucle de rendu WebGL,
états `prefers-reduced-motion`.

## Usage

```bash
npm run build                          # obligatoire : le harnais sert le build de prod
bash tools/visual/run.sh checks/shell.mjs   # nav, panneau mobile, footer
bash tools/visual/run.sh checks/hero.mjs    # scène 3D du hero
```

Sortie : résumé en console (code de sortie non nul si un échec) et captures PNG
dans `tools/visual/out/` (non versionné).

## Ce que le harnais ne peut pas mesurer

Chrome headless n'a pas de GPU : `run.sh` active **SwiftShader**, un rendu
logiciel, seul moyen d'obtenir WebGL2 sans écran. Conséquences :

- **Les FPS n'ont aucune valeur ici** (~3 img/s en logiciel). Le critère
  « ≥ 50 fps desktop » doit être vérifié sur une vraie machine. À la place, le
  harnais compte les **appels de dessin par frame**, qui est le bon indicateur
  de coût GPU et qui, lui, est valide.
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
