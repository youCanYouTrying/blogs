"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type HeroSectionProps = {
  postCount: number;
};

export default function HeroSection({ postCount }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sectionElement = sectionRef.current;

    if (!sectionElement) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        return;
      }

      gsap.from("[data-hero-line]", {
        y: 26,
        autoAlpha: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger: 0.12,
      });

      gsap.from("[data-hero-meta]", {
        y: 18,
        autoAlpha: 0,
        duration: 0.62,
        delay: 0.38,
        ease: "power2.out",
      });
    }, sectionElement);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="border-b border-stone-200 pb-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
        <div className="space-y-4">
          <p
            data-hero-line
            className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500"
          >
            Soyang Blog
          </p>
          <h1
            data-hero-line
            className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.6rem]"
          >
            记录技术、产品细节，
            <br />
            也记录长期项目里的
            <br />
            节奏与判断。
          </h1>
          <p
            data-hero-line
            className="max-w-2xl text-lg leading-8 text-stone-600"
          >
            这里优先写真实开发中的取舍、前端工程经验，以及那些值得被整理下来的工作方法。页面会保持克制，但内容希望始终具体。
          </p>
        </div>

        <div
          data-hero-meta
          className="border-l border-stone-200 pl-5 text-sm leading-7 text-stone-600"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Current
          </p>
          <p className="mt-3">已发布文章 {postCount} 篇</p>
          <p>主题围绕前端工程、写作与个人项目。</p>
        </div>
      </div>
    </section>
  );
}
