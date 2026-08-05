# Comlan Community — Design System (v3, version finale à valider)

> Référentiel visuel unique pour la maquette puis le code des sites Comlan Community.
> **Direction retenue : « le vernaculaire machine » (spec / terminal), sombre & cinétique.**
> On garde uniquement les couleurs de marque. Logo à refaire (le système n'en dépend pas).
> Convention : **[Fixé]** = imposé · **[Défini]** = arrêté ici · **[À pousser]** = validé sur le
> principe, exécution à travailler.

---

## 1. Direction & principes

1. **Le vernaculaire machine.** Le site parle comme les PC qu'on vend : étiquettes de specs, couche
   monospace, motif « terminal », précision. C'est ça la signature — pas un effet, un langage. Colle
   à « tout est calculé ».
2. **Sombre & premium.** Fond quasi-noir, beaucoup d'espace, texture grain discrète. Haut de gamme,
   pas flashy.
3. **Cinétique.** Le mouvement fait partie de l'identité (entrées orchestrées, assemblage de texte,
   révélations au scroll, micro-interactions). Toujours fluide. Niveau de référence : Tamebi.
4. **Éditorial + machine.** Contraste assumé entre une voix **éditoriale** (serifs, émotion) et une
   voix **machine** (monospace, specs, crédibilité). Ce contraste EST le style.
5. **Mobile-first.** Trafic surtout WhatsApp/mobile : on conçoit en colonne étroite, le desktop
   enrichit (curseur, parallaxe légère).

> ⚠️ La couleur rouge/orange reste un **accent** (curseur, caret, CTA) — plus jamais la vedette.
> « Fond noir + halo rouge » seul = look IA générique ; on l'évite.

---

## 2. Signature : le vernaculaire machine **[Retenue · exécution À pousser]**

Éléments de langage récurrents :
- **Étiquettes de specs** (`Core i5` · `16 Go DDR4` · `SSD 512` · `reconditionné · garanti`) comme
  briques de design, pas juste comme infos produit.
- **Couche monospace** pour les eyebrows, labels, chiffres, métadonnées.
- **Motif terminal** : préfixe `>`, curseur qui clignote, texte qui « s'assemble » au chargement.
- **Ton « calculé »** : grilles nettes, alignements précis, données assumées.

**État :** direction validée par Ghilth. Le rendu visuel + l'animation de l'aperçu ne sont **pas
encore au niveau** — à retravailler en profondeur au moment de la maquette (c'est le point qu'on va
challenger le plus). Objectif : que le « terminal » soit élégant et premium, jamais gadget/dev-cliché.

---

## 3. Couleurs

| Token | Hex | Rôle |
|---|---|---|
| `--rouge` | `#FA1500` **[Fixé]** | Accent signature, actions, caret |
| `--orange` | `#EA441A` **[Fixé]** | Fin de dégradé, accent chaud |
| `--noir` | `#000000` **[Fixé]** | Noir de marque |
| `--encre` | `#080808` | Fond de page |
| `--surface` | `#101010` | Cartes, blocs |
| `--surface-2` | `#161616` | Champs, chips |
| `--ligne` | `#242424` | Bordures fines, séparateurs |
| `--craie` | `#F5F3EF` | Texte principal (blanc cassé chaud) |
| `--gris` | `#8F8F8F` | Texte secondaire, mono |
| `--rouge-fonce` | `#C81100` | État pressé |

- `--grad: linear-gradient(105deg,#FA1500,#EA441A)` → 1–2 mots clés par écran, CTA, caret.
- Accent lumineux **discret** autorisé (glow sur CTA/caret) ; jamais en grand aplat.
- Contraste texte cible **WCAG AA** (4.5:1).

---

## 4. Typographie **[Défini]**

Système à trois voix : **éditoriale** (serifs), **courante** (Inter), **machine** (mono).

### Rôles — un job par police (règle stricte)
| Police | Rôle unique | Ne pas faire |
|---|---|---|
| **Instrument Serif** | Hero + grands titres éditoriaux (fin, élégant) | Pas de texte courant |
| **Gloock** | Titres de section à fort impact (contraste, statement) | Pas de paragraphes |
| **Young Serif** | Accents rares : chiffres clés, pull-quotes, mot mis en exergue | Pas en continu, pas en titre long |
| **Inter** | Texte courant, UI, boutons, listes | — |
| **JetBrains Mono** | Specs, eyebrows, labels, motif terminal (la « voix machine ») | Pas de longs blocs |

> ⚠️ **Discipline obligatoire** : jamais deux serifs dans le même bloc. Instrument Serif = serif
> dominant. Gloock et Young Serif = ponctuation, employés avec parcimonie (sinon incohérence).

### Échelle (responsive `clamp`)
| Niveau | Taille | Police / poids | Réglages |
|---|---|---|---|
| Hero | `clamp(2.8rem, 8vw, 5.5rem)` | Instrument Serif 400 | 0.98, -0.01em |
| H1 section (impact) | `clamp(2.2rem, 5vw, 3.6rem)` | Gloock 400 | 1.02 |
| H2 | `clamp(1.7rem, 3vw, 2.4rem)` | Instrument Serif 400 | 1.1 |
| H3 | `1.3rem` | Inter 600 | 1.25 |
| Chiffre clé / exergue | `clamp(2rem, 5vw, 3.4rem)` | Young Serif 400 | 1 |
| Corps L | `1.15rem` | Inter 400 | 1.65 |
| Corps | `1rem` | Inter 400 | 1.65 |
| Petit | `0.875rem` | Inter 500 | 1.5 |
| Eyebrow / spec / label | `0.75rem` | JetBrains Mono 500, UPPERCASE, +0.16em | `--gris` |

Signature typo : hero en Instrument Serif avec 1–2 mots en dégradé ; eyebrows et specs en mono.

---

## 5. Espacement **[Défini]**

Base 4 px : `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160`.
- Padding vertical de section : `clamp(80px, 12vw, 160px)`.
- Gouttière : 20 px (mobile) → 32 px (desktop).
- Padding cartes : 28–36 px.

---

## 6. Rayons, ombres, lumière **[Défini]**

| Token | Valeur | Usage |
|---|---|---|
| `--r-sm` | 8px | Chips specs, champs (angles nets = esprit machine) |
| `--r-md` | 14px | Boutons |
| `--r-lg` | 22px | Cartes, blocs |
| `--r-pill` | 999px | Badges, pills |
| `--ombre` | `0 20px 60px rgba(0,0,0,.55)` | Élévation |
| `--glow` | `0 0 40px rgba(250,21,0,.35)` | Halo rouge discret (CTA, caret) |

Bordure standard `1px solid var(--ligne)` · sur verre `1px solid rgba(255,255,255,.08)`.
Grain léger (~4 %) sur `--encre` pour casser le plat.

---

## 7. Grille & breakpoints **[Défini]**

- Conteneur max **1200 px**, marge latérale 20 px (mobile) / 40 px (desktop).
- Colonnes : 4 (mobile) · 8 (tablette) · 12 (desktop).
- Breakpoints : `≤640` mobile · `641–1024` tablette · `≥1025` desktop.

---

## 8. Iconographie **[Défini]**

- Style **trait** 1.5–2 px, coins légèrement arrondis, monochrome `--craie`, accent `--rouge` si actif.
- Réseaux (WhatsApp, Facebook, Instagram, Medium) : logos monochromes → `--rouge` au survol.
- Pas d'icônes pleines multicolores.

---

## 9. Motion **[Riche mais fluide · exécution À pousser]**

| Type | Durée | Easing |
|---|---|---|
| Micro (hover, focus) | 150 ms | `ease-out` |
| Standard | 300 ms | `cubic-bezier(.22,.68,0,1)` |
| Révélation scroll | 700 ms | `cubic-bezier(.16,1,.3,1)` |

Séquences cohérentes avec le « terminal » :
- **Chargement hero** : le titre s'assemble (type-on / mask reveal), le caret clignote, les specs
  apparaissent en cascade, le CTA en dernier.
- **Scroll reveal** en cascade (fade + `translateY` 24 px, délai 60–80 ms).
- **Chiffres** : compteurs qui s'incrémentent (Young Serif).
- **Curseur** (desktop) : caret/lueur discrète, boutons légèrement magnétiques.
- **`prefers-reduced-motion`** : tout se fige sur l'état final, caret statique.

> Le niveau d'exécution du mouvement (comme le rendu du terminal) est le chantier prioritaire de la
> maquette : viser Tamebi, pas un template animé.

---

## 10. Composants (spécifications, sans code)

- **Étiquette de spec (chip)** : mono, `--surface-2`, bordure `--ligne`, `--r-sm`, padding 7×11.
- **Ligne terminal** : mono `--gris`, préfixe `>` , mot-clé en `--craie`, caret rouge clignotant.
- **Bouton primaire** : fond `--grad`, texte blanc, `--r-md`. Hover : `-2px` + `--glow`. Actif :
  `--rouge-fonce`. Focus : anneau 2 px visible.
- **Bouton secondaire / ghost** : transparent, bordure `--ligne`, texte `--craie`. Hover : bordure
  `--rouge`.
- **Carte** : `--surface`, bordure fine, `--r-lg`, padding 28–36. Hover : bordure `--rouge`,
  `--ombre`, `-4px`. Structure : eyebrow (mono) → titre → texte → lien.
- **Badge « 2 pour 1 »** : pill, bordure `--rouge` sur sombre ou fond `--grad` selon l'emphase.
- **Navigation** : sticky, verre dépoli (`blur` + fine bordure) au scroll, transparente en haut.
  Wordmark · liens · bouton WhatsApp. Mobile : burger → panneau plein écran.
- **Champ** : `--surface-2`, bordure `--ligne`, `--r-sm`, label au-dessus. Focus : bordure `--rouge`
  + anneau. Erreur : bordure `--rouge` + message court (voix interface).
- **Accordéon FAQ** : items séparés `--ligne`, question (Inter 600) + chevron, ouverture animée 300 ms.
- **Pied de page** : `--noir`, wordmark + phrase, colonnes (nav / contact / communauté), ligne réseaux.

---

## 11. Voix & ton **[Défini]**

- Clair, direct, un peu stratège, énergique. Français, casse phrase, voix active.
- Boutons = action réelle (« Parler à un conseiller »).
- Signature : « Deux pour le prix d'un. Tout est calculé. »
- **Loup-Garou en public** = jeu / activité communautaire de stratégie. **Aucune** mention de crédits
  payants / retrait en argent sur les pages publiques.
- **Chiffres** : uniquement le défendable ; pas de compteurs vides.

---

## 12. Accessibilité (plancher)

- Contraste AA (4.5:1) ; vérifier rouge/orange sur sombre et blanc sur rouge.
- Focus clavier visible partout ; cibles tactiles ≥ 44 px.
- `prefers-reduced-motion` respecté.
- Sémantique (`header/nav/main/section/footer`, hiérarchie de titres) ; `alt` réels ; icônes déco
  `aria-hidden`.
- Contenu lisible **sans** les effets (specs, terminal et animations sont un plus, pas un support d'info).

---

## 13. Valeurs de tokens (référence)

```
Couleurs : --rouge #FA1500 · --rouge-fonce #C81100 · --orange #EA441A · --noir #000000
           --encre #080808 · --surface #101010 · --surface-2 #161616 · --ligne #242424
           --craie #F5F3EF · --gris #8F8F8F
Dégradé  : linear-gradient(105deg,#FA1500,#EA441A)
Rayons   : sm 8 · md 14 · lg 22 · pill 999
Ombres   : ombre 0 20px 60px rgba(0,0,0,.55) · glow 0 0 40px rgba(250,21,0,.35)
Espacement : 4 8 12 16 24 32 48 64 96 128 160
Polices  : Instrument Serif / Gloock / Young Serif (titres) · Inter (texte) · JetBrains Mono (machine)
Layout   : max 1200 · breakpoints 640 / 1024
```

---

## 14. Récapitulatif des décisions
| Sujet | Décision |
|---|---|
| Couleurs | Noir + `#FA1500` + `#EA441A` (fixées) |
| Signature | Vernaculaire machine (spec / terminal) — exécution à pousser |
| Titres | Instrument Serif (dominant) + Gloock (impact) + Young Serif (accents) |
| Texte | Inter · Machine : JetBrains Mono |
| Animation | Riche mais fluide, niveau Tamebi — exécution à pousser |
| Loup-Garou | Cadré communautaire, pas d'argent en public |

## Points encore ouverts (non bloquants)
- Version claire du logo (fond sombre) — à produire.
- E-mail pro / domaine.
- Handles réseaux (liens `#` en attendant).
- **Rendu du terminal + niveau d'animation** : à travailler à l'étape maquette (chantier n°1).
