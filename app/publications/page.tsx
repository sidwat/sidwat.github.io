import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { publications } from "@/lib/content";

export const metadata: Metadata = { title: "Publications" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Papers and standards"
        title="Publications"
        intro="Peer-reviewed work and contributions to video coding standards."
      />

      <ol className="mt-12 border-t border-line">
        {publications.map((paper) => (
          <li
            key={paper.url}
            className="grid gap-2 border-b border-line py-8 md:grid-cols-[7rem_1fr] md:gap-8"
          >
            <p className="eyebrow md:pt-1">
              {paper.year} · {paper.kind}
            </p>

            <div>
              <h2 className="text-[1.375rem] leading-snug">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-cb"
                >
                  {paper.title}
                </a>
              </h2>
              <p className="eyebrow mt-2">{paper.venue}</p>
              <p className="prose-body mt-3 max-w-2xl">{paper.abstract}</p>
              <p className="mt-4 max-w-2xl font-mono text-[0.75rem] leading-relaxed text-muted/80">
                {paper.citation}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
