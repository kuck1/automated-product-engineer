import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/src/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automated Product Engineer",
  description: "An opinionated, open-source Next.js reference for shipping complete product work with AI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
