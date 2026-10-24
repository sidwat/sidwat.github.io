import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import { projects, bio, education, researchInterests, honours } from "@/lib/content";
import { nav } from "@/lib/site";

const projectPictures = [
  {src:"/media/projects/landscape.jpg",alt:"Alpine landscape used as an illustrative image-processing sample"},
  {src:"/media/projects/compression.jpg",alt:"Bird photograph comparing original detail and JPEG compression artifacts"},
  {src:"/media/projects/flower.jpeg",alt:"Colorful flower painting used as an illustrative compression sample"},
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="home-work page-shell" aria-labelledby="selected-work">
        <div className="section-heading"><h2 id="selected-work">Selected work</h2><Link href="/projects/" className="quiet-link">Projects <span aria-hidden="true">→</span></Link></div>
        <div className="work-grid">{projects.slice(0, 3).map((project, index) => <article className="work-card" key={project.title}>
          <Link href={`/projects/#project-${index + 1}`} className="project-photo" aria-label={`Illustrative image — view ${project.title}`}><Image src={projectPictures[index].src} alt={projectPictures[index].alt} width={640} height={360} sizes="(max-width: 768px) 100vw, 33vw"/><span>Illustrative image</span></Link>
          <div className="work-card-body"><p className="eyebrow">{project.affiliation}</p><h3><Link href={`/projects/#project-${index + 1}`}>{project.title}<span className="sr-only"> — view project</span></Link></h3><p className="prose-body">{project.points[0]}</p><Link href={`/projects/#project-${index + 1}`} className="quiet-link">Projects <span aria-hidden="true">→</span></Link></div>
        </article>)}</div>
      </section>
      <div className="page-shell">
        <section className="home-content"><h2>Research interests</h2><div className="interest-tags">{researchInterests.map(item=><span key={item}>{item}</span>)}</div></section>
        <section className="home-content"><h2>About me</h2><p className="prose-body max-w-4xl">{bio.map((segment,index)=>segment.href?<a key={index} href={segment.href}>{segment.text}</a>:<span key={index}>{segment.text}</span>)}</p></section>
        <section className="home-content"><h2>Education</h2><div className="education-grid">{education.map(item=><article className="institution-card" key={item.degree}>
          <a href={item.href} aria-label={`Visit ${item.institution}`}><Image src={item.institution.includes("San Diego")?"/media/institutions/ucsd.jpg":"/media/institutions/iit-kanpur.jpg"} alt={item.institution.includes("San Diego")?"Geisel Library at UC San Diego":"Campus building at IIT Kanpur"} width={640} height={360} sizes="(max-width: 768px) 100vw, 33vw"/></a>
          <div className="institution-copy"><p className="eyebrow">{item.period}</p><h3><a href={item.href}>{item.institution} <span aria-hidden="true">↗</span></a></h3><p>{item.degree}</p>{item.detail&&<p>{item.detail}</p>}</div>
        </article>)}</div></section>
        <section className="home-content"><h2>Recognition</h2><ul className="space-y-3">{honours.map(item=><li key={item} className="prose-body">{item}</li>)}</ul></section>
        <p className="mt-8"><Link className="quiet-link text-xs" href="/image-credits/">Image credits</Link></p>
      </div>
      <section className="home-sections page-shell">
        <h2 className="eyebrow">Sections</h2>
        <ul className="mt-8 border-t border-line">
          {nav
            .filter((item) => item.href !== "/")
            .map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  className="group flex items-baseline justify-between gap-6 py-5 transition-colors hover:text-cb"
                >
                  <span className="display text-[clamp(1.5rem,4vw,2.25rem)]">
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm text-muted transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
