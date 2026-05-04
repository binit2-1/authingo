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


    <div className="relative -mt-16 h-[calc(100vh+4rem)] w-full overflow-hidden bg-fd-background flex items-center justify-center">
      <div className="relative mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <div className="pointer-events-none fixed left-1/2 top-0 z-40 h-[calc(100vh+4rem)] w-5xl -translate-x-1/2">
          {/* Left Scale */}
          <VerticalScales className="absolute left-0 top-0 h-full w-10 border-x border-fd-border" />

          {/* Right Scale */}
          <VerticalScales className="absolute right-0 top-0 h-full w-10 border-x border-fd-border" />
        </div>

        {/* Inner Hero Container */}
        <div className="z-10 h-full w-[calc(100%-5rem)] max-[949px]:w-full overflow-y-auto overscroll-contain flex flex-col items-center">
          <div className="w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-4rem)] pt-12 pb-24">
            
            {/* Top Border Block (Adapter) */}
            <div className="relative z-20 w-full border-y border-fd-border pointer-events-auto">
              <a
                href="https://github.com/binit2-1/authingo/tree/main/adapters/postgres"
                target="_blank"
                rel="noreferrer"
                className="h-10 sm:h-12 w-full sm:w-80 bg-[#0763EE] lg:ml-10 font-pixel flex justify-center lg:justify-start px-4 lg:pl-6 gap-2 items-center text-white cursor-pointer pointer-events-auto transition-opacity hover:opacity-90 mx-auto lg:mx-0"
              >
                <span className="truncate">New Adapter: Postgres</span>
                <ArrowRightIcon size={24} color="currentColor" strokeWidth={0.25} radius={1} className="shrink-0" />
              </a>
            </div>

            {/* Main Content Grid */}
            <section className="w-full max-w-5xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center px-6 lg:px-10 py-12 lg:py-20">
              
              {/* Left: Content */}
              <div className="flex flex-col items-center lg:items-start gap-6 sm:gap-8 text-center lg:text-left w-full order-last lg:order-first">
                
                {/* Heading */}
                <h1 className="font-pixel text-4xl sm:text-5xl tracking-tight leading-tight text-fd-foreground selection:bg-[#0763EE] selection:text-white">
                  Authentication for Go & React.
                  <br className="hidden lg:inline" />
                  {" "}Minus the bloat.
                </h1>

                {/* Subtext */}
                <p className="text-fd-foreground/80 text-base sm:text-lg leading-relaxed max-w-xl lg:max-w-md selection:bg-[#0763EE] selection:text-white">
                  A headless, developer-first engine featuring highly secure opaque tokens, automated garbage collection, and zero frontend friction.
                </p>

                {/* CLI snippet */}
                <div className="flex items-center justify-between w-full max-w-sm gap-2 px-4 py-2.5 sm:py-3 rounded-full border border-fd-border bg-fd-background/80 text-sm sm:text-base font-mono text-fd-foreground/75 backdrop-blur shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-fd-muted shrink-0 select-none">$</span>
                    <span className="text-fd-foreground/80 truncate selection:bg-[#0763EE] selection:text-white">{installCommand}</span>
                  </div>
                  <button
                    className="ml-1 text-fd-foreground/70 hover:text-[#0763EE] transition-colors shrink-0 p-1 cursor-pointer select-none"
                    type="button"
                    onClick={handleCopyInstallCommand}
                    aria-label={copied ? "Copied" : "Copy install command"}
                  >
                    {copied ? (
                      <CheckIcon size={18} weight="bold" color="#0763EE" />
                    ) : (
                      <CopyIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Right: AsciiLock */}
              <div className="hidden sm:flex justify-center items-center w-full h-[250px] sm:h-[350px] lg:h-[400px] order-first lg:order-last">
                <div className="w-full max-w-[400px] h-full relative">
                  <AsciiLock />
                </div>
              </div>
            </section>

            {/* Bottom Border Block (CTAs) */}
            <div className="relative z-20 w-full border-y border-fd-border flex flex-col sm:flex-row justify-center lg:justify-start lg:pl-10">
              <button 
                className="h-12 w-full sm:w-40 bg-[#0763EE] font-pixel flex justify-center items-center text-white cursor-pointer transition-opacity hover:opacity-90" 
                onClick={handlePlaygroundClick}
              >
                Playground
              </button>
              <a
                href="https://www.linkedin.com/in/binitgupta"
                target="_blank"
                rel="noreferrer"
                className="h-12 w-full sm:w-56 border-t sm:border-t-0 sm:border-l border-fd-border font-pixel flex justify-center items-center text-fd-foreground gap-2 cursor-pointer transition-colors hover:bg-fd-muted/10 backdrop-blur-sm"
              >
                Talk to Creator
                <ArrowRightIcon size={20} color="currentColor" strokeWidth={0.25} radius={1} />
              </a>
            </div>

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