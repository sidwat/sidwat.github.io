import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import {
  bio,
  education,
  publications,
  roles,
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

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
      <PageHeader
        label="Curriculum vitae"
        title="CV"
        intro="Education, roles, publications, and standards work, in one page."
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

        <Section label="Education">
          {education.map((item) => (
            <div key={item.institution} className="max-w-2xl">
              <p className="text-[1.0625rem]">{item.degree}</p>
              <p className="eyebrow mt-2">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.institution}
                  </a>
                ) : (
                  item.institution
                )}
              </p>
            </div>
          ))}
        </Section>

        <Section label="Experience">
          <ol className="space-y-6">
            {roles.map((role) => (
              <li
                key={`${role.org}-${role.start}`}
                className="grid gap-1 md:grid-cols-[7rem_1fr] md:gap-8"
              >
                <p className="eyebrow md:pt-1">
                  {new Date(role.start).getFullYear()}
                </p>
                <div className="max-w-2xl">
                  <p className="text-[1.0625rem]">{role.title}</p>
                  <p className="eyebrow mt-1.5">
                    {role.org}
                    {role.unit ? ` · ${role.unit}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="Publications">
          <ol className="space-y-6">
            {publications.map((paper) => (
              <li
                key={paper.url}
                className="grid gap-1 md:grid-cols-[7rem_1fr] md:gap-8"
              >
                <p className="eyebrow md:pt-1">{paper.year}</p>
                <div className="max-w-2xl">
                  <p className="text-[1.0625rem]">
                    <a href={paper.url} target="_blank" rel="noreferrer">
                      {paper.title}
                    </a>
                  </p>
                  <p className="eyebrow mt-1.5">{paper.venue}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="Teaching">
          <ol className="space-y-8">
            {teaching.map((course) => (
              <li key={course.title} className="max-w-2xl">
                <p className="text-[1.0625rem]">{course.title}</p>
                <p className="eyebrow mt-1.5">
                  {course.kind} · {course.venue}
                </p>
                <p className="prose-body mt-3">{course.summary}</p>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {course.topics.map((topic) => (
                    <li key={topic} className="eyebrow">
                      {topic}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  );
}
