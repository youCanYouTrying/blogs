import type { Metadata } from "next";
import { headers } from "next/headers";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://soyang.blog";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Soyang Blog",
    template: "%s | Soyang Blog",
  },
  description: "一个关于前端工程、产品细节与长期写作的个人博客。",
  openGraph: {
    title: "Soyang Blog",
    description: "一个关于前端工程、产品细节与长期写作的个人博客。",
    url: siteUrl,
    siteName: "Soyang Blog",
    locale: "zh_CN",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? headerStore.get("next-url") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="zh-CN">
      <body className="bg-stone-50 text-stone-900">
        {isAdminRoute ? (
          children
        ) : (
          <>
            <Navbar />
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </>
        )}
      </body>
    </html>
  );
}
