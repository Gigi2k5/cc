/**
 * Sonde de mise en page, injectée dans la page.
 *
 * Elle répond à trois questions qu'une capture d'écran ne tranche pas :
 * un texte se dessine-t-il par-dessus un voisin, sort-il de sa boîte, et une
 * cible tactile fait-elle 44 px ?
 *
 * ⚠️ Méthode. `scrollWidth > clientWidth` ne vaut RIEN ici : ces deux
 * propriétés valent **0 sur un élément `inline`**, et une bonne moitié des
 * textes du site sont des `<span>` inline. Une sonde qui ne peut pas échouer
 * ne vérifie rien. On mesure donc le texte lui-même, avec un `Range` : ses
 * `getClientRects()` sont des quads de layout, jamais rognés par un
 * `overflow: hidden` ni raccourcis par un `text-overflow: ellipsis` — les deux
 * sont des opérations de peinture. C'est exactement ce qu'on veut :
 *
 * - la géométrie brute du Range dit si le texte DÉPASSE sa boîte (troncature
 *   ou débordement) ;
 * - la même géométrie **intersectée** avec les boîtes de rognage des ancêtres
 *   dit ce qui est réellement PEINT, et c'est là-dessus seulement qu'on peut
 *   parler de chevauchement.
 *
 * Sans cette distinction, chaque `truncate` de la bande d'annonce serait
 * signalé comme un chevauchement — le texte tronqué s'étend en layout jusque
 * sous ses voisins, alors qu'à l'écran il s'arrête sur l'ellipse.
 */
export const LAYOUT_PROBE = String.raw`(() => {
  /* --- Ce qu'on écarte, et pourquoi -------------------------------------
     Des superpositions VOULUES existent, et les confondre avec des défauts
     rendrait la sonde inutilisable :
     - .grain-overlay : grain global, posé sur toute la page par construction ;
     - canvas         : puce du hero et couche réseau, décor derrière le texte ;
     - .terminal-drift: filigrane terminal de Communauté, 3,5 % d'opacité ;
     - [inert]        : panneaux de FAQ repliés, encore dans le DOM. */
  const IGNORE = (el) =>
    el.closest(".grain-overlay, canvas, .terminal-drift, [inert]") !== null;

  const inter = (a, b) => {
    const left = Math.max(a.left, b.left);
    const right = Math.min(a.right, b.right);
    const top = Math.max(a.top, b.top);
    const bottom = Math.min(a.bottom, b.bottom);
    if (right - left <= 0 || bottom - top <= 0) return null;
    return { left, right, top, bottom, width: right - left, height: bottom - top };
  };

  /** Boîte de contenu (padding box) — le rognage d'un overflow s'y arrête. */
  const paddingBox = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      left: r.left + parseFloat(s.borderLeftWidth),
      right: r.right - parseFloat(s.borderRightWidth),
      top: r.top + parseFloat(s.borderTopWidth),
      bottom: r.bottom - parseFloat(s.borderBottomWidth),
    };
  };

  /** Intersection des boîtes de tous les ancêtres qui rognent, self compris. */
  const clipOf = (el) => {
    let box = { left: -1e6, right: 1e6, top: -1e6, bottom: 1e6 };
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      /* 'overflow' ne s'applique pas à un inline non remplacé : un <span>
         inline avec overflow:hidden ne rogne rien. Ne le compter que si
         l'élément est blockifié (bloc, ou item de flex/grid). */
      const blockish = s.display !== "inline";
      if (blockish && (s.overflowX !== "visible" || s.overflowY !== "visible")) {
        const next = inter(box, paddingBox(n));
        if (!next) return null;
        box = next;
      }
    }
    return box;
  };

  /** Opacité effective : écarte ce qui est décoratif ou pas encore révélé. */
  const opacityOf = (el) => {
    let o = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      o *= parseFloat(getComputedStyle(n).opacity);
      if (o < 0.02) return 0;
    }
    return o;
  };

  /** La couche de superposition : deux couches distinctes se recouvrent par
      construction (nav collante au-dessus du contenu, panneau plein écran). */
  const layerOf = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const p = getComputedStyle(n).position;
      if (p === "fixed" || p === "sticky") return n;
    }
    return null;
  };

  const label = (el) => {
    const t = (el.textContent || "").trim().replace(/\s+/g, " ");
    const tag = el.tagName.toLowerCase();
    const cls = (el.getAttribute("class") || "").split(/\s+/).slice(0, 3).join(".");
    const sect = el.closest("section[id], aside, header, footer, [role=dialog]");
    const where = sect ? (sect.id || sect.tagName.toLowerCase() + (sect.getAttribute("role") ? "[dialog]" : "")) : "?";
    return { where, tag: cls ? tag + "." + cls : tag, text: t.slice(0, 46) };
  };

  /* --- Récolte : un noeud par élément portant du texte en propre ---------- */
  const nodes = [];
  for (const el of document.querySelectorAll("body *")) {
    if (IGNORE(el)) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    if (opacityOf(el) < 0.2) continue;

    const own = [...el.childNodes].filter(
      (n) => n.nodeType === 3 && /\S/.test(n.nodeValue),
    );
    if (!own.length) continue;

    const rects = [];
    for (const textNode of own) {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      for (const r of range.getClientRects()) {
        if (r.width > 0.5 && r.height > 0.5) rects.push(r);
      }
    }
    if (!rects.length) continue;

    const clip = clipOf(el);
    /* Rognage total : rien n'est peint, l'élément ne peut chevaucher personne. */
    const painted = clip
      ? rects.map((r) => inter(r, clip)).filter(Boolean)
      : [];

    nodes.push({ el, rects, clip, painted, layer: layerOf(el) });
  }

  /* --- 1. Texte qui sort de sa boîte de rognage --------------------------- */
  const clipped = [];
  for (const n of nodes) {
    if (!n.clip) continue;
    let over = 0;
    for (const r of n.rects) {
      over = Math.max(over, r.right - n.clip.right, n.clip.left - r.left);
    }
    if (over > 1) clipped.push({ ...label(n.el), over: Math.round(over) });
  }

  /* --- 2. Texte qui sort du viewport -------------------------------------- */
  const W = document.documentElement.clientWidth;
  const outside = [];
  for (const n of nodes) {
    for (const r of n.painted) {
      const over = Math.max(r.right - W, -r.left);
      if (over > 1) {
        outside.push({ ...label(n.el), over: Math.round(over) });
        break;
      }
    }
  }

  /* --- 3. Chevauchements peints entre textes de la même couche ------------ */
  const overlaps = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      if (a.layer !== b.layer) continue;
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;

      let worst = null;
      for (const ra of a.painted) {
        for (const rb of b.painted) {
          const hit = inter(ra, rb);
          if (!hit || hit.width <= 2) continue;
          /* Le seuil qui compte est un RATIO, pas des pixels — première
             version de cette sonde, qui n'a signalé que des faux positifs.
             Un quad de texte est la boîte de ligne (ascendante + descendante),
             pas l'encre : elle est plus haute que l'avance de ligne dès que
             l'interlignage est serré, donc deux lignes SUCCESSIVES d'un même
             titre se recouvrent toujours un peu. Relevé sur cette page :
               titre hero      quad 58,0 px · avance 47,9 px → 10,1 px (17 %)
               titre Communauté quad 50,0 px · avance 40,3 px →  9,7 px (19 %)
             Une vraie collision côte à côte — « J−16 » posé sur « 3E ÉDITION »
             avant le correctif — partage en revanche toute la hauteur de
             ligne, donc ~100 %. Le seuil est à 55 % : trois fois la marge
             au-dessus du bleed observé, deux fois sous une vraie collision. */
          const ratio = hit.height / Math.min(ra.height, rb.height);
          if (ratio < 0.55) continue;
          if (!worst || hit.width * hit.height > worst.width * worst.height) worst = hit;
        }
      }
      if (worst) {
        overlaps.push({
          a: label(a.el),
          b: label(b.el),
          w: Math.round(worst.width),
          h: Math.round(worst.height),
        });
      }
    }
  }

  /* --- 4. Cibles tactiles (§12 : ≥ 44 px) --------------------------------- */
  const small = [];
  for (const el of document.querySelectorAll(
    "a[href], button, summary, input, select, textarea, [role=button]",
  )) {
    if (IGNORE(el)) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    /* WCAG 2.5.8 exempte un lien en ligne dans un bloc de texte : sa taille
       est dictée par la typographie de la phrase, pas par le design. */
    const inline = s.display.startsWith("inline") && el.closest("p, li, dd");
    /* On remonte la mesure, jamais le verdict : le plancher n'est pas le même
       au doigt (44 px, §12) et à la souris (24 px, WCAG 2.5.8 AA). C'est
       l'appelant qui connaît le pointeur simulé. */
    if (Math.min(r.width, r.height) < 44) {
      small.push({
        ...label(el),
        w: Math.round(r.width),
        h: Math.round(r.height),
        exempt: Boolean(inline),
      });
    }
  }

  return {
    docOverflow:
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    counted: nodes.length,
    clipped,
    outside,
    overlaps,
    small,
  };
})()`;
