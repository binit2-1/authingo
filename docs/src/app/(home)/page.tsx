const page = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-fd-background flex items-center justify-center">
      <div className="w-full h-full max-w-7xl relative mx-auto flex items-center justify-center">
        
        {/* Left Scale */}
        <VerticalScales className="absolute left-0 top-0 hidden h-full min-[1281px]:block" />
        
        {/* Right Scale */}
        <VerticalScales className="absolute right-0 top-0 hidden h-full min-[1281px]:block" />

        {/* Inner Hero Container */}
        <div className="z-10 p-10 flex flex-col items-center justify-center">
        </div>

      </div>
    </section>
  )
}

const VerticalScales = ({ className }: { className?: string }) => {
  return (
    <div 
      className={`w-10 h-full border-x border-fd-border ${className || ""}`}
      style={{
        backgroundImage: "repeating-linear-gradient(315deg, var(--pattern) 0, var(--pattern) 1px, transparent 1px, transparent 50%)",
        backgroundSize: "10px 10px"
      }}
    ></div>
  )
}

export default page