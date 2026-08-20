/**
 * Nav, panneau mobile et footer (phase 2)
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { connect, createReport } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({ port: Number(process.env.CDP_PORT ?? 9222), out: process.env.OUT ?? "." });
const { check, finish } = createReport();
const { evaluate, sleep, screenshot: shot, send } = cdp;

/* ---------------------------------------------------------------- DESKTOP */
await cdp.viewport({ width: 1440, height: 900 });
await cdp.goto(BASE);
await sleep(2500);

const navTop = await evaluate(`(() => {
  const h = document.querySelector("header");
  const s = getComputedStyle(h);
  return { bg: s.backgroundColor, border: s.borderBottomColor, blur: s.backdropFilter, h: h.offsetHeight };
})()`);
check(
  "nav transparente en haut de page",
  navTop.bg === "rgba(0, 0, 0, 0)" && navTop.blur === "none",
  `bg=${navTop.bg} backdrop=${navTop.blur}`,
);
check("hauteur de nav = 76px (desktop)", navTop.h === 76, `${navTop.h}px`);
await shot("d1-nav-top");

/* scroll → verre dépoli.
   La bascule passe par un rAF (écoute de scroll), puis un rendu React, puis une
   transition de 300 ms. Sous rendu logiciel rAF tourne à ~3 Hz : il faut laisser
   toute la chaîne s'exécuter, sinon on lit un état intermédiaire transparent. */
await evaluate(`window.scrollTo({top: 600, behavior: "instant"})`);
await sleep(2500);
const navScrolled = await evaluate(`(() => {
  const s = getComputedStyle(document.querySelector("header"));
  return { bg: s.backgroundColor, border: s.borderBottomColor, blur: s.backdropFilter,
           scrollY: window.scrollY };
})()`);
check(
  "verre dépoli au scroll (fond + flou + bordure)",
  navScrolled.bg !== "rgba(0, 0, 0, 0)" &&
    navScrolled.blur !== "none" &&
    navScrolled.border !== "rgba(0, 0, 0, 0)",
  `scrollY=${navScrolled.scrollY} bg=${navScrolled.bg} backdrop=${navScrolled.blur} border=${navScrolled.border}`,
);

/* ------------------------------------------------------------- SCROLL-SPY */
const ids = ["a-propos", "ce-quon-fait", "communaute", "evenements", "faq", "contact"];
const spy = [];
for (const target of ids) {
  await evaluate(`(() => {
    const el = document.getElementById(${JSON.stringify(target)});
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
    /* Position absolue, pas offsetTop : depuis que <main> est positionné,
       offsetTop est relatif à lui et non au document. */
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - navH + 40, behavior: "instant" });
  })()`);
  await sleep(600);
  const current = await evaluate(
    `document.querySelector('header a[aria-current="true"]')?.getAttribute("href") ?? null`,
  );
  spy.push({ target, current });
}
const spyOk = spy.every((s) => s.current === `#${s.target}`);
check(
  "scroll-spy : la bonne ancre est active pour les 6 sections",
  spyOk,
  spy.map((s) => `${s.target}→${s.current}`).join("  "),
);
await shot("d2-nav-scrolled");

/* le hero ne doit surligner aucun lien */
await evaluate(`window.scrollTo({top: 0, behavior: "instant"})`);
await sleep(500);
const heroActive = await evaluate(
  `document.querySelectorAll('header a[aria-current="true"]').length`,
);
check("aucun lien actif sur le hero", heroActive === 0, `${heroActive} actif(s)`);

/* liens externes sécurisés */
const relCheck = await evaluate(`(() => {
  const bad = [...document.querySelectorAll('a[target="_blank"]')]
    .filter(a => !/noopener/.test(a.rel));
  const wa = [...document.querySelectorAll('a[href^="https://wa.me"], a[href*="chat.whatsapp.com"]')];
  return { badRel: bad.length, waCount: wa.length, blankCount: document.querySelectorAll('a[target="_blank"]').length };
})()`);
check(
  "liens externes en nouvel onglet avec rel sûr",
  relCheck.badRel === 0 && relCheck.waCount > 0,
  `${relCheck.blankCount} liens _blank, ${relCheck.waCount} WhatsApp, ${relCheck.badRel} sans noopener`,
);

/* le burger est masqué en desktop */
const burgerDesktop = await evaluate(
  `getComputedStyle(document.querySelector('header button[aria-controls="nav-panel"]')).display`,
);
check("burger masqué en desktop", burgerDesktop === "none", burgerDesktop);

/* ----------------------------------------------------------------- MOBILE */
await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(2500);

const mob = await evaluate(`(() => {
  const h = document.querySelector("header");
  const burger = document.querySelector('header button[aria-controls="nav-panel"]');
  const panel = document.getElementById("nav-panel");
  const ps = getComputedStyle(panel);
  const bs = burger.getBoundingClientRect();
  return {
    navH: h.offsetHeight,
    burgerDisplay: getComputedStyle(burger).display,
    burgerW: bs.width, burgerH: bs.height,
    expanded: burger.getAttribute("aria-expanded"),
    panelVis: ps.visibility, panelOpacity: ps.opacity,
    panelHidden: panel.getAttribute("aria-hidden"),
    desktopLinks: getComputedStyle(document.querySelector("header ul")).display,
  };
})()`);
check("hauteur de nav = 64px (mobile)", mob.navH === 64, `${mob.navH}px`);
check("burger visible en mobile", mob.burgerDisplay !== "none", mob.burgerDisplay);
check(
  "cible tactile du burger ≥ 44px",
  mob.burgerW >= 44 && mob.burgerH >= 44,
  `${mob.burgerW}×${mob.burgerH}`,
);
check("liens desktop masqués en mobile", mob.desktopLinks === "none", mob.desktopLinks);
check(
  "panneau fermé : invisible + aria-hidden",
  mob.panelVis === "hidden" && mob.panelHidden === "true" && mob.expanded === "false",
  `visibility=${mob.panelVis} aria-hidden=${mob.panelHidden} expanded=${mob.expanded}`,
);
await shot("m1-nav-closed");

/* ouverture du panneau par un vrai clic */
const box = await evaluate(`(() => {
  const b = document.querySelector('header button[aria-controls="nav-panel"]').getBoundingClientRect();
  return { x: b.x + b.width/2, y: b.y + b.height/2 };
})()`);
for (const type of ["mousePressed", "mouseReleased"]) {
  await send("Input.dispatchMouseEvent", {
    type, x: box.x, y: box.y, button: "left", clickCount: 1,
  });
}
/* Ouverture = rendu React puis fondu de 300 ms. Sous rendu logiciel, avec la
   scène 3D et les révélations sur la même page, la chaîne met plus d'une
   seconde à s'exécuter. */
await sleep(2500);

const opened = await evaluate(`(() => {
  const panel = document.getElementById("nav-panel");
  const ps = getComputedStyle(panel);
  return {
    vis: ps.visibility, opacity: ps.opacity,
    ariaHidden: panel.getAttribute("aria-hidden"),
    expanded: document.querySelector('header button[aria-controls="nav-panel"]').getAttribute("aria-expanded"),
    bodyOverflow: document.body.style.overflow,
    focused: document.activeElement?.textContent?.trim() ?? null,
    role: panel.getAttribute("role"),
    modal: panel.getAttribute("aria-modal"),
    linkCount: panel.querySelectorAll("a").length,
    fontSize: getComputedStyle(panel.querySelector("a")).fontSize,
  };
})()`);
check(
  "panneau ouvert : visible, aria-expanded=true",
  opened.vis === "visible" && Number(opened.opacity) > 0.98 && opened.expanded === "true" && opened.ariaHidden === "false",
  `visibility=${opened.vis} opacity=${opened.opacity} expanded=${opened.expanded}`,
);
check("scroll du body verrouillé", opened.bodyOverflow === "hidden", `overflow=${opened.bodyOverflow}`);
check("focus déplacé sur le premier lien", opened.focused === "À propos", `focus=${opened.focused}`);
/* La bande d'annonce précède la nav : le panneau doit réserver les deux
   hauteurs, sinon son premier lien passe sous l'en-tête (8 px de recouvrement
   la première fois). */
const chevauche = await evaluate(`(() => {
  const header = document.querySelector("header").getBoundingClientRect();
  const premier = document.getElementById("nav-panel").querySelector("a").getBoundingClientRect();
  return { premier: Math.round(premier.top), header: Math.round(header.bottom) };
})()`);
check(
  "le panneau commence sous l'en-tête, bande comprise",
  chevauche.premier >= chevauche.header,
  `1er lien à ${chevauche.premier}px · bas de l'en-tête à ${chevauche.header}px`,
);
check(
  "sémantique de dialogue",
  opened.role === "dialog" && opened.modal === "true",
  `role=${opened.role} aria-modal=${opened.modal}`,
);
check("liens en grand dans le panneau", parseFloat(opened.fontSize) >= 32, opened.fontSize);
await shot("m2-panel-open");

/* Échap ferme et rend le focus au burger */
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await sleep(700);

const closed = await evaluate(`(() => {
  const panel = document.getElementById("nav-panel");
  return {
    vis: getComputedStyle(panel).visibility,
    expanded: document.querySelector('header button[aria-controls="nav-panel"]').getAttribute("aria-expanded"),
    bodyOverflow: document.body.style.overflow,
    focusIsBurger: document.activeElement === document.querySelector('header button[aria-controls="nav-panel"]'),
  };
})()`);
check(
  "Échap ferme le panneau et libère le scroll",
  closed.vis === "hidden" && closed.expanded === "false" && closed.bodyOverflow !== "hidden",
  `visibility=${closed.vis} expanded=${closed.expanded} overflow="${closed.bodyOverflow}"`,
);
check("focus rendu au burger", closed.focusIsBurger === true, `${closed.focusIsBurger}`);

/* footer */
await evaluate(`window.scrollTo({top: document.body.scrollHeight, behavior: "instant"})`);
await sleep(600);
const footer = await evaluate(`(() => {
  const f = document.querySelector("footer");
  return {
    bg: getComputedStyle(f).backgroundColor,
    columns: [...f.querySelectorAll("nav h2")].map(h => h.textContent),
    socials: [...f.querySelectorAll("ul a svg")].length,
    copy: [...f.querySelectorAll("p")].at(-1)?.textContent,
    tagline: f.querySelector("p")?.textContent,
    ctaInMobileNav: [...document.querySelectorAll("header a")]
      .filter(a => a.offsetParent !== null && /wa\\.me/.test(a.href)).length,
  };
})()`);
check("footer sur noir de marque", footer.bg === "rgb(0, 0, 0)", footer.bg);
check(
  "3 colonnes : Navigation / Contact / Communauté",
  footer.columns.join("/") === "Navigation/Contact/Communauté",
  footer.columns.join(" · "),
);
check("3 logos réseaux monochromes", footer.socials === 3, `${footer.socials} svg`);
check("baseline présente", footer.tagline === "Acheter mieux. Vivre l'expérience.", footer.tagline);
check("copyright présent", footer.copy === "© 2026 Comlan Community", footer.copy);
check(
  "CTA WhatsApp absent de la nav mobile",
  footer.ctaInMobileNav === 0,
  `${footer.ctaInMobileNav} CTA visible(s) dans le header`,
);
await shot("m3-footer");

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
