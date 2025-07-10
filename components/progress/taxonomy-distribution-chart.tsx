"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface BloomsTaxonomyLevel {
  level: string
  score: number
  description: string
}

interface TaxonomyDistributionChartProps {
  data: BloomsTaxonomyLevel[]
  color?: string
}

export function TaxonomyDistributionChart({ data, color = "#4f46e5" }: TaxonomyDistributionChartProps) {
  const [chartData, setChartData] = useState<BloomsTaxonomyLevel[]>([])

  useEffect(() => {
    // Animate the data loading
    const timer = setTimeout(() => {
      setChartData(data)
    }, 500)

    return () => clearTimeout(timer)
  }, [data])

  // Generate colors based on the main color with different opacities
  const getColors = () => {
    return chartData.map((_, index) => {
      const opacity = 1 - index * 0.1
      return `${color}${Math.floor(opacity * 100)}`
    })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          innerRadius={60}
          paddingAngle={2}
          dataKey="score"
          nameKey="level"
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColors()[index]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}%`, "Mastery"]}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontSize: "12px",
          }}
        />
        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "12px" }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
