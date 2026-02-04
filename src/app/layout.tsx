import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "onview.art - A Beautiful Art Blocks Collection Viewer",
  description:
    "View any Art Blocks collection beautifully presented. Enter a wallet address or ENS name to explore Fidenzas, Ringers, Chromie Squiggles and more in a museum-style gallery experience.",
  metadataBase: new URL("https://onview.art"),
  openGraph: {
    title: "onview.art - A Beautiful Art Blocks Collection Viewer",
    description:
      "View any Art Blocks collection beautifully presented. Enter a wallet address or ENS name to explore generative art in a museum-style gallery experience.",
    siteName: "onview.art",
    url: "https://onview.art",
  },
  twitter: {
    card: "summary_large_image",
    title: "onview.art - A Beautiful Art Blocks Collection Viewer",
    description:
      "View any Art Blocks collection beautifully presented. Enter a wallet address or ENS name to explore generative art in a museum-style gallery experience.",
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
      </body>
    </html>
  );
}
