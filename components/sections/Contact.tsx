import { Section } from "@/components/layout/Section";
import { BrandIcon } from "@/components/ui/BrandIcons";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GradientText } from "@/components/ui/GradientText";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT, SOCIALS, WHATSAPP } from "@/lib/content";

const NUMBERS = [WHATSAPP.primary, WHATSAPP.secondary];

/** Panneau de contact : tout mène à WhatsApp, les liens sont réels. */
export function Contact() {
  return (
    <Section id="contact" ariaLabelledby="contact-title">
      <div className="rounded-lg border border-ligne bg-surface p-8 sm:p-12 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-18 lg:py-20">
        <Reveal>
          <Eyebrow>{CONTACT.eyebrow}</Eyebrow>
          <h2
            id="contact-title"
            className="mt-6 font-display text-[clamp(2.2rem,5.5vw,3.5rem)] leading-[1.05]"
          >
            {CONTACT.titleBefore}{" "}
            <GradientText>{CONTACT.titleAccent}</GradientText>{" "}
            {CONTACT.titleAfter}
          </h2>

          <p className="mt-9 font-mono text-[0.8125rem] leading-[2] text-gris">
            {CONTACT.meta.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          <ul className="mt-9 flex flex-wrap items-center gap-6">
            {SOCIALS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  className="flex min-h-11 items-center gap-2 text-sm text-gris transition-colors duration-[var(--duration-micro)] ease-micro hover:text-rouge"
                >
                  <BrandIcon name={social.icon} />
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="mt-12 flex flex-col gap-3.5 lg:mt-0">
          {NUMBERS.map((number) => (
            <a
              key={number.href}
              href={number.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-4 rounded-sm border border-ligne bg-surface-2 px-6 py-5 transition-[border-color,translate] duration-[var(--duration-standard)] ease-standard hover:-translate-y-0.5 hover:border-rouge"
            >
              <span>
                <span className="block font-mono text-[0.6875rem] tracking-[0.15em] text-gris uppercase">
                  {number.label}
                </span>
                <span className="mt-1.5 block font-mono text-[1.0625rem] text-craie">
                  {number.display}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-sm text-rouge transition-transform duration-[var(--duration-standard)] ease-standard group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          ))}

          <Button
            href={WHATSAPP.group.href}
            size="lg"
            className="mt-2 w-full text-center"
          >
            {WHATSAPP.group.label} — {WHATSAPP.group.display}
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
