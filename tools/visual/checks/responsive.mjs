/**
 * Passe responsive / mobile-first — 320 · 360 · 390 · 414 px, puis desktop.
 *
 * Le mobile a déjà mordu deux fois sur ce projet (la bande d'annonce illisible
 * sous 400 px, le premier lien du panneau sous l'en-tête). Ce script cherche
 * ce que les captures ne montrent pas de façon fiable : des textes qui se
 * dessinent l'un sur l'autre, des textes qui sortent de leur boîte, des cibles
 * tactiles sous 44 px.
 *
 * La mesure vit dans lib/probe.mjs — lire l'avertissement de méthode qui s'y
 * trouve avant de toucher aux seuils.
 *
 * Les largeurs sont associées à des hauteurs RÉELLES d'appareils plutôt qu'à
 * un 900 px commode : la hauteur décide de ce qui passe sous la ligne de
 * flottaison, et c'est justement une des questions ouvertes.
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { connect, createReport } from "../lib/cdp.mjs";
import { LAYOUT_PROBE } from "../lib/probe.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({
  port: Number(process.env.CDP_PORT ?? 9222),
  out: process.env.OUT ?? ".",
});
const { check, finish } = createReport();
const { evaluate, sleep, screenshot: shot } = cdp;

const VIEWPORTS = [
  { w: 320, h: 568, nom: "320 (iPhone SE 1)", mobile: true },
  { w: 360, h: 640, nom: "360 (Android courant)", mobile: true },
  { w: 390, h: 844, nom: "390 (iPhone 14)", mobile: true },
  { w: 414, h: 896, nom: "414 (iPhone 11 Pro Max)", mobile: true },
  /* Paysage : l'orientation la plus vite oubliée, et celle où la hauteur
     utile fond de moitié. La nav reste en mode burger jusqu'à 1024 px, donc
     un panneau de 642 px doit tenir dans 390 px d'écran — c'est exactement le
     cas que le défilement du panneau rend viable. */
  { w: 844, h: 390, nom: "844×390 (téléphone en paysage)", mobile: true },
  { w: 1440, h: 900, nom: "1440 (desktop)", mobile: false },
];

/** Mesures ciblées : les points ouverts à trancher, chiffres en main. */
const MEASURE = String.raw`(() => {
  const rect = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) };
  };

  /* Troncature de la bande : géométrie du Range contre la boîte de rognage. */
  const bande = (() => {
    const bar = document.querySelector('aside[aria-label] a[target="_blank"]');
    if (!bar) return null;
    const spans = [...bar.querySelectorAll("span")].filter((s) => {
      const st = getComputedStyle(s);
      return st.display !== "none" && st.textOverflow === "ellipsis";
    });
    return spans.map((s) => {
      const range = document.createRange();
      range.selectNodeContents(s);
      const texte = Math.ceil(range.getBoundingClientRect().width);
      const boite = Math.floor(s.getBoundingClientRect().width);
      return { texte: (s.textContent || "").trim(), largeurTexte: texte, largeurBoite: boite, tronque: texte > boite + 1 };
    });
  })();

  /* Chips du programme : combien par ligne, et la dernière ligne est-elle
     orpheline ? On regroupe par ordonnée du haut. */
  const chips = (() => {
    const items = [...document.querySelectorAll("#evenements li li")];
    if (!items.length) return null;
    const lignes = new Map();
    for (const li of items) {
      const y = Math.round(li.getBoundingClientRect().top);
      lignes.set(y, (lignes.get(y) ?? 0) + 1);
    }
    return { total: items.length, parLigne: [...lignes.values()] };
  })();

  return {
    alertH: getComputedStyle(document.documentElement).getPropertyValue("--alert-h").trim(),
    bandeH: rect("aside[aria-label] a"),
    bande,
    chips,
    heroEvent: rect(".glow-breathe"),
    heroSection: rect("section[aria-labelledby=hero-title]"),
    legende: rect("section[aria-labelledby=hero-title] > p"),
    viewportH: window.innerHeight,
  };
})()`;

/** Amène toutes les révélations à leur état final : sans ça la sonde écarte
    tout ce qui est encore à opacité 0 et ne mesure qu'un tiers de la page. */
async function derouler() {
  const hauteur = await evaluate(`document.body.scrollHeight`);
  const pas = await evaluate(`window.innerHeight * 0.8`);
  for (let y = 0; y < hauteur; y += pas) {
    await evaluate(`window.scrollTo({top: ${y}, behavior: "instant"})`);
    await sleep(320);
  }
  await evaluate(`window.scrollTo({top: ${hauteur}, behavior: "instant"})`);
  /* Les cascades de révélation se posent BEAUCOUP plus lentement qu'en
     nominal sous SwiftShader — 3,5 s est la marge retenue par check:community
     après l'avoir vue tomber pile sur la ligne d'arrivée à 2,5 s. */
  await sleep(3500);
}

const ANCRES = [
  ["haut", `window.scrollTo({top: 0, behavior: "instant"})`],
  [
    "ev-haut",
    `document.getElementById("evenements").scrollIntoView({block:"start", behavior:"instant"})`,
  ],
  [
    "ev-bas",
    `(() => { const s = document.getElementById("evenements"); window.scrollTo({top: s.offsetTop + s.offsetHeight - innerHeight, behavior: "instant"}); })()`,
  ],
  [
    "faq",
    `document.getElementById("faq").scrollIntoView({block:"start", behavior:"instant"})`,
  ],
  [
    "contact",
    `document.getElementById("contact").scrollIntoView({block:"start", behavior:"instant"})`,
  ],
  ["pied", `window.scrollTo({top: document.body.scrollHeight, behavior: "instant"})`],
];

for (const vp of VIEWPORTS) {
  await cdp.viewport({ width: vp.w, height: vp.h, mobile: vp.mobile });
  await cdp.goto(BASE);
  await sleep(2500);
  await derouler();
  await evaluate(`window.scrollTo({top: 0, behavior: "instant"})`);
  await sleep(1200);

  const p = await evaluate(LAYOUT_PROBE);
  const m = await evaluate(MEASURE);

  check(
    `${vp.nom} — aucun débordement horizontal du document`,
    p.docOverflow <= 0,
    `${p.docOverflow}px · ${p.counted} textes mesurés`,
  );

  const chevauchements = p.overlaps;
  check(
    `${vp.nom} — aucun texte peint par-dessus un autre`,
    chevauchements.length === 0,
    chevauchements.length === 0
      ? "0 paire"
      : chevauchements
          .slice(0, 5)
          .map(
            (o) =>
              `[${o.a.where}] « ${o.a.text} » × « ${o.b.text} » (${o.w}×${o.h}px)`,
          )
          .join(" · "),
  );

  check(
    `${vp.nom} — aucun texte hors du viewport`,
    p.outside.length === 0,
    p.outside.length === 0
      ? "0"
      : p.outside
          .slice(0, 5)
          .map((o) => `[${o.where}] « ${o.text} » +${o.over}px`)
          .join(" · "),
  );

  /* Aucune troncature, nulle part, 320 px compris. Le `truncate` de la bande
     d'annonce reste en place comme filet, mais il ne doit plus jamais se
     déclencher : sous 360 px c'est le titre entier qui s'efface, précisément
     pour ne pas afficher « 3E ÉDIT… ». Si cette ligne repasse au rouge, c'est
     qu'une police a changé de métrique ou qu'un libellé s'est allongé. */
  const tronques = p.clipped;
  const attendu = 0;
  check(
    `${vp.nom} — aucun texte tronqué`,
    tronques.length <= attendu,
    tronques.length === 0
      ? "0"
      : tronques
          .map((t) => `[${t.where}] « ${t.text} » coupé de ${t.over}px`)
          .join(" · "),
  );

  /* Le plancher dépend du pointeur, pas de la largeur : 44 px au doigt (§12),
     24 px à la souris (WCAG 2.5.8 AA). Un lien de nav desktop de 36 px de haut
     n'est pas un défaut — le signaler noierait les vrais. */
  const plancher = vp.mobile ? 44 : 24;
  const petites = p.small.filter(
    (t) => !t.exempt && Math.min(t.w, t.h) < plancher,
  );
  check(
    `${vp.nom} — cibles ≥ ${plancher}px (${vp.mobile ? "doigt, §12" : "souris, WCAG 2.5.8"})`,
    petites.length === 0,
    petites.length === 0
      ? `${p.small.filter((t) => t.exempt).length} lien(s) en ligne exempté(s) · ` +
        `${p.small.filter((t) => !t.exempt).length} sous 44px, tous ≥ ${plancher}px`
      : petites
          .map((t) => `[${t.where}] ${t.tag} « ${t.text} » ${t.w}×${t.h}`)
          .join(" · "),
  );

  console.log(
    `       │   ${vp.nom} — bande ${m.alertH} h=${m.bandeH?.h ?? "—"} · ` +
      `chips ${m.chips ? m.chips.parLigne.join("+") : "—"} · ` +
      `bloc J− ${m.heroEvent ? `bas ${m.heroEvent.bottom}/${m.viewportH}` : "absent"} · ` +
      `bande tronquée ${m.bande ? m.bande.map((b) => `${b.largeurTexte}/${b.largeurBoite}`).join(",") : "—"}`,
  );

  for (const [nom, script] of ANCRES) {
    await evaluate(script);
    await sleep(700);
    await shot(`r-${vp.w}-${nom}`);
  }

  /* Panneau de nav : seulement là où le burger existe. */
  if (vp.mobile) {
    await evaluate(`window.scrollTo({top: 0, behavior: "instant"})`);
    await sleep(400);
    await evaluate(
      `document.querySelector('header button[aria-controls="nav-panel"]').click()`,
    );
    await sleep(1400);

    const pp = await evaluate(LAYOUT_PROBE);
    const geo = await evaluate(`(() => {
      const panel = document.getElementById("nav-panel");
      const premier = panel.querySelector("a");
      const header = document.querySelector("header");
      const bas = document.querySelector("#nav-panel > div:last-child");
      return {
        premierTop: Math.round(premier.getBoundingClientRect().top),
        enteteBas: Math.round(header.getBoundingClientRect().bottom),
        basPanneau: Math.round(bas.getBoundingClientRect().bottom),
        viewportH: window.innerHeight,
        contenu: panel.scrollHeight,
        visible: panel.clientHeight,
        defilable: /(auto|scroll)/.test(getComputedStyle(panel).overflowY),
        debordeListe: Math.round(
          panel.querySelector("ul").getBoundingClientRect().bottom -
            bas.getBoundingClientRect().top,
        ),
      };
    })()`);

    /* Le CTA du panneau doit être ATTEIGNABLE, ce qui n'est pas la même chose
       que « tenir dans l'écran » : sur un 320×568 six liens en 36 px ne
       tiendront jamais. Ce qui était cassé, c'est qu'il n'y avait aucun moyen
       d'y arriver — le scroll du body est verrouillé à l'ouverture et le
       panneau ne défilait pas : le bouton WhatsApp était hors d'atteinte.
       On ne se contente donc pas de lire `overflow-y` : on défile pour de
       vrai jusqu'au bout et on vérifie que le bouton est dans l'écran. Une
       sonde qui ne peut pas échouer ne vérifie rien. */
    const atteignable = await evaluate(`(() => {
      const panel = document.getElementById("nav-panel");
      panel.scrollTop = panel.scrollHeight;
      const cta = [...panel.querySelectorAll("a")].pop();
      const r = cta.getBoundingClientRect();
      return {
        texte: (cta.textContent || "").trim(),
        haut: Math.round(r.top),
        bas: Math.round(r.bottom),
        dedans: r.top >= 0 && r.bottom <= window.innerHeight + 1,
        defile: Math.round(panel.scrollTop),
      };
    })()`);

    check(
      `${vp.nom} — panneau : 1er lien sous l'en-tête`,
      geo.premierTop >= geo.enteteBas,
      `1er lien à ${geo.premierTop}px · bas de l'en-tête à ${geo.enteteBas}px`,
    );
    check(
      `${vp.nom} — panneau : liens et bas de panneau ne se recouvrent pas`,
      geo.debordeListe <= 0,
      `chevauchement ${geo.debordeListe}px`,
    );
    check(
      `${vp.nom} — panneau : le CTA est atteignable`,
      atteignable.dedans && (geo.defilable || geo.contenu <= geo.visible),
      `« ${atteignable.texte} » à ${atteignable.haut}–${atteignable.bas}px ` +
        `après ${atteignable.defile}px de défilement · ` +
        `contenu ${geo.contenu}px pour ${geo.visible}px visibles`,
    );
    check(
      `${vp.nom} — panneau : défilable dès que le contenu dépasse`,
      geo.contenu <= geo.visible || geo.defilable,
      geo.contenu <= geo.visible
        ? `tient sans défiler (${geo.contenu}/${geo.visible}px)`
        : `overflow-y défilable, ${geo.contenu - geo.visible}px à défiler`,
    );
    check(
      `${vp.nom} — panneau : aucun chevauchement de texte`,
      pp.overlaps.length === 0,
      pp.overlaps.length === 0
        ? "0 paire"
        : pp.overlaps
            .slice(0, 5)
            .map((o) => `« ${o.a.text} » × « ${o.b.text} » (${o.w}×${o.h}px)`)
            .join(" · "),
    );

    await shot(`r-${vp.w}-panneau`);
    await evaluate(
      `document.querySelector('header button[aria-controls="nav-panel"]').click()`,
    );
    await sleep(600);
  }
}

const failed = finish();
cdp.close();
process.exit(failed ? 1 : 0);
