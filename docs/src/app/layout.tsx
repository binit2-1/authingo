import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import type React from "react";
import {
  absoluteUrl,
  defaultOgImage,
  siteDescription,
  siteKeywords,
  siteName,
  siteUrl,
  twitterCreator,
  twitterSite,
} from "@/lib/seo";
import Script from "next/dist/client/script";

type Props = { children: React.ReactNode };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "AuthInGo - Authentication for Go & React",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: "Binit Gupta", url: "https://github.com/binit2-1" }],
  creator: "Binit Gupta",
  publisher: siteName,
  category: "Developer Tools",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "AuthInGo - Authentication for Go & React",
    description: siteDescription,
    url: absoluteUrl("/"),
    siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: absoluteUrl(defaultOgImage.path),
        secureUrl: absoluteUrl(defaultOgImage.path),
        width: defaultOgImage.width,
        height: defaultOgImage.height,
        type: defaultOgImage.type,
        alt: defaultOgImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    ...(twitterSite ? { site: twitterSite } : {}),
    ...(twitterCreator ? { creator: twitterCreator } : {}),
    title: "AuthInGo - Authentication for Go & React",
    description: siteDescription,
    images: [
      {
        url: absoluteUrl(defaultOgImage.path),
        width: defaultOgImage.width,
        height: defaultOgImage.height,
        type: defaultOgImage.type,
        alt: defaultOgImage.alt,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export default function Layout({ children }: Props) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${GeistSans.variable} ${GeistPixelSquare.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="6d4cb90f-54af-4171-ae1b-9f71832d47be"
          strategy="afterInteractive"
        />
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
