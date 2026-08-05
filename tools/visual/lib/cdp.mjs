/**
 * Client CDP minimal — pilote Chrome via le WebSocket natif de Node 22.
 * Aucune dépendance : ni puppeteer, ni playwright.
 */
import { writeFileSync } from "node:fs";

export async function connect({ port = 9222, out = "." } = {}) {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("Aucune cible de type 'page' dans Chrome.");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("Connexion CDP impossible."));
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (!data.id || !pending.has(data.id)) return;
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(new Error(JSON.stringify(data.error)));
    else resolve(data.result);
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, { resolve, reject });
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  // Sans ça, Chrome ressert la page depuis son cache disque et on valide un
  // build périmé.
  await send("Network.setCacheDisabled", { cacheDisabled: true });

  return {
    send,
    close: () => ws.close(),

    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),

    /** Évalue une expression dans la page et renvoie sa valeur. */
    async evaluate(expression) {
      const result = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) {
        throw new Error(`${result.exceptionDetails.text} :: ${expression}`);
      }
      return result.result.value;
    },

    async viewport({ width, height, scale = 1, mobile = false }) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: scale,
        mobile,
      });
    },

    async emulateReducedMotion(on) {
      await send("Emulation.setEmulatedMedia", {
        features: on
          ? [{ name: "prefers-reduced-motion", value: "reduce" }]
          : [],
      });
    },

    async goto(url) {
      await send("Page.navigate", { url });
    },

    async screenshot(name) {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(`${out}/${name}.png`, Buffer.from(data, "base64"));
    },
  };
}

/** Collecteur de résultats avec sortie lisible et code de sortie non nul. */
export function createReport() {
  const results = [];
  return {
    check: (label, pass, detail = "") => results.push({ label, pass, detail }),
    finish() {
      let failed = 0;
      console.log();
      for (const r of results) {
        if (!r.pass) failed++;
        console.log(`${r.pass ? "  OK  " : " ÉCHEC"} │ ${r.label}`);
        if (r.detail) console.log(`       │   ${r.detail}`);
      }
      console.log(
        `\n${results.length - failed}/${results.length} vérifications passées`,
      );
      return failed;
    },
  };
}
