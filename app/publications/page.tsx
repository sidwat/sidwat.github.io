import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Publications" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Papers and standards"
        title="Publications"
        intro="Peer-reviewed work and contributions to video coding standards."
      />
      <p className="prose-body mt-12">Nothing here yet.</p>
    </div>
  );
}
