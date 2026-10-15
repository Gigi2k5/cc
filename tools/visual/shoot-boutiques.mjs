/**
 * Captures des boutiques e-commerce, pour la section « Nos boutiques ».
 *
 * Pourquoi un script et pas des captures à la main : une capture manuelle
 * embarque la barre d'onglets, les extensions et les comptes ouverts de celui
 * qui la prend — donc des informations privées, publiées telles quelles sur le
 * site. Ici le navigateur part d'un profil vide, à une taille fixe, et le
 * résultat est reproductible : le jour où une boutique change de page
 * d'accueil, on relance ce script.
 *
 *   node tools/visual/shoot-boutiques.mjs
 *
 * Ce script lance son propre Chrome : il ne dépend pas de run.sh, qui démarre
 * un serveur Next dont on n'a pas besoin pour viser des sites externes.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { connect } from "./lib/cdp.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const OUT = join(ROOT, "public/boutiques");
const CDP_PORT = Number(process.env.CDP_PORT ?? 9333);

/**
 * Les deux boutiques réelles. `slug` nomme les fichiers produits ; il doit
 * rester aligné sur `BOUTIQUES` dans lib/content.ts.
 */
const BOUTIQUES = [
  {
    slug: "comlan-pc-solutions",
    url: "https://comlan-community-pc-solutions.biggigui.com/",
  },
  {
    slug: "2g-hub",
    url: "https://2ghub.tech/computers",
  },
];

/** Bureau en 16:10, téléphone au format le plus courant du parc béninois. */
const FORMATS = [
  { name: "desktop", width: 1440, height: 900, scale: 1, mobile: false },
  { name: "mobile", width: 390, height: 844, scale: 2, mobile: true },
];

function findChrome() {
  const candidates = [
    process.env.CHROME,
    `${process.env.HOME}/.local/opt/chrome-linux64/chrome`,
    "/home/charbel/.local/bin/google-chrome",
    "/opt/google/chrome/chrome",
    "/snap/bin/chromium",
  ].filter(Boolean);
  for (const path of candidates) if (existsSync(path)) return path;
  throw new Error("Aucun Chrome trouvé — passer CHROME=/chemin/vers/chrome.");
}

const chrome = spawn(
  findChrome(),
  [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${CDP_PORT}`,
    "--remote-allow-origins=*",
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "shoot-"))}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

process.on("exit", () => chrome.kill());

/* Attendre que le port réponde : Chrome met ~1 s à ouvrir son endpoint. */
for (let i = 0; i < 40; i++) {
  try {
    await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 250));
  }
}

const cdp = await connect({ port: CDP_PORT, out: OUT });
mkdirSync(OUT, { recursive: true });

/**
 * Une page de boutique charge ses visuels produit en différé. Capturer trop
 * tôt donne une grille de rectangles gris — le pire visuel possible pour
 * vendre une boutique. On attend donc que chaque <img> soit complète, pas
 * seulement l'événement `load` du document.
 */
async function waitForImages(timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await cdp.evaluate(`(() => {
      if (document.readyState !== "complete") return false;
      const imgs = [...document.images];
      if (imgs.length === 0) return true;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    })()`);
    if (ready) return true;
    await cdp.sleep(500);
  }
  return false;
}

let failures = 0;

for (const boutique of BOUTIQUES) {
  for (const format of FORMATS) {
    await cdp.viewport(format);
    await cdp.goto(boutique.url);
    await cdp.sleep(2500);
    await waitForImages();

    /* Le bandeau de Biggigui ne se charge qu'au premier défilement : capturé
       sans ça, l'en-tête de la boutique est un aplat gris. On descend, on
       laisse les chargements différés se déclencher, puis on remonte. */
    await cdp.evaluate(`window.scrollTo(0, 1600)`);
    await cdp.sleep(1500);
    await cdp.evaluate(`window.scrollTo(0, 0)`);
    await cdp.sleep(800);
    const loaded = await waitForImages();

    /* Beaucoup de vitrines animent leur bannière à l'arrivée : on laisse la
       première boucle se terminer, sinon la capture fige un entre-deux. */
    await cdp.sleep(1500);

    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "webp",
      quality: 88,
    });

    const file = join(OUT, `${boutique.slug}-${format.name}.webp`);
    writeFileSync(file, Buffer.from(data, "base64"));

    const size = Math.round(Buffer.from(data, "base64").length / 1024);
    if (!loaded) failures++;
    console.log(
      `  ${loaded ? "OK  " : "TARD"} │ ${boutique.slug} · ${format.name} · ` +
        `${format.width}×${format.height} · ${size} ko`,
    );
  }
}

cdp.close();
chrome.kill();

if (failures > 0) {
  console.log(
    `\n${failures} capture(s) prises avant la fin du chargement des images.`,
  );
}
console.log(`\nCaptures écrites dans ${OUT}`);
process.exit(0);
