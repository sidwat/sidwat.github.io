import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Photographs"
        title="Gallery"
        intro="Pictures taken away from the screen."
      />
      <p className="prose-body mt-12">Nothing here yet.</p>
    </div>
  );
}
