import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import {
  bio,
  education,
  honours,
  patents,
  publications,
  researchInterests,
  roles,
  skills,
  teaching,
} from "@/lib/content";

export const metadata: Metadata = { title: "CV" };

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="eyebrow">{label}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Two-column row: a period or identifier on the left, the entry on the right. */
function Row({
  aside,
  children,
}: {
  aside: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid gap-1 md:grid-cols-[10rem_1fr] md:gap-8">
      <p className="eyebrow md:pt-1">{aside}</p>
      <div className="max-w-2xl">{children}</div>
    </li>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item) => (
        <li key={item} className="eyebrow">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Curriculum vitae"
        title="CV"
        intro="Education, roles, publications, patents, and teaching, in one page."
      />

      <div className="mt-12">
        <a
          href="/cv.pdf"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-baseline gap-3 border border-line px-5 py-3 text-[0.9375rem] transition-colors hover:border-cb hover:text-cb"
        >
          Download the PDF
          <span aria-hidden="true" className="font-mono text-sm">
            ↓
          </span>
        </a>
      </div>

      <div className="mt-16 space-y-12">
        <Section label="About">
          <p className="prose-body max-w-2xl">
            {bio.map((part, i) =>
              part.href ? (
                <a key={i} href={part.href} target="_blank" rel="noreferrer">
                  {part.text}
                </a>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </p>
        </Section>

        <Section label="Research interests">
          <Tags items={researchInterests} />
        </Section>

        <Section label="Education">
          <ol className="space-y-6">
            {education.map((item) => (
              <Row key={item.degree} aside={item.period}>
                <p className="text-[1.0625rem]">{item.degree}</p>
                <p className="eyebrow mt-1.5">
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.institution}
                    </a>
                  ) : (
                    item.institution
                  )}
                  {item.detail ? ` · ${item.detail}` : ""}
                </p>
              </Row>
            ))}
          </ol>
        </Section>

        <Section label="Experience">
          <ol className="space-y-6">
            {roles.map((role) => (
              <Row key={`${role.org}-${role.start}`} aside={role.period}>
                <p className="text-[1.0625rem]">{role.title}</p>
                <p className="eyebrow mt-1.5">
                  {role.org}
                  {role.unit ? ` · ${role.unit}` : ""}
                </p>
              </Row>
            ))}
          </ol>
        </Section>

        <Section label="Publications">
          <ol className="space-y-6">
            {publications.map((paper) => (
              <Row key={paper.url} aside={String(paper.year)}>
                <p className="text-[1.0625rem]">
                  <a href={paper.url} target="_blank" rel="noreferrer">
                    {paper.title}
                  </a>
                </p>
                <p className="eyebrow mt-1.5">{paper.venue}</p>
              </Row>
            ))}
          </ol>
        </Section>

        <Section label="Patents">
          <ol className="space-y-6">
            {patents.map((patent) => (
              <Row key={patent.applicationNo} aside={patent.applicationNo}>
                <p className="text-[1.0625rem]">{patent.title}</p>
              </Row>
            ))}
          </ol>
        </Section>

        <Section label="Teaching">
          <ol className="space-y-6">
            {teaching.map((course) => (
              <Row key={course.title} aside={course.period}>
                <p className="text-[1.0625rem]">{course.title}</p>
                <p className="eyebrow mt-1.5">
                  {course.venue} · {course.invitedBy.toLowerCase()}
                </p>
                <ul className="mt-3 space-y-2">
                  {course.points.map((point) => (
                    <li
                      key={point}
                      className="prose-body relative pl-5 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-line"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </Row>
            ))}
          </ol>
        </Section>

        <Section label="Honours">
          <ul className="max-w-2xl space-y-2">
            {honours.map((honour) => (
              <li
                key={honour}
                className="prose-body relative pl-5 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-line"
              >
                {honour}
              </li>
            ))}
          </ul>
        </Section>

        <Section label="Tools">
          <Tags items={skills} />
        </Section>
      </div>
    </div>
  );
}
