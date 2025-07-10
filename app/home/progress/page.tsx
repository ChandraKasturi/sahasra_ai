"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, ArrowRight, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BloomsTaxonomyChart } from "@/components/progress/blooms-taxonomy-chart"
import { SubjectProgressChart } from "@/components/progress/subject-progress-chart"
import { SkillRadarChart } from "@/components/progress/skill-radar-chart"

// Mock data for progress
const subjects = [
  { id: "english", name: "English", progress: 78, color: "#4f46e5" },
  { id: "hindi", name: "Hindi", progress: 65, color: "#f97316" },
  { id: "mathematics", name: "Mathematics", progress: 82, color: "#06b6d4" },
  { id: "science", name: "Science", progress: 71, color: "#10b981" },
  { id: "social-science", name: "Social Science", progress: 59, color: "#8b5cf6" },
]

// Mock data for Bloom's taxonomy levels
const bloomsLevels = [
  { level: "Knowledge", score: 85, description: "Recalling facts and basic concepts" },
  { level: "Comprehension", score: 72, description: "Understanding ideas and concepts" },
  { level: "Application", score: 68, description: "Using information in new situations" },
  { level: "Analysis", score: 61, description: "Drawing connections among ideas" },
  { level: "Synthesis", score: 54, description: "Creating new patterns or structures" },
  { level: "Evaluation", score: 48, description: "Justifying a decision or course of action" },
]

// Mock data for recent achievements
const recentAchievements = [
  { id: 1, title: "Science Master", description: "Completed 10 science assessments", date: "2 days ago" },
  { id: 2, title: "Math Wizard", description: "Achieved 90% in algebra", date: "1 week ago" },
  { id: 3, title: "Language Expert", description: "Mastered advanced grammar", date: "2 weeks ago" },
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-brand-navy">Learning Progress</h1>
        <p className="text-gray-500">Track your learning journey and cognitive development</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md p-1 bg-gradient-to-r from-brand-navy/10 to-brand-coral/10 border border-brand-navy/20 rounded-lg shadow-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-navy data-[state=active]:to-brand-coral data-[state=active]:text-white transition-all duration-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="taxonomy"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-navy data-[state=active]:to-brand-coral data-[state=active]:text-white transition-all duration-300"
          >
            Bloom's Taxonomy
          </TabsTrigger>
          <TabsTrigger
            value="subjects"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-navy data-[state=active]:to-brand-coral data-[state=active]:text-white transition-all duration-300"
          >
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview Chart */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Your learning journey visualized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <SubjectProgressChart subjects={subjects} />
              </div>
            </CardContent>
          </Card>

          {/* Subject Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-md">
                  <div className="h-2" style={{ backgroundColor: subject.color }}></div>
                  <CardHeader className="pb-2">
                    <CardTitle>{subject.name}</CardTitle>
                    <CardDescription>Overall progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{subject.progress}%</span>
                      </div>
                      <Progress
                        value={subject.progress}
                        className="h-2"
                        style={
                          {
                            "--progress-background": subject.color,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={`/home/progress/${subject.id}`}>
                        <span>View Details</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Skill Radar Chart */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Cognitive Skills</CardTitle>
              <CardDescription>Your development across different thinking skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <SkillRadarChart />
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="bg-brand-coral/10 p-2 rounded-full">
                      <Award className="h-5 w-5 text-brand-coral" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                      <p className="text-xs text-gray-400">{achievement.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxonomy" className="space-y-6">
          {/* Bloom's Taxonomy Visualization */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Bloom's Taxonomy</CardTitle>
              <CardDescription>Your cognitive development across different levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <BloomsTaxonomyChart data={bloomsLevels} />
              </div>
            </CardContent>
          </Card>

          {/* Taxonomy Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bloomsLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-md">
                  <div
                    className="h-2"
                    style={{
                      backgroundColor: `hsl(${210 + index * 30}, 80%, 60%)`,
                    }}
                  ></div>
                  <CardHeader className="pb-2">
                    <CardTitle>{level.level}</CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mastery</span>
                        <span className="font-medium">{level.score}%</span>
                      </div>
                      <Progress
                        value={level.score}
                        className="h-2"
                        style={
                          {
                            "--progress-background": `hsl(${210 + index * 30}, 80%, 60%)`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          {/* Subject Progress Chart */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Compare your progress across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <SubjectProgressChart subjects={subjects} />
              </div>
            </CardContent>
          </Card>

          {/* Subject Cards with Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="cursor-pointer"
              >
                <Link href={`/home/progress/${subject.id}`}>
                  <Card className="overflow-hidden border-none shadow-md h-full">
                    <div className="h-2" style={{ backgroundColor: subject.color }}></div>
                    <CardHeader className="pb-2">
                      <CardTitle>{subject.name}</CardTitle>
                      <CardDescription>Detailed progress analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-500">View detailed analytics</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
