/**
 * Section Communauté et couche réseau globale (phase 5).
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { DRAW_COUNTER_SOURCE, connect, createReport } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({
  port: Number(process.env.CDP_PORT ?? 9222),
  out: process.env.OUT ?? ".",
});
const { check, finish } = createReport();
const { evaluate, sleep, screenshot: shot, send } = cdp;

/** Copie attendue, recopiée depuis le brief et non depuis le code. */
const EXPECTED = {
  title: "Ici, on n'achète pas qu'un PC. On rejoint un univers.",
  body: "Un jeu communautaire de stratégie, des éditions événementielles, un réseau qui tire tout le monde vers le haut.",
  tags: [
    "🐺 Loup-Garou · jeu de stratégie",
    "Éditions présidentielles",
    "Réseautage",
  ],
  cta: "Rejoindre la communauté",
  groupHref: "https://chat.whatsapp.com/EZwmZf6LCzQ5UYRhkg06OW",
};

await send("Page.addScriptToEvaluateOnNewDocument", { source: DRAW_COUNTER_SOURCE });

const NETWORK_CANVAS = `document.querySelector("body > div.fixed canvas")`;

await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(3000);

/* ------------------------------------------------------- COUCHE RÉSEAU */
const layer = await evaluate(`(() => {
  const wrap = document.querySelector("body > div.fixed");
  const canvas = ${NETWORK_CANVAS};
  const hero = document.querySelector("section canvas");
  if (!wrap || !canvas) return null;
  const ws = getComputedStyle(wrap);
  const main = getComputedStyle(document.querySelector("main"));
  const r = canvas.getBoundingClientRect();
  return {
    position: ws.position,
    zIndex: ws.zIndex,
    pointerEvents: ws.pointerEvents,
    ariaHidden: wrap.getAttribute("aria-hidden"),
    coversViewport: Math.round(r.width) >= document.documentElement.clientWidth - 2 &&
                    Math.round(r.height) >= document.documentElement.clientHeight - 2,
    canvasW: Math.round(r.width), clientW: document.documentElement.clientWidth,
    mainZ: main.zIndex,
    distinctFromHero: canvas !== hero,
    canvasCount: document.querySelectorAll("canvas").length,
    ratio: +(canvas.width / r.width).toFixed(2),
  };
})()`);

check("couche réseau montée", layer !== null, layer ? "canvas présent" : "absente");
check(
  "fixe, plein écran, sous le contenu",
  layer?.position === "fixed" && layer.coversViewport && Number(layer.zIndex) < Number(layer.mainZ),
  `position=${layer?.position} z=${layer?.zIndex} vs main z=${layer?.mainZ} · ${layer?.canvasW}px pour ${layer?.clientW}px`,
);
check(
  "décorative et non cliquable",
  layer?.ariaHidden === "true" && layer.pointerEvents === "none",
  `aria-hidden=${layer?.ariaHidden} pointer-events=${layer?.pointerEvents}`,
);
check(
  "deux contextes distincts : réseau et puce du hero",
  layer?.distinctFromHero === true && layer.canvasCount === 2,
  `${layer?.canvasCount} canvas`,
);
check("dpr du réseau plafonné à 1,5", (layer?.ratio ?? 9) <= 1.51, `ratio ${layer?.ratio}`);

/* Continuité : le réseau rend partout, pas seulement dans le hero. */
const continuity = [];
for (const fraction of [0, 0.35, 0.6, 0.9]) {
  await evaluate(`window.scrollTo({top: document.body.scrollHeight * ${fraction}, behavior: "instant"})`);
  await sleep(1400);
  const drawn = await evaluate(`(async () => {
    const c = ${NETWORK_CANVAS};
    const start = window.__draws(c);
    await new Promise(r => setTimeout(r, 1200));
    return window.__draws(c) - start;
  })()`);
  continuity.push({ fraction, drawn });
}
check(
  "réseau continu sur toute la page",
  continuity.every((c) => c.drawn > 0),
  continuity.map((c) => `${Math.round(c.fraction * 100)}% → ${c.drawn} draws`).join("  "),
);

/* Intensification : on vérifie l'entrée du calcul sur des positions réelles. */
const boost = await evaluate(`(() => {
  const section = document.getElementById("communaute");
  const measure = () => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - innerHeight / 2);
    return Math.max(0, 1 - distance / (innerHeight * 0.8));
  };
  // Section centrée à l'écran.
  section.scrollIntoView({ block: "center", behavior: "instant" });
  const centered = measure();
  // Section loin de l'écran.
  window.scrollTo({ top: 0, behavior: "instant" });
  const away = measure();
  return { centered: +centered.toFixed(2), away: +away.toFixed(2) };
})()`);
check(
  "intensification pilotée : maximale sur Communauté, nulle ailleurs",
  boost.centered > 0.9 && boost.away === 0,
  `centrée=${boost.centered} · hero=${boost.away}`,
);

/* ------------------------------------------------------------- SECTION */
await evaluate(`document.getElementById("communaute").scrollIntoView({block:"center", behavior:"instant"})`);
/* On ATTEND que la cascade soit posée au lieu de parier sur une durée.
   C'est la plus longue du site — 9 segments à 55 ms plus 700 ms de transition
   — et en rendu logiciel elle met bien plus que sa durée nominale : mesurée
   entre 2,5 s et plus de 3,5 s selon la charge de la machine. Toute constante
   choisie ici finit par tomber du mauvais côté un jour ; l'attente active,
   elle, ne dépend plus de la machine. */
const cascade = await evaluate(`(async () => {
  const mots = () => [...document.getElementById("communaute-title").querySelectorAll(".reveal")];
  const posee = () => mots().every(w => Number(getComputedStyle(w).opacity) > 0.99);
  const t0 = Date.now();
  while (!posee() && Date.now() - t0 < 10000) {
    await new Promise(r => setTimeout(r, 150));
  }
  return Date.now() - t0;
})()`);
await sleep(400);

const section = await evaluate(`(() => {
  const s = document.getElementById("communaute");
  const h2 = document.getElementById("communaute-title");
  const watermark = s.querySelector("div[aria-hidden] .terminal-drift");
  const wmWrap = watermark?.parentElement;
  const words = [...h2.querySelectorAll(".reveal")];
  return {
    bg: getComputedStyle(s).backgroundColor,
    eyebrow: (() => {
      const el = s.querySelector("div.max-w-page p");
      // Le « // » est séparé par un gap flex et la casse vient du CSS :
      // textContent ne les porte pas, on vérifie donc les deux séparément.
      return {
        text: el?.textContent.replace(/\\s+/g, " ").trim(),
        transform: el ? getComputedStyle(el).textTransform : null,
        slashColor: el ? getComputedStyle(el.querySelector("span")).color : null,
      };
    })(),
    ariaLabel: h2.getAttribute("aria-label"),
    innerHidden: h2.querySelector("span")?.getAttribute("aria-hidden"),
    wordCount: words.length,
    wordDelays: words.slice(0, 4).map(w => getComputedStyle(w).transitionDelay),
    wordsRevealed: words.every(w => Number(getComputedStyle(w).opacity) > 0.99),
    italicAccent: !!h2.querySelector("em"),
    body: [...s.querySelectorAll("p")].map(p => p.textContent.replace(/\\s+/g," ").trim())
      .find(t => t.startsWith("Un jeu communautaire")),
    tags: [...s.querySelectorAll("ul li")].map(li => li.textContent.trim()),
    cta: s.querySelector("a[href*='chat.whatsapp']")?.textContent.trim(),
    ctaHref: s.querySelector("a[href*='chat.whatsapp']")?.href,
    ctaRel: s.querySelector("a[href*='chat.whatsapp']")?.rel,
    watermarkLines: wmWrap ? watermark.querySelectorAll("p").length : 0,
    watermarkOpacity: wmWrap ? getComputedStyle(wmWrap).opacity : null,
    watermarkHidden: wmWrap?.getAttribute("aria-hidden"),
    driftAnim: watermark ? getComputedStyle(watermark).animationName : null,
    typedLines: watermark
      ? [...watermark.querySelectorAll(".terminal-type")].slice(0, 3).map(n => getComputedStyle(n).animationDelay)
      : [],
  };
})()`);

check(
  "fond translucide : la couche réseau reste visible",
  /\/ 0\.7[0-9]\)$/.test(section.bg),
  `background=${section.bg}`,
);
check(
  "eyebrow « // L'UNIVERS COMLAN » (casse et // rouge portés par le CSS)",
  section.eyebrow.text === "//L'univers Comlan" &&
    section.eyebrow.transform === "uppercase" &&
    section.eyebrow.slashColor === "rgb(250, 21, 0)",
  `${section.eyebrow.text} · ${section.eyebrow.transform} · // en ${section.eyebrow.slashColor}`,
);
check("titre exact et accessible d'un bloc", section.ariaLabel === EXPECTED.title, section.ariaLabel);
check("découpage en mots masqué aux lecteurs d'écran", section.innerHidden === "true", `aria-hidden=${section.innerHidden}`);
check(
  "révélation mot à mot, échelonnée",
  section.wordCount >= 9 && new Set(section.wordDelays).size > 1 && section.wordsRevealed,
  `${section.wordCount} segments · délais ${section.wordDelays.join(" ")} · posée en ${cascade} ms`,
);
check("« un univers » en italique dégradé", section.italicAccent, "<em> présent");
check("paragraphe exact", section.body === EXPECTED.body, section.body?.slice(0, 55) + "…");
check("3 tags exacts", JSON.stringify(section.tags) === JSON.stringify(EXPECTED.tags), section.tags.join(" · "));
check(
  "CTA vers le groupe WhatsApp, en nouvel onglet sûr",
  section.cta === EXPECTED.cta && section.ctaHref === EXPECTED.groupHref && /noopener/.test(section.ctaRel),
  `${section.cta} → ${section.ctaHref}`,
);
check(
  "filigrane terminal : 16 lignes, ~3,5 %, décoratif",
  section.watermarkLines === 16 &&
    Math.abs(Number(section.watermarkOpacity) - 0.035) < 0.005 &&
    section.watermarkHidden === "true",
  `${section.watermarkLines} lignes · opacité ${section.watermarkOpacity}`,
);
check(
  "filigrane : dérive lente et type-on ligne à ligne",
  section.driftAnim === "terminal-drift" && new Set(section.typedLines).size > 1,
  `dérive=${section.driftAnim} · délais ${section.typedLines.join(" ")}`,
);
await shot("n1-communaute-desktop");

/* --------------------------------------------------- ANIMATIONS RÉDUITES */
await cdp.emulateReducedMotion(true);
await cdp.goto(BASE);
/* 8 frames de chauffe à ~370 ms sous rendu logiciel, après l'import dynamique
   de la scène : il faut laisser la file se vider avant de mesurer le gel. */
await sleep(12000);
const reduced = await evaluate(`(async () => {
  const c = ${NETWORK_CANVAS};
  const total = window.__draws(c);
  const start = total;
  await new Promise(r => setTimeout(r, 2500));
  return { total, since: window.__draws(c) - start };
})()`);
check("réseau : image produite puis figée", reduced.total > 0 && reduced.since === 0, `${reduced.total} draws, puis ${reduced.since} sur 2,5 s`);

const drift = await evaluate(`(() => {
  const d = document.querySelector(".terminal-drift");
  const t = document.querySelector(".terminal-drift .terminal-type");
  return { driftDelay: getComputedStyle(d).animationDelay, typeWidth: getComputedStyle(t).width };
})()`);
check("filigrane figé et entièrement révélé", drift.driftDelay === "0s" && drift.typeWidth !== "0px", `délai=${drift.driftDelay} largeur=${drift.typeWidth}`);

/* ------------------------------------------------------------- MOBILE */
await cdp.emulateReducedMotion(false);
await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(3000);
await evaluate(`document.getElementById("communaute").scrollIntoView({block:"center", behavior:"instant"})`);
await sleep(1800);
const mobile = await evaluate(`({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  hasNetwork: !!${NETWORK_CANVAS},
  tagsWrap: [...document.querySelectorAll("#communaute ul li")].length,
})`);
check("aucun débordement horizontal en mobile", mobile.overflow <= 0, `${mobile.overflow}px`);
check("réseau présent en mobile", mobile.hasNetwork, `${mobile.hasNetwork}`);
check("3 tags en mobile", mobile.tagsWrap === 3, `${mobile.tagsWrap}`);
await shot("n2-communaute-mobile");

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
