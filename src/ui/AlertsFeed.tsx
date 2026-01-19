import type { Alert } from './AppShell'

type Severity = 'critical' | 'warning' | 'info'

const dummyAlerts: Alert[] = [
  { time: '14:32:01', severity: 'critical', message: 'Burnout cluster detected in District 3' },
  { time: '14:31:45', severity: 'warning', message: 'Productivity up. Morale missing.' },
  { time: '14:30:12', severity: 'info', message: 'Quiet quitting wave detected' },
  { time: '14:28:33', severity: 'warning', message: 'Transit cut approved. Commute time retaliating.' },
  { time: '14:25:07', severity: 'info', message: 'Resource allocation suboptimal' },
  { time: '14:22:51', severity: 'critical', message: 'Happiness quota not met. Investigating.' },
  { time: '14:20:14', severity: 'info', message: 'Overtime normalized. Sleep optional.' },
  { time: '14:18:02', severity: 'warning', message: 'Coffee supplies critical in Sector 5' },
]

interface AlertsFeedProps {
  alerts?: Alert[]
}

const severityStyles: Record<Severity, string> = {
  critical: 'text-red-400/80',
  warning: 'text-amber-500/80',
  info: 'text-gray-500',
}

const severityIcons: Record<Severity, string> = {
  critical: '●',
  warning: '◐',
  info: '○',
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  const displayAlerts = alerts?.length ? alerts : dummyAlerts

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-sm flex flex-col h-full">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 p-3 border-b border-white/5">
        Alerts
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayAlerts.map((alert, i) => (
          <div
            key={i}
            className="px-3 py-2.5 border-b border-white/5 last:border-b-0 text-xs"
          >
            <div className="flex items-start gap-2">
              <span className={severityStyles[alert.severity]}>
                {severityIcons[alert.severity]}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] text-gray-600">{alert.time}</span>
                <p className="text-gray-300 mt-0.5 leading-tight">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
