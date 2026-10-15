/**
 * Captures de contrôle des deux nouvelles sections, à l'œil.
 *
 * Script d'inspection, pas de vérification : il ne juge rien, il photographie.
 * Les assertions vivent dans checks/boutiques.mjs et checks/evenements.mjs.
 */
import { connect } from "../lib/cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3111";
const cdp = await connect({
  port: Number(process.env.CDP_PORT ?? 9222),
  out: process.env.OUT ?? ".",
});

const VUES = [
  { nom: "nv-1440-boutiques", width: 1440, height: 1000, ancre: "#boutiques" },
  { nom: "nv-1440-evenements", width: 1440, height: 1000, ancre: "#evenements" },
  { nom: "nv-1280-boutiques", width: 1280, height: 900, ancre: "#boutiques" },
  { nom: "nv-1024-evenements", width: 1024, height: 900, ancre: "#evenements" },
  { nom: "nv-390-boutiques", width: 390, height: 844, ancre: "#boutiques" },
  { nom: "nv-390-evenements", width: 390, height: 844, ancre: "#evenements" },
  { nom: "nv-320-boutiques", width: 320, height: 568, ancre: "#boutiques" },
  { nom: "nv-320-evenements", width: 320, height: 568, ancre: "#evenements" },
  { nom: "nv-1440-passees", width: 1440, height: 1000, ancre: "#evenements", bas: true },
  { nom: "nv-390-passees", width: 390, height: 844, ancre: "#evenements", bas: true },
  { nom: "nv-1440-bande", width: 1440, height: 1000, ancre: "#boutiques", bas: true },
];

for (const vue of VUES) {
  await cdp.viewport({ width: vue.width, height: vue.height });
  await cdp.goto(`${BASE}/${vue.ancre}`);
  await cdp.sleep(1800);
  /* Les révélations au scroll ne se déclenchent qu'une fois l'élément vu :
     sans ce petit va-et-vient, la capture fige des blocs encore invisibles. */
  await cdp.evaluate(
    `document.querySelector("${vue.ancre}")?.scrollIntoView({ block: "${vue.bas ? "end" : "start"}" })`,
  );
  await cdp.sleep(1200);
  await cdp.screenshot(vue.nom);
  console.log(`  ${vue.nom}`);
}

cdp.close();
process.exit(0);
