import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAInitializer from '@/components/PWAInitializer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "水分補給トラッカー - Hydration Tracker",
  description: "健康的な水分補給習慣を身につけるためのトラッカーアプリ。記録、統計、リマインダー機能付き",
  keywords: ["水分補給", "健康", "トラッカー", "習慣", "リマインダー", "統計"],
  authors: [{ name: "Hydration Tracker Team" }],
  creator: "Hydration Tracker",
  publisher: "Hydration Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "水分補給",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    title: "水分補給トラッカー",
    description: "健康的な水分補給習慣を身につけよう",
    siteName: "Hydration Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "水分補給トラッカー",
    description: "健康的な水分補給習慣を身につけよう",
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="水分補給" />
        <meta name="application-name" content="水分補給トラッカー" />
        <meta name="msapplication-TileColor" content="#1d4ed8" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAInitializer />
        {children}
      </body>
    </html>
  );
}
