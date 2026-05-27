"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/admin/Editor";

type PostTag = {
  id: number;
  name: string;
};

export type AdminPostRecord = {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  category: string | null;
  published: boolean;
  tags: PostTag[];
};

type PostFormProps = {
  mode: "create" | "edit";
  initialPost?: AdminPostRecord | null;
};

function slugifyTitle(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^0-9A-Za-z\u4e00-\u9fa5\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function PostForm({ mode, initialPost = null }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!initialPost) {
      return;
    }

    setTitle(initialPost.title);
    setSlug(initialPost.slug);
    setSummary(initialPost.summary ?? "");
    setCategory(initialPost.category ?? "");
    setCoverImage(initialPost.coverImage ?? "");
    setTags(initialPost.tags.map((tag) => tag.name).join(", "));
    setContent(initialPost.content || "<p></p>");
    setPublished(initialPost.published);
    setSlugTouched(true);
  }, [initialPost]);

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);

    if (!slugTouched) {
      setSlug(slugifyTitle(nextTitle));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nextTags = tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || null,
      category: category.trim() || null,
      coverImage: coverImage.trim() || null,
      content,
      published,
      tags: nextTags,
    };

    if (!payload.title || !payload.slug || !payload.content) {
      setError("标题、slug 和正文内容不能为空");
      return;
    }

    const endpoint =
      mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${initialPost?.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      setIsSubmitting(true);

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存失败");
      }

      router.push("/admin");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "保存失败，请稍后重试",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl px-6 pb-20 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Admin
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {mode === "create" ? "新建文章" : "编辑文章"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="border border-stone-200 px-4 py-2 text-sm text-stone-700 transition-colors duration-200 hover:border-stone-300 hover:text-stone-900"
          >
            返回列表
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "保存中…" : mode === "create" ? "发布文章" : "保存修改"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="border border-stone-200 bg-white p-6">
            <div className="grid gap-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">标题</span>
                <input
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="输入文章标题"
                  className="w-full border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">Slug</span>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  placeholder="article-slug"
                  className="w-full border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">摘要</span>
                <textarea
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  rows={4}
                  placeholder="一句话概括这篇文章"
                  className="w-full resize-y border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
                />
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-700">
                正文编辑器
              </h2>
              <span className="text-xs text-stone-500">
                支持图片上传、链接、代码块和常用排版
              </span>
            </div>
            <Editor value={content} onChange={setContent} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-stone-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-700">
              发布设置
            </h2>
            <div className="mt-5 space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">分类</span>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="例如：随笔、技术"
                  className="w-full border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  封面图链接
                </span>
                <input
                  value={coverImage}
                  onChange={(event) => setCoverImage(event.target.value)}
                  placeholder="/uploads/2026-05/cover.webp"
                  className="w-full border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-700">标签</span>
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="React, Next.js, Prisma"
                  className="w-full border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
                />
              </label>

              <label className="flex items-center justify-between border border-stone-200 px-4 py-3">
                <div className="space-y-1">
                  <span className="block text-sm font-medium text-stone-800">
                    发布状态
                  </span>
                  <span className="text-xs text-stone-500">
                    关闭时仅保存在后台，前台不展示
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPublished((current) => !current)}
                  className={[
                    "relative h-7 w-12 rounded-full transition-colors duration-200",
                    published ? "bg-amber-700" : "bg-stone-300",
                  ].join(" ")}
                  aria-pressed={published}
                >
                  <span
                    className={[
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform duration-200",
                      published ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
              </label>

              {coverImage ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                    封面预览
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="封面预览"
                    className="w-full border border-stone-200 object-cover"
                  />
                </div>
              ) : null}
            </div>
          </section>

          {error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
