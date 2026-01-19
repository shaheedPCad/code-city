import { useEffect, useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { CityViewport } from './CityViewport'
import { TelemetryPanel } from './TelemetryPanel'
import SimWorker from '../worker/simWorker?worker'
import type { MetricsData, WorkerToMainMessage } from '../shared/messages'

export interface Alert {
  time: string
  severity: 'critical' | 'warning' | 'info'
  message: string
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toTimeString().slice(0, 8)
}

export function AppShell() {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Create worker inside effect (not during render)
    console.log('[AppShell] Creating worker')
    const w = new SimWorker()

    const handleMessage = (e: MessageEvent<WorkerToMainMessage>) => {
      const msg = e.data
      console.log('[AppShell] Message received:', msg.type)
      if (msg.type === 'metrics') {
        console.log('[AppShell] Metrics:', msg.metrics.productivity.toFixed(1))
        setMetrics(msg.metrics)
      } else if (msg.type === 'alert') {
        const newAlert: Alert = {
          time: formatTime(msg.ts),
          severity: msg.severity,
          message: msg.message
        }
        setAlerts(prev => [newAlert, ...prev].slice(0, 50))
      }
    }

    // Attach listener IMMEDIATELY after creation (before any messages can be lost)
    w.addEventListener('message', handleMessage)

    // Signal to children that worker is ready
    setWorker(w)

    return () => {
      w.removeEventListener('message', handleMessage)
      w.terminate()
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[320px_1fr_320px]">
      <ControlPanel worker={worker} />
      <CityViewport worker={worker} />
      <TelemetryPanel metrics={metrics} alerts={alerts} />
    </div>
  )
}
