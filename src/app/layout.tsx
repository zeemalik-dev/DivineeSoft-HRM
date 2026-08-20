import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: "Divineesoft HRM — People, Payroll & Projects",
  description: "HRM, payroll, employee portal and project management console for Divineesoft Technologies.",
  icons: { icon: "/logo-mark.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0A4BF1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Loaded by link rather than next/font so the project builds in offline
            CI too. Every family has a system fallback in globals.css. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
