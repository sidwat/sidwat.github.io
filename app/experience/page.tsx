import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Experience" };

export default function Page() {
  return (
    <div>
      <PageHeader title="Experience" intro="Roles, research positions, and the work behind them." />
      <p className="text-muted">Content coming in a later phase.</p>
    </div>
  );
}
