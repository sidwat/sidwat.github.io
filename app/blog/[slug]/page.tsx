import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostHeader from "@/components/blog/PostHeader";
import PostNav from "@/components/blog/PostNav";
import Prose from "@/components/blog/Prose";
import TagList from "@/components/blog/TagList";
import {
  EMPTY_SLUG_PARAM,
  getAdjacentPosts,
  getAllPosts,
  getPost,
  t,
  type Post,
} from "@/lib/blog";
import { site } from "@/lib/site";

// Every visible post is prerendered; any other slug is the site's 404.
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getAllPosts();
  // See EMPTY_SLUG_PARAM: the export needs at least one param.
  if (posts.length === 0) return [{ slug: EMPTY_SLUG_PARAM }];
  return posts.map((post) => ({ slug: post.slug }));
}

/**
 * The site's static app/opengraph-image.png. A page that sets `openGraph` does
 * not inherit the file-based image (verified in the export), so posts without a
 * cover name it explicitly. Alt text mirrors app/opengraph-image.alt.txt.
 */
const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Sidhartha Watsa — robots, vision, and making video smaller.",
};

const permalink = (post: Pick<Post, "slug">) => `/blog/${post.slug}/`;
const absolute = (pathname: string) => new URL(pathname, site.url).toString();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const images = post.cover ? [{ url: post.cover.src, alt: post.cover.alt }] : [DEFAULT_SHARE_IMAGE];
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: permalink(post) },
    openGraph: {
      type: "article",
      url: permalink(post),
      siteName: site.name,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.url],
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images,
    },
  };
}

function jsonLd(post: Post) {
  const url = absolute(permalink(post));
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: absolute(post.cover?.src ?? "/opengraph-image.png"),
    author: { "@type": "Person", name: site.name, url: site.url },
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const { older, newer } = await getAdjacentPosts(slug);

  return (
    <article className="mx-auto max-w-5xl px-6 pb-24 pt-16">
      <script
        type="application/ld+json"
        // The serialised object only holds build-time strings; `<` is escaped
        // so no value can close the script element (02 §5.4 (b)).
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(post)).replace(/</g, "\\u003c"),
        }}
      />

      <PostHeader post={post} />

      {post.cover && (
        // A plain <img>: images are unoptimised under static export anyway, and
        // the box is reserved by the aspect ratio, so there is no layout shift.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover.src}
          alt={post.cover.alt}
          fetchPriority="high"
          decoding="async"
          className="post-cover mt-10"
        />
      )}

      <Prose html={post.html} />

      <footer className="mt-16 border-t border-line">
        <TagList tags={post.tags} />
        <div className="grid gap-2 border-b border-line py-6 md:grid-cols-[10rem_1fr] md:items-center md:gap-8">
          <p className="eyebrow">{t("blog.post.reply.label")}</p>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1">
            <p className="prose-body">{t("blog.post.reply.body")}</p>
            <Link href="/contact/" className="text-link">
              {t("blog.post.reply.cta")}
              <span aria-hidden="true" className="font-mono">
                {"\u00a0→"}
              </span>
            </Link>
          </div>
        </div>
        <PostNav older={older} newer={newer} />
      </footer>
    </article>
  );
}
