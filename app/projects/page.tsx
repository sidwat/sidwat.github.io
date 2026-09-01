import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Things I have built"
        title="Projects"
        intro="Side work and research prototypes, mostly in vision and robotics."
      />
      <p className="prose-body mt-12">Nothing here yet.</p>
    </div>
  );
}
