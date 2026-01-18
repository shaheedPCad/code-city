import { useRef } from 'react'

export function CityViewport() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="bg-[#080a0e] flex flex-col relative"
    >
      {/* Status Bar - Three Column Layout */}
      <div className="grid grid-cols-3 items-center px-4 py-2 border-b border-white/5">
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

      {/* Viewport Content */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-[9px] uppercase tracking-[0.3em] text-gray-700/50 mb-2">
            City Viewport
          </div>
          <div className="text-[9px] text-gray-700/50">
            PixiJS canvas will render here
          </div>
        </div>
        {/* Inner frame with grid texture */}
        <div
          className="absolute inset-4 border border-white/5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-sm rounded-sm px-3 py-2 border border-white/5">
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
    </div>
  )
}
