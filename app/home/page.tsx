"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen,
  BarChart2,
  FileText,
  ClipboardCheck,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Flame,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubjectProgressChart } from "@/components/progress/subject-progress-chart"
import { useMobile } from "@/hooks/use-mobile"

// Mock data for the dashboard
const subjects = [
  { id: "english", name: "English", progress: 68, color: "#3b82f6", icon: "📚" },
  { id: "hindi", name: "Hindi", progress: 42, color: "#f97316", icon: "🖋️" },
  { id: "mathematics", name: "Mathematics", progress: 75, color: "#22c55e", icon: "🔢" },
  { id: "science", name: "Science", progress: 59, color: "#a855f7", icon: "🧪" },
  { id: "social-science", name: "Social Science", progress: 31, color: "#ef4444", icon: "🌍" },
]

const recentLearning = [
  { id: "1", title: "Photosynthesis Process", subject: "Science", date: "Today", duration: "45 min", progress: 100 },
  { id: "2", title: "Linear Equations", subject: "Mathematics", date: "Yesterday", duration: "30 min", progress: 85 },
  { id: "3", title: "Tenses in English", subject: "English", date: "2 days ago", duration: "25 min", progress: 70 },
]

const upcomingAssessments = [
  { id: "1", title: "Chapter 5 Quiz", subject: "Science", date: "Tomorrow", difficulty: "Medium", questions: 15 },
  { id: "2", title: "Grammar Test", subject: "English", date: "In 3 days", difficulty: "Easy", questions: 20 },
]

const recentFiles = [
  { id: "1", name: "Science Notes.pdf", subject: "Science", date: "Today", size: "2.4 MB" },
  { id: "2", name: "Math Formulas.pdf", subject: "Mathematics", date: "Yesterday", size: "1.8 MB" },
]

const achievements = [
  { id: "1", title: "Fast Learner", description: "Completed 5 lessons in a day", icon: Zap, color: "bg-yellow-500" },
  {
    id: "2",
    title: "Math Wizard",
    description: "Scored 90% in 3 math assessments",
    icon: Brain,
    color: "bg-green-500",
  },
  { id: "3", title: "Consistent", description: "Maintained a 7-day learning streak", icon: Flame, color: "bg-red-500" },
]

const dailyChallenge = {
  subject: "Science",
  question: "What is the process by which plants make their own food using sunlight?",
  options: ["Respiration", "Photosynthesis", "Digestion", "Excretion"],
  answer: 1,
}

const getSubjectColor = (subjectName: string) => {
  const subject = subjects.find((s) => s.name === subjectName)
  return subject ? subject.color : "#3b82f6"
}

export default function HomePage() {
  const [streak, setStreak] = useState(7)
  const [todayGoal, setTodayGoal] = useState(45)
  const [todayProgress, setTodayProgress] = useState(25)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [greeting, setGreeting] = useState("Good morning")
  const [userName, setUserName] = useState("Student")
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMobile()

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    // Simulate loading user data
    setTimeout(() => {
      setUserName("Rahul")
      setIsLoaded(true)
    }, 500)
  }, [])

  // Animation variants
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
        damping: 15,
      },
    },
  }

  const handleChallengeAnswer = (index: number) => {
    setSelectedAnswer(index)
    setShowAnswer(true)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {isLoaded ? (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 md:space-y-8">
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-brand-navy">
                {greeting}, <span className="text-brand-coral">{userName}</span>!
              </h1>
              <p className="mt-2 text-gray-600">
                Ready to continue your learning journey? You're on a{" "}
                <span className="font-semibold text-brand-coral">{streak}-day streak</span>!
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <Card className="flex-1 border-l-4 border-l-brand-coral">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Today's Goal</p>
                      <p className="text-xl font-bold">{todayGoal} minutes</p>
                    </div>
                    <Target className="h-8 w-8 text-brand-coral opacity-80" />
                  </CardContent>
                </Card>

                <Card className="flex-1 border-l-4 border-l-brand-navy">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Progress</p>
                      <p className="text-xl font-bold">{todayProgress} minutes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(todayProgress / todayGoal) * 100} className="w-16 h-2" />
                      <p className="text-sm font-medium">{Math.round((todayProgress / todayGoal) * 100)}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="w-full md:w-auto md:min-w-[300px] bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Daily Challenge</h3>
                    <p className="text-sm text-white/80 mt-1">
                      <span className="inline-flex items-center">
                        <span className="mr-1">{dailyChallenge.subject}</span>
                        <Badge variant="outline" className="ml-2 bg-white/10 text-white border-white/20">
                          +10 points
                        </Badge>
                      </span>
                    </p>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </div>

                <div className="mt-4">
                  <p className="text-sm">{dailyChallenge.question}</p>

                  <div className="mt-3 space-y-2">
                    {dailyChallenge.options.map((option, index) => (
                      <button
                        key={index}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          selectedAnswer === index
                            ? index === dailyChallenge.answer
                              ? "bg-green-500/20 border border-green-500/50"
                              : "bg-red-500/20 border border-red-500/50"
                            : "bg-white/10 hover:bg-white/20 border border-transparent"
                        }`}
                        onClick={() => handleChallengeAnswer(index)}
                        disabled={showAnswer}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showAnswer && (
                    <p className="mt-3 text-sm">
                      {selectedAnswer === dailyChallenge.answer
                        ? "✅ Correct! Well done!"
                        : `❌ The correct answer is ${dailyChallenge.options[dailyChallenge.answer]}`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Cards */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-brand-navy mb-4 flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Your Subjects
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {subjects.map((subject) => (
                <Link href={`/home/learning/${subject.id}`} key={subject.id}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden group">
                    <div className="h-2" style={{ backgroundColor: subject.color }} />
                    <CardContent className="p-4 pt-6 flex flex-col h-full">
                      <div className="mb-2 text-2xl">{subject.icon}</div>
                      <h3 className="font-semibold group-hover:text-brand-coral transition-colors">{subject.name}</h3>

                      <div className="mt-auto pt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{subject.progress}%</span>
                        </div>
                        <Progress
                          value={subject.progress}
                          className="h-2"
                          style={
                            {
                              backgroundColor: "rgba(0,0,0,0.1)",
                              "--progress-background": subject.color,
                            } as React.CSSProperties
                          }
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${subject.progress}%`,
                              backgroundColor: subject.color,
                              transition: "width 0.3s ease-in-out",
                            }}
                          />
                        </Progress>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Tabs for different sections */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="learning" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="learning" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className={isMobile ? "hidden" : "inline"}>Learning</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  <span className={isMobile ? "hidden" : "inline"}>Progress</span>
                </TabsTrigger>
                <TabsTrigger value="assessments" className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className={isMobile ? "hidden" : "inline"}>Assessments</span>
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className={isMobile ? "hidden" : "inline"}>Files</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="learning" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-brand-navy">Recent Learning</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/home/learning" className="flex items-center gap-1">
                      View All <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentLearning.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="h-1" style={{ backgroundColor: getSubjectColor(item.subject) }} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              variant="outline"
                              className="mb-2"
                              style={{
                                color: getSubjectColor(item.subject),
                                borderColor: `${getSubjectColor(item.subject)}50`,
                              }}
                            >
                              {item.subject}
                            </Badge>
                            <h4 className="font-medium">{item.title}</h4>
                          </div>
                          <div className="flex flex-col items-end text-sm text-gray-500">
                            <span>{item.date}</span>
                            <span className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" /> {item.duration}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Completion</span>
                            <span>{item.progress}%</span>
                          </div>
                          <Progress value={item.progress} className="h-1.5" />
                        </div>

                        <Button className="w-full mt-3" variant="outline" asChild>
                          <Link href={`/home/learning/${item.subject.toLowerCase()}/${item.id}`}>
                            Continue Learning
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-brand-navy/5 to-brand-coral/5 border-dashed">
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-navy">Recommended for you</h3>
                      <p className="text-gray-600 mt-1">
                        Based on your progress, we recommend focusing on Hindi and Social Science
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button asChild>
                        <Link href="/home/learning/hindi">Start Hindi</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/home/learning/social-science">Start Social Science</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-brand-navy">Your Progress</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/home/progress" className="flex items-center gap-1">
                      Detailed Progress <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Subject Progress</CardTitle>
                      <CardDescription>Your progress across all subjects</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <SubjectProgressChart subjects={subjects} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Learning Streak</CardTitle>
                      <CardDescription>Keep your streak going!</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-bold text-brand-coral">{streak}</span>
                          </div>
                          <svg className="w-32 h-32" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#FF9D8A"
                              strokeWidth="8"
                              strokeDasharray="283"
                              strokeDashoffset={283 - (283 * streak) / 10}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-center text-gray-600 mb-4">
                        You've been learning for <span className="font-semibold text-brand-navy">{streak} days</span> in
                        a row!
                      </p>
                      <div className="flex justify-center">
                        <Badge className="bg-brand-navy text-white">
                          <Flame className="h-4 w-4 mr-1 text-yellow-300" />
                          {streak} Day Streak
                        </Badge>
                      </div>

                      <div className="mt-6 grid grid-cols-7 gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                              i < streak % 7 ? "bg-brand-coral/20 text-brand-coral" : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {["M", "T", "W", "T", "F", "S", "S"][i]}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-brand-navy mb-3">Recent Achievements</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <Card key={achievement.id} className="overflow-hidden">
                        <div className={`h-1 ${achievement.color}`} />
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className={`p-2 rounded-full ${achievement.color} bg-opacity-20`}>
                            <achievement.icon className={`h-5 w-5 ${achievement.color} text-white`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assessments" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-brand-navy">Upcoming Assessments</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/home/assessment" className="flex items-center gap-1">
                      All Assessments <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingAssessments.map((assessment) => (
                    <Card key={assessment.id} className="overflow-hidden">
                      <div className="h-1" style={{ backgroundColor: getSubjectColor(assessment.subject) }} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              variant="outline"
                              className="mb-2"
                              style={{
                                color: getSubjectColor(assessment.subject),
                                borderColor: `${getSubjectColor(assessment.subject)}50`,
                              }}
                            >
                              {assessment.subject}
                            </Badge>
                            <h4 className="font-medium">{assessment.title}</h4>
                          </div>
                          <div className="flex flex-col items-end text-sm">
                            <span className="text-gray-500">{assessment.date}</span>
                            <Badge
                              variant="outline"
                              className="mt-1"
                              style={{
                                color:
                                  assessment.difficulty === "Easy"
                                    ? "#22c55e"
                                    : assessment.difficulty === "Medium"
                                      ? "#f59e0b"
                                      : "#ef4444",
                                borderColor:
                                  assessment.difficulty === "Easy"
                                    ? "#22c55e50"
                                    : assessment.difficulty === "Medium"
                                      ? "#f59e0b50"
                                      : "#ef444450",
                              }}
                            >
                              {assessment.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm text-gray-500">{assessment.questions} questions</span>
                          <Button size="sm" asChild>
                            <Link href={`/home/assessment/${assessment.subject.toLowerCase()}`}>Start Assessment</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="bg-gradient-to-r from-brand-navy/5 to-brand-coral/5 border-dashed">
                    <CardContent className="p-6 flex flex-col justify-center items-center h-full">
                      <h3 className="text-lg font-semibold text-brand-navy">Create New Assessment</h3>
                      <p className="text-gray-600 text-center mt-1 mb-4">
                        Test your knowledge with a custom assessment
                      </p>
                      <Button asChild>
                        <Link href="/home/assessment">Create Assessment</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-brand-navy">Recent Files</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/home/files" className="flex items-center gap-1">
                      All Files <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden">
                      <div className="h-1" style={{ backgroundColor: getSubjectColor(file.subject) }} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-md">
                              <FileText className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">{file.name}</h4>
                              <div className="flex items-center mt-1">
                                <Badge
                                  variant="outline"
                                  className="mr-2"
                                  style={{
                                    color: getSubjectColor(file.subject),
                                    borderColor: `${getSubjectColor(file.subject)}50`,
                                  }}
                                >
                                  {file.subject}
                                </Badge>
                                <span className="text-xs text-gray-500">{file.size}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{file.date}</span>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/home/assessment/${file.subject.toLowerCase()}/pdf/${file.id}`}>
                              <ClipboardCheck className="h-4 w-4 mr-1" />
                              Assessment
                            </Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={`/home/learning/${file.subject.toLowerCase()}/${file.id}`}>
                              <BookOpen className="h-4 w-4 mr-1" />
                              Learn
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="bg-gradient-to-r from-brand-navy/5 to-brand-coral/5 border-dashed">
                    <CardContent className="p-6 flex flex-col justify-center items-center h-full">
                      <h3 className="text-lg font-semibold text-brand-navy">Upload New File</h3>
                      <p className="text-gray-600 text-center mt-1 mb-4">
                        Upload your study materials to learn and create assessments
                      </p>
                      <Button asChild>
                        <Link href="/home/files">Upload File</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Study Recommendations */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-brand-coral" />
                      Personalized Study Plan
                    </h3>
                    <p className="mt-1 text-white/80">
                      We've analyzed your progress and created a personalized study plan to help you improve.
                    </p>
                  </div>
                  <Button className="bg-white text-brand-navy hover:bg-white/90" asChild>
                    <Link href="/home/progress">View Study Plan</Link>
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="font-medium text-brand-coral">Focus Areas</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-coral mr-2"></span>
                        Hindi Grammar
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-coral mr-2"></span>
                        Social Science History
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-coral mr-2"></span>
                        Science Experiments
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="font-medium text-brand-coral">Strengths</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2"></span>
                        Mathematics Algebra
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2"></span>
                        English Reading
                      </li>
                      <li className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2"></span>
                        Science Biology
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="font-medium text-brand-coral">Recommended Time</h4>
                    <div className="mt-3 space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Hindi</span>
                          <span>45 min/day</span>
                        </div>
                        <Progress value={75} className="h-1.5 bg-white/20">
                          <div className="h-full bg-brand-coral" style={{ width: "75%" }} />
                        </Progress>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Social Science</span>
                          <span>30 min/day</span>
                        </div>
                        <Progress value={50} className="h-1.5 bg-white/20">
                          <div className="h-full bg-brand-coral" style={{ width: "50%" }} />
                        </Progress>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Science</span>
                          <span>20 min/day</span>
                        </div>
                        <Progress value={35} className="h-1.5 bg-white/20">
                          <div className="h-full bg-brand-coral" style={{ width: "35%" }} />
                        </Progress>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-coral mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your personalized dashboard...</p>
          </div>
        </div>
      )}
    </div>
  )
}
