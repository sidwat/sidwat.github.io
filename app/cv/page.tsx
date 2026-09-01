import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "CV" };

export default function Page() {
  return (
    <div>
      <PageHeader
        title="CV"
        intro="A full curriculum vitae, including education, roles, and publications."
      />
      <a
        href="/cv.pdf"
        className="text-accent underline underline-offset-4"
        target="_blank"
        rel="noreferrer"
      >
        Download CV (PDF)
      </a>
      <p className="mt-4 text-sm text-muted">
        Drop the file at <code>public/cv.pdf</code> to activate this link.
      </p>
    </div>
  );
}
