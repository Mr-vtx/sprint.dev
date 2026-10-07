import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import CommandPalette from "@/components/ui/CommandPalette";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sprint.dev: learn by building the next milestone", template: "%s · Sprint.dev" },
  description:
    "Roadmaps that say what to learn, why, and what to build to prove it. Progress stays on your device. Works offline.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Sprint.dev" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e13" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <CommandPalette />
          <ServiceWorkerRegister />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
