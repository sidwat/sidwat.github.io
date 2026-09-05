import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { roles } from "@/lib/content";

export const metadata: Metadata = { title: "Experience" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Where I have worked"
        title="Experience"
        intro="Research roles across video coding, imitation learning, and autonomous systems."
      />

      <ol className="mt-12 border-t border-line">
        {roles.map((role) => (
          <li
            key={`${role.org}-${role.start}`}
            className="grid gap-2 border-b border-line py-8 md:grid-cols-[7rem_1fr] md:gap-8"
          >
            <p className="eyebrow md:pt-1">
              {new Date(role.start).getFullYear()}
            </p>

            <div>
              <h2 className="text-[1.375rem] leading-snug">{role.title}</h2>
              <p className="eyebrow mt-2">
                {role.org}
                {role.unit ? ` · ${role.unit}` : ""} · {role.location}
              </p>
              <p className="prose-body mt-3 max-w-2xl">{role.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
