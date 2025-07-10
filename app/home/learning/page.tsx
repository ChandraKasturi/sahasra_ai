"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { format, subDays } from "date-fns"
import {
  Brain,
  Flame,
  Award,
  TrendingUp,
  Zap,
  MessageSquare,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Book,
  Languages,
  Atom,
  Globe,
  Calculator,
  Loader2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

// Subject mapping with icons and colors
const SUBJECT_MAP = {
  english: { name: "English", icon: Book, color: "bg-blue-500" },
  hindi: { name: "Hindi", icon: Languages, color: "bg-orange-500" },
  science: { name: "Science", icon: Atom, color: "bg-green-500" },
  "social-science": { name: "Social Science", icon: Globe, color: "bg-purple-500" },
  mathematics: { name: "Mathematics", icon: Calculator, color: "bg-red-500" },
}

// Recent activity item interface
interface RecentActivityItem {
  id: string
  subject: string
  message: string
  time: string
  session_id: string
}

// Sample data - in a real app, this would come from an API
const LEARNING_STREAK = 30
const TOTAL_QUESTIONS = 427
const TOTAL_HOURS = 42
const SUBJECTS = [
  {
    id: "english",
    name: "English",
    icon: Book,
    color: "bg-blue-500",
    progress: 78,
    recentPrompt: "Can you explain the use of metaphors in poetry?",
    lastActive: "2 hours ago",
  },
  {
    id: "hindi",
    name: "Hindi",
    icon: Languages,
    color: "bg-orange-500",
    progress: 65,
    recentPrompt: "हिंदी व्याकरण में संधि के नियम क्या हैं?",
    lastActive: "Yesterday",
  },
  {
    id: "science",
    name: "Science",
    icon: Atom,
    color: "bg-green-500",
    progress: 82,
    recentPrompt: "How does photosynthesis work in plants?",
    lastActive: "3 days ago",
  },
  {
    id: "social-science",
    name: "Social Science",
    icon: Globe,
    color: "bg-purple-500",
    progress: 54,
    recentPrompt: "What were the major causes of World War II?",
    lastActive: "5 days ago",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    color: "bg-red-500",
    progress: 71,
    recentPrompt: "How do I solve quadratic equations?",
    lastActive: "1 day ago",
  },
]

// Generate sample history prompts
const generateHistoryPrompts = (subjectId: string) => {
  const today = new Date()
  const prompts = []

  // Different prompt templates for each subject
  const promptTemplates = {
    english: [
      "Analyzing the theme of {topic} in literature",
      "Understanding {topic} in English grammar",
      "Exploring the writing style of {author}",
      "Comparing characters in {book}",
      "Practicing {tense} tense usage",
    ],
    hindi: [
      "हिंदी व्याकरण में {topic} का अध्ययन",
      "{author} की कविताओं का विश्लेषण",
      "हिंदी साहित्य में {movement} आंदोलन",
      "{book} उपन्यास के पात्रों की विशेषताएँ",
      "हिंदी में {grammar} के नियम",
    ],
    science: [
      "Understanding the process of {process}",
      "Exploring the structure of {structure}",
      "The role of {element} in chemical reactions",
      "How does {phenomenon} work?",
      "Explaining the concept of {concept} in physics",
    ],
    "social-science": [
      "The impact of {event} on world history",
      "Understanding the geography of {region}",
      "Political systems in {country}",
      "Economic policies during {period}",
      "Social movements in {century} century",
    ],
    mathematics: [
      "Solving problems involving {concept}",
      "Understanding the properties of {shape}",
      "Applications of {theorem} in real life",
      "Step-by-step solution for {problem_type}",
      "Practicing {operation} with complex numbers",
    ],
  }

  // Topics for each subject
  const topics = {
    english: [
      "love",
      "revenge",
      "justice",
      "identity",
      "Shakespeare",
      "Dickens",
      "To Kill a Mockingbird",
      "present perfect",
      "past continuous",
    ],
    hindi: ["संधि", "समास", "प्रेमचंद", "छायावाद", "भारतेंदु युग", "गोदान", "क्रिया"],
    science: ["photosynthesis", "cell division", "DNA", "oxygen", "carbon", "gravity", "evolution", "electricity"],
    "social-science": [
      "World War II",
      "French Revolution",
      "India",
      "USA",
      "Industrial Revolution",
      "20th",
      "democracy",
    ],
    mathematics: [
      "quadratic equations",
      "triangles",
      "Pythagoras",
      "integration",
      "differentiation",
      "trigonometry",
      "addition",
      "matrices",
    ],
  }

  // Generate 5 random prompts for the subject
  for (let i = 0; i < 5; i++) {
    const date = format(subDays(today, i + 1), "dd-MMM-yy")
    const templates = promptTemplates[subjectId as keyof typeof promptTemplates]
    const subjectTopics = topics[subjectId as keyof typeof topics]

    const template = templates[i % templates.length]
    const topic = subjectTopics[Math.floor(Math.random() * subjectTopics.length)]

    const prompt = template.replace(/{(\w+)}/g, (_, key) => {
      if (
        key === "topic" ||
        key === "author" ||
        key === "book" ||
        key === "tense" ||
        key === "movement" ||
        key === "grammar" ||
        key === "process" ||
        key === "structure" ||
        key === "element" ||
        key === "phenomenon" ||
        key === "concept" ||
        key === "event" ||
        key === "region" ||
        key === "country" ||
        key === "period" ||
        key === "century" ||
        key === "shape" ||
        key === "theorem" ||
        key === "problem_type" ||
        key === "operation"
      ) {
        return topic
      }
      return key
    })

    prompts.push({
      id: `${subjectId}-${i}`,
      date,
      text: prompt,
    })
  }

  return prompts
}

// Achievements data
const ACHIEVEMENTS = [
  { id: 1, name: "Fast Learner", description: "Completed 5 lessons in a day", icon: Zap, unlocked: true },
  { id: 2, name: "Knowledge Seeker", description: "Asked 50+ questions", icon: Brain, unlocked: true },
  { id: 3, name: "Consistent Scholar", description: "Maintained a 30-day streak", icon: Flame, unlocked: true },
  { id: 4, name: "Subject Master", description: "Reached 80% in any subject", icon: Award, unlocked: true },
  { id: 5, name: "Curious Mind", description: "Explored all subjects", icon: Sparkles, unlocked: false },
]

// Daily quote
const DAILY_QUOTE = {
  text: "Education is the most powerful weapon which you can use to change the world.",
  author: "Nelson Mandela",
}

export default function LearningDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [streakProgress, setStreakProgress] = useState(0)
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)

  // Fetch recent activity from API
  const fetchRecentActivity = async () => {
    setIsLoadingActivity(true)
    try {
      const authToken = getAuthToken()
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.GET_HISTORY}/all?page=1`), {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "x-auth-session": authToken }),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch recent activity: ${response.status}`)
      }

      const data = await response.json()
      
      // Filter for user messages (is_ai: false) and get most recent 3
      const userMessages = data.history
        ?.filter((item: any) => !item.is_ai && item.subject && item.message)
        ?.slice(0, 3)
        ?.map((item: any) => ({
          id: item.session_id || `${item.subject}-${item.time}`,
          subject: item.subject,
          message: item.message,
          time: item.time,
          session_id: item.session_id,
        })) || []

      setRecentActivity(userMessages)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      setRecentActivity([])
    } finally {
      setIsLoadingActivity(false)
    }
  }

  // Calculate time ago from timestamp
  const getTimeAgo = (timestamp: string) => {
    const messageDate = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return format(messageDate, "MMM dd")
  }

  // Animate streak progress on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setStreakProgress(LEARNING_STREAK)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Fetch recent activity on component mount
  useEffect(() => {
    fetchRecentActivity()
  }, [])

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Your Learning Journey</h1>
        <p className="text-gray-600">Continue your adventure through knowledge and discover new topics to explore.</p>
      </motion.div>

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 p-4 bg-gradient-to-r from-brand-navy/10 to-brand-coral/10 rounded-lg border border-brand-navy/10"
      >
        <div className="flex items-start gap-3">
          <div className="bg-brand-coral/20 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-brand-coral" />
          </div>
          <div>
            <p className="text-lg italic text-gray-700">"{DAILY_QUOTE.text}"</p>
            <p className="text-sm text-gray-500 mt-1">— {DAILY_QUOTE.author}</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:w-[400px] mb-4 p-1 bg-gradient-to-r from-brand-navy/10 to-brand-coral/10 border border-brand-navy/20 rounded-lg shadow-sm">
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
        </TabsList>

        <TabsContent value="overview">
          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {/* Streak Card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-amber-700">
                    <Flame className="h-5 w-5 mr-2 text-amber-500" />
                    Learning Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-4xl font-bold text-amber-600">{LEARNING_STREAK}</div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                      <Flame className="h-3 w-3 mr-1" /> On Fire!
                    </Badge>
                  </div>
                  <Progress
                    value={streakProgress}
                    max={30}
                    className="h-2 bg-amber-100"
                    indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-400"
                  />
                  <p className="text-xs text-gray-500 mt-2">Keep learning daily to maintain your streak!</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions Answered Card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-blue-700">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                    Questions Answered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600 mb-2">{TOTAL_QUESTIONS}</div>
                  <div className="flex items-center text-sm text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+24 this week</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Great progress! Keep asking questions.</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning Hours Card */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-green-700">
                    <Clock className="h-5 w-5 mr-2 text-green-500" />
                    Learning Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 mb-2">{TOTAL_HOURS}</div>
                  <div className="flex items-center text-sm text-green-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>3.5 hours today</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Time well spent on your education!</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Recent Activity and Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning interactions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingActivity ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-500">Loading recent activity...</span>
                    </div>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const subjectInfo = SUBJECT_MAP[activity.subject as keyof typeof SUBJECT_MAP]
                      if (!subjectInfo) return null

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`${subjectInfo.color} p-2 rounded-full text-white`}>
                            <subjectInfo.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900">{subjectInfo.name}</h4>
                              <span className="text-xs text-gray-500">{getTimeAgo(activity.time)}</span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{activity.message}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No recent activity yet</p>
                      <p className="text-sm text-gray-400">Start a conversation to see your activity here</p>
                    </div>
                  )}
                  <Button variant="ghost" className="w-full text-brand-coral" asChild>
                    <Link href="/home/learning">View all activity</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Milestones you've reached</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ACHIEVEMENTS.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        achievement.unlocked ? "opacity-100" : "opacity-50"
                      }`}
                    >
                      <div
                        className={`${
                          achievement.unlocked ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gray-300"
                        } p-2 rounded-full text-white`}
                      >
                        <achievement.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200">Unlocked</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SUBJECTS.map((subject) => (
              <motion.div key={subject.id} variants={itemVariants}>
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className={`${subject.color} text-white`}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <subject.icon className="h-5 w-5" />
                        {subject.name}
                      </CardTitle>
                      <Badge className="bg-white/20 hover:bg-white/30">{subject.progress}%</Badge>
                    </div>
                    <Progress value={subject.progress} className="h-1 mt-2 bg-white/20" indicatorClassName="bg-white" />
                  </CardHeader>
                  <CardContent className="flex-1 pt-4">
                    <h4 className="font-medium text-sm mb-2">Recent History</h4>
                    <div className="space-y-2 mb-4">
                      {generateHistoryPrompts(subject.id)
                        .slice(0, 3)
                        .map((prompt) => (
                          <Link
                            key={prompt.id}
                            href={`/home/learning/${subject.id}?date=${prompt.date}`}
                            className="block p-2 text-xs rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-700">{prompt.date}</span>
                              <Calendar className="h-3 w-3 text-gray-400" />
                            </div>
                            <p className="text-gray-600 truncate">{prompt.text}</p>
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90" asChild>
                      <Link href={`/home/learning/${subject.id}`}>
                        Start Learning
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Recommended Topics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
        <h2 className="text-xl font-bold text-brand-navy mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Mastering Quadratic Equations", subject: "Mathematics", icon: Calculator, color: "bg-red-500" },
            { title: "Understanding Shakespeare's Sonnets", subject: "English", icon: Book, color: "bg-blue-500" },
            { title: "The Solar System Explained", subject: "Science", icon: Atom, color: "bg-green-500" },
            { title: "Indian Freedom Movement", subject: "Social Science", icon: Globe, color: "bg-purple-500" },
          ].map((topic, index) => (
            <Card key={index} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div
                  className={`${topic.color} p-3 rounded-full text-white mb-3 group-hover:scale-110 transition-transform`}
                >
                  <topic.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{topic.title}</h3>
                <p className="text-xs text-gray-500">{topic.subject}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
