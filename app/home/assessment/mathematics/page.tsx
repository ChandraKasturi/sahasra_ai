"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Calculator,
  ChevronRight,
  Clock,
  Award,
  TrendingUp,
  Trophy,
  Zap,
  Target,
  ArrowRight,
  Play,
  BookOpen,
  BarChart3,
  Percent,
  Sigma,
  Plus,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateAssessmentModal, type Topic } from "@/components/assessment/create-assessment-modal"

// Topic data for mathematics
const topicData = [
  {
    id: 1,
    name: "Algebra",
    description: "Equations, expressions, and algebraic structures",
    icon: <X className="h-5 w-5" />,
    difficulty: "Medium",
    estimatedTime: "20 min",
    questions: 15,
  },
  {
    id: 2,
    name: "Geometry",
    description: "Shapes, sizes, and properties of space",
    icon: <Target className="h-5 w-5" />,
    difficulty: "Medium",
    estimatedTime: "25 min",
    questions: 12,
  },
  {
    id: 3,
    name: "Arithmetic",
    description: "Basic operations and number properties",
    icon: <Plus className="h-5 w-5" />,
    difficulty: "Easy",
    estimatedTime: "15 min",
    questions: 10,
  },
  {
    id: 4,
    name: "Statistics",
    description: "Data collection, analysis, and interpretation",
    icon: <BarChart3 className="h-5 w-5" />,
    difficulty: "Medium",
    estimatedTime: "20 min",
    questions: 15,
  },
  {
    id: 5,
    name: "Calculus",
    description: "Rates of change and accumulation",
    icon: <Sigma className="h-5 w-5" />,
    difficulty: "Hard",
    estimatedTime: "30 min",
    questions: 12,
  },
  {
    id: 6,
    name: "Probability",
    description: "Chance and randomness in events",
    icon: <Percent className="h-5 w-5" />,
    difficulty: "Medium",
    estimatedTime: "20 min",
    questions: 15,
  },
]

// Available topics for Mathematics
const availableTopics: Topic[] = [
  { id: "algebra", name: "Algebra" },
  { id: "geometry", name: "Geometry" },
  { id: "arithmetic", name: "Arithmetic" },
  { id: "statistics", name: "Statistics" },
  { id: "calculus", name: "Calculus" },
  { id: "probability", name: "Probability" },
  { id: "trigonometry", name: "Trigonometry" },
  { id: "number-theory", name: "Number Theory" },
  { id: "matrices", name: "Matrices" },
  { id: "vectors", name: "Vectors" },
]

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

export default function MathematicsAssessmentPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div variants={slideUp} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold text-brand-navy">Mathematics Assessment</h1>
        </div>
        <p className="text-gray-600">
          Begin your mathematics journey! Take assessments to track your progress and master key concepts.
        </p>
      </motion.div>

      {/* Welcome Card for New Users */}
      <motion.div variants={scaleIn} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="mb-6">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <Badge className="bg-red-500 hover:bg-red-600">New</Badge>
                  <span className="text-sm font-medium text-gray-500">Getting Started</span>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  Welcome to Mathematics Assessments!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 max-w-md"
                >
                  You haven't taken any assessments yet. Start your journey by selecting a topic below and test your
                  knowledge!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3 pt-2"
                >
                  <Button className="bg-red-500 hover:bg-red-600" onClick={() => setIsModalOpen(true)}>
                    Take First Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-500 hover:bg-red-50">
                    View Topics
                  </Button>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="relative"
              >
                <motion.div animate={pulse} className="p-4 bg-white rounded-full shadow-lg">
                  <Calculator className="h-12 w-12 text-red-500" />
                </motion.div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="absolute -top-2 -right-2 p-2 bg-amber-400 rounded-full"
                >
                  <Trophy className="h-4 w-4 text-white" />
                </motion.div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={slideUp}>
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Assessment History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Topic Cards */}
            <motion.div
              key="topic-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-red-500" />
                    Mathematics Topics
                  </CardTitle>
                  <CardDescription>Select a topic to begin your assessment journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {topicData.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        variants={itemFade}
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        }}
                        className="border rounded-lg overflow-hidden bg-white"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-red-100 rounded-lg text-red-500">{topic.icon}</div>
                              <h3 className="font-medium">{topic.name}</h3>
                            </div>
                            <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                              {topic.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Mastery Level</span>
                              <span>0%</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          <div className="flex justify-between text-sm mb-4">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{topic.estimatedTime}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <BookOpen className="h-4 w-4" />
                              <span>{topic.questions} questions</span>
                            </div>
                          </div>
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                              className="w-full bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => setIsModalOpen(true)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Assessment
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits of Assessments */}
            <motion.div
              key="benefits-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Benefits of Regular Assessments
                  </CardTitle>
                  <CardDescription>Discover how assessments can improve your mathematics skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <motion.div
                      variants={itemFade}
                      whileHover={{ y: -5 }}
                      className="p-4 border rounded-lg bg-gradient-to-b from-white to-red-50"
                    >
                      <div className="p-3 bg-red-100 rounded-full w-fit mb-3">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      </div>
                      <h3 className="font-medium mb-2">Track Progress</h3>
                      <p className="text-sm text-gray-600">
                        Monitor your improvement over time with detailed performance analytics
                      </p>
                    </motion.div>
                    <motion.div
                      variants={itemFade}
                      whileHover={{ y: -5 }}
                      className="p-4 border rounded-lg bg-gradient-to-b from-white to-amber-50"
                    >
                      <div className="p-3 bg-amber-100 rounded-full w-fit mb-3">
                        <Target className="h-5 w-5 text-amber-500" />
                      </div>
                      <h3 className="font-medium mb-2">Identify Weaknesses</h3>
                      <p className="text-sm text-gray-600">
                        Discover areas that need improvement to focus your study efforts
                      </p>
                    </motion.div>
                    <motion.div
                      variants={itemFade}
                      whileHover={{ y: -5 }}
                      className="p-4 border rounded-lg bg-gradient-to-b from-white to-green-50"
                    >
                      <div className="p-3 bg-green-100 rounded-full w-fit mb-3">
                        <Trophy className="h-5 w-5 text-green-500" />
                      </div>
                      <h3 className="font-medium mb-2">Earn Achievements</h3>
                      <p className="text-sm text-gray-600">
                        Collect badges and rewards as you master different mathematics topics
                      </p>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <motion.div
              key="empty-history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="p-4 bg-red-100 rounded-full mb-4"
                  >
                    <Calculator className="h-8 w-8 text-red-500" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold mb-2"
                  >
                    No Assessment History Yet
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 max-w-md mb-6"
                  >
                    You haven't taken any mathematics assessments yet. Start your journey by completing your first
                    assessment to see your results here.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="bg-red-500 hover:bg-red-600" onClick={() => setIsModalOpen(true)}>
                      Take Your First Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* What to Expect */}
            <motion.div
              key="what-to-expect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-red-500" />
                    What to Expect in Mathematics Assessments
                  </CardTitle>
                  <CardDescription>Learn about the format and types of questions you'll encounter</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                    <motion.div
                      variants={itemFade}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                        <h4 className="font-medium">Algebra</h4>
                      </div>
                      <p className="text-sm text-gray-600 ml-10">
                        Solve equations, simplify expressions, and work with variables and constants
                      </p>
                    </motion.div>
                    <motion.div
                      variants={itemFade}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                          <Target className="h-4 w-4 text-red-500" />
                        </div>
                        <h4 className="font-medium">Geometry</h4>
                      </div>
                      <p className="text-sm text-gray-600 ml-10">
                        Calculate areas, perimeters, and volumes of various shapes and figures
                      </p>
                    </motion.div>
                    <motion.div
                      variants={itemFade}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full">
                          <BarChart3 className="h-4 w-4 text-red-500" />
                        </div>
                        <h4 className="font-medium">Statistics</h4>
                      </div>
                      <p className="text-sm text-gray-600 ml-10">
                        Analyze data, calculate mean, median, mode, and interpret statistical information
                      </p>
                    </motion.div>
                  </motion.div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    Learn More About Assessments
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Motivational Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-4">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-2xl md:text-3xl font-bold"
                >
                  Begin Your Mathematics Journey!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-white/90 max-w-md"
                >
                  Mathematics is the foundation of problem-solving and logical thinking. Start your assessment journey
                  today and build essential skills for success!
                </motion.p>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex gap-3">
                  <motion.div variants={itemFade} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-white text-red-600 hover:bg-gray-100" onClick={() => setIsModalOpen(true)}>
                      Start First Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div variants={itemFade} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                      View Learning Resources
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 1,
                }}
                animate={pulse}
                className="hidden md:block"
              >
                <div className="relative">
                  <Calculator className="h-24 w-24 text-white opacity-90" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="absolute -top-2 -right-2 p-2 bg-yellow-400 rounded-full"
                  >
                    <Zap className="h-4 w-4 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CreateAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject="mathematics"
        subjectColor="red"
        availableTopics={availableTopics}
      />
    </motion.div>
  )
}
