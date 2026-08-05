import { Section } from "@/components/layout/Section";

/**
 * PHASE 0 — page de vérification des fondations.
 * Remplacée par les vraies sections aux phases 3 à 6.
 */

const COLORS = [
  ["rouge", "bg-rouge"],
  ["rouge-fonce", "bg-rouge-fonce"],
  ["orange", "bg-orange"],
  ["noir", "bg-noir"],
  ["encre", "bg-encre"],
  ["surface", "bg-surface"],
  ["surface-2", "bg-surface-2"],
  ["ligne", "bg-ligne"],
  ["ligne-faible", "bg-ligne-faible"],
  ["craie", "bg-craie"],
  ["craie-2", "bg-craie-2"],
  ["gris", "bg-gris"],
  ["gris-faible", "bg-gris-faible"],
] as const;

const FONTS = [
  {
    token: "font-display",
    name: "Instrument Serif",
    role: "Hero, grands titres éditoriaux",
    className: "font-display text-4xl",
  },
  {
    token: "font-impact",
    name: "Gloock",
    role: "Titres de section à fort impact",
    className: "font-impact text-4xl",
  },
  {
    token: "font-accent",
    name: "Young Serif",
    role: "Accents rares : chiffres, « + »",
    className: "font-accent text-4xl",
  },
  {
    token: "font-sans",
    name: "Inter",
    role: "Texte courant, UI, boutons",
    className: "font-sans text-3xl",
  },
  {
    token: "font-mono",
    name: "JetBrains Mono",
    role: "Specs, eyebrows, motif terminal",
    className: "font-mono text-2xl",
  },
] as const;

const RADII = [
  ["rounded-sm · 8", "rounded-sm"],
  ["rounded-md · 14", "rounded-md"],
  ["rounded-lg · 22", "rounded-lg"],
  ["rounded-pill · 999", "rounded-pill"],
] as const;

export default function Home() {
  return (
    <main className="flex-1">
      <Section className="border-b border-ligne-faible">
        <p className="font-mono text-xs tracking-[0.16em] text-gris uppercase">
          <span className="text-rouge">{"//"}</span> phase 0 — fondations
        </p>

        <h1 className="mt-6 font-display text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.98] tracking-[-0.01em]">
          Le PC qu&apos;il te faut.
          <br />
          <em className="text-accent-grad">Deux pour le prix d&apos;un.</em>
        </h1>

        <p className="mt-8 max-w-[54ch] text-[1.15rem] text-craie-2">
          Socle technique en place : tokens, polices, rythme vertical, grain. Les
          primitives arrivent en phase 1.
        </p>
      </Section>

      <Section className="border-b border-ligne-faible">
        <h2 className="font-impact text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">
          Les cinq voix typographiques.
        </h2>

        <dl className="mt-12 grid gap-8 sm:grid-cols-2">
          {FONTS.map((font) => (
            <div
              key={font.token}
              className="rounded-lg border border-ligne bg-surface p-8"
            >
              <dt className={`${font.className} text-craie`}>
                Deux pour le prix d&apos;un — 250k
              </dt>
              <dd className="mt-4 font-mono text-xs tracking-[0.16em] text-gris uppercase">
                {font.token} · {font.name}
              </dd>
              <dd className="mt-1 text-sm text-craie-2">{font.role}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section>
        <h2 className="font-impact text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]">
          Tokens.
        </h2>

        <h3 className="mt-12 font-mono text-xs tracking-[0.16em] text-gris uppercase">
          Couleurs
        </h3>
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {COLORS.map(([name, bg]) => (
            <li key={name}>
              <div
                className={`${bg} h-16 w-full rounded-sm border border-ligne`}
              />
              <span className="mt-2 block font-mono text-[0.7rem] text-gris">
                {name}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-16 font-mono text-xs tracking-[0.16em] text-gris uppercase">
          Rayons · ombres · dégradé
        </h3>
        <ul className="mt-6 flex flex-wrap items-end gap-6">
          {RADII.map(([label, radius]) => (
            <li key={radius} className="text-center">
              <div
                className={`${radius} h-20 w-28 border border-ligne bg-surface-2`}
              />
              <span className="mt-2 block font-mono text-[0.7rem] text-gris">
                {label}
              </span>
            </li>
          ))}
          <li className="text-center">
            <div className="h-20 w-28 rounded-lg bg-surface shadow-ombre" />
            <span className="mt-2 block font-mono text-[0.7rem] text-gris">
              shadow-ombre
            </span>
          </li>
          <li className="text-center">
            <div className="h-20 w-28 rounded-md bg-accent-grad shadow-glow" />
            <span className="mt-2 block font-mono text-[0.7rem] text-gris">
              bg-accent-grad + glow
            </span>
          </li>
        </ul>

        <h3 className="mt-16 font-mono text-xs tracking-[0.16em] text-gris uppercase">
          Rythme &amp; grille
        </h3>
        <p className="mt-6 font-mono text-sm text-craie-2">
          <span className="text-gris">&gt;</span> section-y ={" "}
          <span className="text-craie">clamp(80px, 12vw, 160px)</span> · gutter ={" "}
          <span className="text-craie">20 / 40</span> · max-w-page ={" "}
          <span className="text-craie">1200</span>
        </p>
      </Section>
    </main>
  );
}
