import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts'

export interface WellnessPoint {
  ts: number
  burnout: number
  unemployment: number
}

interface WellnessChartProps {
  data: WellnessPoint[]
}

export function WellnessChart({ data }: WellnessChartProps) {
  const hasData = data.length > 0

  // Recharts needs 2+ points for a line, so duplicate single point
  const chartData = data.length === 1
    ? [data[0], { ...data[0], ts: data[0].ts + 0.001 }]
    : data

  return (
    <div className="h-full w-full relative">
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">
          Waiting for metrics…
        </div>
      )}
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 25 }}>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke="#ffffff"
            strokeOpacity={0.05}
          />
          <XAxis dataKey="ts" hide />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 9 }}
            width={20}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const point = payload[0].payload
              const secsAgo = Math.round(chartData[chartData.length - 1].ts - point.ts)
              return (
                <div className="bg-gray-900/95 border border-white/10 rounded px-2 py-1 text-xs">
                  <div className="text-gray-400">{secsAgo}s ago</div>
                  <div className="text-red-400">Burnout: {point.burnout.toFixed(1)}%</div>
                  <div className="text-amber-400">Unemployed: {point.unemployment.toFixed(1)}%</div>
                </div>
              )
            }}
            cursor={{ stroke: '#ffffff', strokeOpacity: 0.1 }}
          />
          <Line
            type="monotone"
            dataKey="burnout"
            stroke="#f87171"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="unemployment"
            stroke="#fbbf24"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
