import { usesGalacticTheme } from "@/lib/visual-theme";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { projectPictures, projectTools } from "@/lib/project-media";
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
  const picture = projectPictures[slug];
  return <article className="page-shell detail-page project-detail">
    <Link href="/projects/" className="quiet-link">← All projects</Link>
    {usesGalacticTheme() && <div className="project-banner" aria-hidden="true"><ProjectStars label={project.symbol} accent={project.accent} /></div>}
    <header className="page-heading"><p className="eyebrow">{project.affiliation}</p><h1 className="display mt-4">{project.title}</h1></header>
    {picture && <figure className={`project-editorial-media${picture.transparent ? " project-media-transparent" : ""}${picture.diagram ? " project-media-diagram" : ""}`}>{picture.comparison && <div className="comparison-labels" aria-hidden="true"><span>Block artefacts</span><span>Clear image</span></div>}<Image src={picture.src} alt={picture.alt} width={1204} height={800} sizes="(max-width: 768px) 100vw, 900px" /><figcaption>{picture.caption ?? <>Illustrative photograph, not a project output. <Link href="/image-credits/">Image credits</Link></>}</figcaption></figure>}
    <h2 className="text-2xl font-semibold mt-10">My contribution</h2>
    <ul className="project-details">{project.points.map(point => <li key={point}>{point}</li>)}</ul>
    <section className="project-tools" aria-label="Tools and context"><h2 className="text-2xl font-semibold">Tools and context</h2><div>{(projectTools[slug] ?? []).map(tool => <a key={tool.name} href={tool.href}>{tool.name === "OpenAPV" && <Image src="/media/technology/openapv.png" alt="" width={256} height={80} />}<span>{tool.name}</span></a>)}</div></section>
  </article>;
}
