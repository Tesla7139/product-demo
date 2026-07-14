import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

const SITE_URL = "https://clickpost.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clickpost — Self-Service Order Editing & Upsell for Shopify",
    template: "%s · Clickpost",
  },
  description:
    "Let shoppers edit, cancel, and upgrade their own orders. Cut support tickets, validate addresses, and lift AOV with post-purchase upsells.",
  keywords: [
    "order editing",
    "Shopify",
    "post-purchase upsell",
    "address validation",
    "order cancellation",
    "ecommerce",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Clickpost — Self-Service Order Editing & Upsell",
    description:
      "Let shoppers fix their own orders. Fewer tickets, fewer failed deliveries, higher AOV.",
    siteName: "Clickpost",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clickpost — Self-Service Order Editing & Upsell",
    description: "Let shoppers fix their own orders. Fewer tickets, higher AOV.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="relative min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
