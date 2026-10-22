import type { Metadata } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/src/providers/query-provider";
import "./globals.css";

const siteDescription =
  "Auto gives every AI coding agent the same repository-aware system for architecture, design, implementation, QA, security, and delivery.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.buildwithauto.ai"),
  applicationName: "Auto",
  title: {
    default: "Auto | Product engineering for AI agents",
    template: "%s | Auto",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Auto",
    title: "Auto | AI coding, reliable enough for real products",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto | AI coding, reliable enough for real products",
    description: siteDescription,
  },
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
