import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import type React from "react";

type Props = { children: React.ReactNode };

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
