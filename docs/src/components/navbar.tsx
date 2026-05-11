"use client";

import { GithubLogoIcon, List } from "@phosphor-icons/react";
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import authingoLogo from "@/assets/logo/authingo-blue.svg";
import { cn } from "@/lib/cn";

export type NavbarProps = {
  sidebarTrigger?: React.ComponentType<{
    className?: string;
    children?: React.ReactNode;
  }>;
  layout?: "home" | "docs";
};

export default function Navbar({
  sidebarTrigger: SidebarTrigger,
  layout = "home",
}: NavbarProps) {
  const isDocsLayout = layout === "docs";

  const handleGithubClick = () => {
    window.open("https://github.com/binit2-1/authingo", "_blank");
  };

  return (
    <header
      className={cn(
        isDocsLayout
          ? "sticky top-(--fd-docs-row-1) z-30 [grid-area:header] h-16"
          : "sticky top-0 z-30 w-full",
      )}
      style={
        isDocsLayout
          ? ({
              "--fd-header-height": "4rem",
              "--fd-docs-row-2": "calc(var(--fd-docs-row-1) + 4rem)",
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Full-width background with blur */}
      <div className="absolute inset-0 bg-fd-background/95 backdrop-blur" />

      <div
        className={cn(
          "relative mx-auto flex h-16 items-center border-b border-fd-border",
          isDocsLayout
            ? "max-w-(--fd-layout-width,97rem) px-4 sm:px-6"
            : "max-w-236.25 px-3 xs:px-4 sm:px-6",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 xs:gap-2 shrink-0 ml-1 xs:ml-0"
        >
          <Image
            src={authingoLogo}
            alt="Authingo"
            className="w-auto h-20 sm:h-24 md:h-24 lg:h-32"
            priority
          />
        </Link>

        {/* Show nav links on all screen sizes - not hidden on mobile */}
        <div className="flex flex-1 justify-center min-w-0 px-2">
          <nav className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-6 text-[11px] sm:text-xs md:text-sm  font-medium text-fd-foreground">
            <Link
              href="/docs"
              className="transition hover:text-fd-primary whitespace-nowrap"
            >
              Docs
            </Link>
            <Link
              href="/playground"
              className="transition hover:text-fd-primary whitespace-nowrap"
            >
              Playground
            </Link>
            <Link
              href="/changelog"
              className="transition hover:text-fd-primary whitespace-nowrap"
            >
              Changelog
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 shrink-0 ml-auto">
          <button
            type="button"
            aria-label="Open GitHub repository"
            onClick={handleGithubClick}
            className="hidden sm:block cursor-pointer shrink-0 text-fd-foreground"
          >
            <GithubLogoIcon size={16} />
          </button>
          <ThemeSwitch />
          {isDocsLayout && SidebarTrigger && (
            <>
              <SidebarTrigger className="hidden md:flex" />
              <SidebarTrigger className="p-1.5 md:hidden shrink-0">
                <List size={18} />
              </SidebarTrigger>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
