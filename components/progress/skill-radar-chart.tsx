"use client"

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"

// Mock data for cognitive skills
const skillData = [
  { skill: "Critical Thinking", value: 80 },
  { skill: "Problem Solving", value: 75 },
  { skill: "Creativity", value: 65 },
  { skill: "Communication", value: 70 },
  { skill: "Collaboration", value: 85 },
  { skill: "Research", value: 60 },
]

export function SkillRadarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "#4b5563", fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Proficiency"]}
          labelStyle={{ color: "#111" }}
          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
        />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="#4f46e5"
          fill="#4f46e5"
          fillOpacity={0.6}
          animationDuration={1500}
          animationBegin={300}
          isAnimationActive={true}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
