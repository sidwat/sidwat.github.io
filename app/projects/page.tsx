import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <div>
      <PageHeader title="Projects" intro="Things I have built, in research and outside it." />
      <p className="text-muted">Content coming in a later phase.</p>
    </div>
  );
}
