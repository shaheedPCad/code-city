import { ControlPanel } from './ControlPanel'
import { CityViewport } from './CityViewport'
import { TelemetryPanel } from './TelemetryPanel'

export function AppShell() {
  return (
    <div className="h-screen w-screen overflow-hidden grid grid-cols-[320px_1fr_320px]">
      <ControlPanel />
      <CityViewport />
      <TelemetryPanel />
    </div>
  )
}
