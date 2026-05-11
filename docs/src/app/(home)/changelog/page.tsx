import { changelog } from "collections/server";
import type { Metadata } from "next";
import { ArrowRightIcon } from "raster-react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Changelog",
  description:
    "Follow AuthInGo releases, React SDK updates, Postgres adapter changes, and documentation improvements.",
  path: "/changelog",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function compareVersions(a: string, b: string) {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index++) {
    const difference = (right[index] ?? 0) - (left[index] ?? 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

type ChangelogEntry = {
  body: React.ComponentType;
  date: string;
  description: string;
  logUrl?: string;
  tags?: string[];
  title: string;
  version: string;
};

export default function ChangelogPage() {
  const entries = (changelog as unknown as ChangelogEntry[]).toSorted(
    (a, b) => {
      const dateDifference =
        new Date(b.date).getTime() - new Date(a.date).getTime();

      return dateDifference || compareVersions(a.version, b.version);
    },
  );
  const latest = entries[0];

  return (
    <div className="relative -mt-16 min-h-[calc(100vh+4rem)] w-full overflow-hidden bg-fd-background flex justify-center">
      <div className="relative mx-auto flex min-h-[calc(100vh+4rem)] w-full max-w-5xl justify-center">
        <div className="pointer-events-none fixed left-1/2 top-0 z-40 h-[calc(100vh+4rem)] w-5xl -translate-x-1/2">
          <VerticalScales className="absolute left-0 top-0 h-full w-10 border-x border-fd-border" />
          <VerticalScales className="absolute right-0 top-0 h-full w-10 border-x border-fd-border" />
        </div>

        <main className="z-10 mt-16 w-[calc(100%-5rem)] max-[949px]:w-full">
          <header className="border-b border-fd-border px-6 py-12 sm:px-10 sm:py-16">
            <div className="mb-6 flex w-fit items-center border border-fd-border text-xs text-fd-muted-foreground">
              <span className="border-r border-fd-border px-3 py-2 font-pixel text-[#0763EE]">
                latest
              </span>
              <span className="px-3 py-2 font-mono">{latest.version}</span>
            </div>

            <h1 className="font-pixel text-4xl leading-tight tracking-tight text-fd-foreground selection:bg-[#0763EE] selection:text-white sm:text-5xl">
              Changelog
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-fd-muted-foreground selection:bg-[#0763EE] selection:text-white sm:text-lg">
              Product updates, package releases, and documentation improvements
              for AuthInGo.
            </p>
          </header>

          <section className="px-6 py-10 sm:px-10 sm:py-14">
            <div className="space-y-0">
              {entries.map((entry, index) => {
                const MDX = entry.body;

                return (
                  <article
                    key={entry.version}
                    className="grid gap-6 border-fd-border pb-12 last:pb-0 md:grid-cols-[11rem_1fr]"
                  >
                    <aside className="md:sticky md:top-24 md:h-fit">
                      <p className="font-mono text-sm text-fd-muted-foreground">
                        {formatDate(entry.date)}
                      </p>
                      <div className="mt-3 inline-flex border border-fd-border bg-fd-background">
                        <span className="border-r border-fd-border px-3 py-1.5 font-pixel text-xs text-[#0763EE]">
                          v
                        </span>
                        <span className="px-3 py-1.5 font-mono text-sm text-fd-foreground">
                          {entry.version}
                        </span>
                      </div>
                    </aside>

                    <div className="relative border-l border-fd-border pl-6 sm:pl-8">
                      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 bg-[#0763EE]" />
                      {index !== entries.length - 1 ? (
                        <span className="absolute -left-px top-4 h-full border-l border-fd-border" />
                      ) : null}

                      <div className="border border-fd-border bg-fd-background/80">
                        <div className="flex min-h-12 items-center justify-between border-b border-fd-border">
                          <h2 className="px-4 py-3 font-pixel text-2xl leading-tight text-fd-foreground">
                            {entry.title}
                          </h2>
                          <ArrowRightIcon
                            size={26}
                            color="#0763EE"
                            strokeWidth={0.25}
                            radius={1}
                            className="mr-4 hidden shrink-0 sm:block"
                          />
                        </div>

                        <div className="p-4 sm:p-5">
                          <p className="text-sm leading-6 text-fd-muted-foreground">
                            {entry.description}
                          </p>

                          {entry.tags && entry.tags.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {entry.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="border border-fd-border bg-fd-muted/10 px-2.5 py-1 font-mono text-xs text-fd-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {entry.logUrl ? (
                            <a
                              href={entry.logUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-5 inline-flex w-fit items-center gap-2 border border-fd-border bg-fd-muted/10 px-3 py-2 font-pixel text-xs text-[#0763EE] transition hover:border-[#0763EE]/50 hover:bg-[#0763EE]/10"
                            >
                              View git log
                              <ArrowRightIcon
                                size={14}
                                color="#0763EE"
                                strokeWidth={0.25}
                                radius={1}
                              />
                            </a>
                          ) : null}

                          <div className="changelog-mdx mt-6 text-sm leading-6 text-fd-muted-foreground">
                            <MDX />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

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
