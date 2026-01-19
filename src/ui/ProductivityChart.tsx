import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export interface ProductivityPoint {
  ts: number
  value: number
}

interface ProductivityChartProps {
  data: ProductivityPoint[]
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  const hasData = data.length >= 2

  return (
    <div className="h-full w-full relative">
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">
          Collecting data...
        </div>
      )}
      <ResponsiveContainer width="100%" height={112}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="ts" hide />
          <YAxis domain={[0, 100]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
