"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Book,
  Languages,
  Calculator,
  ChevronRight,
  Atom,
  Globe,
  Medal,
  Star,
  TrendingUp,
  Trophy,
  Award,
  Zap,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  BookMarked,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

// Types for assessment data
interface AssessmentData {
  _id: string
  subject: string
  topics: string[]
  level: number
  questions: any[]
  student_id: string
  timestamp: string
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
  last_submission_time?: string
  submission_count?: number
}

interface SubjectAnalytics {
  subject: string
  averageScore: number
  totalAssessments: number
  totalScore: number
  totalMarks: number
  trend: number
}

interface PerformanceTrend {
  period: string
  score: number
  date: string
  subject: string
}

// Sample assessment data
const recentAssessments = [
  {
    id: 1,
    date: "2023-04-08",
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "Medium",
    score: 85,
    totalMarks: 100,
    icon: <Calculator className="h-5 w-5 text-red-500" />,
  },
  {
    id: 2,
    date: "2023-04-05",
    subject: "Science",
    topic: "Multiple Topics",
    difficulty: "Hard",
    score: 92,
    totalMarks: 100,
    icon: <Atom className="h-5 w-5 text-green-500" />,
  },
  {
    id: 3,
    date: "2023-04-02",
    subject: "English",
    topic: "Grammar",
    difficulty: "Easy",
    score: 78,
    totalMarks: 100,
    icon: <Book className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 4,
    date: "2023-03-28",
    subject: "Hindi",
    topic: "Vyakaran",
    difficulty: "Medium",
    score: 88,
    totalMarks: 100,
    icon: <Languages className="h-5 w-5 text-orange-500" />,
  },
  {
    id: 5,
    date: "2023-03-25",
    subject: "Social Science",
    topic: "History",
    difficulty: "Medium",
    score: 90,
    totalMarks: 100,
    icon: <Globe className="h-5 w-5 text-purple-500" />,
  },
]

// Subject data with performance metrics - updated to match learning page colors
const subjectData = [
  {
    name: "English",
    icon: <Book className="h-6 w-6" />,
    color: "bg-blue-500",
    textColor: "text-blue-500",
    borderColor: "border-blue-500",
    hoverColor: "hover:bg-blue-100",
    progress: 78,
    assessmentsTaken: 12,
    averageScore: 82,
    streak: 3,
    badges: ["Grammar Master", "Essay Expert"],
    route: "/home/assessment/english",
    weakTopics: ["Reading Comprehension", "Vocabulary", "Critical Analysis"],
  },
  {
    name: "Hindi",
    icon: <Languages className="h-6 w-6" />,
    color: "bg-orange-500",
    textColor: "text-orange-500",
    borderColor: "border-orange-500",
    hoverColor: "hover:bg-orange-100",
    progress: 65,
    assessmentsTaken: 8,
    averageScore: 75,
    streak: 2,
    badges: ["Vyakaran Visheshagya"],
    route: "/home/assessment/hindi",
    weakTopics: ["व्याकरण (Grammar)", "अनुच्छेद लेखन", "पत्र लेखन"],
  },
  {
    name: "Mathematics",
    icon: <Calculator className="h-6 w-6" />,
    color: "bg-red-500",
    textColor: "text-red-500",
    borderColor: "border-red-500",
    hoverColor: "hover:bg-red-100",
    progress: 92,
    assessmentsTaken: 15,
    averageScore: 88,
    streak: 5,
    badges: ["Algebra Ace", "Geometry Genius"],
    route: "/home/assessment/mathematics",
    weakTopics: ["Real Numbers", "Trigonometry", "Probability"],
  },
  {
    name: "Science",
    icon: <Atom className="h-6 w-6" />,
    color: "bg-green-500",
    textColor: "text-green-500",
    borderColor: "border-green-500",
    hoverColor: "hover:bg-green-100",
    progress: 85,
    assessmentsTaken: 10,
    averageScore: 90,
    streak: 4,
    badges: ["Physics Pro", "Chemistry Whiz"],
    route: "/home/assessment/science",
    weakTopics: ["Chemical Reactions", "Electricity", "Human Physiology"],
  },
  {
    name: "Social Science",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-purple-500",
    textColor: "text-purple-500",
    borderColor: "border-purple-500",
    hoverColor: "hover:bg-purple-100",
    progress: 80,
    assessmentsTaken: 9,
    averageScore: 85,
    streak: 3,
    badges: ["History Buff", "Geography Explorer"],
    route: "/home/assessment/social-science",
    weakTopics: ["Modern History", "Physical Geography", "Indian Constitution"],
  },
]

// Achievement data
const achievements = [
  { name: "Perfect Score", icon: <Trophy className="h-5 w-5 text-yellow-500" />, count: 3 },
  { name: "Weekly Streak", icon: <Zap className="h-5 w-5 text-orange-500" />, count: 5 },
  { name: "Subjects Mastered", icon: <Award className="h-5 w-5 text-purple-500" />, count: 2 },
  { name: "Badges Earned", icon: <Medal className="h-5 w-5 text-blue-500" />, count: 8 },
]

// Format date to readable format
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

// Get difficulty badge color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-amber-100 text-amber-800"
    case "hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemFade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
}

const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
}

export default function AssessmentPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [progressValues, setProgressValues] = useState<{ [key: string]: number }>({})
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Analytics state
  const [allAssessments, setAllAssessments] = useState<AssessmentData[]>([])
  const [subjectAnalytics, setSubjectAnalytics] = useState<SubjectAnalytics[]>([])
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([])
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([])
  const [overallAverageScore, setOverallAverageScore] = useState(0)
  const [totalAssessmentsCompleted, setTotalAssessmentsCompleted] = useState(0)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  
  // Real subject data from server
  const [realSubjectData, setRealSubjectData] = useState<any[]>([])
  const [recentAssessmentsData, setRecentAssessmentsData] = useState<any[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)

  // Fetch all assessments and calculate analytics
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoadingAnalytics(true)
        const authToken = getAuthToken()
        
        if (!authToken) {
          toast({
            title: "Authentication Error",
            description: "Please log in to view assessments.",
            variant: "destructive"
          })
          return
        }

        // Fetch all assessments across subjects
        const response = await fetch(buildApiUrl(`${API_ENDPOINTS.ASSESSMENTS}?subject=all`), {
          headers: {
            "Content-Type": "application/json",
            "x-auth-session": authToken,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch assessments: ${response.status}`)
        }

        const assessments: AssessmentData[] = await response.json()
        setAllAssessments(assessments)

        // Calculate analytics
        calculateAnalytics(assessments)
        
      } catch (error) {
        console.error("Error fetching assessments:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment data.",
          variant: "destructive"
        })
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    fetchAssessments()
  }, [])

  // Generate real subject data from analytics
  const generateSubjectData = (analytics: SubjectAnalytics[], assessments: AssessmentData[]) => {
    const subjectIcons = {
      english: <Book className="h-6 w-6" />,
      hindi: <Languages className="h-6 w-6" />,
      mathematics: <Calculator className="h-6 w-6" />,
      science: <Atom className="h-6 w-6" />,
      "social science": <Globe className="h-6 w-6" />
    }

    const subjectColors = {
      english: {
        color: "bg-blue-500",
        textColor: "text-blue-500",
        borderColor: "border-blue-500",
        hoverColor: "hover:bg-blue-100"
      },
      hindi: {
        color: "bg-orange-500",
        textColor: "text-orange-500", 
        borderColor: "border-orange-500",
        hoverColor: "hover:bg-orange-100"
      },
      mathematics: {
        color: "bg-red-500",
        textColor: "text-red-500",
        borderColor: "border-red-500", 
        hoverColor: "hover:bg-red-100"
      },
      science: {
        color: "bg-green-500",
        textColor: "text-green-500",
        borderColor: "border-green-500",
        hoverColor: "hover:bg-green-100"
      },
      "social science": {
        color: "bg-purple-500",
        textColor: "text-purple-500",
        borderColor: "border-purple-500",
        hoverColor: "hover:bg-purple-100"
      }
    }

    const subjectRoutes = {
      english: "/home/assessment/english",
      hindi: "/home/assessment/hindi", 
      mathematics: "/home/assessment/mathematics",
      science: "/home/assessment/science",
      "social science": "/home/assessment/social-science"
    }

    // Calculate streaks and badges for each subject
    const subjectAssessments = new Map<string, AssessmentData[]>()
    assessments.forEach(assessment => {
      const subject = assessment.subject.toLowerCase()
      if (!subjectAssessments.has(subject)) {
        subjectAssessments.set(subject, [])
      }
      subjectAssessments.get(subject)!.push(assessment)
    })

    return analytics.map(analytic => {
      const subjectKey = analytic.subject.toLowerCase() as keyof typeof subjectIcons
      const subjectAssessmentsData = subjectAssessments.get(subjectKey) || []
      
      // Calculate streak (consecutive passed assessments)
      let streak = 0
      const sortedAssessments = subjectAssessmentsData
        .filter(a => a.last_submission)
        .sort((a, b) => new Date(b.last_submission!.submission_time).getTime() - 
                       new Date(a.last_submission!.submission_time).getTime())
      
      for (const assessment of sortedAssessments) {
        if (assessment.last_submission && assessment.last_submission.score_percentage >= 60) {
          streak++
        } else {
          break
        }
      }

      // Generate badges based on performance
      const badges = []
      if (analytic.averageScore >= 90) badges.push("Excellence")
      if (analytic.averageScore >= 80) badges.push("High Achiever")
      if (analytic.totalAssessments >= 5) badges.push("Dedicated")
      if (streak >= 3) badges.push("Streak Master")

      // Get weak topics from recent assessments
      const weakTopics = getWeakTopics(subjectKey, subjectAssessmentsData)

      return {
        name: analytic.subject.charAt(0).toUpperCase() + analytic.subject.slice(1),
        icon: subjectIcons[subjectKey] || <Book className="h-6 w-6" />,
        ...subjectColors[subjectKey],
        progress: analytic.averageScore,
        assessmentsTaken: analytic.totalAssessments,
        averageScore: analytic.averageScore,
        streak,
        badges,
        route: subjectRoutes[subjectKey] || `/home/assessment/${subjectKey}`,
        weakTopics
      }
    })
  }

  // Get weak topics for a subject based on assessment data
  const getWeakTopics = (subject: string, assessments: AssessmentData[]) => {
    const topicScores = new Map<string, number[]>()
    
    assessments.forEach(assessment => {
      if (assessment.last_submission && assessment.topics) {
        assessment.topics.forEach(topic => {
          if (!topicScores.has(topic)) {
            topicScores.set(topic, [])
          }
          topicScores.get(topic)!.push(assessment.last_submission!.score_percentage)
        })
      }
    })

    // Find topics with average score < 70%
    const weakTopics: string[] = []
    topicScores.forEach((scores, topic) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      if (average < 70) {
        weakTopics.push(topic)
      }
    })

    return weakTopics.slice(0, 3) // Return top 3 weak topics
  }

  // Generate recent assessments data from server data
  const generateRecentAssessments = (assessments: AssessmentData[]) => {
    const subjectIcons = {
      english: <Book className="h-5 w-5 text-blue-500" />,
      hindi: <Languages className="h-5 w-5 text-orange-500" />,
      mathematics: <Calculator className="h-5 w-5 text-red-500" />,
      science: <Atom className="h-5 w-5 text-green-500" />,
      "social science": <Globe className="h-5 w-5 text-purple-500" />
    }

    return assessments
      .filter(assessment => assessment.last_submission)
      .sort((a, b) => new Date(b.last_submission!.submission_time).getTime() - 
                     new Date(a.last_submission!.submission_time).getTime())
      .slice(0, 5)
      .map((assessment, index) => ({
        id: assessment._id,
        date: assessment.last_submission!.submission_time,
        subject: assessment.subject.charAt(0).toUpperCase() + assessment.subject.slice(1),
        topic: assessment.topics ? assessment.topics.join(", ") : "Multiple Topics",
        difficulty: getDifficultyFromLevel(assessment.level),
        score: Math.round((assessment.last_submission!.score_percentage / 100) * assessment.last_submission!.total_questions),
        totalMarks: assessment.last_submission!.total_questions,
        icon: subjectIcons[assessment.subject.toLowerCase() as keyof typeof subjectIcons] || <Book className="h-5 w-5 text-gray-500" />
      }))
  }

  // Convert level to difficulty
  const getDifficultyFromLevel = (level: number) => {
    if (level <= 2) return "Easy"
    if (level <= 4) return "Medium"
    return "Hard"
  }

  // Calculate analytics from assessment data
  const calculateAnalytics = (assessments: AssessmentData[]) => {
    console.log("Calculating analytics with assessments:", assessments)
    
    if (assessments.length === 0) {
      console.log("No assessments found")
      return
    }

    // Filter completed assessments (those with last_submission)
    const completedAssessments = assessments.filter(assessment => {
      return assessment.last_submission && 
             assessment.last_submission.score_percentage !== undefined
    })

    console.log("Completed assessments:", completedAssessments.length)
    setTotalAssessmentsCompleted(completedAssessments.length)

    if (completedAssessments.length === 0) {
      setOverallAverageScore(0)
      setSubjectAnalytics([])
      setRecommendedSubjects([])
      setPerformanceTrends([])
      return
    }

    // Calculate overall average score
    const totalScore = completedAssessments.reduce((sum, assessment) => {
      return sum + (assessment.last_submission?.score_percentage || 0)
    }, 0)

    const overallAverage = totalScore / completedAssessments.length
    setOverallAverageScore(Math.round(overallAverage))
    console.log("Overall average score:", overallAverage)

    // Calculate subject-wise analytics
    const subjectMap = new Map<string, number[]>()
    
    completedAssessments.forEach(assessment => {
      const subject = assessment.subject
      const scorePercentage = assessment.last_submission?.score_percentage || 0
      
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, [])
      }
      
      subjectMap.get(subject)!.push(scorePercentage)
    })

    const subjectAnalytics: SubjectAnalytics[] = Array.from(subjectMap.entries()).map(([subject, scores]) => {
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      
      return {
        subject,
        averageScore: Math.round(averageScore),
        totalAssessments: scores.length,
        totalScore: scores.reduce((sum, score) => sum + score, 0),
        totalMarks: scores.length * 100, // Each assessment is out of 100%
        trend: 0 // Could be calculated with historical data
      }
    })

    console.log("Subject analytics:", subjectAnalytics)
    setSubjectAnalytics(subjectAnalytics)

    // Find recommended subjects (average score < 30)
    const recommended = subjectAnalytics
      .filter(analytics => analytics.averageScore < 30)
      .map(analytics => analytics.subject)
    
    console.log("Recommended subjects:", recommended)
    setRecommendedSubjects(recommended)

    // Calculate performance trends (last 5 assessments)
    const recentAssessments = completedAssessments
      .sort((a, b) => new Date(b.last_submission?.submission_time || b.date || '').getTime() - 
                     new Date(a.last_submission?.submission_time || a.date || '').getTime())
      .slice(0, 5)
      .reverse()

    const trends: PerformanceTrend[] = recentAssessments.map((assessment, index) => {
      const scorePercentage = assessment.last_submission?.score_percentage || 0
      
      return {
        period: `Test ${index + 1}`,
        score: Math.round(scorePercentage),
        date: assessment.last_submission?.submission_time || assessment.date || '',
        subject: assessment.subject
      }
    })

    console.log("Performance trends:", trends)
    setPerformanceTrends(trends)

    // Generate real subject data from analytics
    const realSubjectData = generateSubjectData(subjectAnalytics, assessments)
    setRealSubjectData(realSubjectData)

    // Generate recent assessments data from server data
    const recentAssessmentsData = generateRecentAssessments(assessments)
    setRecentAssessmentsData(recentAssessmentsData)
  }

  // Animate progress bars on load
  useEffect(() => {
    if (realSubjectData.length === 0) return
    
    // Initialize progress values to 0
    const initialValues: { [key: string]: number } = {}
    realSubjectData.forEach((subject) => {
      initialValues[subject.name] = 0
    })
    setProgressValues(initialValues)

    // Set a timeout to simulate loading and then animate progress bars
    const timer = setTimeout(() => {
      setIsLoaded(true)
      const finalValues: { [key: string]: number } = {}
      realSubjectData.forEach((subject) => {
        finalValues[subject.name] = subject.progress
      })
      setProgressValues(finalValues)
    }, 500)

    return () => clearTimeout(timer)
  }, [realSubjectData])

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        variants={slideUp}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Assessment Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress and challenge yourself with new assessments</p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemFade}>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl font-bold text-blue-700"
                  >
                    {isLoadingAnalytics ? "..." : `${overallAverageScore}%`}
                  </motion.p>
                </div>
                <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFade}>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Assessments Completed</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-3xl font-bold text-green-700"
                  >
                    {isLoadingAnalytics ? "..." : totalAssessmentsCompleted}
                  </motion.p>
                </div>
                <motion.div whileHover={{ rotate: -15, scale: 1.1 }} className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFade}>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Streak</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-3xl font-bold text-purple-700"
                  >
                    5 days
                  </motion.p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }}
                  className="p-3 bg-purple-100 rounded-full"
                >
                  <Zap className="h-6 w-6 text-purple-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemFade}>
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Badges Earned</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-3xl font-bold text-amber-700"
                  >
                    8
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                  className="p-3 bg-amber-100 rounded-full"
                >
                  <Medal className="h-6 w-6 text-amber-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recommended Subjects for Improvement */}
      {recommendedSubjects.length > 0 && (
        <motion.div variants={slideUp}>
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Recommended for Improvement
              </CardTitle>
              <CardDescription>
                Subjects where your average score is below 30% - focus on these for better results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendedSubjects.map((subject) => (
                  <Badge key={subject} variant="destructive" className="bg-orange-100 text-orange-800 border-orange-300">
                    <BookMarked className="h-3 w-3 mr-1" />
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedSubjects.map((subject) => (
                  <Link key={subject} href={`/home/assessment/${subject}`}>
                    <Button variant="outline" className="w-full border-orange-200 hover:bg-orange-50">
                      Practice {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <motion.div variants={slideUp}>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4 p-1 bg-gradient-to-r from-brand-navy/10 to-brand-coral/10 border border-brand-navy/20 rounded-lg shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-navy data-[state=active]:to-brand-coral data-[state=active]:text-white transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-navy data-[state=active]:to-brand-coral data-[state=active]:text-white transition-all duration-300"
            >
              Subjects
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-navy data-[state=active]:to-brand-coral data-[state=active]:text-white transition-all duration-300"
            >
              History
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6">
              {/* Performance Trend */}
              <motion.div
                key="overview-performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Performance Trend
                    </CardTitle>
                    <CardDescription>Your assessment scores over the last 5 tests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end justify-between gap-2">
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center w-full h-full">
                          <p className="text-gray-500">Loading performance data...</p>
                        </div>
                      ) : performanceTrends.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-full">
                          <p className="text-gray-500">No assessment data available</p>
                        </div>
                      ) : (
                        performanceTrends.map((trend, index) => (
                          <motion.div
                            key={trend.period}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.min(trend.score, 100)}%` }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md flex flex-col justify-end items-center relative group cursor-pointer"
                            style={{ maxHeight: "160px", minHeight: "20px" }}
                          >
                            <div className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {trend.score}% - {trend.subject}
                            </div>
                            <span className="text-xs text-white font-medium p-1 text-center">
                              {trend.period}
                            </span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
                              </motion.div>

                {/* Subject Analytics */}
                <motion.div
                  key="subject-analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        Subject Performance Analytics
                      </CardTitle>
                      <CardDescription>Detailed breakdown of your performance across subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAnalytics ? (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-gray-500">Loading subject analytics...</p>
                        </div>
                      ) : subjectAnalytics.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-gray-500">No subject data available</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {subjectAnalytics.map((analytics, index) => (
                            <motion.div
                              key={analytics.subject}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                  analytics.averageScore >= 70 ? 'bg-green-100' :
                                  analytics.averageScore >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                                }`}>
                                  {analytics.subject === 'english' && <Book className="h-4 w-4 text-blue-500" />}
                                  {analytics.subject === 'hindi' && <Languages className="h-4 w-4 text-orange-500" />}
                                  {analytics.subject === 'mathematics' && <Calculator className="h-4 w-4 text-red-500" />}
                                  {analytics.subject === 'science' && <Atom className="h-4 w-4 text-green-500" />}
                                  {analytics.subject === 'social-science' && <Globe className="h-4 w-4 text-purple-500" />}
                                </div>
                                <div>
                                  <h4 className="font-medium capitalize">{analytics.subject.replace('-', ' ')}</h4>
                                  <p className="text-sm text-gray-600">
                                    {analytics.totalAssessments} assessment{analytics.totalAssessments !== 1 ? 's' : ''} completed
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-2xl font-bold ${
                                  analytics.averageScore >= 70 ? 'text-green-600' :
                                  analytics.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {analytics.averageScore}%
                                </p>
                                <p className="text-sm text-gray-500">Average Score</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Achievements */}
              <motion.div
                key="overview-achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Your Achievements
                    </CardTitle>
                    <CardDescription>Milestones you've reached so far</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={index}
                          variants={itemFade}
                          whileHover={{ y: -5, transition: { duration: 0.2 } }}
                          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <motion.div whileHover={{ rotate: 10 }} className="p-3 bg-white rounded-full shadow-sm mb-3">
                            {achievement.icon}
                          </motion.div>
                          <motion.p
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                            className="text-xl font-bold"
                          >
                            {achievement.count}
                          </motion.p>
                          <p className="text-sm text-gray-600">{achievement.name}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upcoming Challenges */}
              <motion.div
                key="overview-challenges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-500" />
                      Recommended Assessments
                    </CardTitle>
                    <CardDescription>Focus on these topics to improve your performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {isLoadingAnalytics ? (
                        [1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center p-4 border rounded-lg animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                            <div className="flex-1">
                              <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="w-32 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        realSubjectData.slice(0, 3).map((subject, index) => (
                          <motion.div
                            key={index}
                            variants={itemFade}
                            whileHover={{
                              scale: 1.03,
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            }}
                          >
                            <Link
                              href={subject.route}
                              className={`flex items-center p-4 border rounded-lg ${subject.borderColor} ${subject.hoverColor} transition-all duration-300`}
                            >
                              <motion.div
                                whileHover={{ rotate: 10 }}
                                className={`p-3 ${subject.color} bg-opacity-20 rounded-full mr-4`}
                              >
                                <div className={subject.textColor}>{subject.icon}</div>
                              </motion.div>
                              <div>
                                <p className="font-medium">{subject.name}</p>
                                <p className="text-sm text-gray-600">
                                  {subject.weakTopics && subject.weakTopics.length > 0 
                                    ? subject.weakTopics[0] 
                                    : `${subject.averageScore}% average`}
                                </p>
                              </div>
                              <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }}
                                className="ml-auto"
                              >
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>

          {/* Subjects Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="subjects" className="space-y-6">
              <motion.div
                key="subject-mastery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Subject Mastery Levels
                    </CardTitle>
                    <CardDescription>Your progress across different subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                              <div className="w-20 h-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-16 h-4 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                        {realSubjectData.map((subject, index) => (
                          <motion.div
                            key={subject.name}
                            variants={itemFade}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            }}
                            className={`flex items-center justify-between p-4 border rounded-lg ${subject.hoverColor} transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.2, rotate: 15 }}
                                className={`p-2 rounded-full ${subject.color} text-white`}
                              >
                                {subject.icon}
                              </motion.div>
                              <div>
                                <h4 className="font-medium">{subject.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {subject.assessmentsTaken} assessments • {subject.averageScore}% avg
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <motion.div
                                    className={`h-2 rounded-full ${subject.color}`}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${progressValues[subject.name] || 0}%`,
                                    }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                  />
                                </div>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 1 + index * 0.1 }}
                                  className={`text-sm font-medium ${subject.textColor}`}
                                >
                                  {Math.round(progressValues[subject.name] || 0)}%
                                </motion.span>
                              </div>
                              {subject.streak > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 1.2 + index * 0.1 }}
                                  className="flex items-center gap-1 mt-1"
                                >
                                  <Zap className="h-3 w-3 text-orange-500" />
                                  <span className="text-xs text-orange-600">{subject.streak} streak</span>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>

          {/* History Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="history" className="space-y-6">
              <motion.div
                key="history-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Assessment History</CardTitle>
                    <CardDescription>Your last 5 assessments across all subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center p-4 border rounded-lg animate-pulse">
                            <div className="w-6 h-6 bg-gray-200 rounded mr-4"></div>
                            <div className="flex-1">
                              <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="w-32 h-3 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-16 h-4 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentAssessmentsData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookMarked className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No recent assessments found</p>
                        <p className="text-sm">Take an assessment to see your history here</p>
                      </div>
                    ) : (
                      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                        {recentAssessmentsData.map((assessment, index) => (
                          <motion.div
                            key={assessment.id}
                            variants={itemFade}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            }}
                            className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <motion.div whileHover={{ rotate: 15 }} className="mr-4">
                              {assessment.icon}
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{assessment.subject}</h4>
                                <span className="text-sm text-gray-500">{formatDate(assessment.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">{assessment.topic}</span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(assessment.difficulty)}`}
                                >
                                  {assessment.difficulty}
                                </span>
                              </div>
                            </div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                              className="ml-4 text-right"
                            >
                              <div className="text-lg font-bold">
                                {assessment.score}/{assessment.totalMarks}
                              </div>
                              <div className="text-sm text-gray-500">
                                {Math.round((assessment.score / assessment.totalMarks) * 100)}%
                              </div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      View All History
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" as const }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Motivational Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-brand-navy to-brand-coral text-white overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-4">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-2xl md:text-3xl font-bold"
                >
                  Ready for a Challenge?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-white/90 max-w-md"
                >
                  Test your knowledge, track your progress, and earn badges by completing assessments. Challenge
                  yourself today!
                </motion.p>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex gap-3">
                  <motion.div variants={itemFade} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/home/assessment/mathematics"
                      className="bg-white text-brand-navy hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition-colors block"
                    >
                      Start New Assessment
                    </Link>
                  </motion.div>
                  <motion.button
                    variants={itemFade}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    View Leaderboard
                  </motion.button>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 1,
                  scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }
                }}
                className="hidden md:block"
              >
                <Trophy className="h-24 w-24 text-yellow-300 opacity-90" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
