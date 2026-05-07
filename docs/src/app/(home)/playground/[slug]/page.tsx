import Link from "next/link";
import { notFound } from "next/navigation";
import { PlaygroundSandbox } from "@/components/PlaygroundSandbox";
import { getPlayground, playgrounds } from "@/lib/playgrounds";

type PlaygroundPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return playgrounds.map((playground) => ({
    slug: playground.id,
  }));
}

export async function generateMetadata({ params }: PlaygroundPageProps) {
  const { slug } = await params;
  const playground = getPlayground(slug);

  if (!playground) {
    return {};
  }

  return {
    title: playground.seoMeta.title,
    description: playground.seoMeta.description,
  };
}

export default async function Page({ params }: PlaygroundPageProps) {
  const { slug } = await params;
  const playground = getPlayground(slug);

  if (!playground) notFound();

  return (
    <div className="relative -mt-16 h-[calc(100vh+4rem)] w-full overflow-hidden bg-fd-background flex items-center justify-center">
      <div className="relative mx-auto flex h-full w-full max-w-[1400px] items-center justify-center">
        <div className="pointer-events-none fixed left-1/2 top-0 z-40 h-[calc(100vh+4rem)] w-full max-w-[1400px] -translate-x-1/2">
          <VerticalScales className="absolute left-0 top-0 h-full w-10 border-x border-fd-border" />
          <VerticalScales className="absolute right-0 top-0 h-full w-10 border-x border-fd-border" />
        </div>

        <div className="z-10 h-full w-[calc(100%-5rem)] max-[949px]:w-full overflow-hidden flex flex-col items-center">
          <main className="mt-16 flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden">
            <header className="shrink-0 border-y border-fd-border px-6 py-4 sm:px-10">
              <Link
                href="/playground"
                className="text-sm font-medium text-[#0763ee] transition-colors hover:text-[#0752c6]"
              >
                Back to Playgrounds
              </Link>
              <h1 className="mt-3 font-pixel text-3xl leading-tight text-fd-foreground sm:text-4xl">
                {playground.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-fd-muted-foreground sm:text-base">
                {playground.description}
              </p>
            </header>

            <section className="flex min-h-0 flex-1">
              <div className="flex min-h-0 w-full flex-1">
                <PlaygroundSandbox sandpackConfig={playground.sandpackConfig} />
              </div>
            </section>
          </main>
        </div>
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
