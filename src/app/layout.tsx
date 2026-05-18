import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metro Escrow",
  description: "Modern, AI-native escrow platform"
};

/**
 * Inline theme script. Runs synchronously before paint so the right
 * theme class is applied to <html> immediately — no flash of wrong theme.
 */
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var saved = localStorage.getItem('metro-escrow:theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
