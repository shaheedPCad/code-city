import { KpiCard } from './KpiCard'
import { AlertsFeed } from './AlertsFeed'

const kpis = [
  { label: 'Productivity', value: '78%', sublabel: 'last 60s', trend: 'stable' as const },
  { label: 'Happiness', value: '34%', sublabel: 'rolling avg', trend: 'down' as const },
  { label: 'Burnout', value: '67%', sublabel: 'last 60s', trend: 'up' as const },
  { label: 'Unemployment', value: '12.4%', sublabel: 'city-wide', trend: 'up' as const },
]

export function TelemetryPanel() {
  return (
    <aside className="bg-white/[0.02] backdrop-blur-sm border-l border-white/5 p-5 flex flex-col overflow-hidden">
      <div className="text-xs font-mono text-cyan-400/80 mb-5 tracking-wider">
        TELEMETRY
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            sublabel={kpi.sublabel}
            trend={kpi.trend}
          />
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <AlertsFeed />
      </div>
    </aside>
  )
}
