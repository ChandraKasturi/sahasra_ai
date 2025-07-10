"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for time progress
const timeData = [
  { date: "Jan", score: 45 },
  { date: "Feb", score: 52 },
  { date: "Mar", score: 58 },
  { date: "Apr", score: 65 },
  { date: "May", score: 72 },
  { date: "Jun", score: 78 },
  { date: "Jul", score: 85 },
]

interface TimeProgressChartProps {
  color?: string
}

export function TimeProgressChart({ color = "#4f46e5" }: TimeProgressChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Animate the data loading
    const timer = setTimeout(() => {
      setChartData(timeData)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis
          domain={[0, 100]}
          tickCount={6}
          tick={{ fontSize: 12 }}
          label={{
            value: "Progress Score",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle", fontSize: 12 },
          }}
        />
        <Tooltip
          formatter={(value) => [`${value}`, "Score"]}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={3}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: color }}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
