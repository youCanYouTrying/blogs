"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostForm, { type AdminPostRecord } from "@/components/admin/PostForm";

export default function AdminEditPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<AdminPostRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/posts/${params.id}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "加载文章失败");
        }

        if (!cancelled) {
          setPost(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "加载文章失败，请稍后重试",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      loadPost();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="border border-stone-200 bg-white px-6 py-10 text-sm text-stone-500">
          正在加载文章内容…
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="border border-red-200 bg-red-50 px-6 py-10 text-sm text-red-700">
          {error || "文章不存在"}
        </div>
      </main>
    );
  }

  return <PostForm mode="edit" initialPost={post} />;
}
