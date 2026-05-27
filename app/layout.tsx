import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soyang Blog",
  description: "Personal blog built with Next.js 14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
