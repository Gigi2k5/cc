/**
 * Chemin tactile — ce qui doit être DÉSACTIVÉ au doigt (phase 7).
 *
 * À lancer avec POINTER=coarse, sinon le harnais rapporte un pointeur fin et
 * ces vérifications ne testent rien :
 *   POINTER=coarse bash tools/visual/run.sh checks/touch.mjs
 */
import { connect, createReport } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({
  port: Number(process.env.CDP_PORT ?? 9222),
  out: process.env.OUT ?? ".",
});
const { check, finish } = createReport();
const { evaluate, sleep } = cdp;

await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(3500);

const state = await evaluate(`({
  finePointer: matchMedia("(hover: hover) and (pointer: fine)").matches,
  coarse: matchMedia("(pointer: coarse)").matches,
  magnetic: document.querySelectorAll('[data-magnetic="on"]').length,
  magneticWrappers: document.querySelectorAll('[class*="transition-[translate]"]').length,
  spotlights: document.querySelectorAll(".card-spotlight").length,
  heroCanvas: !!document.querySelector("section canvas"),
  networkCanvas: !!document.querySelector("body > div.fixed canvas"),
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
})`);

check(
  "le harnais simule bien un écran tactile",
  state.coarse && !state.finePointer,
  `pointer:coarse=${state.coarse} · fine=${state.finePointer}`,
);
check(
  "aucun magnétisme actif au doigt",
  state.magnetic === 0 && state.magneticWrappers > 0,
  `${state.magnetic} actif(s) sur ${state.magneticWrappers} conteneurs présents`,
);
check(
  "aucun halo curseur rendu au doigt",
  state.spotlights === 0,
  `${state.spotlights} halo(s) dans le DOM`,
);
check("la scène 3D reste montée au doigt", state.heroCanvas && state.networkCanvas, "hero + réseau");
check("aucun débordement horizontal", state.overflow <= 0, `${state.overflow}px`);

/* Les cartes ne doivent pas rester « collées » en survol après un tap. */
const card = await evaluate(`(() => {
  const c = document.querySelector("#ce-quon-fait li .group");
  c.scrollIntoView({ block: "center", behavior: "instant" });
  const r = c.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + 40) };
})()`);
await sleep(400);
await cdp.send("Input.dispatchTouchEvent", {
  type: "touchStart",
  touchPoints: [{ x: card.x, y: card.y }],
});
await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
await sleep(2000);
const afterTap = await evaluate(`(() => {
  const c = document.querySelector("#ce-quon-fait li .group");
  const s = getComputedStyle(c);
  return { border: s.borderTopColor, translate: s.translate };
})()`);
check(
  "aucun état de survol collé après un tap",
  afterTap.border !== "rgb(250, 21, 0)",
  `bordure=${afterTap.border} translate=${afterTap.translate}`,
);

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
