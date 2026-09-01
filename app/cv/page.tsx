import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "CV" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Curriculum vitae"
        title="CV"
        intro="Education, roles, publications, and standards work, in one page."
      />
      <div className="mt-12">
        <a
          href="/cv.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-baseline gap-3 border border-line px-5 py-3 text-[0.9375rem] transition-colors hover:border-cb hover:text-cb"
        >
          Download the PDF
          <span aria-hidden="true" className="font-mono text-sm">
            ↓
          </span>
        </a>
        <p className="eyebrow mt-5">Add public/cv.pdf to activate this link</p>
      </div>
    </div>
  );
}
