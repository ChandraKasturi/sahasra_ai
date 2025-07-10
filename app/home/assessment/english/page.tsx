"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Book, Award, TrendingUp, Clock, BarChart3, Star, Eye, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreateAssessmentModal, type Topic } from "@/components/assessment/create-assessment-modal"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

interface Assessment {
  _id: string
  questions: any[]
  subject: string
  topics: string[]
  level: number
  date: string
  last_submission?: {
    assessment_id: string
    student_id: string
    submission_time: string
    results: any[]
    correct_count: number
    total_questions: number
    score_percentage: number
  }
  submission_count?: number
}

export default function EnglishAssessmentPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get auth token
        const authToken = getAuthToken()
        
        // Set the date for filtering, e.g., last 30 days
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - 35)
        
        const response = await fetch(buildApiUrlNoPort(`${API_ENDPOINTS.ASSESSMENTS}?subject=english`), {
          headers: {
            "Content-Type": "application/json",
            "x-auth-session": authToken || "",
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessments: ${response.status}`)
        }
        
        const data = await response.json()
        setAssessments(data)
      } catch (error) {
        console.error("Error fetching assessments:", error)
        setError("Failed to load assessments. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load assessments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAssessments()
  }, [])

  // Available topics for English
  const availableTopics: Topic[] = [
    { id: "reading", name: "Reading Comprehension" },
    { id: "vocabulary", name: "Vocabulary" },
    { id: "grammar", name: "Grammar" },
    { id: "writing", name: "Writing" },
    { id: "literature", name: "Literature" },
    { id: "poetry", name: "Poetry" },
    { id: "prose", name: "Prose" },
    { id: "drama", name: "Drama" },
    { id: "critical-thinking", name: "Critical Thinking" },
  ]

  // Calculate statistics from real assessments
  const calculateStats = () => {
    if (assessments.length === 0) {
      return {
        averageScore: 0,
        totalAssessments: 0,
        highestScore: 0,
      }
    }
    
    const completedAssessments = assessments.filter(a => a.last_submission)
    
    if (completedAssessments.length === 0) {
      return {
        averageScore: 0,
        totalAssessments: assessments.length,
        highestScore: 0,
      }
    }
    
    const scores = completedAssessments.map(a => a.last_submission?.score_percentage || 0)
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    const highestScore = Math.max(...scores)
    
    return {
      averageScore,
      totalAssessments: assessments.length,
      highestScore,
    }
  }
  
  const { averageScore, totalAssessments, highestScore } = calculateStats()

  // Topic mastery data
  // Group assessments by topic and calculate average scores
  const calculateTopicMastery = () => {
    const topicScores: Record<string, number[]> = {}
    
    assessments.forEach(assessment => {
      if (assessment.last_submission && assessment.last_submission.score_percentage) {
        assessment.topics.forEach(topic => {
          if (!topicScores[topic]) {
            topicScores[topic] = []
          }
          topicScores[topic].push(assessment.last_submission!.score_percentage)
        })
      }
    })
    
    return Object.entries(topicScores).map(([topic, scores]) => ({
      topic: topic,
      progress: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    }))
  }
  
  const topicMastery = calculateTopicMastery()

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Get difficulty color
  const getDifficultyColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800" // Easy
    if (level <= 4) return "bg-blue-100 text-blue-800" // Medium
    return "bg-red-100 text-red-800" // Hard
  }
  
  // Get difficulty label
  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return "Easy"
    if (level <= 4) return "Medium"
    return "Hard"
  }

  // Get score color based on performance
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Handle click on an assessment
  const handleAssessmentClick = (assessment: Assessment) => {
    router.push(`/home/assessment/english/${assessment._id}${assessment.last_submission ? '/review' : ''}`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 flex items-center">
            <Book className="mr-2" /> English Assessments
          </h1>
          <p className="text-gray-600 mt-1">Track your progress and improve your English skills</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
          Take New Assessment
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center gap-2 text-red-500 p-6">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-gray-700">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-4xl font-bold text-blue-600">{averageScore}%</div>
                      <TrendingUp className="ml-auto text-green-500" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {averageScore >= 80 ? "Excellent performance!" : "Keep improving!"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-gray-700">Assessments Taken</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-4xl font-bold text-blue-600">{totalAssessments}</div>
                      <BarChart3 className="ml-auto text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {totalAssessments > 3 ? "Great consistency!" : "Take more assessments!"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-gray-700">Highest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-4xl font-bold text-blue-600">{highestScore}%</div>
                      <Award className="ml-auto text-yellow-500" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {highestScore >= 90 ? "Outstanding achievement!" : "You can reach higher!"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {topicMastery.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {topicMastery.map((topic, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{topic.topic}</CardTitle>
                        <CardDescription>Your mastery level</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl font-bold text-blue-600">{topic.progress}%</span>
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
                              backgroundColor: "rgba(37, 99, 235, 0.2)",
                              "--progress-color": "rgba(37, 99, 235, 1)",
                            } as React.CSSProperties
                          }
                        />
                        <p className="text-sm text-gray-600">
                          {topic.progress >= 90
                            ? "Excellent mastery!"
                            : topic.progress >= 75
                              ? "Good understanding!"
                              : topic.progress >= 60
                                ? "Making progress!"
                                : "Needs improvement"}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                          Practice {topic.topic}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-600">Complete assessments to see topic mastery data</p>
                  </CardContent>
                </Card>
              )}

              {topicMastery.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Practice</CardTitle>
                    <CardDescription>Focus on these areas to improve your English skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topicMastery
                        .sort((a, b) => a.progress - b.progress)
                        .slice(0, 2)
                        .map((topic, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-blue-700">{topic.topic}</h4>
                              <p className="text-sm text-gray-600">Current mastery: {topic.progress}%</p>
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">Practice Now</Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-blue-700 mb-2">Ready for your next challenge?</h3>
                <p className="text-blue-600 mb-4">
                  Take a new assessment to test your knowledge and track your progress in English.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
                  Start New Assessment
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Your past English assessments and results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              ) : assessments.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-4">You haven't taken any assessments yet.</p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
                    Take Your First Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <Card 
                      key={assessment._id} 
                      className={`overflow-hidden border-l-4 ${assessment.last_submission ? 'border-l-green-500' : 'border-l-blue-500'} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => handleAssessmentClick(assessment)}
                    >
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg text-blue-700">
                            Assessment on {assessment.topics.join(", ")}
                          </h4>
                          <div className="flex items-center mt-2 md:mt-0">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">{formatDate(assessment.date)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Questions</p>
                            <p className="font-medium">{assessment.questions.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Difficulty</p>
                            <Badge className={`${getDifficultyColor(assessment.level)} font-medium`}>
                              {getDifficultyLabel(assessment.level)}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Score</p>
                            {assessment.last_submission ? (
                              <p className={`font-bold text-lg ${getScoreColor(assessment.last_submission.score_percentage)}`}>
                                {assessment.last_submission.correct_count}/{assessment.last_submission.total_questions} ({assessment.last_submission.score_percentage}%)
                              </p>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Not Submitted</Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Eye className="h-4 w-4 mr-2" />
                            {assessment.last_submission ? "View Results" : "Take Assessment"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <CreateAssessmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          subject="english"
          subjectColor="blue"
          availableTopics={availableTopics}
        />
      )}
    </div>
  )
}
