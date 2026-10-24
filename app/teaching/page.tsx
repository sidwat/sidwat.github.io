import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { teaching } from "@/lib/content";

export const metadata: Metadata = { title: "Teaching" };

export default function Page() {
  return (
    <div className="page-shell detail-page">
      <PageHeader
        label="Teaching and invited instruction"
        title="Teaching"
        intro="Courses and workshops I have designed and taught."
      />

      <ol className="teaching-grid mt-12">
        {teaching.map((course) => (
          <li
            key={course.title}
            className="teaching-panel"
          >
            <p className="eyebrow md:pt-1">{course.period}</p>

            <div>
              <h2 className="text-[1.375rem] leading-snug">{course.title}</h2>
              <p className="eyebrow mt-2">
                {course.venue} · {course.location}
              </p>
              <p className="eyebrow mt-1">{course.invitedBy}</p>

              <ul className="mt-4 max-w-2xl space-y-2">
                {course.points.map((point) => (
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
