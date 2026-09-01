import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Blog" };

export default function Page() {
  return (
    <div>
      <PageHeader title="Blog" intro="Notes on vision, codecs, robotics, and whatever else holds my attention." />
      <p className="text-muted">Content coming in a later phase.</p>
    </div>
  );
}
