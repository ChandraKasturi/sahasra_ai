"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"

interface Subject {
  id: string
  name: string
  progress: number
  color: string
}

interface SubjectProgressChartProps {
  subjects: Subject[]
}

export function SubjectProgressChart({ subjects }: SubjectProgressChartProps) {
  // Transform data for the chart
  const data = subjects.map((subject) => ({
    name: subject.name,
    progress: subject.progress,
    color: subject.color,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Progress"]}
          labelStyle={{ color: "#111" }}
          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <Legend />
        <Bar dataKey="progress" name="Progress" animationDuration={1500} animationBegin={300} isAnimationActive={true}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
