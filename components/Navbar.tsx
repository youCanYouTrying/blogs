"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于我" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getDesktopLinkClass(isActive: boolean) {
  return [
    "relative px-2 py-2 text-sm tracking-[0.18em] transition-colors duration-200",
    "after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px",
    "after:origin-left after:bg-amber-700 after:transition-transform after:duration-200",
    isActive
      ? "text-stone-900 after:scale-x-100"
      : "text-stone-600 after:scale-x-0 hover:text-stone-900 hover:after:scale-x-100",
  ].join(" ");
}

function getMobileLinkClass(isActive: boolean) {
  return [
    "block border-b border-stone-200/70 py-3 text-sm tracking-[0.14em] transition-colors duration-200 last:border-b-0",
    isActive ? "text-amber-800" : "text-stone-700 hover:text-stone-900",
  ].join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement | null>(null);
  const scrolledRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const navElement = navRef.current;

    if (!navElement) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const animateGlass = (nextScrolled: boolean) => {
      if (nextScrolled === scrolledRef.current) {
        return;
      }

      scrolledRef.current = nextScrolled;
      setIsScrolled(nextScrolled);

      gsap.to(navElement, {
        backgroundColor: nextScrolled
          ? "rgba(250, 250, 249, 0.82)"
          : "rgba(250, 250, 249, 0)",
        duration: prefersReducedMotion ? 0 : 0.45,
        ease: "power2.out",
      });
    };

    const ctx = gsap.context(() => {
      gsap.set(navElement, {
        backgroundColor: "rgba(250, 250, 249, 0)",
      });

      gsap.fromTo(
        navElement,
        {
          y: -36,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: prefersReducedMotion ? 0 : 0.72,
          ease: "power3.out",
        },
      );
    }, navElement);

    animateGlass(window.scrollY > 24);

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        animateGlass(self.scroll() > 24);
      },
    });

    return () => {
      trigger.kill();
      ctx.revert();
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6">
      <nav
        ref={navRef}
        className={[
          "mx-auto mt-4 w-full max-w-5xl border px-4 py-3 transition-all duration-300 sm:px-6",
          isScrolled
            ? "border-stone-200/80 shadow-[0_10px_30px_rgba(28,25,23,0.06)] backdrop-blur-md"
            : "border-transparent shadow-none backdrop-blur-none",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-900 transition-colors duration-200 hover:text-amber-800"
          >
            Soyang Blog
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={getDesktopLinkClass(active)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
            className="text-sm tracking-[0.18em] text-stone-700 transition-colors duration-200 hover:text-stone-900 md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? "关闭" : "菜单"}
          </button>
        </div>

        <div
          id="mobile-nav-panel"
          className={[
            "grid overflow-hidden transition-all duration-300 ease-out md:hidden",
            isMenuOpen
              ? "mt-3 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden border-t border-stone-200/80">
            <div className="pt-2">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={getMobileLinkClass(active)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
