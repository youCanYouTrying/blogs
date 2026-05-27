"use client";

import { useEffect, useState } from "react";

type CommentItem = {
  id: number;
  nickname: string;
  content: string;
  createdAt: string;
};

type CommentSectionProps = {
  postId: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/comments?postId=${postId}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "加载评论失败");
        }

        if (!cancelled) {
          setComments(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "加载评论失败，请稍后重试",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("昵称不能为空");
      return;
    }

    if (!content.trim()) {
      setError("评论内容不能为空");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          nickname: nickname.trim(),
          content: content.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "发表评论失败");
      }

      setComments((currentComments) => [data, ...currentComments]);
      setContent("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "发表评论失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-20 border-t border-stone-200 pt-10">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Comments
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
          评论区
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-stone-600">
          无需登录，填写昵称即可留言。评论会在敏感词校验通过后立即展示。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 border border-stone-200 bg-white p-5 sm:p-6"
      >
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700">昵称</span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={50}
              placeholder="你的称呼"
              className="w-full border border-stone-300 px-4 py-3 text-sm text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-700">评论内容</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={500}
              rows={5}
              placeholder="写下你的想法…"
              className="w-full resize-y border border-stone-300 px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition-colors duration-200 focus:border-stone-500"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              {content.length}/500 字
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "提交中…" : "发表评论"}
            </button>
          </div>

          {error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </form>

      <div className="mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-700">
            最新评论
          </h3>
          <span className="text-xs text-stone-500">{comments.length} 条</span>
        </div>

        {loading ? (
          <div className="border border-stone-200 bg-white px-5 py-6 text-sm text-stone-500">
            正在加载评论…
          </div>
        ) : comments.length === 0 ? (
          <div className="border border-stone-200 bg-white px-5 py-6 text-sm text-stone-500">
            还没有评论，欢迎留下第一条留言。
          </div>
        ) : (
          <div className="divide-y divide-stone-200 border border-stone-200 bg-white">
            {comments.map((comment) => (
              <article key={comment.id} className="px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-sm font-semibold text-stone-900">
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-stone-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                  {comment.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
