"use client"

import AsciiLock from "@/components/lock-ascii"
import { ArrowRightIcon } from "raster-react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"



const page = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false)
  const copiedTimeoutRef = useRef<number | null>(null)

  const installCommand = "npm install @authingo/react"

  const handlePlaygroundClick = () => {
    router.push('/playground');
  };

  const handleCopyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText(installCommand)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = installCommand
      textarea.setAttribute("readonly", "")
      textarea.style.position = "absolute"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    setCopied(true)
    if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current)
    copiedTimeoutRef.current = window.setTimeout(() => setCopied(false), 1000)
  }

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) window.clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  return (


    <div className="relative -mt-16 h-screen w-full overflow-visible bg-fd-background flex items-center justify-center">
      <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-0 z-40 h-[calc(100%+4rem)] w-5xl -translate-x-1/2">
          {/* Left Scale */}
          <VerticalScales className="absolute left-0 top-0 h-full w-10 border-x border-fd-border" />

          {/* Right Scale */}
          <VerticalScales className="absolute right-0 top-0 h-full w-10 border-x border-fd-border" />
        </div>

        {/* Inner Hero Container */}
        <div className="z-10 h-full w-[calc(100%-5rem)] max-[949px]:w-full p-10 flex flex-col items-center justify-center">
          {/* Badge */}
          <div className="relative z-20 w-236 h-8 -mt-20 border-y border-fd-border pointer-events-auto">
            <a
              href="https://github.com/binit2-1/authingo/tree/main/adapters/postgres"
              target="_blank"
              rel="noreferrer"
              className="h-full w-72 bg-[#0763EE] ml-10 font-pixel flex justify-center pl-4 gap-2 items-center text-white cursor-pointer pointer-events-auto"
            >
              New Adapter: Postgres
              <ArrowRightIcon size={32} color="currentColor" strokeWidth={0.25} radius={1} />
            </a>
          </div>
          <section className="size-full grid grid-cols-2 gap-8 items-center -mt-60">
            {/* Left: Content */}
            <div className="flex flex-col items-start gap-6">


              {/* Heading */}
              <h1 className="font-pixel text-5xl tracking-tight leading-tight text-fd-foreground selection:bg-[#0763EE]">
                Authentication for Go & React.
                <br />
                Minus the bloat.
              </h1>

              {/* Subtext */}
              <p className="text-fd-foreground/80 text-lg leading-relaxed max-w-md">
                A headless, developer-first engine featuring highly secure opaque tokens, automated garbage collection, and zero frontend friction.
              </p>


              {/* CLI snippet */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-fd-border bg-fd-background/80 text-sm font-mono text-fd-foreground/75 backdrop-blur">
                <span className="text-fd-muted">$</span>
                <span className="text-fd-foreground/80">{installCommand}</span>
                <button
                  className="ml-1 text-fd-foreground/70 hover:text-fd-foreground transition-colors"
                  type="button"
                  onClick={handleCopyInstallCommand}
                  aria-label={copied ? "Copied" : "Copy install command"}
                >
                  {copied ? (
                    <CheckIcon size={16} weight="bold" color="#0763EE" />
                  ) : (
                    <CopyIcon size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Right: AsciiLock */}
            <div className="flex -mt-20">
              <AsciiLock />
            </div>
          </section>
          {/* CTAs */}
          <div className="w-236 h-8 -mt-60 border-y pl-12 border-fd-border flex justify-start gap-4">
            <button className="h-full w-36 bg-[#0763EE] font-pixel flex justify-center items-center text-white cursor-pointer" onClick={handlePlaygroundClick}>
              Playground
            </button>
            <a
              href="https://www.linkedin.com/in/binitgupta"
              target="_blank"
              rel="noreferrer"
              className="h-full w-40 border border-fd-border font-pixel flex justify-center items-center text-fd-foreground gap-2 cursor-pointer"
            >
              Talk to Creator
              <ArrowRightIcon size={20} color="currentColor" strokeWidth={0.25} radius={1} />
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

const VerticalScales = ({ className }: { className?: string }) => {
  return (
    <div
      className={className}
      style={{
        backgroundImage: "repeating-linear-gradient(315deg, var(--pattern) 0, var(--pattern) 1px, transparent 1px, transparent 50%)",
        backgroundSize: "10px 10px"
      }}
    ></div>
  )
}

export default page