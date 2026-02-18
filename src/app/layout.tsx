import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "onview.art - Turn Any Wallet Into a Gallery",
  description:
    "Instant Art Blocks galleries. Paste any wallet or ENS to create a beautiful, shareable gallery of your collection. No signup required.",
  metadataBase: new URL("https://onview.art"),
  openGraph: {
    title: "onview.art - Turn Any Wallet Into a Gallery",
    description:
      "Instant Art Blocks galleries. Paste any wallet or ENS to create a beautiful, shareable gallery of your collection. No signup required.",
    siteName: "onview.art",
    url: "https://onview.art",
  },
  twitter: {
    card: "summary_large_image",
    title: "onview.art - Turn Any Wallet Into a Gallery",
    description:
      "Instant Art Blocks galleries. Paste any wallet or ENS to create a beautiful, shareable gallery of your collection. No signup required.",
  },
  alternates: {
    canonical: "https://onview.art",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
