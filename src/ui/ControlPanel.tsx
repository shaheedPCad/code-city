import { useState } from 'react'
import type { MainToWorkerMessage } from '../shared/messages'

interface ControlPanelProps {
  worker: Worker | null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-gray-500">{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-8 h-4 rounded-full transition-colors relative ${
          checked ? 'bg-cyan-500/30' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
            checked ? 'left-4 bg-cyan-400' : 'left-0.5 bg-gray-500'
          }`}
        />
      </button>
    </div>
  )
}

export function ControlPanel({ worker }: ControlPanelProps) {
  const [speed, setSpeed] = useState<1 | 2 | 4>(1)
  const [isRunning, setIsRunning] = useState(false)
  const [isOptimized, setIsOptimized] = useState(false)

  const sendMessage = (msg: MainToWorkerMessage) => {
    worker?.postMessage(msg)
  }

  const handleStart = () => {
    setIsRunning(true)
    sendMessage({ type: 'start' })
  }

  const handlePause = () => {
    setIsRunning(false)
    sendMessage({ type: 'pause' })
  }

  const handleSpeed = (s: 1 | 2 | 4) => {
    setSpeed(s)
    sendMessage({ type: 'speed', value: s })
  }

  const handleOptimize = () => {
    setIsOptimized(true)
    sendMessage({ type: 'optimizeProductivity' })
  }

  return (
    <aside className="h-full bg-white/[0.02] backdrop-blur-sm border-r border-white/5 p-5 overflow-y-auto">
      <div className="text-xs font-mono text-cyan-400/80 mb-6 tracking-wider">
        CONTROL
      </div>

      <Section title="Simulation">
        {/* Start / Pause buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleStart}
            className={`flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors ${
              isRunning
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Start
          </button>
          <button
            onClick={handlePause}
            className={`flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors ${
              !isRunning
                ? 'bg-white/10 text-gray-400'
                : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            Pause
          </button>
        </div>

        {/* Speed segmented control */}
        <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Speed</div>
        <div className="flex bg-white/5 rounded-sm p-0.5">
          {([1, 2, 4] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSpeed(s)}
              className={`flex-1 px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${
                speed === s
                  ? 'bg-white/10 text-gray-200'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              x{s}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Display">
        <Toggle label="Show Agents" defaultChecked />
        <Toggle label="Heatmap" />
      </Section>

      <Section title="Debug">
        <Toggle label="Stats Overlay" />
        <Toggle label="Grid Lines" defaultChecked />
      </Section>

      <Section title="Directives">
        <button
          onClick={handleOptimize}
          disabled={isOptimized}
          className={`w-full px-3 py-3 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors ${
            isOptimized
              ? 'bg-red-500/10 text-red-400/50 cursor-not-allowed border border-red-500/20'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
          }`}
        >
          {isOptimized ? 'PROTOCOL ACTIVE' : 'OPTIMIZE FOR PRODUCTIVITY'}
        </button>
      </Section>
    </aside>
  )
}
