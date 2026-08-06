/**
 * Breakpoints du brief (phase 8) — 360 / 768 / 1024 / 1440.
 *
 * Vérifie les bascules de mise en page à chaque palier et produit une capture
 * par palier pour jugement à l'œil.
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

/** Tailwind : sm 640 · lg 1024. Le brief demande ces quatre largeurs. */
const WIDTHS = [360, 768, 1024, 1440];

const probe = `(() => {
  const styleOf = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).display : "absent";
  };
  const cards = document.querySelectorAll("#ce-quon-fait li");
  const cardsPerRow = (() => {
    if (!cards.length) return 0;
    const firstTop = Math.round(cards[0].getBoundingClientRect().top);
    return [...cards].filter(c => Math.round(c.getBoundingClientRect().top) === firstTop).length;
  })();
  const heroText = document.querySelector("#hero-title")?.closest("div");
  return {
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    gutter: getComputedStyle(document.documentElement).getPropertyValue("--gutter").trim(),
    navH: getComputedStyle(document.documentElement).getPropertyValue("--nav-h").trim(),
    desktopLinks: styleOf("header ul"),
    burger: styleOf('header button[aria-controls="nav-panel"]'),
    chipSlotVisible: (() => {
      const slot = [...document.querySelectorAll("section div[aria-hidden]")]
        .find(d => d.className.includes("lg:hidden") && d.className.includes("62vw"));
      return slot ? getComputedStyle(slot).display !== "none" : null;
    })(),
    heroAlign: heroText ? getComputedStyle(heroText).textAlign : null,
    cardsPerRow,
    containerW: Math.round(document.querySelector("main div.max-w-page")?.getBoundingClientRect().width ?? 0),
  };
})()`;

for (const width of WIDTHS) {
  await cdp.viewport({ width, height: 900, mobile: width < 1024 });
  await cdp.goto(BASE);
  await sleep(3000);

  const state = await evaluate(probe);
  const mobileLayout = width < 1024;

  check(
    `${width}px — aucun débordement horizontal`,
    state.overflow <= 0,
    `${state.overflow}px`,
  );
  check(
    `${width}px — gouttière ${mobileLayout ? "20" : "40"}px et nav ${mobileLayout ? "64" : "76"}px`,
    state.gutter === (mobileLayout ? "20px" : "40px") &&
      state.navH === (mobileLayout ? "64px" : "76px"),
    `gutter=${state.gutter} nav=${state.navH}`,
  );
  check(
    `${width}px — nav en mode ${mobileLayout ? "burger" : "liens"}`,
    mobileLayout
      ? state.desktopLinks === "none" && state.burger !== "none"
      : state.desktopLinks !== "none" && state.burger === "none",
    `liens=${state.desktopLinks} burger=${state.burger}`,
  );
  check(
    `${width}px — hero ${mobileLayout ? "centré avec puce dans le flux" : "aligné à gauche"}`,
    mobileLayout
      ? state.heroAlign === "center" && state.chipSlotVisible === true
      : state.heroAlign === "left" && state.chipSlotVisible === false,
    `align=${state.heroAlign} emplacement puce visible=${state.chipSlotVisible}`,
  );

  const expectedCards = width < 640 ? 1 : width < 1024 ? 2 : 3;
  check(
    `${width}px — ${expectedCards} carte(s) par rangée`,
    state.cardsPerRow === expectedCards,
    `${state.cardsPerRow}`,
  );

  await evaluate(`window.scrollTo({top: 0, behavior: "instant"})`);
  await sleep(600);
  await shot(`bp-${width}-hero`);
  await evaluate(
    `document.getElementById("ce-quon-fait").scrollIntoView({block:"start", behavior:"instant"}); scrollBy(0, -100);`,
  );
  await sleep(900);
  await shot(`bp-${width}-cartes`);
}

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
