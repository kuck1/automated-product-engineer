import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/src/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automated Product Engineer",
  description: "Start with the business need, then ship native web, Android, and iOS products in parallel with shared policy and verifiable convergence.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
