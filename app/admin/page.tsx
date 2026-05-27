"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AdminListPost = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  published: boolean;
  updatedAt: string;
  tags: Array<{ id: number; name: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default function AdminPage() {
  const [posts, setPosts] = useState<AdminListPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/posts?page=1&pageSize=100", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "加载文章列表失败");
        }

        if (!cancelled) {
          setPosts(data.posts ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "加载文章列表失败，请稍后重试",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(postId: number) {
    const confirmed = window.confirm("确定删除这篇文章吗？此操作不可撤销。");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(postId);
      setError("");

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "删除失败");
      }

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "删除失败，请稍后重试",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            文章管理
          </h1>
          <p className="text-sm leading-7 text-stone-600">
            在这里管理文章草稿、发布时间和正文内容。
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-stone-700"
        >
          新建文章
        </Link>
      </div>

      {error ? (
        <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-8">
        {loading ? (
          <div className="border border-stone-200 bg-white px-6 py-10 text-sm text-stone-500">
            正在加载文章列表…
          </div>
        ) : posts.length === 0 ? (
          <div className="border border-stone-200 bg-white px-6 py-10 text-sm text-stone-500">
            还没有文章，先创建第一篇内容。
          </div>
        ) : (
          <div className="divide-y divide-stone-200 border border-stone-200 bg-white">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-stone-900">
                      {post.title}
                    </h2>
                    <span
                      className={[
                        "border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                        post.published
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-stone-200 bg-stone-50 text-stone-600",
                      ].join(" ")}
                    >
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </div>

                  <p className="text-sm text-stone-500">/{post.slug}</p>

                  {post.summary ? (
                    <p className="max-w-2xl text-sm leading-7 text-stone-600">
                      {post.summary}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.12em] text-stone-500">
                    <span>更新于 {formatDate(post.updatedAt)}</span>
                    {post.tags.length ? (
                      <span>{post.tags.map((tag) => tag.name).join(" / ")}</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors duration-200 hover:border-stone-300 hover:text-stone-900"
                  >
                    编辑
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="border border-red-200 px-4 py-2 text-sm text-red-700 transition-colors duration-200 hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === post.id ? "删除中…" : "删除"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
