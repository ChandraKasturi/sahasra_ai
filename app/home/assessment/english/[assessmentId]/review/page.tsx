"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  FileQuestion,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  BarChart,
  Share2,
  Printer,
  Download,
  BookIcon,
  LightbulbIcon,
  CheckCircle,
  XIcon,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

// Types
interface Question {
  id: string
  questionid: string
  type: "mcq" | "true-false" | "descriptive"
  text: string
  image?: string
  options?: string[]
  correctAnswer?: string | boolean | null
  userAnswer?: string | boolean | null
  explanation?: string
  feedback?: string
  is_correct?: boolean
  flagged?: boolean
  rawCorrectAnswer?: string | boolean | null
  studentanswer?: string | null
  option1?: string
  option2?: string
  option3?: string
  option4?: string
}

interface AssessmentDetails {
  id: string
  name: string
  subject: string
  topics: string[]
  questionTypes: string[]
  difficultyLevel: string
  numberOfQuestions: number
  timeLimit: number // in minutes
  timeTaken: number // in seconds
  score: number
  totalMarks: number
  submittedAt: string
}

interface AssessmentResults {
  assessment_id: string
  student_id: string
  submission_time: string
  results: {
    questionid: string
    is_correct: boolean
    feedback: string
  }[]
  correct_count: number
  total_questions: number
  score_percentage: number
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

export default function AssessmentReviewPage({ params }: { params: { assessmentId: string; subject?: string } }) {
  const router = useRouter()
  const isMobile = useMobile()
  // Use a fallback to 'english' since this file is in the english directory
  const subject = params.subject || "english"
  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isNavigationOpen, setIsNavigationOpen] = useState(!isMobile)
  const questionContentRef = useRef<HTMLDivElement>(null)
  const [expandedExplanations, setExpandedExplanations] = useState<string[]>([])
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setIsLoading(true)
        
        // Sample assessment details (in a real app, you'd fetch this from an API)
        const details = {
          id: params.assessmentId,
          name: "Assessment Review",
          subject: subject,
          topics: ["Topic 1", "Topic 2"],
          questionTypes: ["Multiple Choice", "True / False", "Fill Blanks / Descriptive"],
          difficultyLevel: "Medium",
          numberOfQuestions: 0, // Will be updated
          timeLimit: 20,
          timeTaken: 0, // Will be updated if available
          score: 0, // Will be updated
          totalMarks: 0, // Will be updated
          submittedAt: new Date().toISOString(),
        }
        
        // Get auth token
        const authToken = getAuthToken()
        
        // Fetch assessment results
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - 35)
        
        const response = await fetch(buildApiUrlNoPort(`${API_ENDPOINTS.ASSESSMENTS}?subject=${subject}`), {
          headers: {
            "Content-Type": "application/json",
            "x-auth-session": authToken || "",
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment: ${response.status}`)
        }
        
        const assessments = await response.json()
        
        // Find this specific assessment
        const assessment = assessments.find((a: any) => a._id === params.assessmentId)
        
        if (!assessment) {
          throw new Error("Assessment not found")
        }
        
        // Get the assessment questions
        const originalQuestions = assessment.questions || []
        details.numberOfQuestions = originalQuestions.length
        details.totalMarks = originalQuestions.length
        
        // Get the submission results if available
        const submissionResults = assessment.last_submission
        
        if (submissionResults) {
          setAssessmentResults(submissionResults)
          details.score = submissionResults.correct_count
          details.submittedAt = submissionResults.submission_time
        }
        
        // Format questions with results
        const formattedQuestions = originalQuestions.map((q: any) => {
          const questionTypeApi = q.question_type?.toLowerCase()
          let determinedType: "mcq" | "true-false" | "descriptive"

          if (questionTypeApi === "mcq" || (q.options || q.option1)) {
            determinedType = "mcq"
          } else if (questionTypeApi === "truefalse" || q.correct_answer !== undefined || typeof q.correctanswer === 'boolean' || (typeof q.correctanswer === 'string' && (q.correctanswer.toLowerCase() === 'true' || q.correctanswer.toLowerCase() === 'false'))) {
            determinedType = "true-false"
          } else {
            determinedType = "descriptive"
          }

          const formattedQuestion: Question = {
            id: q.id || q._id || String(Math.random()),
            questionid: q.id || q._id || String(Math.random()),
            type: determinedType,
            text: q.question || q.text || "",
            is_correct: q.is_correct || false,
            feedback: q.feedback || "",
            studentanswer: q.student_answer,
            rawCorrectAnswer: q.correctanswer !== undefined ? q.correctanswer : q.correct_answer,
          }

          if (formattedQuestion.type === "mcq") {
            if (q.options && Array.isArray(q.options)) {
              formattedQuestion.options = q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text || String(opt))
            } else {
              const mcqOptions = []
              for (let i = 1; i <= 4; i++) {
                if (q[`option${i}`]) mcqOptions.push(q[`option${i}`])
              }
              if (mcqOptions.length > 0) formattedQuestion.options = mcqOptions
            }
          }

          if (q.student_answer !== undefined && q.student_answer !== null) {
            if (formattedQuestion.type === "mcq") {
              if (String(q.student_answer).startsWith("option")) {
                const optionIndex = parseInt(String(q.student_answer).replace("option", "")) - 1
                if (formattedQuestion.options && optionIndex >= 0 && optionIndex < formattedQuestion.options.length) {
                  formattedQuestion.userAnswer = formattedQuestion.options[optionIndex]
                }
              } else {
                formattedQuestion.userAnswer = String(q.student_answer)
              }
            } else if (formattedQuestion.type === "true-false") {
              formattedQuestion.userAnswer = String(q.student_answer).toLowerCase() === "true"
            } else {
              formattedQuestion.userAnswer = String(q.student_answer)
            }
          }

          if (formattedQuestion.rawCorrectAnswer !== undefined && formattedQuestion.rawCorrectAnswer !== null) {
            if (formattedQuestion.type === "mcq") {
              if (typeof formattedQuestion.rawCorrectAnswer === 'string' && formattedQuestion.rawCorrectAnswer.startsWith("option")) {
                const correctOptionIndex = parseInt(formattedQuestion.rawCorrectAnswer.replace("option", "")) - 1
                if (formattedQuestion.options && correctOptionIndex >= 0 && correctOptionIndex < formattedQuestion.options.length) {
                  formattedQuestion.correctAnswer = formattedQuestion.options[correctOptionIndex]
                }
              } else {
                formattedQuestion.correctAnswer = String(formattedQuestion.rawCorrectAnswer)
              }
            } else if (formattedQuestion.type === "true-false") {
              formattedQuestion.correctAnswer = String(formattedQuestion.rawCorrectAnswer).toLowerCase() === "true"
            } else {
              formattedQuestion.correctAnswer = q.model_answer || String(formattedQuestion.rawCorrectAnswer)
            }
          }

          if (q.model_answer && formattedQuestion.type === "descriptive") {
            formattedQuestion.correctAnswer = q.model_answer
          }

          if (q.explanation || q.explaination) {
            formattedQuestion.explanation = q.explanation || q.explaination
          }
          if (q.image) {
            formattedQuestion.image = q.image
          }

          return formattedQuestion
        })
        
        setAssessmentDetails(details)
        setQuestions(formattedQuestions)
      } catch (error) {
        console.error("Error fetching assessment data:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment results. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAssessmentData()
  }, [params.assessmentId, subject])

  // Reset scroll position when changing questions
  useEffect(() => {
    if (questionContentRef.current) {
      questionContentRef.current.scrollTop = 0
    }
  }, [currentQuestionIndex])

  // Format time taken
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Handle navigation between questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  // Toggle explanation
  const toggleExplanation = (questionId: string) => {
    setExpandedExplanations((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  // Calculate performance metrics
  const calculatePerformance = () => {
    if (!questions.length) return { correct: 0, incorrect: 0, percentage: 0 }

    if (assessmentResults) {
      return {
        correct: assessmentResults.correct_count,
        incorrect: assessmentResults.total_questions - assessmentResults.correct_count,
        percentage: assessmentResults.score_percentage,
      }
    }

    const correct = questions.filter(q => q.is_correct).length
    const incorrect = questions.length - correct
    const percentage = Math.round((correct / questions.length) * 100)

    return { correct, incorrect, percentage }
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex]
  const performance = calculatePerformance()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!assessmentDetails || questions.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">Assessment Not Found</CardTitle>
            <CardDescription>
              We couldn't find the assessment you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The assessment may have been deleted or you might not have permission to access it.</p>
          </CardContent>
          <CardFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`/home/assessment/${subject}`)}
            >
              Back to Assessments
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={slideUp} className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/home/assessment/${subject}`)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Assessment Review</h1>
            </div>
            <p className="text-gray-600 mt-1">
              {assessmentDetails.name} • Completed on {formatDate(assessmentDetails.submittedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* Assessment Summary Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Assessment Details</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="font-medium">{assessmentDetails.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileQuestion className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Questions</p>
                      <p className="font-medium">{assessmentDetails.numberOfQuestions} questions</p>
                    </div>
                  </div>
                  {assessmentDetails.timeTaken > 0 && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Time Taken</p>
                        <p className="font-medium">
                          {formatTime(assessmentDetails.timeTaken)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="relative h-32 w-32 mb-3">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">
                        {assessmentDetails.score}/{assessmentDetails.totalMarks}
                      </div>
                    </div>
                  </div>
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="10"
                      strokeDasharray={`${(performance.percentage / 100) * 283} ${283 - (performance.percentage / 100) * 283}`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-blue-700">Your Score</h3>
                <p className="text-gray-600 mt-1">
                  {performance.percentage >= 80
                    ? "Excellent!"
                    : performance.percentage >= 60
                      ? "Good job!"
                      : "Keep practicing!"}
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 mx-auto">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm mt-1">{performance.correct} Correct</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600 mx-auto">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <p className="text-sm mt-1">{performance.incorrect} Incorrect</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mobile Question Navigation Toggle */}
      {isMobile && (
        <div className="mb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between border-blue-200 text-blue-700"
            onClick={() => setIsNavigationOpen(!isNavigationOpen)}
          >
            <div className="flex items-center">
              <Menu className="h-4 w-4 mr-2" />
              Question Navigation
            </div>
            {isNavigationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        {(isNavigationOpen || !isMobile) && (
          <div className="md:col-span-1">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Questions</CardTitle>
                <CardDescription>Navigate between questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-3 gap-2 px-1">
                  {questions.map((question, index) => {
                    const isCorrect = question.is_correct
                    return (
                      <Button
                        key={question.id}
                        variant={currentQuestionIndex === index ? "default" : "outline"}
                        className={cn(
                          "h-10 w-10 p-0 font-medium",
                          currentQuestionIndex === index ? "bg-blue-600 text-white" : "",
                          isCorrect ? "border-green-500" : "border-red-500",
                        )}
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span>Incorrect</span>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-4">
              <Button
                variant="default"
                className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/home/assessment/${subject}`)}
              >
                <BarChart className="h-4 w-4" />
                View All Assessments
              </Button>
            </div>
          </div>
        )}

        {/* Question Review Content */}
        {currentQuestion && (
          <div className="md:col-span-3">
            <Card className="border-blue-200 h-full">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      currentQuestion.is_correct
                        ? "text-green-600 border-green-200 bg-green-50"
                        : "text-red-600 border-red-200 bg-red-50"
                    }
                  >
                    {currentQuestion.is_correct ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XIcon className="h-3 w-3 mr-1" />
                    )}
                    {currentQuestion.is_correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-3">{currentQuestion.text}</CardTitle>
              </CardHeader>

              <div ref={questionContentRef} className="overflow-auto">
                <CardContent className="p-6">
                  {/* Question Image if available */}
                  {currentQuestion.image && (
                    <div className="mb-6 flex justify-center">
                      <Image
                        src={currentQuestion.image || "/placeholder.svg"}
                        alt="Question visual"
                        width={400}
                        height={200}
                        className="rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Question Answer Review */}
                  <div className="mt-4 space-y-6">
                    {/* MCQ Review */}
                    {currentQuestion.type === "mcq" && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                          const correctOptionIndex = 
                            typeof currentQuestion.rawCorrectAnswer === 'string' && currentQuestion.rawCorrectAnswer.startsWith("option")
                            ? parseInt(currentQuestion.rawCorrectAnswer.replace("option", "")) - 1
                            : -1;
                            
                          const isCorrectOption = option === currentQuestion.correctAnswer || 
                                                (correctOptionIndex !== -1 && index === correctOptionIndex) ||
                                                option === currentQuestion.rawCorrectAnswer;
                          const isUserOption = option === currentQuestion.userAnswer;

                          return (
                            <div
                              key={index}
                              className={cn(
                                "p-4 rounded-md border",
                                isCorrectOption
                                  ? "bg-green-50 border-green-200"
                                  : isUserOption && !isCorrectOption
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-none h-5 w-5 rounded-full border relative">
                                  {isCorrectOption && (
                                    <CheckCircle className="h-5 w-5 text-green-600 absolute -top-[1px] -left-[1px]" />
                                  )}
                                  {isUserOption && !isCorrectOption && (
                                    <XIcon className="h-5 w-5 text-red-600 absolute -top-[1px] -left-[1px]" />
                                  )}
                                  {isUserOption && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "font-medium",
                                    isCorrectOption ? "text-green-700" : isUserOption ? "text-red-700" : "",
                                  )}
                                >
                                  {option}
                                </span>
                                {isUserOption && !isCorrectOption && (
                                  <span className="ml-auto text-sm text-red-600">Your answer</span>
                                )}
                                {isCorrectOption && !isUserOption && (
                                  <span className="ml-auto text-sm text-green-600">Correct answer</span>
                                )}
                                {isCorrectOption && isUserOption && (
                                  <span className="ml-auto text-sm text-green-600">Your answer (Correct)</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* True/False Review */}
                    {currentQuestion.type === "true-false" && (
                      <div className="space-y-3">
                        {[true, false].map((option, index) => {
                          const isCorrectOption = option === currentQuestion.correctAnswer;
                          const isUserOption = option === currentQuestion.userAnswer;

                          return (
                            <div
                              key={index}
                              className={cn(
                                "p-4 rounded-md border",
                                isCorrectOption
                                  ? "bg-green-50 border-green-200"
                                  : isUserOption && !isCorrectOption
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-none h-5 w-5 rounded-full border relative">
                                  {isCorrectOption && (
                                    <CheckCircle className="h-5 w-5 text-green-600 absolute -top-[1px] -left-[1px]" />
                                  )}
                                  {isUserOption && !isCorrectOption && (
                                    <XIcon className="h-5 w-5 text-red-600 absolute -top-[1px] -left-[1px]" />
                                  )}
                                  {isUserOption && (
                                    <div className="h-2 w-2 bg-blue-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "font-medium",
                                    isCorrectOption ? "text-green-700" : isUserOption ? "text-red-700" : "",
                                  )}
                                >
                                  {option ? "True" : "False"}
                                </span>
                                {isUserOption && !isCorrectOption && (
                                  <span className="ml-auto text-sm text-red-600">Your answer</span>
                                )}
                                {isCorrectOption && !isUserOption && (
                                  <span className="ml-auto text-sm text-green-600">Correct answer</span>
                                )}
                                {isCorrectOption && isUserOption && (
                                  <span className="ml-auto text-sm text-green-600">Your answer (Correct)</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Descriptive Review */}
                    {currentQuestion.type === "descriptive" && (
                      <div className="space-y-4">
                        {currentQuestion.userAnswer && (
                          <div className="p-4 rounded-md border border-blue-200 bg-blue-50">
                            <h4 className="font-medium text-blue-700 mb-2">Your Answer:</h4>
                            <div className="whitespace-pre-wrap p-3 bg-white rounded-md border min-h-[100px]">
                              {String(currentQuestion.userAnswer)}
                            </div>
                          </div>
                        )}

                        {currentQuestion.correctAnswer && (
                          <div className="p-4 rounded-md border border-green-200 bg-green-50">
                            <h4 className="font-medium text-green-700 mb-2">Model Answer:</h4>
                            <p className="text-gray-700">{String(currentQuestion.correctAnswer)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation and Feedback */}
                    {(currentQuestion.explanation || currentQuestion.feedback) && (
                      <div className="border rounded-md border-blue-200 overflow-hidden">
                        <button
                          onClick={() => toggleExplanation(currentQuestion.id)}
                          className="w-full flex items-center justify-between p-4 text-blue-700 hover:bg-blue-50"
                        >
                          <div className="flex items-center">
                            <LightbulbIcon className="h-5 w-5 mr-2" />
                            <span className="font-medium">Explanation & Feedback</span>
                          </div>
                          {expandedExplanations.includes(currentQuestion.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        {expandedExplanations.includes(currentQuestion.id) && (
                          <div className="p-4 pt-0 bg-blue-50">
                            {currentQuestion.explanation && (
                              <div className="mb-4">
                                <h5 className="font-medium text-blue-700 mb-1">Explanation:</h5>
                                <p className="text-gray-700">{currentQuestion.explanation}</p>
                              </div>
                            )}
                            {currentQuestion.feedback && (
                              <div>
                                <h5 className="font-medium text-blue-700 mb-1">Feedback:</h5>
                                <p className="text-gray-700">{currentQuestion.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="flex justify-between p-4 border-t">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <motion.div variants={slideUp} className="mt-8">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Performance Summary
            </CardTitle>
            <CardDescription>Summary of your performance in this assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-medium text-gray-700 mb-3">Score Breakdown</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between mb-2">
                    <span>Total Score:</span>
                    <span className="font-bold">{performance.percentage}%</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Correct Answers:</span>
                    <span className="text-green-600">{performance.correct} of {questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incorrect Answers:</span>
                    <span className="text-red-600">{performance.incorrect} of {questions.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-700 mb-3">Areas for Improvement</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-700">
                    {performance.percentage >= 80
                      ? "Excellent work! Continue practicing to maintain your knowledge."
                      : performance.percentage >= 60
                        ? "Good effort! Review the questions you got wrong to improve further."
                        : "Keep practicing! Review all the questions and explanations to strengthen your understanding."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`/home/assessment/${subject}`)}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Return to Assessments
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
