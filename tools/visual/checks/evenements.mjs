/**
 * Section Événements — fidélité de la copie, données structurées, affiche,
 * et la règle §11 du design system (aucune mention de crédits en public).
 *
 * Ce que ce script NE peut pas vérifier : que l'annonce disparaisse bien
 * après la date. Cette bascule ne dépend pas du navigateur mais de
 * `upcomingEvenements()`, qui prend l'heure en paramètre justement pour être
 * exerçable sans attendre le 6 septembre.
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

/** Copie attendue, recopiée depuis le brief et non depuis le code. */
const EXPECTED = {
  sectionTitle: "Ce qui se passe bientôt.",
  badge: "[ 3E ÉDITION · PRÉSENTIEL ]",
  lead: "Une soirée pensée pour durer jusqu'à minuit.",
  specs: [
    ["[ DATE ]", "samedi 5 septembre 2026"],
    ["[ HORAIRE ]", "15h00 → 00h00"],
    ["[ LIEU ]", "communiqué aux inscrits"],
    ["[ PLACES ]", "25"],
    ["[ ENTRÉE ]", "2 000 FCFA"],
  ],
  programme: [
    "Loup-Garou",
    "Pocket Poker",
    "Jeux d'ambiance",
    "Cocktail de bienvenue",
    "Jetons de jeu inclus",
    "Afrobeats & Amapiano",
    "Coin photo",
  ],
  ticket: "https://tike229.ghinel.com/",
  ticketLabel: "Réserver ta place",
  /* Le dispositif « voyant » : bande d'annonce, bloc hero, pastille de nav. */
  alerte: "[ 05.09 ] 3E ÉDITION PRÉSENTIEL · 25 PLACES J−16 Réserver →",
  alerteMobile: "[ 05.09 ] 3E ÉDITION J−16 Réserver",
  alerteNom:
    "Prochaine édition : 3ᵉ édition présentiel, samedi 5 septembre · 25 places · 2 000 FCFA, dans 16 jours. Réserver.",
  stripNom:
    "Prochaine édition : 3ᵉ édition présentiel, samedi 5 septembre · 25 places · 2 000 FCFA, dans 16 jours.",
};

await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(2500);

/* Capturé avant tout scroll : la bande n'est pas collante, elle défile avec la
   page — la mesurer après aurait donné un top négatif. */
const alerte = await evaluate(`(() => {
  const bar = document.querySelector("aside");
  if (!bar) return null;
  /* Texte réellement AFFICHÉ : la bande porte deux formes du titre, dont une
     masquée selon la largeur. textContent les prendrait toutes les deux. */
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
  const b = bar.getBoundingClientRect();
  const cs = getComputedStyle(bar);
  const dot = bar.querySelector(".alert-dot");
  const strip = document.querySelector('main section a[href*="tike229"]');
  return {
    visible: visible(bar),
    nomAccessible: link?.getAttribute("aria-label"),
    top: Math.round(b.top + window.scrollY),
    hauteur: Math.round(b.height),
    token: getComputedStyle(document.body).getPropertyValue("--alert-h").trim(),
    fond: cs.backgroundColor,
    couleur: cs.color,
    repere: bar.tagName + "/" + bar.getAttribute("aria-label"),
    href: link?.getAttribute("href"),
    target: link?.getAttribute("target"),
    rel: link?.getAttribute("rel"),
    cibleH: link ? Math.round(link.getBoundingClientRect().height) : 0,
    liens: bar.querySelectorAll("a").length,
    dotAnim: dot ? getComputedStyle(dot).animationName : null,
    dotCache: dot ? dot.getAttribute("aria-hidden") : null,
    navDot: !!document.querySelector("header ul .alert-dot"),
    stripVisible: strip ? getComputedStyle(strip).display !== "none" : false,
    stripNom: strip?.getAttribute("aria-label"),
    stripVisibleTexte: strip ? visible(strip) : null,
  };
})()`);

await evaluate(
  `document.getElementById("evenements").scrollIntoView({block:"start", behavior:"instant"}); scrollBy(0, -120);`,
);
await sleep(1800);

const dom = await evaluate(`(() => {
  const section = document.getElementById("evenements");
  const clean = (n) => n ? n.textContent.replace(/\\s+/g, " ").trim() : null;
  const panel = section.querySelector("li > div");
  const img = section.querySelector("img");
  return {
    sectionTitle: clean(document.getElementById("evenements-title")),
    eyebrow: clean(section.querySelector("p.font-mono")),
    badge: clean(section.querySelector("li span")),
    eventTitle: clean(section.querySelector("h3")),
    accent: clean(section.querySelector("h3 em")),
    lead: clean(section.querySelector("h3 + p")),
    specs: [...section.querySelectorAll("dl > div")].map(row => [
      clean(row.querySelector("dt")), clean(row.querySelector("dd")),
    ]),
    programme: [...section.querySelectorAll("ul ul li")].map(clean),
    ctas: [...section.querySelectorAll("a")].map(a => ({
      href: a.getAttribute("href"),
      label: clean(a),
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel"),
      height: Math.round(a.getBoundingClientRect().height),
    })),
    ticketHost: [...section.querySelectorAll("p")].map(clean).find(t => t && t.startsWith("billetterie")),
    watermark: clean(panel && panel.querySelector("p[aria-hidden]")),
    poster: img ? {
      alt: img.getAttribute("alt"),
      src: img.getAttribute("src"),
      width: img.getAttribute("width"),
      height: img.getAttribute("height"),
      loading: img.getAttribute("loading"),
      rendered: Math.round(img.getBoundingClientRect().width),
      caption: clean(section.querySelector("figcaption")),
    } : null,
    /* §11 : rien qui évoque un solde à recharger ou un gain en argent. */
    forbidden: (section.textContent.match(/crédit|mise|misez|gain|retrait|cash/gi) || []),
    jsonLd: (() => {
      const tag = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => JSON.parse(s.textContent)).find(d => d["@type"] === "Event");
      return tag ?? null;
    })(),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
})()`);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

check("titre de section exact", dom.sectionTitle === EXPECTED.sectionTitle, dom.sectionTitle);
check("eyebrow « // ÉVÉNEMENTS »", /\/\/\s*ÉVÉNEMENTS/i.test(dom.eyebrow ?? ""), dom.eyebrow);
check("badge d'édition exact", dom.badge === EXPECTED.badge, dom.badge);
check(
  "titre de l'événement, accent sur un seul mot",
  dom.eventTitle === "Le 5 septembre, on joue autrement." && dom.accent === "autrement",
  `${dom.eventTitle} · accent=${dom.accent}`,
);
check("accroche exacte", dom.lead === EXPECTED.lead, dom.lead);

check(
  "fiche technique : 5 paires libellé/valeur exactes",
  same(dom.specs, EXPECTED.specs),
  dom.specs.map((s) => s.join(" ")).join(" · "),
);
check(
  "7 étiquettes de programme exactes",
  same(dom.programme, EXPECTED.programme),
  dom.programme.join(" · "),
);

/* Le point le plus sensible de la section : la règle §11. */
check(
  "aucune mention de crédits, mise ou gain en argent (§11)",
  dom.forbidden.length === 0,
  dom.forbidden.length ? `trouvé : ${dom.forbidden.join(", ")}` : "aucune",
);

const ticket = dom.ctas.find((a) => a.href === EXPECTED.ticket);
check(
  "CTA billetterie : bon lien, bon libellé, nouvel onglet sûr",
  ticket &&
    ticket.label === EXPECTED.ticketLabel &&
    ticket.target === "_blank" &&
    ticket.rel === "noopener noreferrer",
  ticket ? `${ticket.label} → ${ticket.href} (${ticket.rel})` : "CTA absent",
);
check(
  "le domaine tiers est annoncé sous les boutons",
  (dom.ticketHost ?? "").includes("tike229.ghinel.com"),
  dom.ticketHost,
);
check(
  "cibles tactiles des CTA ≥ 44px",
  dom.ctas.filter((a) => a.href?.startsWith("http")).every((a) => a.height >= 44),
  dom.ctas.map((a) => a.height).join(" · "),
);

check(
  "affiche : alt réel, dimensions explicites, chargement différé",
  dom.poster &&
    /^Affiche de la 3e édition/.test(dom.poster.alt) &&
    dom.poster.width === "864" &&
    dom.poster.height === "1080" &&
    dom.poster.loading === "lazy",
  dom.poster ? `${dom.poster.width}×${dom.poster.height} · ${dom.poster.loading}` : "affiche absente",
);
check(
  "affiche : servie par l'optimiseur, pas le JPEG brut",
  (dom.poster?.src ?? "").startsWith("/_next/image"),
  dom.poster?.src?.slice(0, 60),
);
check(
  "affiche : objet posé, pas un fond (moins de la moitié du panneau)",
  dom.poster && dom.poster.rendered > 0 && dom.poster.rendered < 560,
  `${dom.poster?.rendered}px de large`,
);
check("filigrane machine daté", /05\.09\.2026/.test(dom.watermark ?? ""), dom.watermark);

const ld = dom.jsonLd;
check("données structurées Event présentes", !!ld, ld ? ld.name : "absentes");
check(
  "Event : dates, présentiel, tarif et billetterie",
  ld &&
    ld.startDate === "2026-09-05T15:00:00+01:00" &&
    ld.endDate === "2026-09-06T00:00:00+01:00" &&
    ld.eventAttendanceMode === "https://schema.org/OfflineEventAttendanceMode" &&
    ld.offers?.price === 2000 &&
    ld.offers?.priceCurrency === "XOF" &&
    ld.offers?.url === EXPECTED.ticket,
  ld ? `${ld.startDate} · ${ld.offers?.price} ${ld.offers?.priceCurrency}` : "—",
);
check(
  "Event : aucune adresse inventée, seulement le pays",
  ld && ld.location?.address?.addressCountry === "BJ" && !ld.location?.address?.streetAddress,
  ld ? JSON.stringify(ld.location?.address) : "—",
);

/* ============================================ DISPOSITIF D'ANNONCE (haut de page)
   La section ne sert à rien si personne ne descend jusqu'à elle : ce qui suit
   vérifie ce qu'on voit SANS scroller. */
check("bande d'annonce en tout premier, avant le logo", alerte && alerte.top === 0,
  alerte ? `offset ${alerte.top}px · ${alerte.hauteur}px de haut` : "absente");
check(
  "hauteur de bande = token --alert-h (le hero se réserve la place)",
  alerte && `${alerte.hauteur}px` === alerte.token,
  `${alerte?.hauteur}px vs ${alerte?.token}`,
);
check(
  "inversion craie sur encre — le levier est le contraste, pas un aplat rouge",
  alerte && alerte.fond === "rgb(245, 243, 239)" && alerte.couleur === "rgb(8, 8, 8)",
  `fond=${alerte?.fond} texte=${alerte?.couleur}`,
);
check("la bande est un repère nommé", alerte && alerte.repere === "ASIDE/Prochaine édition", alerte?.repere);
check(
  "un seul lien, sur toute la bande : une tabulation, pleine cible tactile",
  alerte && alerte.liens === 1 && alerte.cibleH === alerte.hauteur && alerte.cibleH >= 44,
  `${alerte?.liens} lien · cible ${alerte?.cibleH}px`,
);
check(
  "la bande mène à la billetterie en nouvel onglet sûr",
  alerte && alerte.href === EXPECTED.ticket && alerte.target === "_blank" && alerte.rel === "noopener noreferrer",
  `${alerte?.href} (${alerte?.rel})`,
);
check("texte affiché de la bande, au mot près", alerte && alerte.visible === EXPECTED.alerte, alerte?.visible);
/* La bande porte deux formes du titre, dont une masquée : sans nom accessible
   explicite, le titre serait annoncé deux fois de suite. */
check(
  "nom accessible unique, sans doublon et en langage parlé",
  alerte && alerte.nomAccessible === EXPECTED.alerteNom,
  alerte?.nomAccessible,
);
check(
  "pastille décorative et animée (seul mouvement : pas de texte défilant)",
  alerte && alerte.dotAnim === "dot-pulse" && alerte.dotCache === "true",
  `animation=${alerte?.dotAnim} aria-hidden=${alerte?.dotCache}`,
);
check("pastille sur le lien « Événements » de la nav", alerte?.navDot === true);
check(
  "bloc compte à rebours dans le hero, nommé pour l'oreille",
  alerte?.stripVisible === true &&
    /J−16/.test(alerte?.stripVisibleTexte ?? "") &&
    alerte?.stripNom === EXPECTED.stripNom,
  `${alerte?.stripVisibleTexte} · nom=${alerte?.stripNom}`,
);

await shot("ev-desktop");

/* ------------------------------------------------------------------ MOBILE */
await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(2500);
await evaluate(
  `document.getElementById("evenements").scrollIntoView({block:"start", behavior:"instant"});`,
);
await sleep(1500);

const mobile = await evaluate(`(() => {
  const section = document.getElementById("evenements");
  const img = section.querySelector("img");
  const panel = section.querySelector("li > div");
  const ctas = [...section.querySelectorAll("a")];
  return {
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    posterFits: img ? img.getBoundingClientRect().width <= panel.getBoundingClientRect().width : false,
    /* La composition mobile empile les CTA sur toute la largeur. */
    fullWidthCtas: ctas.filter(a => a.href.startsWith("http"))
      .every(a => a.getBoundingClientRect().width > 240),
    watermarkHidden: panel.querySelector("p[aria-hidden]")
      ? getComputedStyle(panel.querySelector("p[aria-hidden]")).display === "none" : true,
    alerte: (() => {
      const bar = document.querySelector("aside");
      if (!bar) return null;
      const out = [];
      const walk = document.createTreeWalker(bar, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        const el = n.parentElement;
        if (!el || el.offsetParent === null) continue;
        const t = n.textContent.trim();
        if (t) out.push(t);
      }
      return out.join(" ");
    })(),
    stripVisible: (() => {
      const s2 = document.querySelector('main section a[href*="tike229"]');
      return s2 ? getComputedStyle(s2).display !== "none" : false;
    })(),
  };
})()`);

check("aucun débordement horizontal en mobile", mobile.overflow <= 0, `${mobile.overflow}px`);
check(
  "bande d'annonce en mobile : forme courte, jamais une troncature",
  mobile.alerte === EXPECTED.alerteMobile,
  mobile.alerte,
);
check(
  "bloc hero masqué en mobile — c'est la bande qui porte l'annonce",
  mobile.stripVisible === false,
);
check("l'affiche tient dans le panneau", mobile.posterFits === true);
check("CTA en pleine largeur", mobile.fullWidthCtas === true);
check(
  "filigrane masqué en mobile (il chevaucherait le badge)",
  mobile.watermarkHidden === true,
);

await shot("ev-mobile");

/* ------------------------------------------------------ ANIMATIONS RÉDUITES
   Même piège que le caret du hero : la règle globale fige tout sur la dernière
   frame, ce qui rendrait la pastille INVISIBLE au lieu de simplement immobile. */
await cdp.viewport({ width: 1440, height: 900 });
await cdp.emulateReducedMotion(true);
await cdp.goto(BASE);
await sleep(3000);

const reduit = await evaluate(`(() => {
  const dot = document.querySelector("aside .alert-dot");
  const strip = document.querySelector('main section a[href*="tike229"]');
  const ds = dot ? getComputedStyle(dot) : null;
  const ss = strip ? getComputedStyle(strip) : null;
  return {
    dotAnim: ds?.animationName,
    dotOpacity: ds?.opacity,
    dotVisible: dot ? dot.getBoundingClientRect().width > 0 : false,
    haloAnim: ss?.animationName,
    stripVisible: strip ? ss.display !== "none" : false,
  };
})()`);

check(
  "animations réduites : pastille immobile mais VISIBLE",
  reduit.dotAnim === "none" && reduit.dotOpacity === "1" && reduit.dotVisible,
  `animation=${reduit.dotAnim} opacity=${reduit.dotOpacity}`,
);
check(
  "animations réduites : le bloc hero reste affiché, halo figé",
  reduit.stripVisible === true,
  `halo=${reduit.haloAnim}`,
);

await cdp.emulateReducedMotion(false);

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
