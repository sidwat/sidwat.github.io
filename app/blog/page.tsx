import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Blog" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Writing"
        title="Blog"
        intro="Notes on compression, vision, and the occasional detour."
      />
      <p className="prose-body mt-12">Nothing here yet.</p>
    </div>
  );
}
