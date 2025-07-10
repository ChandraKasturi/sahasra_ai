"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Atom, Award, TrendingUp, Clock, BarChart3, Star, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreateAssessmentModal, type Topic } from "@/components/assessment/create-assessment-modal"
import { getAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

export default function ScienceAssessmentPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Fetch real assessment history for the past week
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const oneWeekAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        const authToken = getAuthToken()
        const res = await fetch(
          buildApiUrl(`${API_ENDPOINTS.ASSESSMENTS}?subject=science`),
          {
            headers: { "x-auth-session": authToken || "" }
          }
        )
        const data = await res.json()
        const items = Array.isArray(data) ? data : [data]
        setHistoryItems(items)
      } catch (error) {
        console.error("Error fetching history:", error)
      } finally {
        setLoadingHistory(false)
      }
    }
    fetchHistory()
  }, [])

  // Sample data for Science assessments
  const assessments = [
    {
      id: 1,
      date: "2023-04-15",
      name: "Chemical Reactions Test",
      topic: "Chemical Reactions",
      difficulty: "Medium",
      score: 88,
      totalMarks: 100,
    },
    {
      id: 2,
      date: "2023-03-30",
      name: "Physics Fundamentals",
      topic: "Multiple",
      difficulty: "Hard",
      score: 79,
      totalMarks: 100,
    },
    {
      id: 3,
      date: "2023-03-20",
      name: "Biology: Human Systems",
      topic: "Human Physiology",
      difficulty: "Medium",
      score: 92,
      totalMarks: 100,
    },
    {
      id: 4,
      date: "2023-03-10",
      name: "Electricity and Magnetism",
      topic: "Electricity",
      difficulty: "Hard",
      score: 75,
      totalMarks: 100,
    },
    {
      id: 5,
      date: "2023-02-25",
      name: "Environmental Science",
      topic: "Ecology",
      difficulty: "Easy",
      score: 94,
      totalMarks: 100,
    },
  ]

  // Available topics for Science
  const availableTopics: Topic[] = [
    { id: "chemical-reactions", name: "Chemical Reactions" },
    { id: "physics", name: "Physics" },
    { id: "human-physiology", name: "Human Physiology" },
    { id: "electricity", name: "Electricity" },
    { id: "ecology", name: "Ecology" },
    { id: "mechanics", name: "Mechanics" },
    { id: "optics", name: "Optics" },
    { id: "thermodynamics", name: "Thermodynamics" },
    { id: "genetics", name: "Genetics" },
    { id: "periodic-table", name: "Periodic Table" },
    { id: "magnetism", name: "Magnetism" },
  ]

  // Calculate statistics
  const averageScore = Math.round(
    assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length,
  )
  const totalAssessments = assessments.length
  const highestScore = Math.max(...assessments.map((assessment) => assessment.score))

  // Topic mastery data
  const topicMastery = [
    { topic: "Chemical Reactions", progress: 88 },
    { topic: "Physics", progress: 79 },
    { topic: "Human Physiology", progress: 92 },
    { topic: "Electricity", progress: 75 },
    { topic: "Ecology", progress: 94 },
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
    if (score >= 75) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-600 flex items-center">
            <Atom className="mr-2" /> Science Assessments
          </h1>
          <p className="text-gray-600 mt-1">Track your progress and explore the world of science</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700" onClick={() => setIsModalOpen(true)}>
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
                  <div className="text-4xl font-bold text-green-600">{averageScore}%</div>
                  <TrendingUp className="ml-auto text-green-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {averageScore >= 80 ? "Excellent scientific understanding!" : "Keep exploring science!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Assessments Taken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-green-600">{totalAssessments}</div>
                  <BarChart3 className="ml-auto text-green-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {totalAssessments > 3 ? "Great scientific curiosity!" : "Take more science assessments!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-green-600">{highestScore}%</div>
                  <Award className="ml-auto text-yellow-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {highestScore >= 90 ? "Outstanding scientific achievement!" : "You can reach higher!"}
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
                    <span className="text-3xl font-bold text-green-600">{topic.progress}%</span>
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
                        backgroundColor: "rgba(22, 163, 74, 0.2)",
                        "--progress-color": "rgba(22, 163, 74, 1)",
                      } as React.CSSProperties
                    }
                  />
                  <p className="text-sm text-gray-600">
                    {topic.progress >= 90
                      ? "Excellent scientific mastery!"
                      : topic.progress >= 75
                        ? "Good scientific understanding!"
                        : topic.progress >= 60
                          ? "Making scientific progress!"
                          : "Needs more exploration"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50">
                    Explore {topic.topic}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Experiments</CardTitle>
              <CardDescription>Explore these areas to improve your science skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicMastery
                  .sort((a, b) => a.progress - b.progress)
                  .slice(0, 2)
                  .map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-700">{topic.topic}</h4>
                        <p className="text-sm text-gray-600">Current mastery: {topic.progress}%</p>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700">Experiment Now</Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-700 mb-2">Ready to explore more scientific concepts?</h3>
            <p className="text-green-600 mb-4">
              Take a new assessment to test your knowledge and discover the wonders of science.
            </p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsModalOpen(true)}>
              Start New Assessment
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Dynamic History */}
          {loadingHistory ? (
            <div>Loading history...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>Your past science assessments and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historyItems.map((entry) => {
                    const id = entry._id?.$oid ?? entry._id
                    const hasSubmission = Boolean(entry.last_submission || entry.correct_count !== undefined)
                    const questions = entry.questions || []
                    const summary = entry.last_submission || {
                      assessment_id: id,
                      student_id: entry.student_id,
                      submission_time: entry.timestamp || entry.date,
                      results: entry.results,
                      correct_count: entry.correct_count,
                      total_questions: entry.total_questions,
                      score_percentage: entry.score_percentage,
                    }
                    const handleClick = () => {
                      localStorage.setItem(`assessment_${id}`, JSON.stringify(questions))
                      if (hasSubmission) {
                        localStorage.setItem(`review_${id}`, JSON.stringify(summary))
                        const answersMap: Record<string, string> = {}
                        questions.forEach((q: any) => {
                          const qid = q._id?.$oid ?? q._id
                          if (q.student_answer !== undefined) answersMap[qid] = q.student_answer
                        })
                        localStorage.setItem(`answers_${id}`, JSON.stringify(answersMap))
                        router.push(`/home/assessment/science/${id}/review`)
                      } else {
                        router.push(`/home/assessment/science/${id}`)
                      }
                    }
                    return (
                      <Card key={id} className="overflow-hidden border-l-4 border-l-green-500">
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg text-green-700">{`Assessment ${id}`}</h4>
                            <div className="flex items-center mt-2 md:mt-0">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">
                                {new Date(summary.submission_time.$date || summary.submission_time).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Questions</p>
                              <p className="font-medium">{questions.length}</p>
                            </div>
                            {hasSubmission && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Score</p>
                              <p className={`font-bold text-lg ${getScoreColor(summary.score_percentage)}`}>
                                {summary.correct_count}/{summary.total_questions}
                              </p>
                            </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Topics</p>
                              <p className="font-medium">{(entry.topics || []).join(', ')}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleClick}>
                              <Eye className="h-4 w-4 mr-2" />
                              {hasSubmission ? "View Assessment" : "Take Assessment"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject="science"
        subjectColor="green"
        availableTopics={availableTopics}
      />
    </div>
  )
}
