import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return (
    <div className="page-shell detail-page">
      <PageHeader
        label="Photographs"
        title="Gallery"
        intro="Pictures taken away from the screen."
      />
      <p className="prose-body mt-12">Nothing here yet.</p>
    </div>
  );
}
