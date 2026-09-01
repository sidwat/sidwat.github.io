import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return (
    <div>
      <PageHeader title="Gallery" intro="Photographs and visual work." />
      <p className="text-muted">Content coming in a later phase.</p>
    </div>
  );
}
