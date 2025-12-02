import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 家用重训 & 有氧计划助手",
  description: "基于大模型的居家重训与有氧训练计划生成器",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
