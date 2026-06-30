import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { CommandPalette } from "@/components/command/CommandPalette";
import { getCommandItems } from "@/lib/commands";
import { site } from "@/lib/site";

/*
 * Type pairing (self-hosted via next/font — no layout shift, no runtime fetch):
 *  - Fraunces: a high-contrast editorial serif for display headings (the
 *    "opinionated" voice).
 *  - Inter: a neutral, legible workhorse sans for body + UI.
 *  - JetBrains Mono: labels, eyebrows, code, and the technical accents.
 */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // Only the weights we actually use, and no extra variable axes — a smaller
  // font file swaps in sooner, which improves LCP on the big serif headlines.
  weight: ["600", "700"],
  preload: true,
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: next-themes sets the class on <html> before
    // React hydrates, so the server/client class differs by design.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          {/* Skip link for keyboard / screen-reader users. */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          {/* Global ⌘K palette — items built on the server from project data. */}
          <CommandPalette items={getCommandItems()} />
        </ThemeProvider>
      </body>
    </html>
  );
}
