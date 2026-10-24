import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { projects } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return (
    <div className="page-shell detail-page">
      <PageHeader
        label="Selected work"
        title="Projects"
        intro="Codec research at Samsung, and autonomous systems before it."
      />

      <div className="project-grid mt-12">
        {projects.map((project, index) => (
          <section id={`project-${index + 1}`} key={project.title} className="project-panel">
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
