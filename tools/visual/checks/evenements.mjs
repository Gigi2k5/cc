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
};

await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(2500);

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
  };
})()`);

check("aucun débordement horizontal en mobile", mobile.overflow <= 0, `${mobile.overflow}px`);
check("l'affiche tient dans le panneau", mobile.posterFits === true);
check("CTA en pleine largeur", mobile.fullWidthCtas === true);
check(
  "filigrane masqué en mobile (il chevaucherait le badge)",
  mobile.watermarkHidden === true,
);

await shot("ev-mobile");

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
