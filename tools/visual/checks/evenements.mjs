/**
 * Section « Nos événements » — les deux blocs, la dégradation d'une édition
 * sans date arrêtée, l'orbite décorative, et la règle §11 du design system.
 *
 * Ce que ce script NE peut pas vérifier : que la bascule d'un bloc à l'autre
 * se fasse bien le jour dit. Elle ne dépend pas du navigateur mais de
 * `upcomingEvenements()` / `pastEvenements()`, qui prennent l'heure en
 * paramètre justement pour être exerçables sans attendre.
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
 * Les deux éditions, **recopiées du brief** et non importées de `lib/` : un
 * test qui lit la même source que le code ne vérifie plus rien, il se
 * contente d'être d'accord avec lui-même.
 *
 * `fin` est la borne qui décide du bloc. On la réévalue ici, à l'heure du
 * test, pour que ce script reste juste après le 31 décembre — le jour où la
 * 4ᵉ édition basculera à son tour dans l'historique.
 */
const EDITIONS = {
  quatre: { fin: "2026-12-31T23:59:59+01:00", debut: "2026-12-01T00:00:00+01:00" },
  trois: { fin: "2026-09-06T00:00:00+01:00", debut: "2026-09-05T15:00:00+01:00" },
};

const maintenant = Date.now();
const aVenir = Object.entries(EDITIONS)
  .filter(([, e]) => new Date(e.fin).getTime() > maintenant)
  .map(([nom]) => nom);
const passees = Object.entries(EDITIONS)
  .filter(([, e]) => new Date(e.fin).getTime() <= maintenant)
  .map(([nom]) => nom);

/** Copie attendue, au mot près, recopiée du brief. */
const ATTENDU = {
  eyebrow: "NOS ÉVÉNEMENTS",
  titreSection: "Ce qui se passe bientôt.",
  badge4: "[ 4E ÉDITION · GAME PARTY ]",
  aVenirBadge: "[ À VENIR ]",
  lead4: "La 4ᵉ édition se prépare. La date se confirme bientôt.",
  specs4: [
    ["[ DATE ]", "décembre 2026 · à confirmer"],
    ["[ LIEU ]", "communiqué aux inscrits"],
  ],
  titrePasse: "Éditions passées",
  badgePasse: "[ PASSÉE ]",
  nomSeo3: "Comlan Community — 3e édition présentiel",
  groupe: "https://chat.whatsapp.com/EZwmZf6LCzQ5UYRhkg06OW",
  /* Date non arrêtée : la bande affiche le mois, jamais un « J−77 » calculé
     sur une borne technique. */
  compte: "DÉCEMBRE 2026",
  ctaSansBilletterie: "En savoir plus",
};

await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(2500);

/* Capturé avant tout scroll : la bande n'est pas collante. */
const alerte = await evaluate(`(() => {
  const bar = document.querySelector("aside");
  if (!bar) return null;
  const visible = (root) => {
    const out = [];
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      const el = n.parentElement;
      if (!el || el.offsetParent === null) continue;
      const t = n.textContent.trim();
      if (t) out.push(t);
    }
    return out.join(" ");
  };
  const link = bar.querySelector("a");
  return {
    visible: visible(bar),
    nomAccessible: link?.getAttribute("aria-label"),
    href: link?.getAttribute("href"),
    target: link?.getAttribute("target"),
    rel: link?.getAttribute("rel"),
    cibleH: link ? Math.round(link.getBoundingClientRect().height) : 0,
    liens: bar.querySelectorAll("a").length,
    navDot: !!document.querySelector("header ul .alert-dot"),
  };
})()`);

await evaluate(
  `document.getElementById("evenements").scrollIntoView({block:"start", behavior:"instant"}); scrollBy(0, -120);`,
);
await sleep(1800);

const dom = await evaluate(`(() => {
  const section = document.getElementById("evenements");
  const clean = (n) => n ? n.textContent.replace(/\\s+/g, " ").trim() : null;
  const panneau = section.querySelector("li > div");
  const orbite = section.querySelector(".photo-ring");

  /* Le bloc d'historique : repéré par son titre, pas par une position dans le
     DOM — un sélecteur positionnel casserait au premier réagencement. */
  const h3s = [...section.querySelectorAll("h3")];
  const titrePasse = h3s.map(clean).find((t) => t === "Éditions passées");
  const cartes = [...section.querySelectorAll("ul li .group")];

  return {
    eyebrow: clean(section.querySelector("p.font-mono")),
    titreSection: clean(document.getElementById("evenements-title")),

    /* --- Bloc à venir --- */
    badges: [...(panneau?.querySelectorAll("p span") ?? [])].map(clean),
    titre: clean(panneau?.querySelector("h3")),
    lead: clean(panneau?.querySelector("h3 + p")),
    specs: [...(panneau?.querySelectorAll("dl > div") ?? [])].map((row) => [
      clean(row.querySelector("dt")), clean(row.querySelector("dd")),
    ]),
    /* Un programme ou une affiche apparaîtraient ici s'ils existaient. */
    programme: [...(panneau?.querySelectorAll("ul li") ?? [])].map(clean),
    afficheDansPanneau: !!panneau?.querySelector("figure img"),
    mentionBilletterie: [...(panneau?.querySelectorAll("p") ?? [])]
      .map(clean).some((t) => t && t.startsWith("billetterie")),
    ctas: [...(panneau?.querySelectorAll("a") ?? [])].map((a) => ({
      href: a.getAttribute("href"),
      label: clean(a),
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel"),
      height: Math.round(a.getBoundingClientRect().height),
    })),

    /* --- Bloc historique --- */
    titrePasse,
    cartesPassees: cartes.map((c) => {
      const img = c.querySelector("img");
      return {
        texte: clean(c),
        titre: clean(c.querySelector("h3")),
        img: img ? {
          alt: img.getAttribute("alt"),
          src: img.getAttribute("src"),
          loading: img.getAttribute("loading"),
        } : null,
      };
    }),

    /* --- Orbite décorative --- */
    orbite: orbite ? {
      cachee: orbite.getAttribute("aria-hidden"),
      pointeur: getComputedStyle(orbite).pointerEvents,
      images: [...orbite.querySelectorAll("img")].map((i) => ({
        alt: i.getAttribute("alt"),
        src: i.getAttribute("src"),
        loading: i.getAttribute("loading"),
      })),
      liens: orbite.querySelectorAll("a, button").length,
      texte: clean(orbite),
      /* Le centre doit rester vide : c'est ce qui permet au titre de se poser
         sur l'encre pure, sans voile. On mesure la distance entre le centre de
         l'anneau et la carte la plus proche, puis on la compare au demi-titre. */
      rayonLibre: (() => {
        const r = orbite.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let min = Infinity;
        for (const el of orbite.querySelectorAll(".photo-ring-item")) {
          const b = el.getBoundingClientRect();
          const dx = Math.max(b.left - cx, cx - b.right, 0);
          const dy = Math.max(b.top - cy, cy - b.bottom, 0);
          min = Math.min(min, Math.hypot(dx, dy));
        }
        return Math.round(min);
      })(),
    } : null,

    /* --- Galerie du coin photo, dans la carte de l'édition passée --- */
    galerie: (() => {
      const items = [...section.querySelectorAll('li img[alt*="coin photo"]')];
      const compte = [...section.querySelectorAll("p")]
        .map(clean)
        .find((t) => t && t.startsWith("coin photo —"));
      return {
        nombre: items.length,
        compte,
        alts: items.map((i) => i.getAttribute("alt")),
        srcs: items.map((i) => i.getAttribute("src")),
      };
    })(),

    /* §11 : rien qui évoque un solde à recharger ou un gain en argent. */
    interdits: (section.textContent.match(/crédit|mise|misez|gain|retrait|cash/gi) || []),

    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((s) => JSON.parse(s.textContent))
      .flatMap((d) => (Array.isArray(d) ? d : [d]))
      .filter((d) => d["@type"] === "Event"),

    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ====================================================== EN-TÊTE DE SECTION */
/* Les capitales viennent d'un `text-transform` : le DOM porte « Nos
   événements ». Comparer en capitales testerait le CSS, pas la copie. */
check(
  "eyebrow « // NOS ÉVÉNEMENTS »",
  (dom.eyebrow ?? "").toUpperCase().includes(ATTENDU.eyebrow),
  dom.eyebrow,
);
check("titre de section exact", dom.titreSection === ATTENDU.titreSection, dom.titreSection);

/* ============================================================ BLOC À VENIR */
check(
  "une seule édition à venir, la 4e",
  aVenir.length === 1 && aVenir[0] === "quatre",
  `à venir : ${aVenir.join(", ") || "aucune"}`,
);
check("badge de la 4e édition exact", dom.badges.includes(ATTENDU.badge4), dom.badges.join(" · "));
check(
  "la fiche est explicitement marquée « à venir »",
  dom.badges.includes(ATTENDU.aVenirBadge),
  dom.badges.join(" · "),
);
check("accroche exacte", dom.lead === ATTENDU.lead4, dom.lead);

/* Le cœur de cette passe : une édition dont rien n'est arrêté ne doit rien
   inventer, et ne doit pas non plus laisser de trou. */
check(
  "fiche technique réduite aux 2 faits connus (date au mois, lieu)",
  same(dom.specs, ATTENDU.specs4),
  dom.specs.map((s) => s.join(" ")).join(" · "),
);
check(
  "aucune ligne de tarif inventée",
  !dom.specs.some(([label]) => label === "[ ENTRÉE ]"),
  dom.specs.map(([l]) => l).join(" "),
);
check("aucun programme inventé", dom.programme.length === 0, `${dom.programme.length} étiquette(s)`);
check(
  "aucune affiche fantôme : le panneau prend toute la largeur",
  dom.afficheDansPanneau === false,
);
check(
  "pas de billetterie annoncée tant qu'elle n'existe pas",
  dom.mentionBilletterie === false,
);

const ctaPrincipal = dom.ctas[0];
check(
  "sans billetterie, le CTA principal mène au groupe WhatsApp",
  ctaPrincipal?.href === ATTENDU.groupe &&
    ctaPrincipal?.target === "_blank" &&
    ctaPrincipal?.rel === "noopener noreferrer",
  ctaPrincipal ? `${ctaPrincipal.label} → ${ctaPrincipal.href}` : "CTA absent",
);
check(
  "cibles tactiles des CTA ≥ 44px",
  dom.ctas.length > 0 && dom.ctas.every((a) => a.height >= 44),
  dom.ctas.map((a) => a.height).join(" · "),
);

/* ========================================================= BLOC HISTORIQUE */
check(
  "une édition passée, la 3e",
  passees.length === 1 && passees[0] === "trois",
  `passées : ${passees.join(", ") || "aucune"}`,
);
check("le bloc « Éditions passées » existe", dom.titrePasse === ATTENDU.titrePasse, dom.titrePasse);
check(
  "l'édition passée n'a pas disparu du site",
  dom.cartesPassees.length === passees.length,
  `${dom.cartesPassees.length} carte(s)`,
);

const carte = dom.cartesPassees[0];
check("la carte porte le nom complet de l'édition", carte?.titre === ATTENDU.nomSeo3, carte?.titre);
check("la carte est marquée « passée »", (carte?.texte ?? "").includes(ATTENDU.badgePasse), carte?.texte?.slice(0, 60));
check("la carte est datée", (carte?.texte ?? "").includes("05.09.2026"), carte?.texte?.slice(0, 60));
check(
  "affiche de l'édition passée : alt réel, servie par l'optimiseur, différée",
  carte?.img &&
    /^Affiche de la 3e édition/.test(carte.img.alt) &&
    carte.img.src.startsWith("/_next/image") &&
    carte.img.loading === "lazy",
  carte?.img ? `${carte.img.alt?.slice(0, 40)}… · ${carte.img.loading}` : "affiche absente",
);

/* ============================================================== L'ORBITE */
check("l'anneau d'images est présent", !!dom.orbite, dom.orbite ? "oui" : "absente");
check(
  "anneau : retiré de l'arbre d'accessibilité et du pointeur",
  dom.orbite?.cachee === "true" && dom.orbite?.pointeur === "none",
  `aria-hidden=${dom.orbite?.cachee} pointer-events=${dom.orbite?.pointeur}`,
);
check(
  "anneau : 13 images, toutes sans texte alternatif (décor, pas information)",
  dom.orbite?.images.length === 13 && dom.orbite.images.every((i) => i.alt === ""),
  `${dom.orbite?.images.length} image(s)`,
);
/* Ce qui fait tenir la forme : un centre vide. Le titre y est posé sans voile,
   donc son contraste ne dépend d'aucune image. Si l'anneau se resserrait, le
   texte passerait sur les cartes et le contraste deviendrait une loterie. */
check(
  "anneau : le centre reste vide sous le titre",
  dom.orbite?.rayonLibre >= 180,
  `${dom.orbite?.rayonLibre}px libres au centre`,
);
check(
  "anneau : aucune cible cliquable",
  dom.orbite?.liens === 0,
  `${dom.orbite?.liens} lien(s)`,
);
check(
  "galerie : les 8 portraits du coin photo sont dans la carte de l'édition",
  dom.galerie.nombre === 8,
  `${dom.galerie.nombre} vignette(s)`,
);
check(
  "galerie : chaque photo porte un texte alternatif situé et numéroté",
  dom.galerie.alts.every((a, i) => a === `Portrait pris au coin photo de la 3e édition présentiel. ${i + 1} sur 8.`),
  dom.galerie.alts[0],
);
check(
  "galerie : le compte est calculé, pas écrit en dur",
  dom.galerie.compte === "coin photo — 8 photos",
  dom.galerie.compte,
);
check(
  "galerie : vignettes servies par l'optimiseur d'images",
  dom.galerie.srcs.every((s) => (s ?? "").startsWith("/_next/image")),
  dom.galerie.srcs[0]?.slice(0, 40),
);
check(
  "anneau : images différées (elles ne retardent pas le premier rendu)",
  dom.orbite?.images.every((i) => i.loading === "lazy"),
  dom.orbite?.images.map((i) => i.loading).join(" · "),
);

/* ======================================================== DONNÉES & RÈGLES */
check(
  "aucune mention de crédits, mise ou gain en argent (§11)",
  dom.interdits.length === 0,
  dom.interdits.length ? `trouvé : ${dom.interdits.join(", ")}` : "aucune",
);

check(
  "données structurées : seulement les éditions datées",
  dom.jsonLd.length === passees.length,
  `${dom.jsonLd.length} Event déclaré(s) pour ${passees.length} édition(s) datée(s)`,
);
const ld = dom.jsonLd[0];
check(
  "Event : dates réelles, présentiel, tarif et billetterie",
  ld &&
    ld.startDate === EDITIONS.trois.debut &&
    ld.endDate === EDITIONS.trois.fin &&
    ld.eventAttendanceMode === "https://schema.org/OfflineEventAttendanceMode" &&
    ld.offers?.price === 2000 &&
    ld.offers?.priceCurrency === "XOF",
  ld ? `${ld.startDate} · ${ld.offers?.price} ${ld.offers?.priceCurrency}` : "—",
);
check(
  "Event : aucune adresse inventée, seulement le pays",
  ld && ld.location?.address?.addressCountry === "BJ" && !ld.location?.address?.streetAddress,
  ld ? JSON.stringify(ld.location?.address) : "—",
);
check(
  "aucune startDate déclarée pour l'édition sans date",
  !dom.jsonLd.some((e) => e.startDate === EDITIONS.quatre.debut),
  dom.jsonLd.map((e) => e.startDate).join(" · ") || "—",
);

check("aucun débordement horizontal", dom.overflow <= 0, `${dom.overflow}px`);

/* ====================================== DISPOSITIF D'ANNONCE (haut de page) */
check(
  "la bande affiche le mois, pas un compte à rebours calculé sur une borne technique",
  (alerte?.visible ?? "").includes(ATTENDU.compte) && !/J−\d/.test(alerte?.visible ?? ""),
  alerte?.visible,
);
check(
  "sans billetterie, la bande ne promet pas « Réserver »",
  (alerte?.visible ?? "").includes(ATTENDU.ctaSansBilletterie) &&
    !(alerte?.visible ?? "").includes("Réserver"),
  alerte?.visible,
);
check(
  "la bande mène au groupe WhatsApp, en nouvel onglet sûr",
  alerte?.href === ATTENDU.groupe &&
    alerte?.target === "_blank" &&
    alerte?.rel === "noopener noreferrer",
  `${alerte?.href} (${alerte?.rel})`,
);
check(
  "un seul lien sur toute la bande, pleine cible tactile",
  alerte?.liens === 1 && alerte?.cibleH >= 44,
  `${alerte?.liens} lien · cible ${alerte?.cibleH}px`,
);
check(
  "nom accessible en langage parlé, sans « J moins »",
  (alerte?.nomAccessible ?? "").includes("en décembre 2026") &&
    !/J−/.test(alerte?.nomAccessible ?? ""),
  alerte?.nomAccessible,
);
check("pastille sur le lien « Événements » de la nav", alerte?.navDot === true);

await shot("ev-desktop");
await cdp.viewport({ width: 390, height: 844 });
await evaluate(
  `document.getElementById("evenements").scrollIntoView({block:"start", behavior:"instant"});`,
);
await sleep(1200);
await shot("ev-mobile");

cdp.close();
process.exit(finish() > 0 ? 1 : 0);
