import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/src/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automated Product Engineer",
  description: "Start daily product work with business needs while an open-source engineering system handles the technical details behind the scenes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
