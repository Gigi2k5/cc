import Image from "next/image";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { Chip, SpecChip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CTA, EVENEMENTS, WHATSAPP, type Evenement } from "@/lib/content";
import { pastEvenements, upcomingEvenements } from "@/lib/evenements";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

import { EventOrbit } from "./EventOrbit";

/**
 * Le seul contenu daté du site — et sa mémoire.
 *
 * Deux blocs, pas des onglets : sur une page unique, le scroll *est* la
 * navigation, et des onglets cacheraient la moitié de la section au visiteur
 * comme aux moteurs. Avec une édition à venir et une passée, un `tablist`
 * serait plus d'habillage que de contenu.
 *
 * La bascule entre les deux blocs ne demande aucun redéploiement : la page
 * porte `export const revalidate` (voir app/page.tsx) et la comparaison de
 * dates vit dans lib/evenements.ts, évaluée côté serveur uniquement. Le
 * lendemain d'une soirée, l'édition descend d'elle-même dans l'historique —
 * elle ne disparaît jamais.
 */
export function Evenements() {
  const upcoming = upcomingEvenements();
  const past = pastEvenements();

  /* Une édition dont la date n'est pas arrêtée n'entre pas dans les données
     structurées : déclarer une `startDate` inventée vaudrait moins que rien,
     un moteur l'afficherait telle quelle. */
  const datees = [...upcoming, ...past].filter(
    (event) => event.dateStatus === "confirme",
  );

  return (
    <Section id="evenements" ariaLabelledby="evenements-title">
      {/* L'anneau habille l'en-tête et lui seul : le contenu dessous reste
          sobre, sinon les images du décor concurrenceraient l'affiche de
          l'édition annoncée.

          Deux dispositions, une seule source. À partir de 1024px le titre se
          tient AU CENTRE de l'anneau, dans son vide — c'est tout l'intérêt de
          la forme : il n'y a rien derrière le texte, donc aucun voile n'est
          nécessaire. En dessous, le centre ne fait plus que ~210px de large et
          « Ce qui se passe bientôt. » n'y tient pas sans devenir minuscule :
          l'anneau passe alors au-dessus et le titre dessous, les deux
          centrés. */}
      <div className="relative flex flex-col items-center gap-10 lg:block lg:min-h-[800px] lg:gap-0">
        <EventOrbit className="lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2" />

        <Reveal className="relative w-full text-center lg:absolute lg:inset-0 lg:grid lg:place-content-center">
          <Eyebrow className="justify-center">{EVENEMENTS.eyebrow}</Eyebrow>
          <SectionTitle
            id="evenements-title"
            className="mx-auto mt-6 max-w-[14ch]"
          >
            {upcoming.length > 0 ? EVENEMENTS.title : EVENEMENTS.empty.title}
          </SectionTitle>
        </Reveal>
      </div>

      {datees.length > 0 ? <EventJsonLd events={datees} /> : null}

      {upcoming.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-6">
          {upcoming.map((event, index) => (
            <Reveal as="li" key={event.slug} delay={index * 80}>
              <EventPanel event={event} />
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal delay={80}>
          <p className="max-w-[46ch] text-[1.0625rem] leading-[1.7] text-gris">
            {EVENEMENTS.empty.body}
          </p>
          <p className="mt-10">
            <Magnetic>
              <Button href={WHATSAPP.group.href} size="lg">
                {CTA.community}
              </Button>
            </Magnetic>
          </p>
        </Reveal>
      )}

      {past.length > 0 ? (
        <div className="mt-20 lg:mt-24">
          <Reveal>
            <h3 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.2] tracking-[-0.01em]">
              {EVENEMENTS.past.heading}
            </h3>
            <p className="mt-3 max-w-[44ch] text-[0.9375rem] leading-[1.7] text-gris">
              {EVENEMENTS.past.note}
            </p>
          </Reveal>

          {/* La grille suit le nombre d'éditions au lieu de l'imposer : une
              seule carte dans une grille à trois colonnes laisse deux tiers de
              vide à sa droite et se lit comme un bloc inachevé. Seule, elle
              passe donc en carte horizontale, qui occupe la largeur
              franchement. À deux, deux colonnes. Au-delà, trois. */}
          <ul
            className={cn(
              "mt-9 grid gap-5",
              past.length === 1
                ? "max-w-[46rem]"
                : past.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {past.map((event, index) => (
              <Reveal as="li" key={event.slug} delay={index * 80}>
                <PastEventCard event={event} seule={past.length === 1} />
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

/**
 * L'annonce en fiche technique : une soirée décrite exactement comme le site
 * décrit une configuration. Le seul mot en dégradé de la section est l'accent
 * du titre (§3), et le prix est le seul Young Serif (§4).
 *
 * Tarif, programme, billetterie et affiche sont **optionnels** : une édition
 * annoncée avant que tout soit arrêté n'affiche que ce qui est vrai, sans
 * laisser de trou. Sans affiche, la fiche prend toute la largeur au lieu de
 * réserver une colonne vide.
 */
function EventPanel({ event }: { event: Evenement }) {
  const aPoster = Boolean(event.poster);

  return (
    <div className="relative overflow-hidden rounded-lg border border-ligne bg-surface p-8 sm:p-12 lg:px-18 lg:py-20">
      {/* Filigrane machine. Décoratif, et masqué là où il chevaucherait le badge. */}
      <p
        aria-hidden="true"
        className="absolute top-7 right-8 hidden font-mono text-[0.6875rem] tracking-[0.18em] text-gris-faible/60 lg:block"
      >
        {"// "}
        {event.watermark}
      </p>

      <div
        className={
          aPoster ? "lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-x-16" : ""
        }
      >
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="flex flex-wrap items-center gap-2.5">
            <Chip>{event.badge}</Chip>
            {/* Dit à quel bloc appartient la fiche, sans dépendre de la
                position à l'écran — un lecteur d'écran ne voit pas les deux
                colonnes. */}
            <SpecChip className="text-rouge">
              {EVENEMENTS.upcomingBadge}
            </SpecChip>
          </p>

          <h3 className="mt-6 font-display text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.1] tracking-[-0.01em]">
            {event.titleBefore}{" "}
            <GradientText as="em">{event.titleAccent}</GradientText>
            {event.titleAfter}
          </h3>

          <p className="mt-4 text-[1.0625rem] leading-[1.7] text-gris">
            {event.lead}
          </p>

          {/* Paires libellé/valeur : une liste de définitions, pas un tableau
              de mise en page — c'est exactement ce que décrit `dl`. */}
          <dl className="mt-9 border-b border-ligne-faible">
            {event.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline gap-4 border-t border-ligne-faible py-3.5 sm:gap-6"
              >
                <dt className="w-23 shrink-0 font-mono text-[0.625rem] tracking-[0.16em] text-gris sm:w-26 sm:text-[0.6875rem] sm:tracking-[0.18em]">
                  {spec.label}
                </dt>
                <dd className="font-mono text-[0.78125rem] text-craie sm:text-[0.875rem]">
                  {spec.value}
                  {spec.to ? (
                    <>
                      {" "}
                      <span className="text-gris">→</span> {spec.to}
                    </>
                  ) : null}
                </dd>
              </div>
            ))}

            {event.price ? (
              <div className="flex items-baseline gap-4 border-t border-ligne-faible pt-4 pb-5 sm:gap-6">
                <dt className="w-23 shrink-0 font-mono text-[0.625rem] tracking-[0.16em] text-gris sm:w-26 sm:text-[0.6875rem] sm:tracking-[0.18em]">
                  {event.price.label}
                </dt>
                <dd className="flex items-baseline gap-2.5">
                  <span className="font-accent text-[1.75rem] leading-none text-craie sm:text-[2.125rem]">
                    {event.price.amount}
                  </span>
                  {/* Espace explicite : sans lui le texte accessible vaut
                      « 2 000FCFA » d'un seul tenant. En conteneur flex, un nœud
                      de texte vide n'est pas rendu — l'espacement reste celui du
                      `gap`, rien ne bouge à l'écran. */}{" "}
                  <span className="font-mono text-xs tracking-[0.1em] text-gris sm:text-[0.8125rem]">
                    {event.price.currency}
                  </span>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {/* L'affiche est un objet posé, jamais un fond : sa palette (dorés,
            rouge saturé) ne doit pas déborder sur celle du site. */}
        {event.poster ? (
          <figure className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <div className="rounded-sm border border-ligne bg-encre p-2.5">
              <Image
                src={event.poster.src}
                alt={event.poster.alt}
                width={event.poster.width}
                height={event.poster.height}
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 60vw, 90vw"
                className="h-auto w-full rounded-sm"
              />
            </div>
            <figcaption className="mt-2.5 font-mono text-[0.625rem] tracking-[0.14em] text-gris-faible">
              {event.poster.caption}
            </figcaption>
          </figure>
        ) : null}

        <div className="lg:col-start-1 lg:row-start-2">
          {/* Nuage d'étiquettes à partir de 640 px, plaques pleine largeur en
              dessous. Ce n'est pas un repli faute de mieux : à 320 px la carte
              n'offre que 216 px de contenu et les étiquettes mesurent de 106 à
              185 px (mesuré), donc il en tient une par ligne — sept lignes aux
              bords droits tous différents, qui se lisent comme un accident de
              retour à la ligne plutôt que comme un nuage. Pleine largeur, la
              même information devient une pile de plaques de spec régulière,
              qui parle la même langue que la fiche technique juste au-dessus
              (§2), et pour exactement la même hauteur : 7 × 41 px + 6 × 8 px de
              gouttière contre 7 × 46 px avant. */}
          {event.programme ? (
            <ul className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {event.programme.map((item) => (
                <li key={item}>
                  <Chip className="w-full sm:w-auto">{item}</Chip>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            {/* Pas de billetterie ouverte : le groupe WhatsApp devient l'action
                principale. C'est là que la date tombera en premier, donc ce
                n'est pas un bouton de repli — c'est le bon geste à ce stade. */}
            {event.ticket ? (
              <Magnetic>
                <Button
                  href={event.ticket.href}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {event.ticket.label}
                </Button>
              </Magnetic>
            ) : (
              <Magnetic>
                <Button
                  href={WHATSAPP.group.href}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {CTA.community}
                </Button>
              </Magnetic>
            )}
            <Magnetic>
              <Button
                href={WHATSAPP.primary.href}
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                {EVENEMENTS.secondaryCta}
              </Button>
            </Magnetic>
          </div>

          {/* La billetterie est un domaine tiers : on l'annonce plutôt que de
              laisser la surprise au clic. */}
          {event.ticket ? (
            <p className="mt-4 font-mono text-[0.6875rem] text-gris-faible">
              {EVENEMENTS.ticketPrefix} {event.ticket.host}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Une édition passée, en carte compacte — l'affiche en vignette, la date en
 * voix machine, et le lien de récapitulatif s'il existe.
 *
 * Bâtie sur `Card` plutôt que sur un conteneur maison : l'historique doit
 * parler la même langue que « Ce qu'on fait », pas inventer un troisième
 * dialecte de carte.
 */
function PastEventCard({
  event,
  seule = false,
}: {
  event: Evenement;
  /** Seule de sa grille : l'affiche passe à gauche au lieu d'être en bandeau. */
  seule?: boolean;
}) {
  /* Sorti de `event` : à l'intérieur d'un callback, TypeScript ne peut plus
     garantir que la propriété optionnelle n'a pas changé entre-temps. */
  const photos = event.photos;

  return (
    <Card
      className={cn(
        "h-full gap-0 p-0",
        seule && "sm:flex-row sm:items-stretch",
      )}
    >
      {event.poster ? (
        /* Ratio fixe et `object-cover` : les affiches n'ont pas toutes le même
           format (720×1080, 864×1080…) et une grille de vignettes de hauteurs
           différentes se lit comme une erreur de gabarit. */
        <div
          className={cn(
            "relative overflow-hidden border-ligne bg-encre",
            seule
              ? "aspect-[4/3] w-full rounded-t-lg border-b sm:aspect-auto sm:w-[38%] sm:shrink-0 sm:rounded-l-lg sm:rounded-tr-none sm:border-r sm:border-b-0"
              : "aspect-[4/3] w-full rounded-t-lg border-b",
          )}
        >
          <Image
            src={event.poster.src}
            alt={event.poster.alt}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 90vw"
            className="object-cover object-top opacity-80 transition-opacity duration-[var(--duration-standard)] ease-standard group-hover:opacity-100"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
        <p className="flex flex-wrap items-center gap-2">
          <SpecChip>{EVENEMENTS.past.badge}</SpecChip>
          <SpecChip>{event.watermark}</SpecChip>
        </p>

        <CardTitle className="mt-1">{event.seoName}</CardTitle>
        <CardText>{event.lead}</CardText>

        {/* La galerie du coin photo. Les mêmes images tournent dans l'anneau
            de l'en-tête, mais là-bas elles sont du décor et le bloc est
            `aria-hidden` ; ici elles portent un vrai texte alternatif, parce
            qu'ici elles sont de l'information.

            Le nombre est compté, jamais écrit en dur : une photo ajoutée ne
            doit pas laisser un compte faux derrière elle. */}
        {photos ? (
          <div className="mt-2">
            <p className="font-mono text-[0.625rem] tracking-[0.14em] text-gris-faible">
              {EVENEMENTS.past.photosPrefix} {photos.items.length} photos
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {photos.items.map((photo, index) => (
                <li
                  key={photo.src}
                  className="relative size-12 overflow-hidden rounded-sm border border-ligne bg-encre sm:size-14"
                >
                  <Image
                    src={photo.src}
                    alt={`${EVENEMENTS.past.photoAlt} ${index + 1} sur ${photos.items.length}.`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {event.recap ? (
          <p className="mt-auto pt-3">
            <Button href={event.recap.href} size="md" variant="ghost">
              {event.recap.label}
            </Button>
          </p>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * Données structurées `Event` — ce qui permet à un moteur d'afficher la date,
 * le tarif et le lien de billetterie directement dans ses résultats.
 *
 * N'y entrent que les éditions dont la date est arrêtée : l'appelant filtre
 * sur `dateStatus`. Une édition encore sans date n'a rien à déclarer.
 *
 * Le lieu exact n'est pas public (position assumée) : on ne déclare donc que
 * le pays, jamais une adresse inventée.
 *
 * `<` : le JSON est injecté tel quel dans le document, on neutralise le
 * seul caractère qui pourrait en sortir (recommandation Next).
 */
function EventJsonLd({ events }: { events: readonly Evenement[] }) {
  const payload = events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.seoName,
    description: event.lead,
    startDate: event.start,
    endDate: event.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.poster ? { image: `${SITE_URL}${event.poster.src}` } : {}),
    location: {
      "@type": "Place",
      name: EVENEMENTS.place,
      address: { "@type": "PostalAddress", addressCountry: "BJ" },
    },
    organizer: {
      "@type": "Organization",
      name: "Comlan Community",
      url: SITE_URL,
    },
    ...(event.ticket && event.price
      ? {
          offers: {
            "@type": "Offer",
            url: event.ticket.href,
            price: event.price.value,
            priceCurrency: event.price.code,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          payload.length === 1 ? payload[0] : payload,
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
