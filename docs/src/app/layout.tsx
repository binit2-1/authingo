import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { GeistPixelSquare } from "geist/font/pixel";
import React from 'react';

const inter = Inter({
  subsets: ['latin'],
});

type Props = { children: React.ReactNode };

export default function Layout({ children }: Props) {
  return (
    <html lang="en" className={`${inter.className} ${GeistPixelSquare.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
