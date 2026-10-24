import type { Metadata } from "next";
import MeshField from "@/components/MeshField";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Sidhartha Watsa — robots, vision, and making video smaller. Two years on " +
    "next-generation video codec standards at Samsung Research; now a master's " +
    "in computer science at UC San Diego.",
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
    >
      <body className="min-h-dvh bg-ink">
        {/* Apply appearance before first paint; migrate the former ink/studio preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{if(localStorage.getItem("motion")==="paused")document.documentElement.dataset.motion="paused";t=localStorage.getItem("theme");if(t==="studio")t="light";if(t==="plate"||t==="ink")t="dark";if(t==="light"||t==="dark")localStorage.setItem("theme",t)}catch(e){}document.documentElement.dataset.theme=t==="light"||t==="dark"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"})()`,
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded focus:bg-cb focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <MeshField />
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
