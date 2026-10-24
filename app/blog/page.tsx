import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PostList, { EmptyState } from "@/components/blog/PostList";
import { getAllPosts, t } from "@/lib/blog";

export const metadata: Metadata = {
  title: t("blog.meta.title"),
  description: t("blog.meta.description"),
  alternates: {
    canonical: "/blog/",
    types: { "application/rss+xml": "/blog/feed.xml" },
  },
};

export default async function Page() {
  const posts = await getAllPosts();

  return (
    <div className="page-shell detail-page">
      <PageHeader
        label={t("blog.index.label")}
        title={t("blog.index.title")}
        intro={t("blog.index.intro")}
      />
      {posts.length > 0 ? <PostList posts={posts} /> : <EmptyState />}
    </div>
  );
}
