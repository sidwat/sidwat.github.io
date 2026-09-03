import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

// Archivo carries a width axis, so display and body come from one superfamily
// and the width does the contrast work.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Sidhartha Watsa works on next-generation video codec standards at Samsung Research, Bangalore. Previously imitation learning at IISc and autonomous systems at IIT Kanpur.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script sets data-theme before React hydrates, so the server
    // markup deliberately does not match. Nothing else on <html> is dynamic.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivo.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh bg-ink">
        {/*
          Sets data-theme while the parser is still inside <body>, before any of
          the page is painted, so a stored studio choice never flashes through
          ink. This has to be a literal inline script: next/script's
          beforeInteractive compiles to a self.__next_s push under static
          export, which does not run until the Next bundle loads — well after
          first paint, which is the entire thing being avoided here.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="studio")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded focus:bg-cb focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Nav />
        <div id="main">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
