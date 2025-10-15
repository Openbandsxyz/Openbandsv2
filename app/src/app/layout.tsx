import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  const BASE = URL ? URL.replace(/\/$/, "") : undefined;
  const projectName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME
  
  return {
    title: projectName,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    other: {
      // Per Mini Apps docs, expose fc:miniapp (not fc:frame) and use version "1"
      // https://miniapps.farcaster.xyz/docs/guides/agents-checklist
      // https://miniapps.farcaster.xyz/docs/guides/discovery
      'fc:miniapp': JSON.stringify({
        version: '1',
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: process.env.NEXT_PUBLIC_APP_BUTTON_TITLE,
          action: {
            type: 'launch_frame',
            name: projectName,
            url: BASE,
            splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
      // Per Base Cookbook (MiniKit), also include fc:frame with version "next"
      // https://docs.base.org/cookbook/minikit/add-frame-metadata#add-frame-metadata
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: process.env.NEXT_PUBLIC_APP_BUTTON_TITLE,
          action: {
            type: 'launch_frame',
            name: projectName,
            url: BASE,
            splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-center" />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}