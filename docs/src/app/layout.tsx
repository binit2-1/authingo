import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Manrope } from 'next/font/google';
import { GeistPixelSquare } from "geist/font/pixel";
import React from 'react';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

type Props = { children: React.ReactNode };

export default function Layout({ children }: Props) {
  return (
    <html
      lang="en"
      className={`${manrope.className} ${manrope.variable} ${GeistPixelSquare.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
