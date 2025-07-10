"use client"

import type React from "react"

import { useState } from "react"
import { Globe, Award, TrendingUp, Clock, BarChart3, Star, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreateAssessmentModal, type Topic } from "@/components/assessment/create-assessment-modal"

export default function SocialScienceAssessmentPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sample data for Social Science assessments
  const assessments = [
    {
      id: 1,
      date: "2023-04-18",
      name: "Modern History Test",
      topic: "Modern History",
      difficulty: "Medium",
      score: 81,
      totalMarks: 100,
    },
    {
      id: 2,
      date: "2023-04-02",
      name: "Geography: Physical Features",
      topic: "Physical Geography",
      difficulty: "Easy",
      score: 93,
      totalMarks: 100,
    },
    {
      id: 3,
      date: "2023-03-22",
      name: "Civics: Indian Constitution",
      topic: "Indian Constitution",
      difficulty: "Hard",
      score: 76,
      totalMarks: 100,
    },
    {
      id: 4,
      date: "2023-03-12",
      name: "Economics Fundamentals",
      topic: "Economics",
      difficulty: "Medium",
      score: 85,
      totalMarks: 100,
    },
    {
      id: 5,
      date: "2023-02-28",
      name: "Ancient Indian History",
      topic: "Ancient History",
      difficulty: "Hard",
      score: 79,
      totalMarks: 100,
    },
  ]

  // Available topics for Social Science
  const availableTopics: Topic[] = [
    { id: "modern-history", name: "Modern History" },
    { id: "physical-geography", name: "Physical Geography" },
    { id: "indian-constitution", name: "Indian Constitution" },
    { id: "economics", name: "Economics" },
    { id: "ancient-history", name: "Ancient History" },
    { id: "medieval-history", name: "Medieval History" },
    { id: "political-science", name: "Political Science" },
    { id: "human-geography", name: "Human Geography" },
    { id: "international-relations", name: "International Relations" },
    { id: "environmental-studies", name: "Environmental Studies" },
  ]

  // Calculate statistics
  const averageScore = Math.round(
    assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length,
  )
  const totalAssessments = assessments.length
  const highestScore = Math.max(...assessments.map((assessment) => assessment.score))

  // Topic mastery data
  const topicMastery = [
    { topic: "Modern History", progress: 81 },
    { topic: "Physical Geography", progress: 93 },
    { topic: "Indian Constitution", progress: 76 },
    { topic: "Economics", progress: 85 },
    { topic: "Ancient History", progress: 79 },
  ]

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-blue-100 text-blue-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get score color based on performance
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-purple-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-600 flex items-center">
            <Globe className="mr-2" /> Social Science Assessments
          </h1>
          <p className="text-gray-600 mt-1">Track your progress and understand our world better</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700" onClick={() => setIsModalOpen(true)}>
          Take New Assessment
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-purple-600">{averageScore}%</div>
                  <TrendingUp className="ml-auto text-green-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {averageScore >= 80 ? "Excellent social awareness!" : "Keep exploring our world!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Assessments Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-purple-600">{totalAssessments}</div>
                  <BarChart3 className="ml-auto text-purple-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {totalAssessments > 3 ? "Great exploration of society!" : "Take more social science assessments!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-purple-600">{highestScore}%</div>
                  <Award className="ml-auto text-yellow-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {highestScore >= 90 ? "Outstanding social science achievement!" : "You can reach higher!"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicMastery.map((topic, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{topic.topic}</CardTitle>
                  <CardDescription>Your mastery level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-purple-600">{topic.progress}%</span>
                    <div className="flex">
                      {Array.from({ length: Math.floor(topic.progress / 20) }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      {Array.from({ length: 5 - Math.floor(topic.progress / 20) }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-gray-300" />
                      ))}
                    </div>
                  </div>
                  <Progress
                    value={topic.progress}
                    className="h-2 mb-4"
                    style={
                      {
                        backgroundColor: "rgba(147, 51, 234, 0.2)",
                        "--progress-color": "rgba(147, 51, 234, 1)",
                      } as React.CSSProperties
                    }
                  />
                  <p className="text-sm text-gray-600">
                    {topic.progress >= 90
                      ? "Excellent social science mastery!"
                      : topic.progress >= 75
                        ? "Good social understanding!"
                        : topic.progress >= 60
                          ? "Making social science progress!"
                          : "Needs more exploration"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-purple-600 border-purple-200 hover:bg-purple-50">
                    Explore {topic.topic}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Explorations</CardTitle>
              <CardDescription>Explore these areas to improve your social science skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicMastery
                  .sort((a, b) => a.progress - b.progress)
                  .slice(0, 2)
                  .map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-purple-700">{topic.topic}</h4>
                        <p className="text-sm text-gray-600">Current mastery: {topic.progress}%</p>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700">Explore Now</Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-bold text-purple-700 mb-2">Ready to explore our society and history?</h3>
            <p className="text-purple-600 mb-4">
              Take a new assessment to test your knowledge and understand our world better.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsModalOpen(true)}>
              Start New Assessment
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Your past social science assessments and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <Card key={assessment.id} className="overflow-hidden border-l-4 border-l-purple-500">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg text-purple-700">{assessment.name}</h4>
                        <div className="flex items-center mt-2 md:mt-0">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">{formatDate(assessment.date)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Topic</p>
                          <p className="font-medium">{assessment.topic}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Difficulty</p>
                          <Badge className={`${getDifficultyColor(assessment.difficulty)} font-medium`}>
                            {assessment.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Score</p>
                          <p className={`font-bold text-lg ${getScoreColor(assessment.score)}`}>
                            {assessment.score}/{assessment.totalMarks}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                          <Eye className="h-4 w-4 mr-2" />
                          View Assessment
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject="social-science"
        subjectColor="purple"
        availableTopics={availableTopics}
      />
    </div>
  )
}
