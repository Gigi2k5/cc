import type { Metadata } from "next";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardSpecs, CardText, CardTitle } from "@/components/ui/Card";
import { Chip, SpecChip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { TerminalKeyword, TerminalLine } from "@/components/ui/TerminalLine";
import { contrastRatio, wcagLevel } from "@/lib/contrast";

/**
 * PHASE 1 — page de démo interne des primitives. Non liée depuis le site.
 * (Un dossier `_dev` serait privé au sens App Router, donc non routé :
 * la route est donc `/dev`, exclue de l'indexation.)
 */
export const metadata: Metadata = {
  title: "Design system — Comlan Community",
  robots: { index: false, follow: false },
};

const CONTRAST_PAIRS = [
  { label: "craie sur encre", fg: "#F5F3EF", bg: "#080808" },
  { label: "craie-2 sur encre", fg: "#B5B3AF", bg: "#080808" },
  { label: "gris sur encre", fg: "#8F8F8F", bg: "#080808" },
  { label: "gris sur surface", fg: "#8F8F8F", bg: "#101010" },
  { label: "gris sur surface-2", fg: "#8F8F8F", bg: "#161616" },
  { label: "rouge sur encre", fg: "#FA1500", bg: "#080808" },
  { label: "gris-faible sur encre", fg: "#4A4A4A", bg: "#080808" },
  { label: "blanc sur rouge", fg: "#FFFFFF", bg: "#FA1500" },
  { label: "blanc sur orange", fg: "#FFFFFF", bg: "#EA441A" },
] as const;

function Block({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-ligne-faible pt-10">
      <h2 className="font-mono text-xs tracking-[0.16em] text-craie uppercase">
        {title}
      </h2>
      {note ? <p className="mt-2 text-sm text-gris">{note}</p> : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 py-4">
      <span className="w-44 shrink-0 font-mono text-[0.7rem] text-gris-faible">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function DevPage() {
  return (
    <main className="flex-1">
      <Section>
        <Eyebrow>Design system — phase 1</Eyebrow>
        <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4rem)] leading-[1]">
          Les primitives, dans tous leurs{" "}
          <GradientText as="em">états</GradientText>.
        </h1>
        <p className="mt-6 max-w-[60ch] text-craie-2">
          Page interne, non liée et non indexée. Survole, tabule au clavier, et
          active « animations réduites » dans l&apos;OS pour vérifier les états.
        </p>

        <div className="mt-20 flex flex-col gap-16">
          <Block
            title="Button"
            note="Primaire : dégradé + halo directionnel, lift + scale au survol, rouge-fonce à l'appui. Ghost : bordure → rouge. Rend un <a> si href, un <button> sinon."
          >
            <Row label="primary · lg">
              <Button size="lg">Parler à un conseiller</Button>
              <Button size="lg" variant="ghost">
                Rejoindre la communauté
              </Button>
            </Row>
            <Row label="primary · md">
              <Button>Parler sur WhatsApp</Button>
              <Button variant="ghost">Voir la FAQ</Button>
            </Row>
            <Row label="lien externe">
              <Button href="https://wa.me/2290159100290">
                WhatsApp (nouvel onglet)
              </Button>
              <Button href="#contact" variant="ghost">
                Ancre interne
              </Button>
            </Row>
            <Row label="disabled">
              <Button disabled>Indisponible</Button>
              <Button variant="ghost" disabled>
                Indisponible
              </Button>
            </Row>
          </Block>

          <Block
            title="Eyebrow"
            note="Voix machine : mono, uppercase, lettrage ouvert, « // » en rouge."
          >
            <Row label="md (section)">
              <Eyebrow>Système Comlan</Eyebrow>
            </Row>
            <Row label="sm (carte)">
              <Eyebrow size="sm">PC-sur-mesure</Eyebrow>
            </Row>
            <Row label="sm + emoji">
              <Eyebrow size="sm" lead="💻">
                PC-sur-mesure
              </Eyebrow>
            </Row>
          </Block>

          <Block
            title="Chip · SpecChip"
            note="Étiquettes de specs comme briques de design. Angles nets (8px), mono, surface-2."
          >
            <Row label="Chip">
              <Chip>Depuis 2022</Chip>
              <Chip>PC neufs &amp; reconditionnés</Chip>
              <Chip>Concept 2 pour 1</Chip>
            </Row>
            <Row label="SpecChip">
              <SpecChip>Core i5</SpecChip>
              <SpecChip>16 Go</SpecChip>
              <SpecChip>SSD 512</SpecChip>
            </Row>
          </Block>

          <Block
            title="Card"
            note="Survol : bordure → rouge, élévation, -4px, et l'eyebrow vire au rouge avec la carte."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <Eyebrow
                  size="sm"
                  lead="💻"
                  className="group-hover:text-rouge"
                >
                  PC-sur-mesure
                </Eyebrow>
                <CardTitle>PC sur mesure</CardTitle>
                <CardText>
                  Neuf ou reconditionné, choisi selon ton besoin et ton budget.
                </CardText>
                <CardSpecs>
                  <SpecChip>Core i5</SpecChip>
                  <SpecChip>16 Go</SpecChip>
                  <SpecChip>SSD 512</SpecChip>
                </CardSpecs>
              </Card>

              <Card>
                <Eyebrow
                  size="sm"
                  lead="🎁"
                  className="group-hover:text-rouge"
                >
                  Deux-pour-un
                </Eyebrow>
                <CardTitle>2 pour 1</CardTitle>
                <CardText>
                  Un avantage en plus à chaque pack, sans surcoût.
                </CardText>
              </Card>

              <Card interactive={false}>
                <Eyebrow size="sm">Panneau statique</Eyebrow>
                <CardTitle>interactive={"{false}"}</CardTitle>
                <CardText>
                  Pas de survol : pour les blocs de contenu qui ne sont pas des
                  cibles.
                </CardText>
              </Card>
            </div>
          </Block>

          <Block
            title="GradientText"
            note="Un à deux mots par écran, jamais plus. Le rouge reste un accent."
          >
            <p className="font-display text-5xl leading-tight">
              On en parle sur <GradientText>WhatsApp</GradientText> ?
            </p>
            <p className="mt-6 font-display text-5xl leading-tight">
              Deux pour le{" "}
              <GradientText as="em">prix d&apos;un</GradientText>.
            </p>
          </Block>

          <Block
            title="TerminalLine"
            note="Préfixe « > » en craie, corps en gris, caret rouge clignotant. En animations réduites, le caret reste visible et fixe."
          >
            <div className="rounded-lg border border-ligne bg-surface p-8">
              <TerminalLine>
                comlan --pack étudiant --budget{" "}
                <TerminalKeyword>250k</TerminalKeyword>
              </TerminalLine>
              <TerminalLine caret={false}>
                notre_signature ={" "}
                <TerminalKeyword>« deux pour le prix d&apos;un »</TerminalKeyword>
              </TerminalLine>
              <TerminalLine caret={false}>
                statut = <TerminalKeyword>tout_est_calculé</TerminalKeyword>
              </TerminalLine>
            </div>
          </Block>

          <Block
            title="Contrastes — mesurés"
            note="WCAG 2.1. « AA » = 4,5:1 pour le texte courant ; « AA large » = 3:1, valable seulement à partir de 24px (ou 18,66px en gras)."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-ligne font-mono text-[0.7rem] tracking-[0.14em] text-gris uppercase">
                    <th className="py-3 pr-4 font-medium">Paire</th>
                    <th className="py-3 pr-4 font-medium">Ratio</th>
                    <th className="py-3 pr-4 font-medium">Texte courant</th>
                    <th className="py-3 font-medium">Aperçu</th>
                  </tr>
                </thead>
                <tbody>
                  {CONTRAST_PAIRS.map((pair) => {
                    const ratio = contrastRatio(pair.fg, pair.bg);
                    const level = wcagLevel(ratio);
                    const fails = level === "échec" || level === "AA large";
                    return (
                      <tr
                        key={pair.label}
                        className="border-b border-ligne-faible"
                      >
                        <td className="py-3 pr-4 font-mono text-[0.75rem] text-craie-2">
                          {pair.label}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[0.75rem] text-craie">
                          {ratio.toFixed(2)}:1
                        </td>
                        <td
                          className={`py-3 pr-4 font-mono text-[0.75rem] ${
                            fails ? "text-rouge" : "text-gris"
                          }`}
                        >
                          {fails ? `⚠ ${level}` : level}
                        </td>
                        <td className="py-3">
                          <span
                            className="inline-block rounded-sm px-3 py-1 text-[0.75rem]"
                            style={{
                              color: pair.fg,
                              backgroundColor: pair.bg,
                            }}
                          >
                            Aa exemple
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Block>
        </div>
      </Section>
    </main>
  );
}
