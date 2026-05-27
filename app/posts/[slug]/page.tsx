import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import TableOfContents, {
  decoratePostContent,
} from "@/components/TableOfContents";
import { prisma } from "@/lib/prisma";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://soyang.blog";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

async function getPublishedPost(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      tags: true,
    },
  });
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    return {
      title: "文章不存在",
      description: "未找到对应文章。",
    };
  }

  const description =
    post.summary ||
    `阅读《${post.title}》，了解这篇文章的完整内容与相关评论。`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `${siteUrl}/posts/${post.slug}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags.map((tag) => tag.name),
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    notFound();
  }

  const { html, headings } = decoratePostContent(post.content);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-28">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
        <article className="min-w-0">
          <header className="border-b border-stone-200 pb-8">
            <div className="space-y-4">
              {post.category ? (
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                  {post.category}
                </p>
              ) : null}

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
                {post.title}
              </h1>

              {post.summary ? (
                <p className="max-w-3xl text-lg leading-8 text-stone-600">
                  {post.summary}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-stone-500">
              <span>{formatDate(post.createdAt)}</span>
              <span>{post.views} 次阅读</span>
              {post.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full border border-stone-200 px-3 py-1 text-xs uppercase tracking-[0.14em] text-stone-600"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <div className="mt-8 lg:hidden">
            <TableOfContents headings={headings} variant="mobile" />
          </div>

          <div
            className="prose prose-neutral mt-10 max-w-none text-[1.05rem] leading-8 prose-headings:scroll-mt-28 prose-headings:font-semibold prose-a:text-amber-800 prose-a:no-underline hover:prose-a:text-amber-900 prose-blockquote:border-stone-300 prose-blockquote:text-stone-600 prose-code:text-stone-800 prose-pre:bg-stone-950 prose-pre:text-stone-100"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <CommentSection postId={post.id} />
        </article>

        <TableOfContents headings={headings} />
      </div>
    </main>
  );
}
