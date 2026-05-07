import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AuthInGo Playground",
  description:
    "Try live AuthInGo authentication examples with editable React code, server-owned cookie sessions, and a Go demo backend.",
  path: "/playground",
});

export default function PlaygroundLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
