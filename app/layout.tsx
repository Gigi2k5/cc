import type { Metadata, Viewport } from "next";

import { AlertBar } from "@/components/layout/AlertBar";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { NetworkLayer } from "@/components/three/NetworkLayer";
import { upcomingEvenements } from "@/lib/evenements";
import { fontVariables } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

const TITLE = "Comlan Community — Le PC qu'il te faut. Deux pour le prix d'un.";
const DESCRIPTION =
  "Des PC neufs et reconditionnés adaptés à ton besoin, un accompagnement réel, et une communauté qui va au-delà de la simple vente. Bénin, depuis 2022.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Comlan Community",
  keywords: [
    "PC Bénin",
    "ordinateur portable Bénin",
    "PC reconditionné",
    "PC étudiant",
    "Comlan Community",
    "deux pour le prix d'un",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_BJ",
    url: "/",
    siteName: "Comlan Community",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Comlan Community — Le PC qu'il te faut. Deux pour le prix d'un.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  // Le CRM est un outil interne : rien ici ne doit y mener ni le mentionner.
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  /* Une édition à venir change la hauteur utile du hero : le drapeau porte le
     token --alert-h, qui vaut 0 le reste de l'année. Sans lui, la bande
     pousserait le bas du hero sous la ligne de flottaison. */
  const hasUpcoming = upcomingEvenements().length > 0;

  return (
    <html lang="fr" className={`${fontVariables} h-full`}>
      <body
        data-alert={hasUpcoming ? "on" : undefined}
        className="flex min-h-full flex-col bg-encre text-craie"
      >
        {/* Réseau global : fixe, derrière toute la page. Le contenu passe
            au-dessus via z-10, et les fonds de section qui doivent le laisser
            voir sont semi-transparents. */}
        <NetworkLayer />
        <AlertBar />
        <Nav highlightEvents={hasUpcoming} />
        {children}
        <Footer />
        {/* Grain global, purement décoratif (§6). */}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
