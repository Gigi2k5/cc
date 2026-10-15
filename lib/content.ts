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

/**
 * Comptes réseaux. Facebook et Medium restent des placeholders tant que leurs
 * adresses exactes ne sont pas connues (§ points ouverts).
 *
 * L'URL Instagram est volontairement nettoyée de son paramètre de suivi
 * (`?mdxt=…`) : ces jetons sont attachés à la session de celui qui a copié le
 * lien, ils n'ont rien à faire dans un lien public et peuvent expirer.
 */
export const SOCIALS = [
  { name: "Facebook", href: "#", icon: "facebook" },
  {
    name: "Instagram",
    href: "https://www.instagram.com/comlan_community",
    icon: "instagram",
  },
  { name: "Medium", href: "#", icon: "medium" },
] as const;

export const HOURS = "Lundi–Dimanche · 8h–22h";
export const DELIVERY = "livraison : 3–5 jours ouvrés";

/** Sections ancrées, dans l'ordre du scroll. Pilote la nav et le scroll-spy. */
export const NAV_LINKS = [
  { id: "a-propos", label: "À propos" },
  { id: "ce-quon-fait", label: "Ce qu'on fait" },
  { id: "boutiques", label: "Boutiques" },
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

/**
 * `icon` nomme une icône Lucide, au trait, plutôt qu'un emoji.
 *
 * Les emoji étaient le seul élément générique du site, et le seul dont le
 * dessin change d'un appareil à l'autre — cinq glyphes de couleur au milieu
 * d'un design system qui impose une police par rôle et des angles nets. Au
 * trait fin et en `currentColor`, les icônes suivent la couleur de l'eyebrow,
 * y compris son passage au rouge au survol.
 *
 * `specs` n'est plus jamais vide : une carte sur cinq qui portait ses
 * caractéristiques et quatre qui finissaient sur un blanc, ça se lisait comme
 * un gabarit inachevé. Chaque libellé ajouté est repris d'une copie déjà
 * validée ailleurs sur le site — « surcoût = 0 » du bloc 2 pour 1, « depuis
 * 2022 » de la bande En bref, « partie hebdo » du filigrane Communauté — et
 * n'avance donc aucune promesse nouvelle.
 */
export const CE_QU_ON_FAIT = {
  eyebrow: "Ce qu'on fait",
  title: "Cinq façons de te servir.",
  cards: [
    {
      slug: "PC-sur-mesure",
      icon: "laptop",
      title: "PC sur mesure",
      text: "Neuf ou reconditionné, choisi selon ton besoin et ton budget.",
      specs: ["Core i5", "16 Go", "SSD 512"],
    },
    {
      slug: "Deux-pour-un",
      icon: "gift",
      title: "2 pour 1",
      text: "Un avantage en plus à chaque pack, sans surcoût.",
      specs: ["surcoût = 0"],
    },
    {
      slug: "Bacheliers",
      icon: "graduation",
      title: "Nouveaux bacheliers",
      text: "La bonne machine pour ta filière, avec des conseils.",
      specs: ["conseil par filière"],
    },
    {
      slug: "Loup-Garou",
      icon: "jeu",
      title: "Univers Loup-Garou",
      text: "Le jeu communautaire de stratégie qui rassemble.",
      specs: ["partie hebdo"],
    },
    {
      slug: "Réseau",
      icon: "reseau",
      title: "Un réseau",
      text: "Des événements qui font vivre d'autres entrepreneurs.",
      specs: ["depuis 2022"],
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
  /**
   * Quand la billetterie n'est pas ouverte, « Réserver » promettrait un
   * formulaire qui n'existe pas. La bande mène alors au groupe, où la date
   * tombera en premier.
   */
  ctaSansBilletterie: "En savoir plus",
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

type EvenementBase = {
  slug: string;
  /** Nom complet, réservé aux données structurées. */
  seoName: string;
  badge: string;
  /** Formes courtes : la bande est en capitales mono et tient sur une ligne. */
  dateShort: string;
  alertTitle: string;
  /** Sous 640 px : la bande n'a pas la place du libellé complet. */
  alertTitleShort: string;
  alertMeta?: string;
  heroTitle: string;
  heroMeta: string;
  titleBefore: string;
  titleAccent: string;
  titleAfter: string;
  lead: string;
  /**
   * ISO 8601. `end` décide du passage dans l'historique.
   *
   * Quand `dateStatus` vaut `"a-confirmer"`, `start` n'est **pas** une date
   * réelle : c'est une borne technique qui maintient l'édition du bon côté du
   * tri tant que le mois n'est pas écoulé. Rien ne doit l'afficher ni la
   * compter — voir `countdownLabel` et `EventJsonLd`.
   */
  start: string;
  end: string;
  watermark: string;
  specs: readonly EvenementSpec[];
  /** Absent tant que le tarif n'est pas arrêté. */
  price?: {
    label: string;
    amount: string;
    currency: string;
    /** Pour les données structurées uniquement. */
    value: number;
    code: string;
  };
  /** Absent tant que le programme n'est pas arrêté. */
  programme?: readonly string[];
  /** Absent tant que la billetterie n'est pas ouverte. */
  ticket?: { href: string; label: string; host: string };
  /** Absent tant que l'affiche n'est pas prête. */
  poster?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption: string;
  };
  /** Récapitulatif d'une édition passée : galerie photo, article, album. */
  recap?: { href: string; label: string; host: string };
  /**
   * Photos prises pendant la soirée. Portées par la carte de l'édition, avec
   * un vrai texte alternatif — c'est là qu'elles sont de l'information, et non
   * dans l'anneau décoratif de l'en-tête.
   */
  photos?: {
    legende: string;
    items: readonly { src: string; width: number; height: number }[];
  };
};

/**
 * Une édition est soit datée, soit annoncée au mois — et les deux cas n'ont
 * pas les mêmes champs obligatoires.
 *
 * `"confirme"` : la date est arrêtée. Le compte à rebours tourne et l'édition
 * entre dans les données structurées.
 *
 * `"a-confirmer"` : seul le mois est connu. Ni compte à rebours, ni `startDate`
 * déclarée — on n'annonce pas une date qu'on n'a pas. En contrepartie, le
 * libellé de repli devient **obligatoire** : c'est le type qui empêche
 * d'ajouter une édition sans date en laissant un trou dans la bande et dans
 * le hero.
 */
export type Evenement =
  | (EvenementBase & { dateStatus: "confirme" })
  | (EvenementBase & {
      dateStatus: "a-confirmer";
      /** À la place du compte à rebours : le mois, en capitales mono. */
      countdownFallback: string;
      /** Le même, tel qu'une synthèse vocale doit l'entendre. */
      countdownFallbackSpoken: string;
    });

export const EVENEMENTS = {
  eyebrow: "Nos événements",
  title: "Ce qui se passe bientôt.",
  /** Le lieu n'est pas public : position assumée, pas un oubli. */
  place: "Lieu communiqué aux inscrits",
  secondaryCta: "Une question ? WhatsApp",
  ticketPrefix: "billetterie :",
  recapPrefix: "récap :",
  /** Chapeau du bloc des éditions à venir. */
  upcomingBadge: "[ À VENIR ]",
  /** Affiché quand plus aucune édition n'est à venir — jamais une section vide. */
  empty: {
    title: "La prochaine édition se prépare.",
    body: "Les prochaines éditions s'annoncent d'abord dans le groupe WhatsApp.",
  },
  /** Bloc d'historique. Il reste affiché même quand une édition est à venir. */
  past: {
    heading: "Éditions passées",
    badge: "[ PASSÉE ]",
    /** Une édition passée ne disparaît jamais : elle change seulement de bloc. */
    note: "Les éditions passées restent ici. Les photos s'ajoutent après coup.",
    /* « 8 photos » : le nombre est calculé, jamais écrit en dur — une photo
       ajoutée ne doit pas laisser un compte faux derrière elle. */
    photosPrefix: "coin photo —",
    photoAlt: "Portrait pris au coin photo de la 3e édition présentiel.",
  },
  /**
   * L'anneau d'images derrière l'en-tête de section.
   *
   * Il mêle les affiches des campagnes et les portraits du **coin photo** de
   * la 3ᵉ édition — le coin photo était au programme de la soirée, ces visages
   * sont donc la soirée elle-même. C'est ce qui fait la différence entre un
   * décor et une mémoire : l'anneau montre ce qui s'est réellement passé.
   *
   * Le bloc qui le porte est `aria-hidden` : treize images sans rôle
   * individuel n'ont rien à annoncer une par une. Les mêmes photos sont
   * reprises, elles, avec un vrai texte alternatif, dans la carte de l'édition
   * passée — c'est là qu'elles sont de l'information.
   *
   * L'ordre alterne volontairement portraits et affiches : deux portraits
   * voisins sur l'anneau se lisent comme une planche contact, pas comme une
   * constellation.
   */
  orbite: [
    { src: "/evenements/orbite/edition-3-rouge.jpeg", width: 864, height: 1080 },
    { src: "/evenements/photos/coin-photo-01.jpg", width: 720, height: 1280 },
    { src: "/evenements/orbite/loup-garou-presidentiel-1.jpeg", width: 720, height: 1080 },
    { src: "/evenements/photos/coin-photo-02.jpg", width: 720, height: 1280 },
    { src: "/evenements/photos/coin-photo-03.jpg", width: 720, height: 1280 },
    { src: "/evenements/orbite/minora-presidentiel.jpeg", width: 720, height: 1080 },
    { src: "/evenements/photos/coin-photo-04.jpg", width: 720, height: 1280 },
    { src: "/evenements/orbite/loup-garou-whatsapp.jpeg", width: 890, height: 1080 },
    { src: "/evenements/photos/coin-photo-05.jpg", width: 720, height: 1280 },
    { src: "/evenements/photos/coin-photo-06.jpg", width: 720, height: 1280 },
    { src: "/evenements/orbite/loup-garou-presidentiel-2.jpeg", width: 720, height: 960 },
    { src: "/evenements/photos/coin-photo-07.jpg", width: 720, height: 1280 },
    { src: "/evenements/photos/coin-photo-08.jpg", width: 720, height: 1280 },
  ],
  items: [
    {
      slug: "edition-4-game-party",
      seoName: "Comlan Community — 4e édition Game Party",
      badge: "[ 4E ÉDITION · GAME PARTY ]",
      dateShort: "12.26",
      alertTitle: "4E ÉDITION GAME PARTY",
      alertTitleShort: "4E ÉDITION",
      heroTitle: "4ᵉ édition Game Party",
      heroMeta: "décembre 2026 · date à confirmer",
      titleBefore: "En décembre, on remet",
      titleAccent: "le couvert",
      titleAfter: ".",
      lead: "La 4ᵉ édition se prépare. La date se confirme bientôt.",
      /* Bornes techniques, pas une date annoncée : voir `dateStatus`. Le jour
         où la date tombe, ces deux champs et `dateStatus` suffisent — le
         compte à rebours, la bande et les données structurées se rallument
         seuls. */
      start: "2026-12-01T00:00:00+01:00",
      end: "2026-12-31T23:59:59+01:00",
      dateStatus: "a-confirmer",
      countdownFallback: "DÉCEMBRE 2026",
      countdownFallbackSpoken: "en décembre 2026",
      watermark: "12.2026",
      specs: [
        { label: "[ DATE ]", value: "décembre 2026 · à confirmer" },
        { label: "[ LIEU ]", value: "communiqué aux inscrits" },
      ],
      /* Ni tarif, ni programme, ni billetterie : rien n'est arrêté. Les
         champs restent absents plutôt que remplis d'approximations. */
    },
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
      dateStatus: "confirme",
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
      photos: {
        legende: "au coin photo de la soirée",
        items: [
          { src: "/evenements/photos/coin-photo-01.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-02.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-03.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-04.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-05.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-06.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-07.jpg", width: 720, height: 1280 },
          { src: "/evenements/photos/coin-photo-08.jpg", width: 720, height: 1280 },
        ],
      },
    },
  ] satisfies readonly Evenement[],
} as const;

/* --------------------------------------------------------------------------
   Boutiques — les vitrines e-commerce réelles.

   Les URL sont exactes et vérifiées (HTTP 200). Les captures sont produites
   par tools/visual/shoot-boutiques.mjs, jamais prises à la main : une capture
   manuelle embarque la barre d'onglets de celui qui la prend.

   Ajouter une boutique = ajouter une entrée, plus son slug dans le script de
   capture. La bande s'adapte d'elle-même.
   -------------------------------------------------------------------------- */

export type Boutique = {
  slug: string;
  name: string;
  /** Forme courte pour la bande, qui tient sur une ligne en mono. */
  shortName: string;
  /** Domaine affiché sous le bouton : on annonce où mène le clic. */
  host: string;
  href: string;
  description: string;
  /** Mention de la place de marché hôte, quand la boutique en dépend. */
  note?: string;
  shots: {
    desktop: { src: string; width: number; height: number };
    mobile: { src: string; width: number; height: number };
    alt: string;
  };
};

export const BOUTIQUES = {
  eyebrow: "Nos boutiques",
  title: "Deux vitrines, un seul interlocuteur.",
  body: "Le catalogue est en ligne et à jour. Le conseil, lui, reste sur WhatsApp.",
  cta: "Visiter la boutique",
  hostPrefix: "boutique :",
  /** Nom accessible de la bande de sélection. */
  bandLabel: "Choisir une boutique",
  items: [
    {
      slug: "comlan-pc-solutions",
      /* Espace insécable avant la barre : sans elle, le retour à la ligne la
         rejette en tête de seconde ligne (« | PC & Solutions »), ce qui se lit
         comme une puce de liste. Elle reste ainsi collée à « Community ». */
      name: "Comlan Community | PC & Solutions",
      shortName: "PC & SOLUTIONS",
      host: "comlan-community-pc-solutions.biggigui.com",
      href: "https://comlan-community-pc-solutions.biggigui.com/",
      description:
        "La vitrine officielle : PC neufs et reconditionnés, choisis pour tes études, ton travail, ta création ou le gaming. Chaque fiche porte sa configuration et son prix.",
      note: "hébergée sur la place de marché Biggigui",
      shots: {
        desktop: {
          src: "/boutiques/comlan-pc-solutions-desktop.webp",
          width: 1440,
          height: 900,
        },
        mobile: {
          src: "/boutiques/comlan-pc-solutions-mobile.webp",
          width: 780,
          height: 1688,
        },
        alt: "Page d'accueil de la boutique Comlan Community | PC & Solutions, avec sa grille de PC portables et leurs prix.",
      },
    },
    {
      slug: "2g-hub",
      name: "2G HUB",
      shortName: "2G HUB",
      host: "2ghub.tech",
      href: "https://2ghub.tech/computers",
      description:
        "Notre seconde vitrine, sur sa propre boutique. Le rayon ordinateurs y rassemble les machines disponibles tout de suite, avec panier et commande en ligne.",
      shots: {
        desktop: {
          src: "/boutiques/2g-hub-desktop.webp",
          width: 1440,
          height: 900,
        },
        mobile: {
          src: "/boutiques/2g-hub-mobile.webp",
          width: 780,
          height: 1688,
        },
        alt: "Rayon ordinateurs de la boutique 2G HUB, avec les PC portables disponibles et leurs prix.",
      },
    },
  ] satisfies readonly Boutique[],
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
      { label: "Boutiques", href: "#boutiques" },
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
