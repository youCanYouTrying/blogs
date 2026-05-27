import type { Metadata } from "next";
import { headers } from "next/headers";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soyang Blog",
  description: "Personal blog built with Next.js 14",
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
