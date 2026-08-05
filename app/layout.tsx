import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { fontVariables } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  // Métadonnées complètes + Open Graph : phase 8.
  title: "Comlan Community — Le PC qu'il te faut. Deux pour le prix d'un.",
  description:
    "Des PC neufs et reconditionnés adaptés à ton besoin, un accompagnement réel, et une communauté qui va au-delà de la simple vente. Bénin.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col bg-encre text-craie">
        <Nav />
        {children}
        <Footer />
        {/* Grain global, purement décoratif (§6). */}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
