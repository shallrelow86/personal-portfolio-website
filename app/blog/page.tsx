import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { ALL_POSTS_QUERY } from "@/sanity/lib/queries";
import PostCardList from "./PostCardList";
import RevealContent from "@/components/RevealContent";

export const metadata: Metadata = {
  title: "Blog",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await client.fetch(ALL_POSTS_QUERY).catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <RevealContent>
        <h1 className="text-3xl font-bold mb-10">博客</h1>
      </RevealContent>

      {posts.length === 0 ? (
        <div className="py-24 text-center text-text-muted">
          暂无文章，请在 /admin 中撰写
        </div>
      ) : (
        <PostCardList posts={posts} />
      )}
    </div>
  );
}
