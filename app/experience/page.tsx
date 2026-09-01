import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Experience" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Where I have worked"
        title="Experience"
        intro="Research roles across video coding, imitation learning, and autonomous systems."
      />
      <p className="prose-body mt-12">Nothing here yet.</p>
    </div>
  );
}
