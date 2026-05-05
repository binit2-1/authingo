"use client";

import {
  LockKeyIcon,
  PaletteIcon,
  PasswordIcon,
  ShieldIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ArrowRightIcon } from "raster-react";
import { type PlaygroundIcon, playgrounds } from "@/lib/playgrounds";

const playgroundIcons: Record<PlaygroundIcon, typeof PasswordIcon> = {
  palette: PaletteIcon,
  password: PasswordIcon,
  shield: ShieldIcon,
  vault: LockKeyIcon,
};

const Page = () => {
  return (
    <div className="relative -mt-16 h-[calc(100vh+4rem)] w-full overflow-hidden bg-fd-background flex items-center justify-center">
      <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <div className="pointer-events-none fixed left-1/2 top-0 z-40 h-[calc(100vh+4rem)] w-5xl -translate-x-1/2">
          <VerticalScales className="absolute left-0 top-0 h-full w-10 border-x border-fd-border" />
          <VerticalScales className="absolute right-0 top-0 h-full w-10 border-x border-fd-border" />
        </div>

        <div className="z-10 h-full w-[calc(100%-5rem)] max-[949px]:w-full overflow-y-auto overscroll-contain flex flex-col items-center">
          <div className="w-full mt-16 flex-1 min-h-[calc(100vh-4rem)]">
            <h1 className="text-4xl sm:text-5xl tracking-tight leading-tight text-fd-foreground selection:bg-[#0763EE] selection:text-white pl-10 pt-12">
              Playground
            </h1>

            {/* Listed Examples */}
            <div className="mt-8 px-10 pb-28 sm:pb-20">
              <div className="grid border-t border-l border-fd-border grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] xl:grid-cols-4">
                {playgrounds.map((playground) => {
                  const Icon = playgroundIcons[playground.icon];

                  return (
                    <Link
                      key={playground.id}
                      href={`/playground/${playground.id}`}
                      className="group flex aspect-square flex-col justify-between overflow-hidden border-r border-b border-fd-border bg-fd-background p-5 transition-colors hover:bg-fd-muted/20 xl:p-4"
                    >
                      <div>
                        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-fd-border text-[#0763EE] transition-colors group-hover:bg-[#0763EE] group-hover:text-white xl:h-9 xl:w-9">
                          <Icon size={22} weight="duotone" />
                        </div>
                        <h2 className="min-h-14 font-pixel text-xl leading-tight text-fd-foreground xl:min-h-11 xl:text-lg">
                          {playground.title}
                        </h2>
                        <p className="-mt-2 text-sm leading-5 text-fd-muted-foreground xl:text-xs xl:leading-5">
                          {playground.description}
                        </p>
                      </div>

                      <span className="mt-4 inline-flex items-center font-mono text-xs uppercase tracking-wider text-fd-muted-foreground transition-colors group-hover:text-[#0763EE] xl:text-[0.6875rem]">
                        Open playground
                        <ArrowRightIcon
                          size={24}
                          color="currentColor"
                          strokeWidth={0.25}
                          radius={1}
                          className="ml-1"
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerticalScales = ({ className }: { className?: string }) => {
  return (
    <div
      className={className}
      style={{
        backgroundImage:
          "repeating-linear-gradient(315deg, var(--pattern) 0, var(--pattern) 1px, transparent 1px, transparent 50%)",
        backgroundSize: "10px 10px",
      }}
    />
  );
};

export default Page;
