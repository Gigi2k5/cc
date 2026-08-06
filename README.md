# Comlan Community — site de présentation

Site vitrine une page (scroll) de Comlan Community : vente de PC neufs et
reconditionnés au Bénin, concept « deux pour le prix d'un », univers
communautaire.

Ce dépôt ne contient que le **site public**. La boutique e-commerce est un site
séparé (à venir).

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 — tokens déclarés dans `app/globals.css` (`@theme`)
- `next/font/google` — Instrument Serif, Gloock, Young Serif, Inter, JetBrains Mono
- À venir : `three` / `@react-three/fiber` (hero 3D), `framer-motion`, `lucide-react`

## Commandes

```bash
npm run dev        # serveur de dev (http://localhost:3000)
npm run build      # build de production
npm run start      # sert le build de production
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run check:shell # vérifs nav/footer en pilotant Chrome (build requis)
npm run check:hero  # vérifs de la scène 3D du hero
npm run check:content # fidélité de la copie, révélations, survols
npm run check:community # section Communauté + couche réseau globale
npm run check:faq   # accordéon FAQ (clavier) + contact + tous les liens
npm run check:motion # magnétisme, spotlight, filets, cohérence motion.ts/CSS
npm run check:touch # chemin tactile : ce qui doit être désactivé au doigt
```

## Structure

```
app/
  layout.tsx      polices, metadata, grain global
  page.tsx        assemblage des sections
  globals.css     tokens (@theme) + base + utilitaires maison
components/
  layout/         Section · Container · Nav · Footer
  ui/             primitives du design system
  sections/       sections de la page
  three/          scène WebGL du hero + couche réseau
lib/
  fonts.ts        les 5 polices et leurs variables CSS
references/       design system + maquette validée (lecture seule)
```

## Design system

`references/Comlan_Community_Design_System(1).md` fait foi pour les règles
(couleurs, typo, motion, a11y). `references/Comlan Maquette.dc.html` fait foi
pour le contenu et le layout.

Les tokens vivent **uniquement** dans `app/globals.css`. Ils sont disponibles à
la fois comme utilitaires Tailwind (`bg-encre`, `rounded-lg`, `shadow-glow`,
`font-display`, `max-w-page`) et comme variables CSS (`var(--color-encre)`) pour
la scène WebGL et les couches canvas.

## Avancement

- [x] Phase 0 — setup, tokens, polices, `Section` / `Container`, grain
- [x] Phase 1 — primitives du design system (démo : `/dev`)
- [x] Phase 2 — nav sticky + scroll-spy + burger, footer
- [x] Phase 3 — hero 3D (WebGL, repli CSS, reduced-motion figé)
- [x] Phase 4 — sections contenu (En bref, À propos, Ce qu'on fait, 2 pour 1, Comment ça marche)
- [x] Phase 5 — communauté + réseau de fond global (couche fixe, parallaxe, intensification)
- [x] Phase 6 — FAQ (accordéon accessible) + contact (liens WhatsApp réels)
- [x] Phase 7 — chorégraphie (magnétisme, spotlight, transitions de section)
- [ ] Phase 8 — perf, a11y, SEO, déploiement

## Déploiement

Vercel (instructions détaillées en phase 8).
