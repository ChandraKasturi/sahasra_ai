"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BloomsTaxonomyLevel {
  level: string
  score: number
  description: string
}

interface BloomsTaxonomyChartProps {
  data: BloomsTaxonomyLevel[]
}

export function BloomsTaxonomyChart({ data }: BloomsTaxonomyChartProps) {
  // Add color to each data point
  const chartData = data.map((item, index) => ({
    ...item,
    color: `hsl(${210 + index * 30}, 80%, 60%)`,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="level" width={100} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Mastery"]}
          labelStyle={{ color: "#111" }}
          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <Bar dataKey="score" nameKey="level" animationDuration={1500} animationBegin={300} isAnimationActive={true}>
          {chartData.map((entry, index) => (
            <CellComponent key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Add Cell component for custom colors
function CellComponent({ fill, ...props }: { fill: string; [key: string]: any }) {
  return <rect {...props} fill={fill} />
}
