import { useEffect, useState, useRef } from 'react'
import { ControlPanel } from './ControlPanel'
import { CityViewport } from './CityViewport'
import { TelemetryPanel } from './TelemetryPanel'
import SimWorker from '../worker/simWorker?worker'
import type { MetricsData, WorkerToMainMessage } from '../shared/messages'
import type { ProductivityPoint } from './ProductivityChart'
import type { WellnessPoint } from './WellnessChart'

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
  const [productivityHistory, setProductivityHistory] = useState<ProductivityPoint[]>([])
  const [wellnessHistory, setWellnessHistory] = useState<WellnessPoint[]>([])
  const [isProtocolActive, setIsProtocolActive] = useState(false)
  const startTimeRef = useRef(Date.now())

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

        // Add to ring buffer (max 120 points = 60s at 2Hz)
        const ts = (Date.now() - startTimeRef.current) / 1000
        setProductivityHistory(prev => {
          const next = [...prev, { ts, value: msg.metrics.productivity }]
          return next.length > 120 ? next.slice(-120) : next
        })

        // Wellness history (burnout + unemployment)
        setWellnessHistory(prev => {
          const next = [...prev, {
            ts,
            burnout: msg.metrics.burnout,
            unemployment: msg.metrics.unemployment
          }]
          return next.length > 120 ? next.slice(-120) : next
        })
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
      <ControlPanel worker={worker} isProtocolActive={isProtocolActive} onProtocolActivate={() => setIsProtocolActive(true)} />
      <CityViewport worker={worker} isProtocolActive={isProtocolActive} />
      <TelemetryPanel metrics={metrics} alerts={alerts} productivityHistory={productivityHistory} wellnessHistory={wellnessHistory} />
    </div>
  )
}
