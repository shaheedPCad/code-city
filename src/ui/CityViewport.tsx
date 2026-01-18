import { useRef, useEffect } from 'react'
import { createCityRenderer } from '../render/createCityRenderer'

export function CityViewport() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const renderer = createCityRenderer(containerRef.current)

    return () => {
      renderer.destroy()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="bg-[#080a0e] flex flex-col relative"
    >
      {/* Status Bar - Three Column Layout */}
      <div className="grid grid-cols-3 items-center px-4 py-2 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400/80 tracking-wider">CODE CITY</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-600">v0.1.0</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">
            Simulation Console
          </span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">IDLE</span>
        </div>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-sm rounded-sm px-3 py-2 border border-white/5 z-10">
        <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <span className="text-[10px] text-gray-400">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span className="text-[10px] text-gray-400">Burnout</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <span className="text-[10px] text-gray-400">Unemployed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
