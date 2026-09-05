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
            className="grid gap-2 border-b border-line py-8 md:grid-cols-[10rem_1fr] md:gap-8"
          >
            <p className="eyebrow md:pt-1">{role.period}</p>

            <div>
              <h2 className="text-[1.375rem] leading-snug">{role.title}</h2>
              <p className="eyebrow mt-2">
                {role.org}
                {role.unit ? ` · ${role.unit}` : ""} · {role.location}
              </p>

              <ul className="mt-4 max-w-2xl space-y-2">
                {role.points.map((point) => (
                  <li
                    key={point}
                    className="prose-body relative pl-5 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-line"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
