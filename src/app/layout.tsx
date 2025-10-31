import "./globals.css";
import { Metadata } from "next";
import { Providers } from "@/components/layout/providers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Story Board",
  description: "Create cinematic AI stories with frame-by-frame control."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-CN">
      <body className="bg-bg-light text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
