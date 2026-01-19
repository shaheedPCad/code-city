import { KpiCard } from './KpiCard'
import { AlertsFeed } from './AlertsFeed'
import type { MetricsData } from '../shared/messages'
import type { Alert } from './AppShell'

interface TelemetryPanelProps {
  metrics: MetricsData | null
  alerts: Alert[]
}

function getTrend(value: number, thresholdHigh: number, thresholdLow: number): 'up' | 'down' | 'stable' {
  if (value > thresholdHigh) return 'up'
  if (value < thresholdLow) return 'down'
  return 'stable'
}

export function TelemetryPanel({ metrics, alerts }: TelemetryPanelProps) {
  const kpis = metrics
    ? [
        {
          label: 'Productivity',
          value: `${metrics.productivity.toFixed(1)}%`,
          sublabel: 'live',
          trend: getTrend(metrics.productivity, 90, 60)
        },
        {
          label: 'Happiness',
          value: `${metrics.happiness.toFixed(1)}%`,
          sublabel: 'live',
          trend: getTrend(metrics.happiness, 70, 40)
        },
        {
          label: 'Burnout',
          value: `${metrics.burnout.toFixed(1)}%`,
          sublabel: 'live',
          trend: getTrend(metrics.burnout, 30, 15) // inverted - high is bad
        },
        {
          label: 'Unemployment',
          value: `${metrics.unemployment.toFixed(1)}%`,
          sublabel: 'city-wide',
          trend: getTrend(metrics.unemployment, 10, 5) // inverted - high is bad
        },
      ]
    : [
        { label: 'Productivity', value: '--', sublabel: 'waiting', trend: 'stable' as const },
        { label: 'Happiness', value: '--', sublabel: 'waiting', trend: 'stable' as const },
        { label: 'Burnout', value: '--', sublabel: 'waiting', trend: 'stable' as const },
        { label: 'Unemployment', value: '--', sublabel: 'waiting', trend: 'stable' as const },
      ]

  return (
    <aside className="h-full bg-white/[0.02] backdrop-blur-sm border-l border-white/5 p-5 flex flex-col overflow-hidden">
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
        <AlertsFeed alerts={alerts} />
      </div>
    </aside>
  )
}
