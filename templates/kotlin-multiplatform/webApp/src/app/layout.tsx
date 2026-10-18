import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../generated/tokens.css";
import "./styles.css";

export const metadata: Metadata = { title: "Parallel Product", description: "One product contract, three native surfaces." };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
