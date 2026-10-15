import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Le titre d'une section (§4 — H2 en Gloock).
 *
 * ### Pourquoi deux niveaux
 *
 * Toutes les sections portaient exactement le même titre : même police, même
 * `clamp`, même position en haut à gauche, onze fois de suite. Pris un par un
 * les blocs sont bons ; enchaînés, la page s'aplatit, parce que rien ne dit
 * au lecteur ce qui compte et ce qui accompagne.
 *
 * La hiérarchie est donc explicite, et c'est la seule chose qui change :
 *
 * - **`majeur`** — les sections qui portent la proposition : à propos, ce
 *   qu'on fait, le concept, les boutiques, la communauté, les événements.
 *   Taille inchangée, c'est la référence.
 * - **`appui`** — celles qui répondent à une question qu'on se pose déjà,
 *   une fois convaincu : comment ça marche, la FAQ, le contact. Un cran en
 *   dessous (2,2 → 1,75rem au plancher), ce qui suffit à créer le rythme
 *   sans rien changer d'autre : ni la copie, ni la mise en page, ni la
 *   couleur.
 *
 * Avant, le `clamp` était recopié dans sept fichiers — et deux d'entre eux
 * avaient déjà divergé. Il n'existe plus qu'ici.
 */
export function SectionTitle({
  children,
  id,
  level = "majeur",
  className,
}: {
  children: ReactNode;
  id?: string;
  level?: "majeur" | "appui";
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "font-impact leading-[1.1]",
        level === "majeur"
          ? "text-[clamp(2.2rem,5vw,3.25rem)]"
          : "text-[clamp(1.75rem,3.6vw,2.4rem)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}
