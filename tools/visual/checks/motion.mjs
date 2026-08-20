/**
 * Chorégraphie (phase 7) — boutons magnétiques, spotlight curseur, transitions
 * de section, et cohérence entre lib/motion.ts et les tokens CSS.
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
const { evaluate, sleep, screenshot: shot, send } = cdp;

/* --------------------------- lib/motion.ts vs tokens CSS --------------------
   Les deux doivent rester alignés : le CSS est la source de vérité, le module
   JS n'en est le miroir que là où une valeur numérique est indispensable. */
const motionSource = readFileSync(
  new URL("../../../lib/motion.ts", import.meta.url),
  "utf8",
);
const readNumber = (name) =>
  Number(motionSource.match(new RegExp(`${name}:\\s*([\\d.]+)`))?.[1]);
const readString = (name) =>
  motionSource.match(new RegExp(`${name}:\\s*"([^"]+)"`))?.[1];

const JS_MOTION = {
  micro: readNumber("micro"),
  standard: readNumber("standard"),
  reveal: readNumber("reveal"),
  easeStandard: readString("standard").includes("cubic")
    ? readString("standard")
    : motionSource.match(/standard: "(cubic[^"]+)"/)?.[1],
  spotlightRadius: Number(motionSource.match(/SPOTLIGHT_RADIUS = (\d+)/)?.[1]),
  magneticMax: Number(motionSource.match(/max: (\d+)/)?.[1]),
};

const move = async (x, y) => {
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: Math.round(x),
    y: Math.round(y),
    buttons: 0,
    pointerType: "mouse",
  });
};

await cdp.viewport({ width: 1440, height: 1000 });
await cdp.goto(BASE);
await sleep(3000);

const tokens = await evaluate(`(() => {
  const root = getComputedStyle(document.documentElement);
  const spot = getComputedStyle(document.querySelector(".card-spotlight") ?? document.body);
  return {
    micro: root.getPropertyValue("--duration-micro").trim(),
    standard: root.getPropertyValue("--duration-standard").trim(),
    reveal: root.getPropertyValue("--duration-reveal").trim(),
    easeStandard: root.getPropertyValue("--ease-standard").trim(),
    spotBg: spot.backgroundImage,
  };
})()`);

const ms = (value) => Math.round(parseFloat(value) * (value.endsWith("ms") ? 1 : 1000));
check(
  "durées : lib/motion.ts aligné sur les tokens CSS",
  ms(tokens.micro) === JS_MOTION.micro &&
    ms(tokens.standard) === JS_MOTION.standard &&
    ms(tokens.reveal) === JS_MOTION.reveal,
  `CSS ${tokens.micro}/${tokens.standard}/${tokens.reveal} · JS ${JS_MOTION.micro}/${JS_MOTION.standard}/${JS_MOTION.reveal}`,
);
/* Chrome normalise « 0.22 » en « .22 » : on compare les nombres, pas les
   chaînes. */
const bezier = (value) =>
  (value.match(/-?[\d.]+/g) ?? []).map(Number).join(",");
check(
  "easing standard aligné",
  bezier(tokens.easeStandard) === bezier(JS_MOTION.easeStandard),
  `CSS ${tokens.easeStandard} → ${bezier(tokens.easeStandard)}`,
);
check(
  "rayon du spotlight aligné sur SPOTLIGHT_RADIUS",
  tokens.spotBg.includes(`${JS_MOTION.spotlightRadius}px`),
  `CSS contient ${JS_MOTION.spotlightRadius}px : ${tokens.spotBg.includes(`${JS_MOTION.spotlightRadius}px`)}`,
);

/* ------------------------------------------------------ BOUTONS MAGNÉTIQUES */
const magneticCount = await evaluate(
  `document.querySelectorAll('[data-magnetic="on"]').length`,
);
check(
  "conteneurs magnétiques actifs au pointeur fin",
  magneticCount >= 3,
  `${magneticCount} boutons magnétiques (nav + 2 CTA du hero + communauté)`,
);

const magnetTarget = await evaluate(`(() => {
  const wrap = document.querySelector('section [data-magnetic="on"]');
  wrap.scrollIntoView({ block: "center", behavior: "instant" });
  const r = wrap.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
})()`);
await sleep(400);

/* Curseur vers le bord droit du bouton : le déplacement doit partir de ce côté. */
await move(magnetTarget.x + magnetTarget.w - 6, magnetTarget.y + magnetTarget.h / 2);
/* La transition de 150 ms s'étire beaucoup en rendu logiciel : mesurer trop tôt
   renvoie une valeur intermédiaire (vérifié : encore en vol à 200 ms). */
await sleep(2500);
const pulled = await evaluate(
  `getComputedStyle(document.querySelector('section [data-magnetic="on"]')).translate`,
);
const [px = 0, py = 0] = pulled.split(" ").map(parseFloat);
check(
  "le bouton est attiré vers le curseur",
  pulled !== "none" && Math.abs(px) > 1,
  `translate=${pulled}`,
);
check(
  `déplacement plafonné à ${JS_MOTION.magneticMax}px`,
  Math.abs(px) <= JS_MOTION.magneticMax + 0.5 && Math.abs(py || 0) <= JS_MOTION.magneticMax + 0.5,
  `x=${px} y=${py || 0}`,
);

/* Curseur au loin : retour à zéro. */
await move(5, 5);
await sleep(2500);
const released = await evaluate(
  `getComputedStyle(document.querySelector('section [data-magnetic="on"]')).translate`,
);
check(
  "le bouton revient en place quand le curseur sort",
  released === "none" || /^0px( 0px)?$/.test(released),
  `translate=${released}`,
);

/* ------------------------------------------------------------- SPOTLIGHT */
const spotState = await evaluate(`(() => {
  const cards = [...document.querySelectorAll("#ce-quon-fait li .group")];
  const staticCards = [...document.querySelectorAll("main .group")].filter(
    c => !c.className.includes("hover:border-rouge"));
  return {
    interactive: cards.length,
    withSpotlight: cards.filter(c => c.querySelector(".card-spotlight")).length,
    staticWithSpotlight: staticCards.filter(c => c.querySelector(".card-spotlight")).length,
  };
})()`);
check(
  "spotlight sur toutes les cartes interactives",
  spotState.interactive === 5 && spotState.withSpotlight === 5,
  `${spotState.withSpotlight}/${spotState.interactive} cartes`,
);
check(
  "aucun spotlight sur les panneaux non interactifs",
  spotState.staticWithSpotlight === 0,
  `${spotState.staticWithSpotlight}`,
);

const cardBox = await evaluate(`(() => {
  const card = document.querySelector("#ce-quon-fait li .group");
  card.scrollIntoView({ block: "center", behavior: "instant" });
  const r = card.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
})()`);
await sleep(400);
await move(cardBox.x + cardBox.w * 0.3, cardBox.y + cardBox.h * 0.7);
/* Fondu du halo : 300 ms nominales, bien plus en rendu logiciel. */
await sleep(2500);

const spotHover = await evaluate(`(() => {
  const card = document.querySelector("#ce-quon-fait li .group");
  const spot = card.querySelector(".card-spotlight");
  return {
    x: card.style.getPropertyValue("--spot-x"),
    y: card.style.getPropertyValue("--spot-y"),
    opacity: getComputedStyle(spot).opacity,
    interactive: getComputedStyle(spot).pointerEvents,
    hidden: spot.getAttribute("aria-hidden"),
  };
})()`);
check(
  "le halo suit le curseur dans la carte",
  parseFloat(spotHover.x) > 1 && parseFloat(spotHover.y) > 1,
  `--spot-x=${spotHover.x} --spot-y=${spotHover.y}`,
);
check(
  "halo visible au survol, décoratif et non cliquable",
  Number(spotHover.opacity) > 0.9 &&
    spotHover.interactive === "none" &&
    spotHover.hidden === "true",
  `opacity=${spotHover.opacity} pointer-events=${spotHover.interactive}`,
);
await shot("mo1-spotlight");
await move(5, 5);

/* -------------------------------------------------- TRANSITIONS DE SECTION */
await cdp.goto(BASE);
await sleep(2500);
const rulesBefore = await evaluate(`(() => {
  const rules = [...document.querySelectorAll(".section-rule")];
  return {
    count: rules.length,
    untouched: rules.filter(r => !r.dataset.revealed).length,
    transform: rules.length ? getComputedStyle(rules.at(-1)).transform : null,
    duration: rules.length ? getComputedStyle(rules[0]).transitionDuration : null,
  };
})()`);
check("5 filets de transition entre les sections", rulesBefore.count === 5, `${rulesBefore.count}`);
check(
  "filets non tracés avant d'entrer dans le cadre",
  rulesBefore.untouched === rulesBefore.count &&
    rulesBefore.transform === "matrix(0, 0, 0, 1, 0, 0)",
  `${rulesBefore.untouched} en attente · transform=${rulesBefore.transform}`,
);

await evaluate(`(async () => {
  const step = innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    scrollTo({ top: y, behavior: "instant" });
    await new Promise(r => setTimeout(r, 220));
  }
})()`);
await sleep(2000);
const rulesAfter = await evaluate(`(() => {
  const rules = [...document.querySelectorAll(".section-rule")];
  return {
    revealed: rules.filter(r => r.dataset.revealed === "true").length,
    transforms: rules.map(r => getComputedStyle(r).transform),
    decorative: rules.every(r => r.getAttribute("aria-hidden") === "true"),
  };
})()`);
check(
  "tous les filets se tracent au scroll",
  rulesAfter.revealed === 4 && rulesAfter.transforms.every(t => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)"),
  `${rulesAfter.revealed}/4 tracés`,
);
check("filets purement décoratifs", rulesAfter.decorative, "aria-hidden sur les 4");

/* --------------------------------------------------- ANIMATIONS RÉDUITES */
await cdp.emulateReducedMotion(true);
await cdp.goto(BASE);
await sleep(3000);
const reduced = await evaluate(`(() => {
  const rule = document.querySelector(".section-rule");
  return {
    magnetic: document.querySelectorAll('[data-magnetic="on"]').length,
    spotlights: document.querySelectorAll(".card-spotlight").length,
    ruleTransition: getComputedStyle(rule).transitionDuration,
    revealTransition: getComputedStyle(document.querySelector(".reveal")).transitionDuration,
  };
})()`);
check(
  "aucun magnétisme en animations réduites",
  reduced.magnetic === 0,
  `${reduced.magnetic} conteneur(s) actif(s)`,
);
check(
  "aucun halo curseur en animations réduites",
  reduced.spotlights === 0,
  `${reduced.spotlights} halo(s) dans le DOM`,
);
check(
  "transitions neutralisées (filets et révélations)",
  parseFloat(reduced.ruleTransition) < 0.002 && parseFloat(reduced.revealTransition) < 0.002,
  `filet=${reduced.ruleTransition} révélation=${reduced.revealTransition}`,
);

/* ------------------------------------------------------------- MOBILE */
await cdp.emulateReducedMotion(false);
await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(2500);
const mobile = await evaluate(`(() => {
  const cw = document.documentElement.clientWidth;
  const offenders = [...document.querySelectorAll("body *")]
    .map(el => ({ el, b: el.getBoundingClientRect() }))
    .filter(({ b }) => b.width > 0 && (b.right > cw + 1 || b.left < -1))
    .filter(({ el }) => {
      // Ignore ce qui est légitimement rogné par un ancêtre overflow-hidden.
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (getComputedStyle(p).overflowX === "hidden") return false;
      }
      return true;
    })
    .slice(0, 3)
    .map(({ el, b }) => el.tagName + "[" + String(el.className).slice(0, 40) + "] w=" + Math.round(b.width));
  /* Le conteneur magnétique s'étire comme enfant de flex : si le bouton qu'il
     entoure ne le remplit pas, les CTA cessent d'être pleine largeur — une
     régression que rien ne signalait avant. */
  const heroCta = [...document.querySelectorAll('section [data-magnetic] > a')]
    .slice(0, 2)
    .map(a => Math.round(a.getBoundingClientRect().width / a.parentElement.getBoundingClientRect().width * 100));
  return {
    overflow: document.documentElement.scrollWidth - cw,
    offenders,
    rules: document.querySelectorAll(".section-rule").length,
    heroCta,
  };
})()`);
check(
  "aucun débordement horizontal en mobile",
  mobile.overflow <= 0,
  mobile.overflow > 0 ? `${mobile.overflow}px · ${mobile.offenders.join(" | ")}` : "0px",
);
check(
  "les CTA du hero remplissent leur conteneur magnétique en mobile",
  mobile.heroCta.length === 2 && mobile.heroCta.every(p => p >= 99),
  mobile.heroCta.map(p => p + "%").join(" · "),
);
check("filets présents en mobile", mobile.rules === 4, `${mobile.rules}`);

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
