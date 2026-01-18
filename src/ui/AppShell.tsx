import { useRef, useEffect, useState } from 'react'
import { ControlPanel } from './ControlPanel'
import { CityViewport } from './CityViewport'
import { TelemetryPanel } from './TelemetryPanel'
import SimWorker from '../worker/simWorker?worker'

function createWorker() {
  console.log('[AppShell] Creating worker')
  return new SimWorker()
}

export function AppShell() {
  const workerRef = useRef<Worker | null>(null)
  const [workerReady, setWorkerReady] = useState(false)

  // Lazy initialization - runs synchronously on first access
  if (workerRef.current === null) {
    workerRef.current = createWorker()
  }

  useEffect(() => {
    setWorkerReady(true)
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[320px_1fr_320px]">
      <ControlPanel worker={workerRef} />
      <CityViewport worker={workerRef} workerReady={workerReady} />
      <TelemetryPanel />
    </div>
  )
}
