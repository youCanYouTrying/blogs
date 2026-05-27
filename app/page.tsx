import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PostCard from "@/components/PostCard";

type HomePost = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  createdAt: Date;
  category: string | null;
  tags: Array<{ id: number; name: string }>;
};

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

async function getPublishedPosts(): Promise<HomePost[]> {
  try {
    const { prisma } = await import("@/lib/prisma");

    return await prisma.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tags: true,
      },
    });
  } catch (error) {
    console.error("Failed to load published posts for home page", error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-28">
      <HeroSection postCount={posts.length} />

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Posts
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
              最新文章
            </h2>
          </div>
          <p className="text-sm text-stone-500">{posts.length} 篇已发布内容</p>
        </div>

        <div className="mt-8">
          {posts.length === 0 ? (
            <div className="border border-stone-200 bg-white px-6 py-10 text-sm leading-7 text-stone-500">
              还没有已发布文章。可以先去后台创建内容，首页会在文章发布后自动更新。
            </div>
          ) : (
            posts.map((post, index) => (
              <PostCard
                key={post.id}
                index={index}
                post={{
                  ...post,
                  createdAt: post.createdAt.toISOString(),
                }}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
