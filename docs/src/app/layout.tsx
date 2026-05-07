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
} from "@/lib/seo";

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
        width: defaultOgImage.width,
        height: defaultOgImage.height,
        alt: defaultOgImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuthInGo - Authentication for Go & React",
    description: siteDescription,
    images: [
      {
        url: absoluteUrl(defaultOgImage.path),
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
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
