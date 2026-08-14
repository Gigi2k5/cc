/**
 * Audit (phase 8) — charge utile réseau, métriques de rendu, accessibilité
 * axe-core, structure sémantique et parcours clavier.
 *
 * ⚠️ Aucun score de performance n'est produit ici : le harnais tourne en rendu
 * logiciel (SwiftShader), les temps mesurés ne représentent aucune machine
 * réelle. Ce qui EST valide : les octets transférés, le nombre de requêtes, la
 * structure du document, et les violations axe.
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { readFileSync } from "node:fs";

import { connect, createReport } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({
  port: Number(process.env.CDP_PORT ?? 9222),
  out: process.env.OUT ?? ".",
});
const { check, finish } = createReport();
const { evaluate, sleep, send } = cdp;

const AXE = readFileSync(
  new URL("../../../node_modules/axe-core/axe.min.js", import.meta.url),
  "utf8",
);

/* Les octets sont relus depuis la performance timeline du navigateur plutôt que
   par abonnement aux événements réseau : même résultat, et ça reste dans les
   moyens du client CDP minimal. */

await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(6000);

/* ------------------------------------------------------- CHARGE UTILE
   Le partage critique/différé se fait contre le HTML **servi**, pas contre le
   DOM : le DOM contient aussi les scripts injectés par le loader, ce qui ferait
   passer un chunk différé pour du critique (erreur commise une première fois). */
const payload = await evaluate(`(async () => {
  const html = await (await fetch(location.href, { cache: "no-store" })).text();
  const critical = new Set([...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]));
  const preloaded = new Set(
    [...html.matchAll(/rel="preload"[^>]*href="([^"]+)"/g)].map(m => m[1]));

  const res = performance.getEntriesByType("resource");
  const kb = n => Math.round(n / 1024);
  const sum = a => kb(a.reduce((t, e) => t + (e.encodedBodySize || e.transferSize || 0), 0));
  const path = e => new URL(e.name).pathname;
  const js = res.filter(e => /\\.js$/.test(e.name));
  const fonts = res.filter(e => /\\.woff2?$/.test(e.name));

  return {
    criticalJsKb: sum(js.filter(e => critical.has(path(e)))),
    deferredJsKb: sum(js.filter(e => !critical.has(path(e)))),
    deferredCount: js.filter(e => !critical.has(path(e))).length,
    cssKb: sum(res.filter(e => /\\.css$/.test(e.name))),
    fontsKb: sum(fonts),
    preloadedFontsKb: sum(fonts.filter(e => preloaded.has(path(e)))),
    totalKb: sum(res),
    requests: res.length,
    sameOrigin: res.every(e => new URL(e.name).origin === location.origin),
    documentKb: kb(performance.getEntriesByType("navigation")[0]?.encodedBodySize ?? 0),
    threeIsDeferred: js.filter(e => !critical.has(path(e)))
      .some(e => (e.encodedBodySize || e.transferSize || 0) > 100 * 1024),
  };
})()`);

/* Budgets. Le JS critique est ce qui bloque réellement le premier rendu ; la
   scène 3D est hors de ce budget parce qu'elle arrive après l'hydratation. */
check(
  "JS critique sous 180 Ko",
  payload.criticalJsKb <= 180,
  `${payload.criticalJsKb} Ko (React + Next + app)`,
);
check(
  "la scène 3D est bien hors du chemin critique",
  payload.threeIsDeferred && payload.deferredJsKb > 200,
  `${payload.deferredJsKb} Ko différés en ${payload.deferredCount} chunks`,
);
check("CSS sous 20 Ko", payload.cssKb <= 20, `${payload.cssKb} Ko`);
check(
  "polices préchargées sous 140 Ko",
  payload.preloadedFontsKb <= 140,
  `${payload.preloadedFontsKb} Ko préchargés sur ${payload.fontsKb} Ko chargés`,
);
check(
  "charge utile totale sous 800 Ko",
  payload.totalKb < 800,
  `${payload.totalKb} Ko en ${payload.requests} requêtes`,
);
check("document HTML sous 60 Ko", payload.documentKb < 60, `${payload.documentKb} Ko`);
check("aucune requête vers un domaine tiers", payload.sameOrigin, "tout vient de l'origine");

/* ------------------------------------------------------ DÉCALAGE DE MISE EN PAGE */
const cls = await evaluate(`(async () => {
  let value = 0;
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) value += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
  await new Promise(r => setTimeout(r, 1200));
  return Math.round(value * 1000) / 1000;
})()`);
check(
  "aucun décalage de mise en page cumulé (CLS ≈ 0)",
  cls < 0.02,
  `CLS = ${cls}`,
);

/* ------------------------------------------------------------ AXE-CORE */
await evaluate(AXE);
const axe = await evaluate(`(async () => {
  const results = await axe.run(document, {
    resultTypes: ["violations"],
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
  });
  return results.violations.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
    targets: v.nodes.map(n => n.target.join(" ")),
    sample: v.nodes[0]?.target?.join(" ") ?? "",
  }));
})()`);

/* Exception unique et épinglée : le filigrane terminal de la section Communauté
   est de la décoration pure à 3,5 % d'opacité, sous aria-hidden. Le WCAG 1.4.3
   exempte explicitement la décoration ; axe ne peut pas distinguer une texture
   d'un contenu et calcule 1,04:1. On ne désactive pas la règle — on vérifie que
   c'est la SEULE occurrence et qu'elle est bien confinée au filigrane. */
const isDecorativeWatermark = (v) =>
  v.id === "color-contrast" && v.targets.every((t) => /terminal-type/.test(t));

const decorative = axe.filter(isDecorativeWatermark);
const real = axe.filter((v) => !isDecorativeWatermark(v));

check(
  "axe-core : aucune violation réelle (WCAG 2.1 AA + bonnes pratiques)",
  real.length === 0,
  real.length
    ? real.map((v) => `${v.impact} ${v.id} (${v.nodes}) ${v.sample}`).join(" | ")
    : "aucune",
);
check(
  "la seule exception de contraste est le filigrane décoratif",
  decorative.length <= 1 &&
    decorative.every((v) => v.nodes <= 16 && v.targets.every((t) => /terminal-type/.test(t))),
  decorative.length
    ? `filigrane Communauté, ${decorative[0].nodes} nœud(s) — décoration pure, exemptée par le WCAG 1.4.3`
    : "aucune exception",
);

/* --------------------------------------------------------- SÉMANTIQUE */
const semantics = await evaluate(`(() => {
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .map(h => ({ level: Number(h.tagName[1]), text: h.textContent.replace(/\\s+/g," ").trim().slice(0, 40) }));
  let jumps = [];
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) {
      jumps.push(headings[i - 1].level + "→" + headings[i].level + " « " + headings[i].text + " »");
    }
  }
  return {
    h1Count: headings.filter(h => h.level === 1).length,
    jumps,
    landmarks: {
      header: document.querySelectorAll("body > header").length,
      nav: document.querySelectorAll("nav").length,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("body > footer").length,
    },
    lang: document.documentElement.lang,
    imagesWithoutAlt: [...document.querySelectorAll("img")].filter(i => !i.hasAttribute("alt")).length,
    svgNotHidden: [...document.querySelectorAll("svg")].filter(s => s.getAttribute("aria-hidden") !== "true").length,
    unlabelledButtons: [...document.querySelectorAll("button")]
      .filter(b => !b.textContent.trim() && !b.getAttribute("aria-label")).length,
  };
})()`);

check("un seul h1", semantics.h1Count === 1, `${semantics.h1Count}`);
check(
  "hiérarchie de titres sans saut de niveau",
  semantics.jumps.length === 0,
  semantics.jumps.length ? semantics.jumps.join(" · ") : "continue",
);
check(
  "repères sémantiques présents",
  semantics.landmarks.header === 1 && semantics.landmarks.main === 1 && semantics.landmarks.footer === 1 && semantics.landmarks.nav >= 1,
  JSON.stringify(semantics.landmarks),
);
check("langue déclarée en français", semantics.lang === "fr", semantics.lang);
check("toute image porte un alt", semantics.imagesWithoutAlt === 0, `${semantics.imagesWithoutAlt} sans alt`);
check("icônes décoratives masquées", semantics.svgNotHidden === 0, `${semantics.svgNotHidden} svg non masqués`);
check("tout bouton a un nom accessible", semantics.unlabelledButtons === 0, `${semantics.unlabelledButtons} sans nom`);

/* ----------------------------------------------------- PARCOURS CLAVIER */
await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(3000);

const tabOrder = [];
await evaluate(`document.body.focus()`);
for (let i = 0; i < 32; i++) {
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const step = await evaluate(`(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      label: (el.getAttribute("aria-label") || el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 32),
      outline: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2,
      visible: r.width > 0 && r.height > 0,
      inHidden: !!el.closest("[inert], [aria-hidden='true']"),
    };
  })()`);
  if (!step) break;
  tabOrder.push(step);
}

check(
  "le parcours clavier couvre toute la page",
  tabOrder.length >= 25,
  `${tabOrder.length} arrêts atteints`,
);
check(
  "chaque arrêt clavier est visible et hors zone masquée",
  tabOrder.every((s) => s.visible && !s.inHidden),
  tabOrder.filter((s) => !s.visible || s.inHidden).map((s) => `${s.tag} « ${s.label} »`).join(" | ") || "tous corrects",
);
check(
  "anneau de focus visible sur chaque arrêt",
  tabOrder.every((s) => s.outline),
  tabOrder.filter((s) => !s.outline).map((s) => `${s.tag} « ${s.label} »`).join(" | ") || "tous visibles",
);

/* ------------------------------------------------------------- SEO / OG */
const head = await evaluate(`(() => {
  const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
  return {
    title: document.title,
    description: meta('meta[name="description"]'),
    ogTitle: meta('meta[property="og:title"]'),
    ogDescription: meta('meta[property="og:description"]'),
    ogImage: meta('meta[property="og:image"]'),
    ogType: meta('meta[property="og:type"]'),
    ogLocale: meta('meta[property="og:locale"]'),
    ogUrl: meta('meta[property="og:url"]'),
    twitterCard: meta('meta[name="twitter:card"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    icons: [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map(l => l.getAttribute("href")),
    robots: meta('meta[name="robots"]'),
    themeColor: meta('meta[name="theme-color"]'),
  };
})()`);

check("titre et description présents", !!head.title && !!head.description, `« ${head.title?.slice(0, 50)}… »`);
check(
  "Open Graph complet",
  !!head.ogTitle && !!head.ogDescription && !!head.ogImage && head.ogType === "website" && head.ogLocale?.startsWith("fr"),
  `type=${head.ogType} locale=${head.ogLocale} image=${head.ogImage}`,
);
check("carte Twitter/X déclarée", head.twitterCard === "summary_large_image", `${head.twitterCard}`);
check("URL canonique déclarée", !!head.canonical, `${head.canonical}`);
/* Assertion née d'un vrai incident : le canonique et l'image OG pointaient vers
   un domaine appartenant à un tiers (NEXT_PUBLIC_SITE_URL laissée sur une valeur
   devinée). L'audit ne le voyait pas : il vérifiait leur présence, pas leur
   cohérence avec l'origine servie. L'aperçu de partage était cassé. */
const servedOrigin = await evaluate(`location.origin`);
/* En local, le harnais sert sur un autre port que le repli de développement :
   on compare l'hôte, pas le port. En production les deux doivent coïncider. */
const host = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};
check(
  "canonique et image OG sur l'origine réellement servie",
  host(head.canonical) === host(servedOrigin) &&
    host(head.ogImage) === host(servedOrigin),
  `servi=${host(servedOrigin)} · canonique=${host(head.canonical)} · og:image=${host(head.ogImage)}`,
);
check("favicon propre au projet", head.icons.some((h) => h && !h.includes("favicon.ico")), head.icons.join(" "));
check("theme-color défini", head.themeColor === "#080808", `${head.themeColor}`);

/* La page de démo interne ne doit pas être indexable. */
await cdp.goto(`${BASE}/dev`);
await sleep(1500);
const devRobots = await evaluate(
  `document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null`,
);
check("/dev non indexable", /noindex/.test(devRobots ?? ""), `robots=${devRobots}`);

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
