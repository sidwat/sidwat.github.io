import { usesGalacticTheme } from "@/lib/visual-theme";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/content";
import ProjectStars from "@/components/ProjectStars";

export const dynamicParams = false;
export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  return project ? { title: project.title, description: project.points[0], alternates: { canonical: `/projects/${slug}/` } } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  return <article className="page-shell detail-page project-detail">
    <Link href="/projects/" className="quiet-link">← All projects</Link>
    {usesGalacticTheme() && <div className="project-banner" aria-hidden="true"><ProjectStars label={project.symbol} accent={project.accent} /></div>}
    <header className="page-heading"><p className="eyebrow">{project.affiliation}</p><h1 className="display mt-4">{project.title}</h1></header>
    <ul className="project-details">{project.points.map(point => <li key={point}>{point}</li>)}</ul>
  </article>;
}
