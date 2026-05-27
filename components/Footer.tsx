import Link from "next/link";

const socialLinks = [
  { href: "https://github.com/youCanYouTrying", label: "GitHub" },
  { href: "mailto:hello@soyang.blog", label: "Email" },
  { href: "https://x.com", label: "X" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-stone-200">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Soyang Blog. Written with patience and
          published in public.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="transition-colors duration-200 hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
