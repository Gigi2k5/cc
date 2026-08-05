import { BrandIcon } from "@/components/ui/BrandIcons";
import { Wordmark } from "@/components/ui/Wordmark";
import { BRAND, FOOTER_COLUMNS, SOCIALS } from "@/lib/content";
import { isExternal } from "@/lib/utils";

import { Container } from "./Container";

/** Design system §10 — noir de marque, wordmark + phrase, colonnes, réseaux. */
export function Footer() {
  return (
    <footer className="border-t border-ligne-faible bg-noir">
      <Container className="pt-20 pb-12">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-14">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[24ch] text-sm leading-[1.7] text-gris">
              {BRAND.tagline}
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-labelledby={`footer-${column.title}`}>
              <h2
                id={`footer-${column.title}`}
                className="font-mono text-[0.6875rem] tracking-[0.18em] text-gris uppercase"
              >
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-craie-2 transition-colors duration-[var(--duration-micro)] ease-micro hover:text-rouge"
                      {...(isExternal(link.href)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                {"note" in column && column.note ? (
                  <li className="text-gris">{column.note}</li>
                ) : null}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-ligne-faible pt-7 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex items-center gap-6">
            {SOCIALS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  className="flex items-center gap-2 text-[0.8125rem] text-gris transition-colors duration-[var(--duration-micro)] ease-micro hover:text-rouge"
                >
                  <BrandIcon name={social.icon} />
                  {social.name}
                </a>
              </li>
            ))}
          </ul>

          <p className="font-mono text-xs text-gris">{BRAND.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
