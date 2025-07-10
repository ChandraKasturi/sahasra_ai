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
  AlertCircle,
  ArrowLeft,
  Flag,
  Check,
  X,
  HelpCircle,
  Menu,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import useMobile from "@/hooks/use-mobile"
import { getAuthToken } from "@/lib/auth"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"
import { toast } from "@/components/ui/use-toast"

// Types
interface Question {
  id: string
  type: "mcq" | "true-false" | "short-answer" | "very-short-answer" | "long-answer" | "case-study"
  text: string
  image?: string
  options?: string[]
  answer?: string | boolean | null
  userAnswer?: string | boolean | null
  wordCount?: number
  flagged?: boolean
  questionid?: string
  question_type?: string
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
  lastSubmission?: any
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

// Sample assessment data
const getAssessmentDetails = (id: string): AssessmentDetails => {
  return {
    id,
    name: "Reading Comprehension and Grammar Assessment",
    subject: "English",
    topics: ["Reading Comprehension", "Grammar", "Vocabulary"],
    questionTypes: ["Multiple Choice", "True / False", "Fill Blanks / Descriptive"],
    difficultyLevel: "Medium",
    numberOfQuestions: 10,
    timeLimit: 20, // 20 minutes
  }
}

// Sample questions
const getQuestions = (): Question[] => {
  return [
    {
      id: "1",
      questionid: "q1",
      type: "mcq",
      question_type: "MCQ",
      text: "What literary device is used in the sentence: 'The wind whispered through the trees'?",
      options: ["Metaphor", "Personification", "Simile", "Alliteration"],
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "2",
      questionid: "q2",
      type: "mcq",
      question_type: "MCQ",
      text: "Identify the correct sentence:",
      options: [
        "Between you and I, this is a secret.",
        "Between you and me, this is a secret.",
        "Between yourself and I, this is a secret.",
        "Between yourself and me, this is a secret.",
      ],
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "3",
      questionid: "q3",
      type: "true-false",
      question_type: "TRUEFALSE",
      text: "In the sentence 'She walked quickly to the store', 'quickly' is an adverb.",
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "4",
      questionid: "q4",
      type: "short-answer",
      question_type: "SHORT_ANSWER",
      text: "Explain the difference between 'affect' and 'effect' and provide an example sentence for each.",
      answer: "",
      userAnswer: "",
      wordCount: 0,
      flagged: false,
    },
    {
      id: "5",
      questionid: "q5",
      type: "mcq",
      question_type: "MCQ",
      text: "Look at the image below. What type of poem is illustrated in this visual representation?",
      image: "/placeholder.svg?height=200&width=400",
      options: ["Sonnet", "Haiku", "Limerick", "Free Verse"],
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "6",
      questionid: "q6",
      type: "true-false",
      question_type: "TRUEFALSE",
      text: "Based on the image below, this is an example of a first-person narrative perspective.",
      image: "/placeholder.svg?height=200&width=400",
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "7",
      questionid: "q7",
      type: "long-answer",
      question_type: "LONG_ANSWER",
      text: "Analyze the imagery in the picture below and explain how it contributes to the mood of the scene.",
      image: "/placeholder.svg?height=200&width=400",
      answer: "",
      userAnswer: "",
      wordCount: 0,
      flagged: false,
    },
    {
      id: "8",
      questionid: "q8",
      type: "mcq",
      question_type: "MCQ",
      text: "Which of the following is NOT a type of figurative language?",
      options: ["Metaphor", "Hyperbole", "Exposition", "Onomatopoeia"],
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "9",
      questionid: "q9",
      type: "true-false",
      question_type: "TRUEFALSE",
      text: "The words 'their', 'there', and 'they're' are examples of homophones.",
      answer: null,
      userAnswer: null,
      flagged: false,
    },
    {
      id: "10",
      questionid: "q10",
      type: "case-study",
      question_type: "CASE_STUDY",
      text: "Write a short paragraph using at least three different types of figurative language. Identify each type you use.",
      answer: "",
      userAnswer: "",
      wordCount: 0,
      flagged: false,
    },
  ]
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

// Get real questions from localStorage
const getQuestionsFromStorage = (assessmentId: string): Question[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedQuestions = localStorage.getItem(`assessment_${assessmentId}`);
      if (storedQuestions) {
        const parsedQuestions = JSON.parse(storedQuestions);
        
        // Transform the API question format to our internal format
        return parsedQuestions.map((q: any, index: number) => {
          // Map API question types to frontend types
          const mapQuestionType = (apiType: string): Question['type'] => {
            switch (apiType?.toUpperCase()) {
              case "MCQ":
                return "mcq"
              case "TRUEFALSE":
                return "true-false"
              case "SHORT_ANSWER":
                return "short-answer"
              case "VERY_SHORT_ANSWER":
                return "very-short-answer"
              case "LONG_ANSWER":
                return "long-answer"
              case "CASE_STUDY":
                return "case-study"
              default:
                return q.options ? "mcq" : q.correct_answer !== undefined ? "true-false" : "short-answer"
            }
          }

          const questionType = mapQuestionType(q.question_type);
          
          let transformedQuestion: Question = {
            id: String(index + 1),
            questionid: q.id || q._id || `q${index + 1}`,
            type: questionType,
            question_type: q.question_type || (
              questionType === "mcq" ? "MCQ" : 
              questionType === "true-false" ? "TRUEFALSE" :
              questionType === "short-answer" ? "SHORT_ANSWER" :
              questionType === "very-short-answer" ? "VERY_SHORT_ANSWER" :
              questionType === "long-answer" ? "LONG_ANSWER" :
              questionType === "case-study" ? "CASE_STUDY" : "SHORT_ANSWER"
            ),
            text: q.question || q.text,
            userAnswer: null,
            flagged: false,
          };
          
          // Add options for MCQ
          if (transformedQuestion.type === "mcq" && q.options) {
            transformedQuestion.options = q.options;
          } else if (transformedQuestion.type === "mcq") {
            // Handle API format that might have option1, option2, etc.
            const options = [];
            for (let i = 1; i <= 4; i++) {
              if (q[`option${i}`]) {
                options.push(q[`option${i}`]);
              }
            }
            if (options.length > 0) {
              transformedQuestion.options = options;
            }
          }
          
          // Add image if available
          if (q.image) {
            transformedQuestion.image = q.image;
          }
          
          return transformedQuestion;
        });
      }
    } catch (error) {
      console.error("Error parsing questions from localStorage:", error);
    }
  }
  
  // Fallback to sample questions if localStorage is not available or empty
  return getQuestions();
};

export default function AssessmentPage({ params }: { params: { assessmentId: string; subject?: string } }) {
  const router = useRouter()
  const isMobile = useMobile()
  const subject = params.subject || "english"
  const [assessmentDetails, setAssessmentDetails] = useState<AssessmentDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [activeTab, setActiveTab] = useState("question")
  const [isNavigationOpen, setIsNavigationOpen] = useState(!isMobile)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null)
  const [hasSubmission, setHasSubmission] = useState(false)
  const questionContentRef = useRef<HTMLDivElement>(null)

  // Initialize assessment data and check if there's a previous submission
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        // Get assessment details
        const details = getAssessmentDetails(params.assessmentId)
        
        // Fetch previous assessments to check if this one has been submitted
        const authToken = getAuthToken()
        
        // Set the date for filtering, e.g., last 30 days
        const fromDate = new Date()
        fromDate.setDate(fromDate.getDate() - 35)
        
        const response = await fetch(buildApiUrlNoPort(`${API_ENDPOINTS.ASSESSMENTS}?subject=${subject}`), {
          headers: {
            "Content-Type": "application/json",
            "x-auth-session": authToken || "",
          },
        })
        
        if (response.ok) {
          const assessments = await response.json()
          
          // Check if this assessment has a previous submission
          const previousSubmission = assessments.find(
            (assessment: any) => assessment._id === params.assessmentId && assessment.last_submission
          )
          
          if (previousSubmission) {
            setHasSubmission(true)
            setAssessmentResults(previousSubmission.last_submission)
            details.lastSubmission = previousSubmission.last_submission
          }
        }
        
        setAssessmentDetails(details)
        
        // Get questions from localStorage instead of sample data
        const loadedQuestions = getQuestionsFromStorage(params.assessmentId);
        setQuestions(loadedQuestions)
        
        setTimeRemaining(details.timeLimit * 60) // Convert minutes to seconds
      } catch (error) {
        console.error("Error fetching assessment data:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment data. Please try again.",
          variant: "destructive",
        })
      }
    }
    
    fetchAssessmentData()
  }, [params.assessmentId, subject])

  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || isSubmitted || hasSubmission) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isSubmitted, hasSubmission])

  // Reset scroll position when changing questions
  useEffect(() => {
    if (questionContentRef.current) {
      questionContentRef.current.scrollTop = 0
    }
  }, [currentQuestionIndex])

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // Handle navigation between questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setActiveTab("question")
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setActiveTab("question")
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setActiveTab("question")
  }

  // Handle answer changes
  const handleMCQAnswer = (option: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].userAnswer = option
    setQuestions(updatedQuestions)
  }

  const handleTrueFalseAnswer = (value: boolean) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].userAnswer = value
    setQuestions(updatedQuestions)
  }

  const handleDescriptiveAnswer = (text: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].userAnswer = text
    updatedQuestions[currentQuestionIndex].wordCount = text.trim().split(/\s+/).filter(Boolean).length
    setQuestions(updatedQuestions)
  }

  // Toggle flagged status
  const toggleFlagged = () => {
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex].flagged = !updatedQuestions[currentQuestionIndex].flagged
    setQuestions(updatedQuestions)
  }

  // Calculate progress
  const calculateProgress = () => {
    const answeredCount = questions.filter((q) => q.userAnswer !== null && q.userAnswer !== "").length
    return (answeredCount / questions.length) * 100
  }

  // Format student answer for API submission
  const formatStudentAnswer = (question: Question) => {
    if (question.type === "mcq") {
      // For MCQ, find the index of the selected option and return option1, option2, etc.
      const index = question.options?.findIndex(opt => opt === question.userAnswer)
      return index !== undefined && index >= 0 ? `option${index + 1}` : null
    } else if (question.type === "true-false") {
      // For true-false, return "true" or "false" as string
      return question.userAnswer !== null ? String(question.userAnswer).toLowerCase() : null
    } else {
      // For descriptive, return the text
      return question.userAnswer || ""
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create payload for API
      const payload = {
        assessment_id: params.assessmentId,
        questions: questions.map(q => ({
          questionid: q.questionid,
          studentanswer: formatStudentAnswer(q),
          question_type: q.question_type
        })).filter(q => q.studentanswer !== null)
      }

      // Get auth token
      const authToken = getAuthToken()

      // Call API to submit assessment
      const response = await fetch(buildApiUrlNoPort(API_ENDPOINTS.ASSESSMENT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken || "",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit assessment: ${response.status}`)
      }

      const results = await response.json()
      setAssessmentResults(results)
      setIsSubmitted(true)
      setShowConfirmSubmit(false)

      // Redirect to review page
      router.push(`/home/assessment/${subject}/${params.assessmentId}/review`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex]

  // Helper function to get question type display name
  const getQuestionTypeDisplayName = (type: Question['type']) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice"
      case "true-false":
        return "True / False"
      case "very-short-answer":
        return "Very Short Answer"
      case "short-answer":
        return "Short Answer"
      case "long-answer":
        return "Long Answer"
      case "case-study":
        return "Case Study"
      default:
        return "Unknown"
    }
  }

  if (!assessmentDetails || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If this assessment has already been submitted, redirect to review
  if (hasSubmission && !isSubmitted) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">Assessment Already Completed</CardTitle>
            <CardDescription>
              You've already completed this assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="bg-blue-50 rounded-full p-4 mb-4">
              <CheckCircle className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-center mb-6">
              Your previous score: <span className="font-bold">{assessmentDetails.lastSubmission?.score_percentage}%</span> 
              ({assessmentDetails.lastSubmission?.correct_count}/{assessmentDetails.lastSubmission?.total_questions} correct)
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700"
                onClick={() => router.push(`/home/assessment/${subject}`)}
              >
                Back to Assessments
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/home/assessment/${subject}/${params.assessmentId}/review`)}
              >
                View Assessment Results
              </Button>
            </div>
          </CardContent>
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
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">{assessmentDetails.name}</h1>
            </div>
            <p className="text-gray-600 mt-1">
              {assessmentDetails.topics.join(" • ")} • {assessmentDetails.difficultyLevel} Difficulty
            </p>
          </div>

          {!isSubmitted && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setShowConfirmSubmit(true)}
              >
                Submit Assessment
              </Button>
            </div>
          )}
        </div>

        {!isSubmitted && (
          <div className="bg-white rounded-lg border p-4 mb-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    Questions: <strong>{assessmentDetails.numberOfQuestions}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    Time Limit: <strong>{assessmentDetails.timeLimit} minutes</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileQuestion className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    Question Types: <strong>{assessmentDetails.questionTypes.length}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Completion:</span>
                <Progress value={calculateProgress()} className="h-2 w-32" />
                <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
              </div>
            </div>
          </div>
        )}
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
      {!isSubmitted ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          {(isNavigationOpen || !isMobile) && (
            <div className="md:col-span-1">
              <Card className="mx-auto w-full max-w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Questions</CardTitle>
                  <CardDescription>Navigate between questions</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-5 md:grid-cols-3 gap-2 px-1">
                  {questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      className={cn(
                        "h-10 w-10 p-0 font-medium",
                        question.userAnswer !== null && question.userAnswer !== "" ? "border-blue-500" : "",
                        question.flagged ? "border-red-500" : "",
                        currentQuestionIndex === index ? "bg-blue-600 text-white" : "",
                      )}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-0">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Flagged</span>
                  </div>
                </CardFooter>
              </Card>

              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={toggleFlagged}
                >
                  <Flag className="h-4 w-4" />
                  {currentQuestion.flagged ? "Remove Flag" : "Flag Question"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => setActiveTab(activeTab === "question" ? "instructions" : "question")}
                >
                  <HelpCircle className="h-4 w-4" />
                  {activeTab === "question" ? "View Instructions" : "Back to Question"}
                </Button>
              </div>
            </div>
          )}

          {/* Question Content */}
          <div className="md:col-span-3">
            <Card className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
                  <TabsTrigger value="question">Question</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                </TabsList>

                <TabsContent value="question" className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </Badge>
                      <Badge variant="outline" className="text-gray-600 border-gray-200">
                        {getQuestionTypeDisplayName(currentQuestion.type)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-3">{currentQuestion.text}</CardTitle>
                  </CardHeader>

                  <div ref={questionContentRef} className="overflow-auto">
                    <CardContent>
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

                      {/* Question Answer Interface */}
                      <div className="mt-4">
                        {currentQuestion.type === "mcq" && (
                          <RadioGroup
                            value={(currentQuestion.userAnswer as string) || ""}
                            onValueChange={handleMCQAnswer}
                            className="space-y-3"
                          >
                            {currentQuestion.options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={option}
                                  id={`option-${index}`}
                                  className="border-blue-300 text-blue-600"
                                />
                                <Label
                                  htmlFor={`option-${index}`}
                                  className="flex-1 cursor-pointer rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {currentQuestion.type === "true-false" && (
                          <div className="flex flex-col gap-3">
                            <Button
                              variant={currentQuestion.userAnswer === true ? "default" : "outline"}
                              className={cn(
                                "justify-start gap-2 h-12",
                                currentQuestion.userAnswer === true ? "bg-blue-600" : "border-blue-200",
                              )}
                              onClick={() => handleTrueFalseAnswer(true)}
                            >
                              <Check className="h-5 w-5" />
                              True
                            </Button>
                            <Button
                              variant={currentQuestion.userAnswer === false ? "default" : "outline"}
                              className={cn(
                                "justify-start gap-2 h-12",
                                currentQuestion.userAnswer === false ? "bg-blue-600" : "border-blue-200",
                              )}
                              onClick={() => handleTrueFalseAnswer(false)}
                            >
                              <X className="h-5 w-5" />
                              False
                            </Button>
                          </div>
                        )}

                        {(currentQuestion.type === "short-answer" || 
                          currentQuestion.type === "very-short-answer" || 
                          currentQuestion.type === "long-answer" || 
                          currentQuestion.type === "case-study") && (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Type your answer here..."
                              className={`resize-none border-blue-200 focus-visible:ring-blue-500 ${
                                currentQuestion.type === "very-short-answer" ? "min-h-[100px]" :
                                currentQuestion.type === "short-answer" ? "min-h-[150px]" :
                                currentQuestion.type === "long-answer" ? "min-h-[250px]" :
                                currentQuestion.type === "case-study" ? "min-h-[300px]" : "min-h-[200px]"
                              }`}
                              value={(currentQuestion.userAnswer as string) || ""}
                              onChange={(e) => handleDescriptiveAnswer(e.target.value)}
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>
                                {currentQuestion.type === "very-short-answer" && "Keep your answer brief (1-2 sentences)"}
                                {currentQuestion.type === "short-answer" && "Provide a concise answer (2-3 sentences)"}
                                {currentQuestion.type === "long-answer" && "Provide a detailed explanation"}
                                {currentQuestion.type === "case-study" && "Analyze the scenario thoroughly"}
                              </span>
                              <span>Word count: {currentQuestion.wordCount || 0}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="gap-1"
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
                </TabsContent>

                <TabsContent value="instructions" className="h-full">
                  <CardHeader>
                    <CardTitle>Assessment Instructions</CardTitle>
                    <CardDescription>Please read these instructions carefully</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">General Instructions:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>This assessment contains {questions.length} questions of varying types.</li>
                        <li>You have {assessmentDetails.timeLimit} minutes to complete the assessment.</li>
                        <li>You can navigate between questions using the navigation panel or next/previous buttons.</li>
                        <li>You can flag questions to review later.</li>
                        <li>Your progress is automatically saved as you answer questions.</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Question Types:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>
                          <span className="font-medium">Multiple Choice:</span> Select one correct answer from the given
                          options.
                        </li>
                        <li>
                          <span className="font-medium">True/False:</span> Indicate whether the given statement is true
                          or false.
                        </li>
                        <li>
                          <span className="font-medium">Very Short Answer:</span> Provide a brief response (1-2 sentences).
                        </li>
                        <li>
                          <span className="font-medium">Short Answer:</span> Provide a concise answer (2-3 sentences).
                        </li>
                        <li>
                          <span className="font-medium">Long Answer:</span> Provide a detailed explanation or analysis.
                        </li>
                        <li>
                          <span className="font-medium">Case Study:</span> Analyze scenarios or real-world situations with thorough explanations.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Scoring:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Each question carries equal marks.</li>
                        <li>There is no negative marking for incorrect answers.</li>
                        <li>Written answers will be evaluated based on content, clarity, and relevance.</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-700">Important Note</h4>
                          <p className="text-sm text-gray-700">
                            Once you submit the assessment, you cannot return to it. Make sure to review all your
                            answers before submitting.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => setActiveTab("question")} className="bg-blue-600 hover:bg-blue-700">
                      Back to Question
                    </Button>
                  </CardFooter>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Assessment Complete!</CardTitle>
              <CardDescription className="text-center">Your assessment has been submitted successfully</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="animate-pulse flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 text-blue-600 mb-6">
                <Check className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Thank you for completing the assessment!</h3>
              <p className="text-gray-600 text-center mb-6">
                Your results are being processed and will be available shortly.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push(`/home/assessment/${subject}/${params.assessmentId}/review`)}
              >
                View Results
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold mb-2">Submit Assessment?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to submit your assessment? You won't be able to change your answers after
              submission.
            </p>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    You have {questions.filter((q) => q.userAnswer === null || q.userAnswer === "").length} unanswered
                    questions and {questions.filter((q) => q.flagged).length} flagged questions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmSubmit(false)}>
                Continue Assessment
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Assessment"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
