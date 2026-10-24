import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { patents, publications } from "@/lib/content";

export const metadata: Metadata = { title: "Publications" };

export default function Page() {
  return (
    <div className="page-shell detail-page">
      <PageHeader
        label="Papers, patents and standards"
        title="Publications"
        intro="Peer-reviewed work, filed patents, and contributions to video coding standards."
      />

      <ol className="mt-12 border-t border-line">
        {publications.map((paper) => (
          <li
            key={paper.url}
            className="grid gap-2 border-b border-line py-8 md:grid-cols-[10rem_1fr] md:gap-8"
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
              <p className="mt-4 max-w-2xl font-mono text-[0.75rem] leading-relaxed text-muted">
                {paper.citation}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="eyebrow mt-20">Patents filed</h2>

      <ol className="patent-list mt-6">
        {patents.map((patent) => (
          <li
            key={patent.applicationNo}
            className="patent-panel"
          >
            <p className="eyebrow md:pt-1">{patent.applicationNo}</p>
            <div>
              <h3 className="text-[1.375rem] leading-snug">{patent.title}</h3>
              <p className="prose-body mt-3 max-w-2xl">{patent.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
