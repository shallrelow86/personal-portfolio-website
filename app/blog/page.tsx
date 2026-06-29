import { Metadata } from "next";
import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { fetchApi, type Post } from "@/lib/api";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await fetchApi<Post[]>("/api/posts");

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-10">Blog</h1>
        {!posts || posts.length === 0 ? (
          <p className="font-mono text-sm text-text-muted text-center py-24">暂无文章</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
