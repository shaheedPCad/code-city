import { useRef, useEffect, type RefObject } from 'react'
import { createCityRenderer } from '../render/createCityRenderer'

interface CityViewportProps {
  worker: RefObject<Worker | null>
  workerReady: boolean
}

export function CityViewport({ worker, workerReady }: CityViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const receivedFirstSnapshot = useRef(false)

  useEffect(() => {
    if (!containerRef.current || !worker.current) return

    const renderer = createCityRenderer(containerRef.current)
    const w = worker.current

    const handleMessage = (e: MessageEvent) => {
      const { type, positions, flags } = e.data
      if (type === 'snapshot') {
        if (!receivedFirstSnapshot.current) {
          console.log('[CityViewport] First snapshot received')
          receivedFirstSnapshot.current = true
        }
        const positionsArray = new Float32Array(positions)
        const flagsArray = new Uint8Array(flags)
        renderer.setAgents(positionsArray, flagsArray)
      }
    }

    w.addEventListener('message', handleMessage)

    return () => {
      w.removeEventListener('message', handleMessage)
      renderer.destroy()
    }
  }, [worker, workerReady])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Status Bar - Three Column Layout */}
      <div className="shrink-0 grid grid-cols-3 items-center px-4 py-2 border-b border-white/5 relative z-10">
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

      {/* Canvas Container - takes remaining space */}
      <div ref={containerRef} className="flex-1 min-h-0 relative bg-[#080a0e]">
        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 bg-panel/70 backdrop-blur border border-white/10 rounded px-3 py-2.5 z-10">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-gray-400">Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[11px] text-gray-400">Burnout</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] text-gray-400">Unemployed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
