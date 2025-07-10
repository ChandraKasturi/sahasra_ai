"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Chapter {
  name: string
  progress: number
}

interface ChapterProgressChartProps {
  chapters: Chapter[]
  color?: string
}

export function ChapterProgressChart({ chapters, color = "#4f46e5" }: ChapterProgressChartProps) {
  const [chartData, setChartData] = useState<Chapter[]>([])

  useEffect(() => {
    // Animate the data loading
    const timer = setTimeout(() => {
      setChartData(chapters)
    }, 500)

    return () => clearTimeout(timer)
  }, [chapters])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickCount={6}
          tick={{ fontSize: 12 }}
          label={{
            value: "Completion (%)",
            position: "insideBottom",
            offset: -10,
            style: { textAnchor: "middle", fontSize: 12 },
          }}
        />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Completion"]}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
          }}
        />
        <Bar
          dataKey="progress"
          fill={color}
          radius={[0, 4, 4, 0]}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
