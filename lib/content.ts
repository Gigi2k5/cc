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
  /** `primary` reçoit tous les CTA « Parler à un conseiller / sur WhatsApp ». */
  primary: {
    href: "https://wa.me/2290169787127",
    display: "+229 01 69 78 71 27",
    label: "WhatsApp 1",
  },
  secondary: {
    href: "https://wa.me/2290159100290",
    display: "+229 01 59 10 02 90",
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

export const HOURS = "Lundi–Dimanche · 8h–22h";
export const DELIVERY = "livraison : 3–5 jours ouvrés";

/** Sections ancrées, dans l'ordre du scroll. Pilote la nav et le scroll-spy. */
export const NAV_LINKS = [
  { id: "a-propos", label: "À propos" },
  { id: "ce-quon-fait", label: "Ce qu'on fait" },
  { id: "communaute", label: "Communauté" },
  { id: "evenements", label: "Événements" },
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

/* ==========================================================================
   Sections de contenu — copie validée, au mot près.
   ========================================================================== */

/** Bandeau de chips sous le hero. */
export const EN_BREF = [
  "Depuis 2022",
  "PC neufs & reconditionnés",
  "Concept 2 pour 1",
  "Communauté active",
  "Bénin",
] as const;

export const A_PROPOS = {
  eyebrow: "À propos",
  title: "Plus qu'un vendeur de PC.",
  body: "Depuis 2022, Comlan Community rend la technologie accessible au Bénin. On vend des PC — mais on fait surtout en sorte que chaque client reparte avec la bonne machine, un vrai accompagnement, et l'accès à un univers communautaire.",
  /** Bloc signature, voix machine. */
  signature: [
    "notre_signature = « deux pour le prix d'un »",
    "statut = tout_est_calculé",
  ],
} as const;

export const CE_QU_ON_FAIT = {
  eyebrow: "Ce qu'on fait",
  title: "Cinq façons de te servir.",
  cards: [
    {
      slug: "PC-sur-mesure",
      lead: "💻",
      title: "PC sur mesure",
      text: "Neuf ou reconditionné, choisi selon ton besoin et ton budget.",
      specs: ["Core i5", "16 Go", "SSD 512"],
    },
    {
      slug: "Deux-pour-un",
      lead: "🎁",
      title: "2 pour 1",
      text: "Un avantage en plus à chaque pack, sans surcoût.",
      specs: [],
    },
    {
      slug: "Bacheliers",
      lead: "🎓",
      title: "Nouveaux bacheliers",
      text: "La bonne machine pour ta filière, avec des conseils.",
      specs: [],
    },
    {
      slug: "Loup-Garou",
      lead: "🐺",
      title: "Univers Loup-Garou",
      text: "Le jeu communautaire de stratégie qui rassemble.",
      specs: [],
    },
    {
      slug: "Réseau",
      lead: "🤝",
      title: "Un réseau",
      text: "Des événements qui font vivre d'autres entrepreneurs.",
      specs: [],
    },
  ],
} as const;

export const DEUX_POUR_UN = {
  eyebrow: "Le concept",
  /** Filigrane mono dans le coin du panneau. */
  watermark: "TOUT_EST_CALCULÉ",
  title: "Un pack. Un avantage en plus.",
  body: "Tu paies un pack au prix standard et tu reçois un avantage additionnel, sans surcoût.",
  blocks: [
    { label: "[ 01 ]", title: "Ton PC", note: "config testée · prête à l'emploi" },
    {
      label: "[ 02 ]",
      title: "Ton avantage",
      note: "accessoire · service · bonus",
    },
    { label: "[ TOTAL ]", title: "Prix standard", note: "surcoût = 0" },
  ],
} as const;

export const COMMENT_CA_MARCHE = {
  eyebrow: "Comment ça marche",
  title: "Trois étapes. Zéro surprise.",
  steps: [
    {
      number: "01",
      title: "Réservation",
      text: "Tu nous écris sur WhatsApp, on cerne ton besoin et ton budget.",
    },
    {
      number: "02",
      title: "Préparation",
      text: "Config, test complet, et ton avantage 2 pour 1 ajouté au pack.",
    },
    {
      number: "03",
      title: "Livraison",
      text: "Livraison, installation, et mini-formation pour bien démarrer.",
    },
  ],
  note: "délais typiques : 3–5 jours",
} as const;

export const COMMUNAUTE = {
  eyebrow: "L'univers Comlan",
  /** Titre révélé mot à mot ; le dernier segment est en italique dégradé. */
  title: ["Ici, on n'achète pas qu'un PC.", "On rejoint"],
  titleAccent: "un univers.",
  body: "Un jeu communautaire de stratégie, des éditions événementielles, un réseau qui tire tout le monde vers le haut.",
  tags: [
    "🐺 Loup-Garou · jeu de stratégie",
    "Éditions présidentielles",
    "Réseautage",
  ],
  /**
   * Motif terminal en filigrane (~3,5 % d'opacité). Loup-Garou reste cadré
   * comme jeu communautaire : aucune mention de crédits, mise ou retrait (§11).
   */
  terminal: [
    "loup-garou --edition présidentielle --joueurs 24",
    'comlan network --event "soirée entrepreneurs"',
    "communauté --statut active --depuis 2022",
    "loup-garou --role village --nuit 3",
    "comlan --rejoindre --via whatsapp",
    "réseau --profil étudiants,jeunes-pros,tpe",
    "loup-garou --partie hebdo --inscription ouverte",
    'comlan network --statut "ça tire vers le haut"',
  ],
} as const;

/**
 * Bande d'annonce et bloc hero — le dispositif « voyant » de l'événement.
 *
 * Il descend exactement de la même source que la section : `upcomingEvenements()`.
 * Une seule date à tenir à jour, trois endroits qui s'éteignent ensemble.
 */
export const ALERTE = {
  /** Nom accessible du repère qui porte la bande. */
  label: "Prochaine édition",
  cta: "Réserver",
  heroEyebrow: "Prochaine édition",
  /** Compte à rebours, en voix machine. */
  countdown: {
    prefix: "J−",
    tomorrow: "DEMAIN",
    today: "AUJOURD'HUI",
    ongoing: "EN COURS",
  },
} as const;

/* --------------------------------------------------------------------------
   Événements — le seul contenu daté du site.
   
   `end` est la borne qui compte : la section retire d'elle-même une édition
   dès qu'elle est passée (voir Evenements.tsx), et la page est revalidée
   toutes les heures. Personne n'a donc à redéployer le lendemain d'une
   soirée. Ajouter une édition = ajouter une entrée dans `items`.
   
   Fuseau du Bénin : UTC+1 toute l'année, sans heure d'été.
   
   ⚠️ §11 du design system — Loup-Garou reste cadré comme jeu communautaire.
   Les jetons sont *inclus* dans l'entrée : ni crédits à recharger, ni mise,
   ni retrait en argent, ici comme ailleurs sur le site public.
   -------------------------------------------------------------------------- */

export type EvenementSpec = {
  label: string;
  value: string;
  /** Présent sur une plage : rendu « value → to ». */
  to?: string;
};

export type Evenement = {
  slug: string;
  /** Nom complet, réservé aux données structurées. */
  seoName: string;
  badge: string;
  /** Formes courtes : la bande est en capitales mono et tient sur une ligne. */
  dateShort: string;
  alertTitle: string;
  /** Sous 640 px : la bande n'a pas la place du libellé complet. */
  alertTitleShort: string;
  alertMeta: string;
  heroTitle: string;
  heroMeta: string;
  titleBefore: string;
  titleAccent: string;
  titleAfter: string;
  lead: string;
  /** ISO 8601. `end` décide de la disparition de l'annonce. */
  start: string;
  end: string;
  watermark: string;
  specs: readonly EvenementSpec[];
  price: {
    label: string;
    amount: string;
    currency: string;
    /** Pour les données structurées uniquement. */
    value: number;
    code: string;
  };
  programme: readonly string[];
  ticket: { href: string; label: string; host: string };
  poster: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
  };
};

export const EVENEMENTS = {
  eyebrow: "Événements",
  title: "Ce qui se passe bientôt.",
  /** Le lieu n'est pas public : position assumée, pas un oubli. */
  place: "Lieu communiqué aux inscrits",
  secondaryCta: "Une question ? WhatsApp",
  ticketPrefix: "billetterie :",
  /** Affiché quand plus aucune édition n'est à venir — jamais une section vide. */
  empty: {
    title: "La prochaine édition se prépare.",
    body: "Les prochaines éditions s'annoncent d'abord dans le groupe WhatsApp.",
  },
  items: [
    {
      slug: "edition-3-presentiel",
      seoName: "Comlan Community — 3e édition présentiel",
      badge: "[ 3E ÉDITION · PRÉSENTIEL ]",
      dateShort: "05.09",
      alertTitle: "3E ÉDITION PRÉSENTIEL",
      alertTitleShort: "3E ÉDITION",
      alertMeta: "25 PLACES",
      heroTitle: "3ᵉ édition présentiel",
      heroMeta: "samedi 5 septembre · 25 places · 2 000 FCFA",
      titleBefore: "Le 5 septembre, on joue",
      titleAccent: "autrement",
      titleAfter: ".",
      lead: "Une soirée pensée pour durer jusqu'à minuit.",
      start: "2026-09-05T15:00:00+01:00",
      end: "2026-09-06T00:00:00+01:00",
      watermark: "05.09.2026",
      specs: [
        { label: "[ DATE ]", value: "samedi 5 septembre 2026" },
        { label: "[ HORAIRE ]", value: "15h00", to: "00h00" },
        { label: "[ LIEU ]", value: "communiqué aux inscrits" },
        { label: "[ PLACES ]", value: "25" },
      ],
      price: {
        label: "[ ENTRÉE ]",
        amount: "2 000",
        currency: "FCFA",
        value: 2000,
        code: "XOF",
      },
      programme: [
        "Loup-Garou",
        "Pocket Poker",
        "Jeux d'ambiance",
        "Cocktail de bienvenue",
        "Jetons de jeu inclus",
        "Afrobeats & Amapiano",
        "Coin photo",
      ],
      ticket: {
        href: "https://tike229.ghinel.com/",
        label: "Réserver ta place",
        host: "tike229.ghinel.com",
      },
      poster: {
        src: "/evenements/edition-3-presentiel.jpg",
        alt: "Affiche de la 3e édition présentiel de Comlan Community : samedi 5 septembre 2026, de 15h à minuit, entrée 2 000 FCFA, 25 places disponibles.",
        width: 864,
        height: 1080,
        caption: "affiche officielle · 3e édition",
      },
    },
  ] satisfies readonly Evenement[],
} as const;

export const FAQ = {
  eyebrow: "FAQ",
  title: "Les questions qu'on nous pose.",
  items: [
    {
      question: "Quels PC proposez-vous ?",
      answer:
        "Des configurations adaptées (étudiant, pro, gaming), neuves ou reconditionnées, testées et prêtes à l'emploi.",
    },
    {
      question: "C'est quoi « 2 pour 1 » ?",
      answer:
        "Tu paies un pack au prix standard et tu reçois un avantage additionnel (accessoire, service ou bonus) sans surcoût.",
    },
    {
      question: "Comment se passe la livraison ?",
      answer:
        "Livraison ou retrait local, avec installation et mini-formation si besoin.",
    },
    {
      question: "Quels moyens de paiement ?",
      answer:
        "Cash, acompte + solde à la livraison, paiement par tranche selon les cas ; précommande en période de forte demande.",
    },
    {
      question: "Et le SAV ?",
      answer:
        "Support WhatsApp, diagnostic, conseils, et relais partenaires si nécessaire.",
    },
    {
      question: "C'est quoi Loup-Garou ?",
      answer:
        "Un jeu communautaire de stratégie sur WhatsApp, avec des parties régulières et des éditions événementielles.",
    },
  ],
} as const;

export const CONTACT = {
  eyebrow: "Contact",
  /** Le mot en dégradé est isolé : un à deux mots par écran (§3). */
  titleBefore: "On en parle sur",
  titleAccent: "WhatsApp",
  titleAfter: "?",
  meta: [`horaires : ${HOURS}`, DELIVERY],
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
      { label: "Événements", href: "#evenements" },
    ],
  },
] as const;
