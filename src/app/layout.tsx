import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metro Escrow",
  description: "Modern, AI-native escrow platform"
};

/** Root layout: just <html><body>. Each route group brings its own chrome. */
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
