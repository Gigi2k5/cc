/**
 * Captures de chaque section en desktop — pas de vérification, juste des images
 * pour juger la mise en page. Sortie dans tools/visual/out/.
 *
 * Lancé par tools/visual/run.sh — voir le README de ce dossier.
 */
import { connect } from "../lib/cdp.mjs";
const cdp = await connect({ port: Number(process.env.CDP_PORT ?? 9222), out: process.env.OUT ?? "." });
await cdp.viewport({ width: 1440, height: 1000 });
await cdp.goto(process.env.BASE);
await cdp.sleep(2500);
// déclenche toutes les révélations
await cdp.evaluate(`(async () => { const s = innerHeight*0.6;
  for (let y=0; y<document.body.scrollHeight; y+=s) { scrollTo({top:y,behavior:"instant"}); await new Promise(r=>setTimeout(r,200)); } })()`);
await cdp.sleep(1200);
for (const [name, sel] of [["s1-enbref-apropos","#a-propos"],["s2-cequonfait","#ce-quon-fait"],
                           ["s3-deuxpourun","#deux-pour-un-title"],["s4-comment","#comment-ca-marche-title"]]) {
  await cdp.evaluate(`document.querySelector(${JSON.stringify(sel)}).closest("section").scrollIntoView({block:"start",behavior:"instant"}); scrollBy(0,-90);`);
  await cdp.sleep(700);
  await cdp.screenshot(name);
}
cdp.close();
