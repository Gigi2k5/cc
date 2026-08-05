/**
 * Toute la copie française du site, au mot près, et les liens réels.
 * Source unique : les sections ne portent que du layout, jamais du texte,
 * pour qu'on ne dérive jamais du contenu validé.
 */

export const BRAND = {
  name: "Comlan",
  nameAccent: "Community",
  /** Suffixe machine du wordmark. */
  tag: "[ C//C — BÉNIN ]",
  tagline: "Acheter mieux. Vivre l'expérience.",
  copyright: "© 2026 Comlan Community",
} as const;

/** Liens WhatsApp réels. */
export const WHATSAPP = {
  primary: {
    href: "https://wa.me/2290159100290",
    display: "+229 01 59 10 02 90",
    label: "WhatsApp 1",
  },
  secondary: {
    href: "https://wa.me/2290169787127",
    display: "+229 01 69 78 71 27",
    label: "WhatsApp 2",
  },
  group: {
    href: "https://chat.whatsapp.com/EZwmZf6LCzQ5UYRhkg06OW",
    display: "Communauté WhatsApp",
    label: "Rejoindre le groupe",
  },
} as const;

/** Handles à remplacer quand les comptes seront ouverts (§ points ouverts). */
export const SOCIALS = [
  { name: "Facebook", href: "#", icon: "facebook" },
  { name: "Instagram", href: "#", icon: "instagram" },
  { name: "Medium", href: "#", icon: "medium" },
] as const;

export const HOURS = "Lundi–Samedi · 8h–18h";
export const DELIVERY = "livraison : 3–5 jours ouvrés";

/** Sections ancrées, dans l'ordre du scroll. Pilote la nav et le scroll-spy. */
export const NAV_LINKS = [
  { id: "a-propos", label: "À propos" },
  { id: "ce-quon-fait", label: "Ce qu'on fait" },
  { id: "communaute", label: "Communauté" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

/** Référence stable au niveau module : sert de dépendance au scroll-spy. */
export const NAV_IDS: readonly string[] = NAV_LINKS.map((link) => link.id);

export const CTA = {
  whatsapp: "Parler sur WhatsApp",
  advisor: "Parler à un conseiller",
  community: "Rejoindre la communauté",
} as const;

/** Colonnes du pied de page. */
export const FOOTER_COLUMNS = [
  {
    title: "Navigation",
    links: [
      { label: "À propos", href: "#a-propos" },
      { label: "Ce qu'on fait", href: "#ce-quon-fait" },
      { label: "Communauté", href: "#communaute" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: WHATSAPP.primary.label, href: WHATSAPP.primary.href },
      { label: WHATSAPP.secondary.label, href: WHATSAPP.secondary.href },
    ],
    note: HOURS,
  },
  {
    title: "Communauté",
    links: [
      { label: "Groupe WhatsApp", href: WHATSAPP.group.href },
      { label: "Loup-Garou", href: "#communaute" },
      { label: "Événements", href: "#communaute" },
    ],
  },
] as const;
