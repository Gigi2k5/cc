/**
 * Sections de contenu (phase 4) — fidélité de la copie au mot près,
 * révélations au scroll, survol des cartes, absence de débordement.
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
const { evaluate, sleep, screenshot: shot, send } = cdp;

/** Copie attendue, recopiée depuis le brief et non depuis le code. */
const EXPECTED = {
  enBref: [
    "Depuis 2022",
    "PC neufs & reconditionnés",
    "Concept 2 pour 1",
    "Communauté active",
    "Bénin",
  ],
  aProposTitle: "Plus qu'un vendeur de PC.",
  aProposBody:
    "Depuis 2022, Comlan Community rend la technologie accessible au Bénin. On vend des PC — mais on fait surtout en sorte que chaque client reparte avec la bonne machine, un vrai accompagnement, et l'accès à un univers communautaire.",
  signature: [
    "notre_signature = « deux pour le prix d'un »",
    "statut = tout_est_calculé",
  ],
  faitTitle: "Cinq façons de te servir.",
  cards: [
    ["PC sur mesure", "Neuf ou reconditionné, choisi selon ton besoin et ton budget."],
    ["2 pour 1", "Un avantage en plus à chaque pack, sans surcoût."],
    ["Nouveaux bacheliers", "La bonne machine pour ta filière, avec des conseils."],
    ["Univers Loup-Garou", "Le jeu communautaire de stratégie qui rassemble."],
    ["Un réseau", "Des événements qui font vivre d'autres entrepreneurs."],
  ],
  specs: ["Core i5", "16 Go", "SSD 512"],
  deuxTitle: "Un pack. Un avantage en plus.",
  deuxBody:
    "Tu paies un pack au prix standard et tu reçois un avantage additionnel, sans surcoût.",
  deuxBlocks: [
    ["[ 01 ]", "Ton PC", "config testée · prête à l'emploi"],
    ["[ 02 ]", "Ton avantage", "accessoire · service · bonus"],
    ["[ TOTAL ]", "Prix standard", "surcoût = 0"],
  ],
  commentTitle: "Trois étapes. Zéro surprise.",
  steps: [
    ["01", "Réservation", "Tu nous écris sur WhatsApp, on cerne ton besoin et ton budget."],
    ["02", "Préparation", "Config, test complet, et ton avantage 2 pour 1 ajouté au pack."],
    ["03", "Livraison", "Livraison, installation, et mini-formation pour bien démarrer."],
  ],
  delay: "délais typiques : 3–5 jours",
};

await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(2500);

/* Fait défiler toute la page pour déclencher chaque révélation. */
await evaluate(`(async () => {
  const step = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise(r => setTimeout(r, 220));
  }
})()`);
await sleep(1500);

const text = (selector) =>
  `[...document.querySelectorAll(${JSON.stringify(selector)})].map(n => n.textContent.replace(/\\s+/g, " ").trim())`;

const dom = await evaluate(`(() => ({
  enBref: ${text("section[aria-label='En bref'] li")},
  aProposTitle: document.getElementById("a-propos-title")?.textContent.trim(),
  aProposBody: [...document.querySelectorAll("#a-propos p")].map(n => n.textContent.replace(/\\s+/g," ").trim()).find(t => t.startsWith("Depuis 2022,")),
  signature: [...document.querySelectorAll("#a-propos .border-rouge span")].map(n => n.textContent.trim()),
  faitTitle: document.getElementById("ce-quon-fait-title")?.textContent.trim(),
  cards: [...document.querySelectorAll("#ce-quon-fait li")].map(li => [
    li.querySelector("h3")?.textContent.trim(),
    li.querySelector("p:not([class*='font-mono'])")?.textContent.replace(/\\s+/g," ").trim(),
  ]),
  cardSpecs: [...document.querySelectorAll("#ce-quon-fait li")].map(li =>
    [...li.querySelectorAll("span")].map(s => s.textContent.trim())
      .filter(t => /Core i5|16 Go|SSD 512/.test(t))),
  deuxTitle: document.getElementById("deux-pour-un-title")?.textContent.trim(),
  deuxBody: document.getElementById("deux-pour-un-title")?.nextElementSibling?.textContent.replace(/\\s+/g," ").trim(),
  deuxBlocks: (() => {
    const panel = document.getElementById("deux-pour-un-title").closest("div.relative");
    return [...panel.querySelectorAll("div.rounded-sm")].map(b =>
      [...b.querySelectorAll("p")].map(p => p.textContent.trim()));
  })(),
  operators: (() => {
    const panel = document.getElementById("deux-pour-un-title").closest("div.relative");
    return [...panel.querySelectorAll("span")].map(s => s.textContent.trim()).filter(t => t === "+" || t === "=");
  })(),
  watermark: (() => {
    const panel = document.getElementById("deux-pour-un-title").closest("div.relative");
    return panel.querySelector("p[aria-hidden]")?.textContent.replace(/\\s+/g," ").trim();
  })(),
  commentTitle: document.getElementById("comment-ca-marche-title")?.textContent.trim(),
  steps: [...document.getElementById("comment-ca-marche-title").closest("section").querySelectorAll("ol li")].map(li => [
    li.querySelector("span")?.textContent.trim(),
    li.querySelector("h3")?.textContent.trim(),
    li.querySelector("p")?.textContent.replace(/\\s+/g," ").trim(),
  ]),
  delayChip: [...document.querySelectorAll("span")].map(s => s.textContent.trim()).find(t => t.startsWith("délais")),
}))()`);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

check("En bref : 5 chips exacts", same(dom.enBref, EXPECTED.enBref), dom.enBref.join(" · "));
check("À propos : titre exact", dom.aProposTitle === EXPECTED.aProposTitle, dom.aProposTitle);
check("À propos : paragraphe exact", dom.aProposBody === EXPECTED.aProposBody, dom.aProposBody?.slice(0, 60) + "…");
check("À propos : bloc signature exact", same(dom.signature, EXPECTED.signature), dom.signature.join(" / "));
check("Ce qu'on fait : titre exact", dom.faitTitle === EXPECTED.faitTitle, dom.faitTitle);
check("Ce qu'on fait : 5 cartes, titres et textes exacts", same(dom.cards, EXPECTED.cards), dom.cards.map((c) => c[0]).join(" · "));
check("SpecChips sur la 1re carte uniquement", same(dom.cardSpecs[0], EXPECTED.specs) && dom.cardSpecs.slice(1).every((s) => s.length === 0), `carte 1 : ${dom.cardSpecs[0].join(" · ")}`);
check("2 pour 1 : titre exact", dom.deuxTitle === EXPECTED.deuxTitle, dom.deuxTitle);
check("2 pour 1 : accroche exacte", dom.deuxBody === EXPECTED.deuxBody, dom.deuxBody?.slice(0, 60) + "…");
check("2 pour 1 : les 3 blocs exacts", same(dom.deuxBlocks, EXPECTED.deuxBlocks), dom.deuxBlocks.map((b) => b[1]).join(" | "));
check("2 pour 1 : opérateurs + et =", same(dom.operators, ["+", "="]), dom.operators.join(" "));
check("2 pour 1 : filigrane machine", dom.watermark === "// TOUT_EST_CALCULÉ", dom.watermark);
check("Comment ça marche : titre exact", dom.commentTitle === EXPECTED.commentTitle, dom.commentTitle);
check("Comment ça marche : 3 étapes exactes", same(dom.steps, EXPECTED.steps), dom.steps.map((s) => `${s[0]} ${s[1]}`).join(" · "));
check("Chip des délais", dom.delayChip === EXPECTED.delay, dom.delayChip);

/* Révélations : tout doit avoir basculé après le passage de scroll. */
const reveals = await evaluate(`(() => {
  const all = [...document.querySelectorAll(".reveal")];
  const pending = all.filter(n => n.dataset.revealed !== "true");
  const styles = all.map(n => getComputedStyle(n).opacity);
  return { total: all.length, pending: pending.length, allOpaque: styles.every(o => Number(o) > 0.99) };
})()`);
check(
  "toutes les révélations se sont déclenchées",
  reveals.pending === 0 && reveals.allOpaque,
  `${reveals.total} éléments, ${reveals.pending} en attente`,
);

const cascade = await evaluate(`(() => {
  const cards = [...document.querySelectorAll("#ce-quon-fait li.reveal")];
  return cards.map(c => getComputedStyle(c).transitionDelay);
})()`);
check(
  "cascade échelonnée sur les cartes (§9 : 60–80 ms)",
  cascade.length === 5 && cascade[1] !== cascade[0] && cascade[4] !== cascade[0],
  cascade.join(" · "),
);

/* Survol d'une carte : bordure et eyebrow passent au rouge.
   Vrai déplacement de souris plutôt que CSS.forcePseudoState : c'est le
   moteur de rendu qui décide, et ça exerce aussi le @media (hover: hover)
   dont Tailwind v4 entoure les variantes de survol. */
const cardBox = await evaluate(`(() => {
  const card = document.querySelector("#ce-quon-fait li .group");
  card.scrollIntoView({ block: "center", behavior: "instant" });
  const r = card.getBoundingClientRect();
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
})()`);
await sleep(400);
await send("Input.dispatchMouseEvent", {
  type: "mouseMoved", x: cardBox.x, y: cardBox.y, buttons: 0,
});
await sleep(900);

const hover = await evaluate(`(() => {
  const card = document.querySelector("#ce-quon-fait li .group");
  const eyebrow = card.querySelector("p");
  const cs = getComputedStyle(card);
  return {
    border: cs.borderTopColor,
    shadow: cs.boxShadow !== "none",
    translate: cs.translate,
    eyebrow: getComputedStyle(eyebrow).color,
    hovered: card.matches(":hover"),
  };
})()`);
check(
  "survol carte : bordure rouge, élévation, eyebrow rouge",
  hover.hovered &&
    hover.border === "rgb(250, 21, 0)" &&
    hover.shadow &&
    hover.eyebrow === "rgb(250, 21, 0)",
  `:hover=${hover.hovered} bordure=${hover.border} ombre=${hover.shadow} translate=${hover.translate} eyebrow=${hover.eyebrow}`,
);
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 5, y: 5, buttons: 0 });
await shot("c1-sections-desktop");

/* Aucun débordement horizontal aux breakpoints du brief. */
for (const width of [360, 768, 1024, 1440]) {
  await cdp.viewport({ width, height: 900, mobile: width < 1024 });
  await sleep(700);
  const overflow = await evaluate(
    `document.documentElement.scrollWidth - document.documentElement.clientWidth`,
  );
  check(`aucun débordement horizontal à ${width}px`, overflow <= 0, `${overflow}px`);
}

await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(2500);
await evaluate(`window.scrollTo({top: document.body.scrollHeight * 0.35, behavior: "instant"})`);
await sleep(1200);
await shot("c2-sections-mobile");

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
