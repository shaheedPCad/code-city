interface KpiCardProps {
  label: string
  value: string | number
  sublabel?: string
  trend?: 'up' | 'down' | 'stable'
}

export function KpiCard({ label, value, sublabel, trend }: KpiCardProps) {
  const trendIndicator = trend === 'up' ? '▲' : trend === 'down' ? '▼' : null
  const trendColor = trend === 'up' ? 'text-red-400/80' : trend === 'down' ? 'text-red-400/80' : ''

  return (
    <div className="bg-white/[0.03] border border-white/5 p-3 rounded-sm">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-mono font-semibold text-gray-100">{value}</span>
        {trendIndicator && (
          <span className={`text-[10px] ${trendColor}`}>{trendIndicator}</span>
        )}
      </div>
      {sublabel && (
        <div className="text-[9px] text-gray-600 mt-1">{sublabel}</div>
      )}
    </div>
  )
}
