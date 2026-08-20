import Image from "next/image";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { CTA, EVENEMENTS, WHATSAPP, type Evenement } from "@/lib/content";
import { upcomingEvenements } from "@/lib/evenements";
import { SITE_URL } from "@/lib/site";

/**
 * Le seul contenu daté du site.
 *
 * Une édition disparaît d'elle-même une fois sa date de fin passée : la page
 * porte `export const revalidate` (voir app/page.tsx), donc la bascule se fait
 * sans que personne ne redéploie. Quand il ne reste rien à venir, la section
 * ne se vide pas — elle bascule sur un état de repli qui renvoie au groupe.
 *
 * La comparaison de dates vit dans lib/evenements.ts : elle n'est évaluée que
 * côté serveur, au prérendu puis à chaque revalidation. Le client ne la
 * recalcule jamais, donc rien ne peut diverger du HTML servi.
 */
export function Evenements() {
  const upcoming = upcomingEvenements();

  return (
    <Section id="evenements" ariaLabelledby="evenements-title">
      <Reveal>
        <Eyebrow>{EVENEMENTS.eyebrow}</Eyebrow>
        <h2
          id="evenements-title"
          className="mt-6 font-impact text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.1]"
        >
          {upcoming.length > 0 ? EVENEMENTS.title : EVENEMENTS.empty.title}
        </h2>
      </Reveal>

      {upcoming.length > 0 ? (
        <>
          <EventJsonLd events={upcoming} />
          <ul className="mt-14 flex flex-col gap-6">
            {upcoming.map((event, index) => (
              <Reveal as="li" key={event.slug} delay={index * 80}>
                <EventPanel event={event} />
              </Reveal>
            ))}
          </ul>
        </>
      ) : (
        <Reveal delay={80}>
          <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.7] text-gris">
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
    </Section>
  );
}

/**
 * L'annonce en fiche technique : une soirée décrite exactement comme le site
 * décrit une configuration. Le seul mot en dégradé de la section est l'accent
 * du titre (§3), et le prix est le seul Young Serif (§4).
 */
function EventPanel({ event }: { event: Evenement }) {
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

      <div className="lg:grid lg:grid-cols-[1.15fr_1fr] lg:gap-x-16">
        <div className="lg:col-start-1 lg:row-start-1">
          <p>
            <Chip>{event.badge}</Chip>
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
                    `gap`, rien ne bouge à l'écran. */}
                {" "}
                <span className="font-mono text-xs tracking-[0.1em] text-gris sm:text-[0.8125rem]">
                  {event.price.currency}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* L'affiche est un objet posé, jamais un fond : sa palette (dorés,
            rouge saturé) ne doit pas déborder sur celle du site. */}
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

        <div className="lg:col-start-1 lg:row-start-2">
          <ul className="mt-8 flex flex-wrap gap-2">
            {event.programme.map((item) => (
              <li key={item}>
                <Chip>{item}</Chip>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Magnetic>
              <Button
                href={event.ticket.href}
                size="lg"
                className="w-full sm:w-auto"
              >
                {event.ticket.label}
              </Button>
            </Magnetic>
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
          <p className="mt-4 font-mono text-[0.6875rem] text-gris-faible">
            {EVENEMENTS.ticketPrefix} {event.ticket.host}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Données structurées `Event` — ce qui permet à un moteur d'afficher la date,
 * le tarif et le lien de billetterie directement dans ses résultats.
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
    image: `${SITE_URL}${event.poster.src}`,
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
    offers: {
      "@type": "Offer",
      url: event.ticket.href,
      price: event.price.value,
      priceCurrency: event.price.code,
      availability: "https://schema.org/InStock",
    },
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
