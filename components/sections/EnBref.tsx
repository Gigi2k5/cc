import { Container } from "@/components/layout/Container";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/ui/Reveal";
import { EN_BREF } from "@/lib/content";

/** Bandeau de specs sous le hero — les étiquettes comme briques de design (§2). */
export function EnBref() {
  return (
    <section
      aria-label="En bref"
      className="border-y border-ligne-faible bg-encre"
    >
      <Container className="py-6">
        <ul className="flex flex-wrap items-center gap-3.5">
          {EN_BREF.map((item, index) => (
            <Reveal as="li" key={item} delay={index * 70}>
              <Chip>{item}</Chip>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
