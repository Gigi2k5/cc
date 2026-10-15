/**
 * Section « Nos boutiques » — URL réelles, accessibilité des onglets, et la
 * bascule de présentation entre téléphone et bureau.
 *
 * Le point le plus délicat de la section est vérifié ici : au-dessus de
 * 640 px une seule boutique est affichée et la bande est un `tablist` ; en
 * dessous, les deux boutiques sont visibles et il n'y a plus d'onglets du
 * tout. Une seule de ces deux présentations peut être vraie à la fois, et
 * l'arbre d'accessibilité doit dire la même chose que l'écran.
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { connect, createReport } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({
  port: Number(process.env.CDP_PORT ?? 9222),
  out: process.env.OUT ?? ".",
});
const { check, finish } = createReport();
const { evaluate, sleep, screenshot: shot } = cdp;

/**
 * Les deux boutiques, **recopiées du brief** : ce sont les URL que
 * l'utilisateur a fournies, pas celles que le code contient. C'est tout
 * l'intérêt — si quelqu'un modifie un lien dans `lib/content.ts`, ce test
 * doit tomber, pas suivre.
 */
const ATTENDU = {
  eyebrow: "NOS BOUTIQUES",
  titre: "Deux vitrines, un seul interlocuteur.",
  cta: "Visiter la boutique",
  boutiques: [
    {
      nom: "Comlan Community | PC & Solutions",
      href: "https://comlan-community-pc-solutions.biggigui.com/",
      hote: "comlan-community-pc-solutions.biggigui.com",
      bande: "PC & SOLUTIONS",
    },
    {
      nom: "2G HUB",
      href: "https://2ghub.tech/computers",
      hote: "2ghub.tech",
      bande: "2G HUB",
    },
  ],
};

/** Relève l'état complet de la section à la largeur courante. */
const RELEVE = String.raw`(() => {
  const section = document.getElementById("boutiques");
  if (!section) return null;
  const clean = (n) => n ? n.textContent.replace(/\s+/g, " ").trim() : null;
  const vu = (el) => !!el && el.offsetParent !== null;

  const bande = section.querySelector('[data-bande="boutiques"]');
  const tuiles = [...section.querySelectorAll("button")];
  const panneaux = [...section.querySelectorAll('[id*="panneau"]')];

  return {
    eyebrow: clean(section.querySelector("p.font-mono")),
    titre: clean(document.getElementById("boutiques-title")),

    bandeVisible: vu(bande),
    bandeRole: bande?.getAttribute("role") ?? null,
    bandeNom: bande?.getAttribute("aria-label") ?? null,

    tuiles: tuiles.map((b) => ({
      texte: clean(b),
      role: b.getAttribute("role"),
      selectionne: b.getAttribute("aria-selected"),
      controle: b.getAttribute("aria-controls"),
      tabindex: b.getAttribute("tabindex"),
      h: Math.round(b.getBoundingClientRect().height),
      w: Math.round(b.getBoundingClientRect().width),
    })),

    panneaux: panneaux.map((p) => {
      const lien = p.querySelector("a[href^='http']");
      const imgs = [...p.querySelectorAll("img")];
      return {
        id: p.id,
        visible: vu(p),
        role: p.getAttribute("role"),
        labelledBy: p.getAttribute("aria-labelledby"),
        nom: clean(p.querySelector("h3")),
        href: lien?.getAttribute("href"),
        cta: clean(lien),
        target: lien?.getAttribute("target"),
        rel: lien?.getAttribute("rel"),
        cibleH: lien ? Math.round(lien.getBoundingClientRect().height) : 0,
        hote: [...p.querySelectorAll("p")].map(clean).find((t) => t && t.startsWith("boutique :")),
        images: imgs.map((i) => ({
          alt: i.getAttribute("alt"),
          src: i.getAttribute("src"),
          charge: i.complete && i.naturalWidth > 0,
          visible: vu(i),
        })),
      };
    }),

    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    /* Débordement imputable à la SECTION seule : le plus large de ses
       descendants, comparé à la largeur de l'écran. */
    debordementSection: Math.round(
      Math.max(
        0,
        ...[...section.querySelectorAll("*")].map(
          (el) => el.getBoundingClientRect().right,
        ),
      ) - document.documentElement.clientWidth,
    ),
  };
})()`;

/* ========================================================= BUREAU (1440px) */
await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(2200);
await evaluate(
  `document.getElementById("boutiques").scrollIntoView({block:"start", behavior:"instant"}); scrollBy(0, -120);`,
);
await sleep(1600);

const bureau = await evaluate(RELEVE);

check("la section existe", !!bureau, bureau ? "oui" : "absente");
check(
  "eyebrow « // NOS BOUTIQUES »",
  (bureau?.eyebrow ?? "").toUpperCase().includes(ATTENDU.eyebrow),
  bureau?.eyebrow,
);
check("titre de section exact", bureau?.titre === ATTENDU.titre, bureau?.titre);

check(
  "deux boutiques, pas une de plus — aucun doublon de remplissage",
  bureau?.panneaux.length === 2 && bureau?.tuiles.length === 2,
  `${bureau?.panneaux.length} panneau(x) · ${bureau?.tuiles.length} tuile(s)`,
);

/* Le point qui compte le plus : les URL. Une boutique mal liée est pire
   qu'une boutique absente. */
for (const [i, attendu] of ATTENDU.boutiques.entries()) {
  const p = bureau?.panneaux[i];
  check(
    `boutique ${i + 1} : URL exacte`,
    p?.href === attendu.href,
    `${p?.href} (attendu ${attendu.href})`,
  );
  check(
    `boutique ${i + 1} : nom exact`,
    p?.nom === attendu.nom,
    p?.nom,
  );
  check(
    `boutique ${i + 1} : le domaine est annoncé sous le bouton`,
    (p?.hote ?? "").includes(attendu.hote),
    p?.hote,
  );
  check(
    `boutique ${i + 1} : lien externe en nouvel onglet sûr`,
    p?.target === "_blank" && p?.rel === "noopener noreferrer",
    `${p?.target} · ${p?.rel}`,
  );
  check(
    `boutique ${i + 1} : libellé « ${ATTENDU.cta} »`,
    p?.cta === ATTENDU.cta,
    p?.cta,
  );
}

/* --- La bande --- */
check("la bande est affichée au bureau", bureau?.bandeVisible === true);
check(
  "la bande est un vrai groupe d'onglets, nommé",
  bureau?.bandeRole === "tablist" && !!bureau?.bandeNom,
  `role=${bureau?.bandeRole} nom=${bureau?.bandeNom}`,
);
check(
  "les tuiles portent les noms courts des deux boutiques",
  ATTENDU.boutiques.every((b, i) => (bureau?.tuiles[i]?.texte ?? "").includes(b.bande)),
  bureau?.tuiles.map((t) => t.texte).join(" | "),
);
check(
  "une seule tuile sélectionnée",
  bureau?.tuiles.filter((t) => t.selectionne === "true").length === 1,
  bureau?.tuiles.map((t) => t.selectionne).join(" · "),
);
check(
  "chaque tuile commande son panneau",
  bureau?.tuiles.every((t, i) => t.role === "tab" && t.controle === bureau.panneaux[i]?.id),
  bureau?.tuiles.map((t) => t.controle).join(" · "),
);
check(
  "un seul arrêt clavier pour la bande (motif WAI)",
  bureau?.tuiles.filter((t) => t.tabindex === "0").length === 1,
  bureau?.tuiles.map((t) => t.tabindex).join(" · "),
);
check(
  "tuiles ≥ 44px de haut (§12)",
  bureau?.tuiles.every((t) => t.h >= 44),
  bureau?.tuiles.map((t) => `${t.w}×${t.h}`).join(" · "),
);

/* --- Une seule boutique à la fois --- */
check(
  "au bureau, une seule boutique est affichée",
  bureau?.panneaux.filter((p) => p.visible).length === 1,
  bureau?.panneaux.map((p) => p.visible).join(" · "),
);
check(
  "les panneaux sont de vrais tabpanels, reliés à leur onglet",
  bureau?.panneaux.every((p) => p.role === "tabpanel" && !!p.labelledBy),
  bureau?.panneaux.map((p) => `${p.role}/${p.labelledBy}`).join(" · "),
);

/* --- Les captures --- */
const panneauVisible = bureau?.panneaux.find((p) => p.visible);
check(
  "les deux captures (bureau + téléphone) sont chargées",
  panneauVisible?.images.length === 2 && panneauVisible.images.every((i) => i.charge),
  panneauVisible?.images.map((i) => (i.charge ? "chargée" : "ÉCHEC")).join(" · "),
);
check(
  "captures servies par l'optimiseur d'images, pas le fichier brut",
  panneauVisible?.images.every((i) => (i.src ?? "").startsWith("/_next/image")),
  panneauVisible?.images.map((i) => i.src?.slice(0, 34)).join(" · "),
);
check(
  "la capture principale est décrite, la vignette est décorative",
  panneauVisible?.images[0]?.alt?.length > 20 && panneauVisible?.images[1]?.alt === "",
  `[0] ${panneauVisible?.images[0]?.alt?.slice(0, 40)}… · [1] « ${panneauVisible?.images[1]?.alt} »`,
);

check("aucun débordement horizontal au bureau", bureau?.overflow <= 0, `${bureau?.overflow}px`);

/* --- La sélection fonctionne --- */
await evaluate(`document.querySelectorAll("#boutiques button")[1].click()`);
await sleep(700);
const apresClic = await evaluate(RELEVE);
check(
  "cliquer la 2e tuile affiche la 2e boutique",
  apresClic?.panneaux[1]?.visible === true &&
    apresClic?.panneaux[0]?.visible === false &&
    apresClic?.tuiles[1]?.selectionne === "true",
  `visible : ${apresClic?.panneaux.map((p) => p.visible).join(" · ")}`,
);

/* --- Clavier : flèches entre onglets (motif WAI) --- */
await evaluate(`document.querySelectorAll("#boutiques button")[1].focus()`);
await cdp.send("Input.dispatchKeyEvent", {
  type: "keyDown",
  key: "ArrowLeft",
  code: "ArrowLeft",
  windowsVirtualKeyCode: 37,
});
await sleep(600);
const apresFleche = await evaluate(RELEVE);
check(
  "flèche gauche revient à la boutique précédente",
  apresFleche?.tuiles[0]?.selectionne === "true" && apresFleche?.panneaux[0]?.visible === true,
  `sélection : ${apresFleche?.tuiles.map((t) => t.selectionne).join(" · ")}`,
);

await shot("bo-desktop");

/* ===================================================== TÉLÉPHONE (390px) */
await cdp.viewport({ width: 390, height: 844 });
await cdp.goto(BASE);
await sleep(2200);
await evaluate(
  `document.getElementById("boutiques").scrollIntoView({block:"start", behavior:"instant"});`,
);
await sleep(1600);

const mobile = await evaluate(RELEVE);

check(
  "sur téléphone, les DEUX boutiques sont visibles — rien n'est caché derrière un appui",
  mobile?.panneaux.filter((p) => p.visible).length === 2,
  mobile?.panneaux.map((p) => p.visible).join(" · "),
);
check("sur téléphone, la bande d'onglets disparaît", mobile?.bandeVisible === false);
check(
  "sur téléphone, plus aucune sémantique d'onglets — l'arbre dit ce que l'écran montre",
  mobile?.panneaux.every((p) => p.role === null && p.labelledBy === null) &&
    mobile?.tuiles.every((t) => t.role === null),
  `panneaux : ${mobile?.panneaux.map((p) => p.role).join(" · ")}`,
);
check(
  "sur téléphone, chaque boutique garde son bouton, ≥ 44px",
  mobile?.panneaux.every((p) => p.cibleH >= 44 && p.href?.startsWith("http")),
  mobile?.panneaux.map((p) => `${p.cibleH}px`).join(" · "),
);
check(
  "sur téléphone, la vignette de maquette est retirée (une seule capture)",
  mobile?.panneaux.every((p) => p.images.filter((i) => i.visible).length === 1),
  mobile?.panneaux.map((p) => p.images.filter((i) => i.visible).length).join(" · "),
);
check("aucun débordement horizontal sur téléphone", mobile?.overflow <= 0, `${mobile?.overflow}px`);

await shot("bo-mobile");

/* ============================================ 320px — le plus petit écran */
await cdp.viewport({ width: 320, height: 568 });
await evaluate(
  `document.getElementById("boutiques").scrollIntoView({block:"start", behavior:"instant"});`,
);
await sleep(1200);
const petit = await evaluate(RELEVE);
check(
  "à 320px : les deux boutiques restent accessibles",
  petit?.panneaux.filter((p) => p.visible).length === 2,
  `${petit?.panneaux.filter((p) => p.visible).length} visible(s)`,
);
/* Mesuré sur la section et non sur le document : à 320px le filigrane
   terminal de la section Communauté déborde de quelques pixels selon la phase
   de son animation, ce qui rendrait cette assertion intermittente pour une
   raison étrangère aux boutiques. Le débordement du document est de toute
   façon couvert, à toutes les largeurs, par check:responsive. */
check(
  "à 320px : la section ne déborde pas de la largeur de l'écran",
  petit?.debordementSection <= 0,
  `${petit?.debordementSection}px`,
);
await shot("bo-320");

cdp.close();
process.exit(finish() > 0 ? 1 : 0);
