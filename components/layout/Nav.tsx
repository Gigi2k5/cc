"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Wordmark } from "@/components/ui/Wordmark";
import { BRAND, CTA, NAV_IDS, NAV_LINKS, WHATSAPP } from "@/lib/content";
import { useScrollSpy } from "@/lib/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

const PANEL_ID = "nav-panel";
/** Le lien qui porte la pastille quand une édition approche. */
const EVENTS_ID = "evenements";

export function Nav({
  /** Une édition est à venir : le lien correspondant porte une pastille. */
  highlightEvents = false,
}: {
  highlightEvents?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [navHeight, setNavHeight] = useState(64);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const active = useScrollSpy(NAV_IDS, navHeight);

  /* La hauteur de nav vit dans le token --nav-h : on la lit au lieu de
     la dupliquer en JS. */
  useEffect(() => {
    const read = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        "--nav-h",
      );
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed)) setNavHeight(parsed);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  /* Verre dépoli au scroll, transparente en haut. rAF pour ne poser
     qu'un setState par frame au maximum. */
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* Panneau mobile : verrou de scroll, Échap, et focus rendu au burger. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    // Capturé à l'ouverture : c'est bien à ce burger-là qu'on rend le focus.
    const toggle = toggleRef.current;

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 h-[var(--nav-h)] w-full",
          // Pas de backdrop-filter dans la liste : transitionner un flou est
          // coûteux et saccade. Le fondu du fond suffit à l'œil.
          "transition-[background-color,border-color]",
          "duration-[var(--duration-standard)] ease-standard",
          scrolled || open
            ? "border-b border-ligne-faible bg-encre/75 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Navigation principale"
          className="mx-auto flex h-full max-w-page items-center justify-between gap-8 px-[var(--gutter)]"
        >
          {/* `min-h-11` : sans lui la cible ne fait que la hauteur du texte,
              soit 19 px — bien en dessous des 44 px de §12. La nav fait 64 px,
              rien ne bouge à l'écran. */}
          <a
            href="#top"
            aria-label={`${BRAND.name} ${BRAND.nameAccent} — retour en haut`}
            className="flex min-h-11 items-center"
          >
            <Wordmark withTag />
          </a>

          {/* Gouttière resserrée entre 1024 et 1280 : six liens + le CTA y tiennent
                juste. Au-delà, on retrouve le rythme de la maquette. */}
          <ul className="hidden items-center gap-6 lg:flex xl:gap-9">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative block py-2 text-sm whitespace-nowrap transition-colors",
                      "duration-[var(--duration-micro)] ease-micro",
                      isActive ? "text-craie" : "text-gris hover:text-craie",
                    )}
                  >
                    {link.label}
                    {/* Rattrape ceux qui balaient la nav sans lire le hero. */}
                    {highlightEvents && link.id === EVENTS_ID ? (
                      <span aria-hidden="true" className="alert-dot ml-1.5 size-1.5 align-middle" />
                    ) : null}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-0.5 left-0 h-px w-full bg-accent-grad",
                        "transition-opacity duration-[var(--duration-standard)] ease-standard",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            {/* Masquage porté par un conteneur : `hidden` sur le Button ne
                battrait pas le `inline-flex` de sa classe de base — entre deux
                utilitaires `display`, c'est l'ordre dans la feuille générée
                qui tranche, pas l'ordre dans className. */}
            <div className="hidden lg:block">
              <Magnetic>
                {/* Six liens serrent la nav : sans ça le libellé passe sur deux
                    lignes et le bouton double de hauteur. */}
                <Button href={WHATSAPP.primary.href} className="whitespace-nowrap">
                  {CTA.whatsapp}
                </Button>
              </Magnetic>
            </div>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={PANEL_ID}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="-mr-2 grid size-11 shrink-0 place-items-center text-craie transition-colors duration-[var(--duration-micro)] ease-micro hover:text-rouge lg:hidden"
            >
              {open ? (
                <X aria-hidden="true" strokeWidth={1.75} className="size-6" />
              ) : (
                <Menu aria-hidden="true" strokeWidth={1.75} className="size-6" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Panneau plein écran mobile. `invisible` le retire de l'ordre de
          tabulation et de l'arbre d'accessibilité quand il est fermé. */}
      <div
        id={PANEL_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-encre lg:hidden",
          /* `overflow-y-auto` : six liens en 36 px, un CTA et la signature
             font 642 px de haut au minimum. Sur un 360×640 — une taille
             d'Android parmi les plus courantes — ça dépasse, et comme le
             scroll du body est verrouillé à l'ouverture, le bouton WhatsApp
             était purement INATTEIGNABLE (mesuré : bas de panneau à 753 px
             pour 640 px d'écran, 568 px sur un iPhone SE où « Contact »
             lui-même était coupé). Le panneau défile désormais. */
          "overflow-y-auto overscroll-contain",
          /* La nav n'est plus collée en haut : la bande d'annonce la précède.
             Le panneau doit donc réserver les deux, sinon son premier lien
             passe sous l'en-tête. Une fois défilé la bande n'est plus là, et
             réserver sa hauteur ne ferait que 48 px de vide — autant de pris
             sur ce qui doit tenir dans l'écran. */
          scrolled ? "pt-[var(--nav-h)]" : "pt-[calc(var(--nav-h)+var(--alert-h))]",
          "transition-opacity duration-[var(--duration-standard)] ease-standard",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        {/* Rythme resserré : à gap-2/pt-10 le panneau faisait 692 px et
            débordait de tous les téléphones courts. À gap-1/pt-4 il tombe à
            642 px, donc il tient sans défiler dès 667 px de haut (iPhone SE 2/3,
            iPhone 8) — les 36 px des liens, eux, ne se négocient pas. */}
        <ul className="flex flex-col gap-1 px-[var(--gutter)] pt-4">
          {NAV_LINKS.map((link, index) => (
            <li key={link.id}>
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "block py-2 font-display text-[2.25rem] leading-tight transition-colors",
                  "duration-[var(--duration-micro)] ease-micro",
                  active === link.id ? "text-rouge" : "text-craie",
                )}
              >
                {link.label}
                {highlightEvents && link.id === EVENTS_ID ? (
                  <span aria-hidden="true" className="alert-dot mb-2 ml-2.5 size-2 align-middle" />
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        {/* `mt-auto` et non `justify-between` sur le parent : quand il y a de
            la place le bloc va au bas de l'écran, exactement comme avant ;
            quand il n'y en a pas la marge automatique tombe à zéro au lieu de
            pousser le bloc hors de la zone défilable. */}
        <div className="mt-auto flex flex-col gap-5 px-[var(--gutter)] pb-8">
          <Button
            href={WHATSAPP.primary.href}
            size="lg"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            {CTA.whatsapp}
          </Button>
          <p className="font-mono text-[0.625rem] tracking-[0.14em] text-gris-faible">
            {BRAND.tag}
          </p>
        </div>
      </div>
    </>
  );
}
