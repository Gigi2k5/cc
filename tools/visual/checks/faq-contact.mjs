/**
 * FAQ (accordéon accessible) et Contact (phase 6).
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
  faqTitle: "Les questions qu'on nous pose.",
  faq: [
    ["Quels PC proposez-vous ?", "Des configurations adaptées (étudiant, pro, gaming), neuves ou reconditionnées, testées et prêtes à l'emploi."],
    ["C'est quoi « 2 pour 1 » ?", "Tu paies un pack au prix standard et tu reçois un avantage additionnel (accessoire, service ou bonus) sans surcoût."],
    ["Comment se passe la livraison ?", "Livraison ou retrait local, avec installation et mini-formation si besoin."],
    ["Quels moyens de paiement ?", "Cash, acompte + solde à la livraison, paiement par tranche selon les cas ; précommande en période de forte demande."],
    ["Et le SAV ?", "Support WhatsApp, diagnostic, conseils, et relais partenaires si nécessaire."],
    ["C'est quoi Loup-Garou ?", "Un jeu communautaire de stratégie sur WhatsApp, avec des parties régulières et des éditions événementielles."],
  ],
  contactTitle: "On en parle sur WhatsApp ?",
  meta: ["horaires : Lundi–Dimanche · 8h–22h", "livraison : 3–5 jours ouvrés"],
  wa1: { href: "https://wa.me/2290169787127", display: "+229 01 69 78 71 27" },
  wa2: { href: "https://wa.me/2290159100290", display: "+229 01 59 10 02 90" },
  group: "https://chat.whatsapp.com/EZwmZf6LCzQ5UYRhkg06OW",
  socials: ["Facebook", "Instagram", "Medium"],
};

const TRIGGERS = `[...document.querySelectorAll('#faq button[aria-controls]')]`;

/**
 * Émet une touche. `text` est indispensable pour Entrée et Espace : avec
 * `rawKeyDown` seul, Chrome ne synthétise pas le clic sur un <button>.
 * (Entrée déclenche le clic au keydown, Espace au keyup.)
 */
const key = async (name, code, vk, text) => {
  await send("Input.dispatchKeyEvent", {
    type: text ? "keyDown" : "rawKeyDown",
    key: name,
    code,
    text,
    unmodifiedText: text,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: name,
    code,
    windowsVirtualKeyCode: vk,
    nativeVirtualKeyCode: vk,
  });
};

await cdp.viewport({ width: 1440, height: 1000 });
await cdp.goto(BASE);
await sleep(2500);
await evaluate(`document.getElementById("faq").scrollIntoView({block:"start", behavior:"instant"}); scrollBy(0,-90);`);
await sleep(1200);

/* --------------------------------------------------------------- CONTENU */
const faq = await evaluate(`(() => {
  const section = document.getElementById("faq");
  const triggers = ${TRIGGERS};
  return {
    title: document.getElementById("faq-title")?.textContent.trim(),
    items: triggers.map(t => [
      t.textContent.replace(/[+−]\\s*$/, "").replace(/\\s+/g, " ").trim(),
      document.getElementById(t.getAttribute("aria-controls"))?.textContent.replace(/\\s+/g, " ").trim(),
    ]),
    headings: [...section.querySelectorAll("h3 > button")].length,
    regions: triggers.every(t => {
      const p = document.getElementById(t.getAttribute("aria-controls"));
      return p?.getAttribute("role") === "region" && p.getAttribute("aria-labelledby") === t.id;
    }),
  };
})()`);

check("FAQ : titre exact", faq.title === EXPECTED.faqTitle, faq.title);
check(
  "FAQ : 6 questions et réponses exactes",
  JSON.stringify(faq.items) === JSON.stringify(EXPECTED.faq),
  faq.items.map((i) => i[0]).join(" · "),
);
check("chaque en-tête est un bouton dans un h3", faq.headings === 6, `${faq.headings} boutons`);
check("chaque panneau est une region reliée à son en-tête", faq.regions, "role=region + aria-labelledby");

/* ------------------------------------------------------------ ÉTAT INITIAL */
const state = async () =>
  evaluate(`(() => {
    const triggers = ${TRIGGERS};
    return triggers.map(t => {
      const p = document.getElementById(t.getAttribute("aria-controls"));
      return {
        expanded: t.getAttribute("aria-expanded"),
        rows: getComputedStyle(p).gridTemplateRows,
        inert: p.hasAttribute("inert"),
        duration: getComputedStyle(p).transitionDuration,
      };
    });
  })()`);

const initial = await state();
check(
  "un seul item ouvert au chargement",
  initial.filter((i) => i.expanded === "true").length === 1 && initial[0].expanded === "true",
  initial.map((i) => i.expanded).join(" "),
);
check(
  "panneaux repliés : inert et repliés à 0fr",
  initial.slice(1).every((i) => i.inert && i.rows === "0px") && !initial[0].inert,
  `ouvert rows=${initial[0].rows} inert=${initial[0].inert} · fermé rows=${initial[1].rows} inert=${initial[1].inert}`,
);
check(
  "ouverture douce ~300 ms",
  initial[0].duration === "0.3s",
  `transition-duration=${initial[0].duration}`,
);

/* --------------------------------------------------------- CLIC : EXCLUSIF */
const clickTrigger = async (index) => {
  const box = await evaluate(`(() => {
    const t = ${TRIGGERS}[${index}];
    t.scrollIntoView({ block: "center", behavior: "instant" });
    const r = t.getBoundingClientRect();
    return { x: Math.round(r.x + 40), y: Math.round(r.y + r.height / 2) };
  })()`);
  await sleep(300);
  for (const type of ["mousePressed", "mouseReleased"]) {
    await send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
  }
  await sleep(1200);
};

await clickTrigger(2);
const afterClick = await state();
check(
  "un seul item ouvert à la fois",
  afterClick.filter((i) => i.expanded === "true").length === 1 && afterClick[2].expanded === "true",
  afterClick.map((i) => i.expanded).join(" "),
);
check(
  "le panneau ouvert se déplie, les autres redeviennent inert",
  afterClick[2].rows !== "0px" && !afterClick[2].inert && afterClick[0].inert,
  `ouvert rows=${afterClick[2].rows} · ancien inert=${afterClick[0].inert}`,
);

await clickTrigger(2);
const afterToggle = await state();
check(
  "re-cliquer referme l'item",
  afterToggle.every((i) => i.expanded === "false"),
  afterToggle.map((i) => i.expanded).join(" "),
);

/* ------------------------------------------------------------- CLAVIER */
await evaluate(`${TRIGGERS}[0].focus()`);
await sleep(200);
await key("Enter", "Enter", 13, "\r");
await sleep(1200);
const afterEnter = await state();
check("Entrée ouvre l'item focalisé", afterEnter[0].expanded === "true", afterEnter.map((i) => i.expanded).join(" "));

await key(" ", "Space", 32, " ");
await sleep(1200);
const afterSpace = await state();
check("Espace referme l'item focalisé", afterSpace[0].expanded === "false", afterSpace.map((i) => i.expanded).join(" "));

await key("ArrowDown", "ArrowDown", 40);
await sleep(300);
const afterDown = await evaluate(`(() => {
  const triggers = ${TRIGGERS};
  return { index: triggers.indexOf(document.activeElement), focusVisible: document.activeElement?.matches(":focus-visible") };
})()`);
check("Flèche bas déplace le focus vers l'en-tête suivant", afterDown.index === 1, `index=${afterDown.index}`);

await key("End", "End", 35);
await sleep(300);
const afterEnd = await evaluate(`${TRIGGERS}.indexOf(document.activeElement)`);
check("Fin va au dernier en-tête", afterEnd === 5, `index=${afterEnd}`);

const focusRing = await evaluate(`(() => {
  const el = document.activeElement;
  const s = getComputedStyle(el);
  return { width: s.outlineWidth, color: s.outlineColor, style: s.outlineStyle };
})()`);
check(
  "anneau de focus visible sur l'en-tête",
  focusRing.style !== "none" && parseFloat(focusRing.width) >= 2,
  `${focusRing.style} ${focusRing.width} ${focusRing.color}`,
);
await shot("f1-faq-desktop");

/* ------------------------------------------------------------- CONTACT */
await evaluate(`document.getElementById("contact").scrollIntoView({block:"start", behavior:"instant"}); scrollBy(0,-90);`);
await sleep(1500);

const contact = await evaluate(`(() => {
  const s = document.getElementById("contact");
  const links = [...s.querySelectorAll("a")];
  const wa = links.filter(a => /wa\\.me/.test(a.href));
  const group = links.find(a => /chat\\.whatsapp/.test(a.href));
  return {
    title: document.getElementById("contact-title")?.textContent.replace(/\\s+/g," ").trim(),
    gradient: !!s.querySelector(".text-accent-grad"),
    meta: [...s.querySelectorAll("p span")].map(n => n.textContent.trim()).filter(t => t.startsWith("horaires") || t.startsWith("livraison")),
    numbers: wa.map(a => ({ href: a.href, text: a.textContent.replace(/\\s+/g," ").trim(), target: a.target, rel: a.rel })),
    group: group ? { href: group.href, text: group.textContent.replace(/\\s+/g," ").trim(), target: group.target, rel: group.rel } : null,
    socials: [...s.querySelectorAll("ul li a")].map(a => a.textContent.trim()),
    socialIcons: s.querySelectorAll("ul li a svg").length,
  };
})()`);

check("Contact : titre exact", contact.title === EXPECTED.contactTitle, contact.title);
check("« WhatsApp » en dégradé accent", contact.gradient, "text-accent-grad présent");
check("horaires et délai de livraison", JSON.stringify(contact.meta) === JSON.stringify(EXPECTED.meta), contact.meta.join(" · "));
check(
  "2 cartes WhatsApp : numéros et liens exacts",
  contact.numbers.length === 2 &&
    contact.numbers[0].href === EXPECTED.wa1.href &&
    contact.numbers[0].text.includes(EXPECTED.wa1.display) &&
    contact.numbers[1].href === EXPECTED.wa2.href &&
    contact.numbers[1].text.includes(EXPECTED.wa2.display),
  contact.numbers.map((n) => `${n.text.slice(0, 30)} → ${n.href}`).join(" | "),
);
check(
  "cartes WhatsApp en nouvel onglet avec rel sûr",
  contact.numbers.every((n) => n.target === "_blank" && /noopener/.test(n.rel)),
  contact.numbers.map((n) => `${n.target}/${n.rel}`).join(" "),
);
check(
  "bouton du groupe vers le vrai lien",
  contact.group?.href === EXPECTED.group && /Rejoindre le groupe/.test(contact.group.text),
  `${contact.group?.text} → ${contact.group?.href}`,
);
check("3 réseaux avec logo", JSON.stringify(contact.socials) === JSON.stringify(EXPECTED.socials) && contact.socialIcons === 3, contact.socials.join(" · "));
await shot("f2-contact-desktop");

/* -------------------------------------------------- LIENS DE TOUTE LA PAGE */
const links = await evaluate(`(() => {
  const all = [...document.querySelectorAll("a[href]")];
  const external = all.filter(a => /^https?:/.test(a.getAttribute("href")));
  return {
    total: all.length,
    externalCount: external.length,
    unsafe: external.filter(a => a.target !== "_blank" || !/noopener/.test(a.rel)).map(a => a.href),
    hrefs: [...new Set(external.map(a => a.href))].sort(),
    placeholders: all.filter(a => a.getAttribute("href") === "#").length,
    deadAnchors: [...new Set(all
      .map(a => a.getAttribute("href"))
      .filter(h => h && h.startsWith("#") && h.length > 1)
      .filter(h => !document.querySelector(h)))],
  };
})()`);
check(
  "tous les liens externes : nouvel onglet + rel sûr",
  links.unsafe.length === 0,
  `${links.externalCount} externes · ${links.unsafe.length} à risque`,
);
/* Le site n'envoie ailleurs que vers WhatsApp et vers la billetterie de la
   section Événements. Toute autre destination est un accident : cette
   assertion est là pour le voir tout de suite. */
check(
  "aucune sortie du site hors WhatsApp et billetterie",
  links.hrefs.every((h) => /wa\.me|chat\.whatsapp|tike229\.ghinel\.com/.test(h)),
  links.hrefs.join(" "),
);
check(
  "toutes les ancres internes pointent vers une cible existante",
  links.deadAnchors.length === 0,
  links.deadAnchors.length ? links.deadAnchors.join(" ") : "aucune ancre morte",
);
check(
  "réseaux encore en placeholder (attendu)",
  links.placeholders === 6,
  `${links.placeholders} liens « # » (3 en contact + 3 en footer)`,
);

/* ------------------------------------------------------------- MOBILE */
await cdp.viewport({ width: 390, height: 844, scale: 2, mobile: true });
await cdp.goto(BASE);
await sleep(2500);
await evaluate(`document.getElementById("faq").scrollIntoView({block:"start", behavior:"instant"})`);
await sleep(1000);
const mobile = await evaluate(`(() => {
  const t = ${TRIGGERS}[0];
  const r = t.getBoundingClientRect();
  return {
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    triggerHeight: Math.round(r.height),
    groupButton: (() => {
      const b = document.querySelector("#contact a[href*='chat.whatsapp']").getBoundingClientRect();
      return Math.round(b.height);
    })(),
  };
})()`);
check("aucun débordement horizontal en mobile", mobile.overflow <= 0, `${mobile.overflow}px`);
check("cible tactile des en-têtes ≥ 44px", mobile.triggerHeight >= 44, `${mobile.triggerHeight}px`);
check("cible tactile du bouton groupe ≥ 44px", mobile.groupButton >= 44, `${mobile.groupButton}px`);
await evaluate(`document.getElementById("contact").scrollIntoView({block:"start", behavior:"instant"})`);
await sleep(1200);
await shot("f3-contact-mobile");

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
