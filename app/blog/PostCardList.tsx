"use client";

import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/api";

export default function PostCardList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
