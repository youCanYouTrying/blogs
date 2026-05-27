"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type PostCardProps = {
  post: {
    title: string;
    slug: string;
    summary: string | null;
    createdAt: string;
    category: string | null;
    tags: Array<{ id: number; name: string }>;
  };
  index: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function PostCard({ post, index }: PostCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const cardElement = cardRef.current;

    if (!cardElement) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const animation = gsap.fromTo(
      cardElement,
      {
        autoAlpha: 0,
        y: 28,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.68,
        delay: index * 0.1,
        ease: "power3.out",
        paused: true,
      },
    );

    const trigger = ScrollTrigger.create({
      trigger: cardElement,
      start: "top 84%",
      once: true,
      onEnter: () => animation.play(),
    });

    return () => {
      trigger.kill();
      animation.kill();
    };
  }, [index]);

  return (
    <article
      ref={cardRef}
      className="border-b border-stone-200 py-8 first:pt-0 last:border-b-0 last:pb-0"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-stone-500">
          {post.category ? <span>{post.category}</span> : null}
          <span>{formatDate(post.createdAt)}</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-[2rem]">
            <Link
              href={`/posts/${post.slug}`}
              className="transition-colors duration-200 hover:text-amber-800"
            >
              {post.title}
            </Link>
          </h2>

          <p className="max-w-3xl text-base leading-8 text-stone-600">
            {post.summary || "这篇文章还没有摘要，点击进入查看完整内容。"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="border border-stone-200 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-stone-600 transition-colors duration-200 hover:border-stone-300 hover:text-stone-900"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
