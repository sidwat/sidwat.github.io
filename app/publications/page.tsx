import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Publications" };

export default function Page() {
  return (
    <div>
      <PageHeader title="Publications" intro="Papers, preprints, and standards contributions." />
      <p className="text-muted">Content coming in a later phase.</p>
    </div>
  );
}
