"use client";

import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type AccordionItem = {
  question: string;
  answer: string;
};

/**
 * Accordéon accessible — motif WAI : un bouton par en-tête, `aria-expanded`,
 * et un panneau relié par `aria-controls` / `aria-labelledby`. Un seul item
 * ouvert à la fois (§ maquette).
 *
 * L'ouverture anime `grid-template-rows` de 0fr à 1fr : c'est la seule façon
 * de faire glisser une hauteur automatique sans la mesurer en JS.
 *
 * Le panneau replié reste dans le DOM pour l'animation, mais porte `inert` :
 * il sort du parcours clavier et de l'arbre d'accessibilité, donc un lecteur
 * d'écran ne lit jamais une réponse fermée.
 */
export function Accordion({ items }: { items: readonly AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  /* Flèches, Début et Fin entre les en-têtes — le reste (Entrée, Espace, Tab)
     est déjà couvert par des <button> natifs. */
  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: items.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const wrapped = (next + items.length) % items.length;
    triggers.current[wrapped]?.focus();
  };

  return (
    <div className="border-b border-ligne">
      {items.map((item, index) => {
        const open = openIndex === index;
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.question} className="border-t border-ligne">
            <h3>
              <button
                ref={(node) => {
                  triggers.current[index] = node;
                }}
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "flex w-full items-center justify-between gap-5 py-6 text-left",
                  "text-base font-medium transition-colors",
                  "duration-[var(--duration-micro)] ease-micro",
                  open ? "text-craie" : "text-craie-2 hover:text-craie",
                )}
              >
                {item.question}
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 font-mono text-lg transition-colors",
                    "duration-[var(--duration-micro)] ease-micro",
                    open ? "text-rouge" : "text-gris",
                  )}
                >
                  {open ? "−" : "+"}
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              inert={!open}
              className={cn(
                "grid transition-[grid-template-rows]",
                "duration-[var(--duration-standard)] ease-standard",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-[36rem] pb-6 text-[0.9375rem] leading-[1.7] text-gris">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
