/**
 * Scène 3D du hero (phase 3)
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { connect, createReport } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({ port: Number(process.env.CDP_PORT ?? 9222), out: process.env.OUT ?? "." });
const { check, finish } = createReport();
const { evaluate: ev, sleep, screenshot: shot, send } = cdp;

/* Compteur d'appels de dessin, posé avant tout script de la page. */
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `
    window.__draws = 0;
    for (const proto of [
      typeof WebGLRenderingContext !== "undefined" && WebGLRenderingContext.prototype,
      typeof WebGL2RenderingContext !== "undefined" && WebGL2RenderingContext.prototype,
    ]) {
      if (!proto) continue;
      for (const m of ["drawArrays","drawElements","drawArraysInstanced","drawElementsInstanced"]) {
        const orig = proto[m];
        if (!orig) continue;
        proto[m] = function (...a) { window.__draws++; return orig.apply(this, a); };
      }
    }
  `,
});

/* ------------------------------------------------------------ DESKTOP 1440 */
await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);

/* Chorégraphie de chargement : on capture pendant la cascade. */
for (const [name, at] of [["h-0.4s", 400], ["h-0.9s", 500], ["h-1.6s", 700], ["h-2.6s", 1000]]) {
  await sleep(at);
  await shot(name);
}
await sleep(4000);
await shot("h-final");

const canvas = await ev(`(() => {
  const c = document.querySelector("section canvas");
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return {
    cssW: Math.round(r.width), cssH: Math.round(r.height),
    bufW: c.width, bufH: c.height,
    ratio: +(c.width / r.width).toFixed(2),
    draws: window.__draws,
  };
})()`);
check("canvas WebGL monté dans le hero", canvas !== null, canvas ? `${canvas.cssW}×${canvas.cssH} css` : "absent");
check("des appels de dessin ont lieu", (canvas?.draws ?? 0) > 0, `${canvas?.draws} draws cumulés`);
check(
  "dpr plafonné à 2",
  canvas !== null && canvas.ratio <= 2.01,
  `buffer ${canvas?.bufW}×${canvas?.bufH} → ratio ${canvas?.ratio}`,
);

/* Coût par frame, en appels de dessin (le vrai proxy GPU ; pas les FPS logiciels). */
const perFrame = await ev(`(async () => {
  const start = window.__draws;
  let frames = 0;
  await new Promise(res => {
    const t0 = performance.now();
    (function tick(){ frames++; performance.now() - t0 < 1500 ? requestAnimationFrame(tick) : res(); })();
  });
  return { draws: window.__draws - start, frames };
})()`);
/* Budget attendu : 8 meshes pour la puce (pistes et plots étant instanciés),
   3 pour le réseau, plus les passes de bloom. ~22 est le régime normal ; au-delà
   de 32, quelque chose a cessé d'être instancié. */
check(
  "appels de dessin par frame dans le budget",
  perFrame.frames > 0 && perFrame.draws / perFrame.frames < 32,
  `${perFrame.draws} draws / ${perFrame.frames} frames = ${(perFrame.draws / perFrame.frames).toFixed(1)} par frame`,
);

/* Le rendu doit s'arrêter quand le hero sort de l'écran. */
await ev(`window.scrollTo({top: 3000, behavior: "instant"})`);
/* Deux fenêtres : la 1re peut contenir les frames déjà en vol (le rendu logiciel
   met ~370 ms par frame), la 2nde doit être strictement vide. */
const drain = await ev(`(async () => {
  const start = window.__draws;
  await new Promise(r => setTimeout(r, 2500));
  return window.__draws - start;
})()`);
const offscreen = await ev(`(async () => {
  const start = window.__draws;
  await new Promise(r => setTimeout(r, 2500));
  return window.__draws - start;
})()`);
check("rendu arrêté hors écran", offscreen === 0, `drainage ${drain} draws, puis ${offscreen} draws sur 2,5 s`);

await ev(`window.scrollTo({top: 0, behavior: "instant"})`);
await sleep(1200);
const back = await ev(`(async () => {
  const start = window.__draws;
  await new Promise(r => setTimeout(r, 1000));
  return window.__draws - start;
})()`);
check("rendu repris au retour à l'écran", back > 0, `${back} draws pendant 1 s`);

/* Contenu du hero. */
const content = await ev(`(() => {
  const h1 = document.getElementById("hero-title");
  const sec = h1.closest("section");
  return {
    h1: [...h1.querySelectorAll(".hero-line")].map(l => l.textContent.trim()).join(" "),
    lines: [...h1.querySelectorAll(".hero-line")].length,
    italic: !!h1.querySelector("em"),
    typeChars: getComputedStyle(sec.querySelector(".terminal-type")).getPropertyValue("--type-chars").trim(),
    caret: !!sec.querySelector(".terminal-caret"),
    ctas: [...sec.querySelectorAll("a[href*='wa.me'], a[href*='chat.whatsapp']")].map(a => a.textContent.trim()),
    caption: [...sec.querySelectorAll("p")].map(p=>p.textContent.trim()).find(t => t.startsWith("la machine")),
    eyebrow: sec.querySelector("p")?.textContent.replace(/\\s+/g," ").trim(),
    canvasAria: document.querySelector("section canvas")?.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
  };
})()`);
check("H1 exact sur deux lignes masquées", content.h1 === "Le PC qu'il te faut. Deux pour le prix d'un." && content.lines === 2, `"${content.h1}" · ${content.lines} lignes`);
check("2e ligne en italique dégradé", content.italic, `<em> présent`);
check("type-on calé sur la longueur de la commande", content.typeChars === "36", `--type-chars=${content.typeChars}`);
check("caret rouge présent", content.caret === true);
check("2 CTA du hero", content.ctas.length === 2, content.ctas.join(" | "));
check("légende basse présente", content.caption === "la machine · et tout l'univers autour", content.caption ?? "absente");
check("canvas retiré de l'arbre d'accessibilité", content.canvasAria === "true", `aria-hidden=${content.canvasAria}`);

/* ------------------------------------------------------ ANIMATIONS RÉDUITES */
await cdp.emulateReducedMotion(true);
await cdp.goto(BASE);
await sleep(9000);  // SwiftShader : ~370 ms par rendu, on laisse la file se vider
await shot("h-reduced");

const reduced = await ev(`(() => {
  const h1 = document.getElementById("hero-title");
  const line = h1.querySelector(".hero-line > span");
  const cs = getComputedStyle(line);
  const type = getComputedStyle(document.querySelector(".terminal-type"));
  const caret = getComputedStyle(document.querySelector(".terminal-caret"));
  const eyebrow = getComputedStyle(document.querySelector("#hero-title").previousElementSibling);
  return {
    lineDelay: cs.animationDelay, lineDuration: cs.animationDuration,
    lineTranslate: cs.translate, lineOpacity: cs.opacity,
    eyebrowOpacity: eyebrow.opacity,
    typeWidth: type.width, typeDelay: type.animationDelay,
    caretAnim: caret.animationName, caretOpacity: caret.opacity,
    draws: window.__draws,
  };
})()`);
check(
  "délais d'animation annulés (pas de hero vide)",
  reduced.lineDelay === "0s" && reduced.typeDelay === "0s",
  `ligne=${reduced.lineDelay} type-on=${reduced.typeDelay}`,
);
check(
  "titre et eyebrow immédiatement visibles",
  reduced.lineOpacity === "1" && reduced.eyebrowOpacity === "1" && /^(none|0px( 0%)?)$/.test(reduced.lineTranslate),
  `opacity ligne=${reduced.lineOpacity} eyebrow=${reduced.eyebrowOpacity} translate=${reduced.lineTranslate}`,
);
check(
  "caret statique mais visible",
  reduced.caretAnim === "none" && reduced.caretOpacity === "1",
  `animation=${reduced.caretAnim} opacity=${reduced.caretOpacity}`,
);
check("commande entièrement révélée", reduced.typeWidth !== "0px", `width=${reduced.typeWidth}`);
check("la scène a bien produit une image figée", reduced.draws > 0, `${reduced.draws} draws`);

const frozen = await ev(`(async () => {
  const start = window.__draws;
  await new Promise(r => setTimeout(r, 2000));
  return window.__draws - start;
})()`);
check("image figée : plus aucun rendu", frozen === 0, `${frozen} draws pendant 2 s`);

/* ------------------------------------------------------------- MOBILE 390 */
await cdp.emulateReducedMotion(false);
await cdp.viewport({ width: 390, height: 844, scale: 3, mobile: true });
await cdp.goto(BASE);
await sleep(5000);
await shot("h-mobile");

const mobile = await ev(`(() => {
  const c = document.querySelector("section canvas");
  const r = c?.getBoundingClientRect();
  return {
    hasCanvas: !!c,
    ratio: c ? +(c.width / r.width).toFixed(2) : null,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    terminalFits: (() => {
      const t = document.querySelector(".terminal-type");
      return t ? t.scrollWidth <= t.parentElement.clientWidth + 1 : null;
    })(),
  };
})()`);
check("scène montée en mobile", mobile.hasCanvas, `canvas présent`);
check("dpr mobile plafonné à 1,5", mobile.ratio !== null && mobile.ratio <= 1.51, `ratio ${mobile.ratio}`);
check("aucun débordement horizontal", mobile.overflowX <= 0, `${mobile.overflowX}px de débordement`);
check("la ligne terminal tient dans la largeur", mobile.terminalFits !== false, `${mobile.terminalFits}`);

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
