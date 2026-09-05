import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { projects } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Selected work"
        title="Projects"
        intro="Codec research at Samsung, and autonomous systems before it."
      />

      <div className="mt-12 border-t border-line">
        {projects.map((project) => (
          <section key={project.title} className="border-b border-line py-8">
            <h2 className="text-[1.375rem] leading-snug">{project.title}</h2>
            <p className="eyebrow mt-2">{project.affiliation}</p>

            <ul className="mt-4 max-w-2xl space-y-2">
              {project.points.map((point) => (
                <li
                  key={point}
                  className="prose-body relative pl-5 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-line"
                >
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
