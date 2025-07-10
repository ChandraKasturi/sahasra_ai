"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
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
  FileText,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

// Types
interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  questionid?: string
  text: string
  question?: string
  type: "mcq" | "true-false" | "descriptive"
  question_type?: string
  options?: string[] | Option[]
  option1?: string
  option2?: string
  option3?: string
  option4?: string
  image_url?: string
  correctAnswer?: string
  correct_option?: string
  rawCorrectAnswer?: string | boolean | null
  explanation?: string
  feedback?: string
  is_correct?: boolean
  flagged?: boolean
  studentanswer?: string | null
}

interface PdfDetails {
  id: string
  title: string
  file_name: string
  description?: string
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

export default function PdfAssessmentReviewPage() {
  const router = useRouter()
  const params = useParams()
  const pdfId = params.pdfId as string
  const isMobile = useMobile()
  
  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [pdfDetails, setPdfDetails] = useState<PdfDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null)
  const [expandedExplanations, setExpandedExplanations] = useState<string[]>([])
  const [isNavigationOpen, setIsNavigationOpen] = useState(!isMobile)
  const questionContentRef = useRef<HTMLDivElement>(null)

  // Initialize assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get auth token
        const authToken = getAuthToken()
        if (!authToken) {
          throw new Error("Authentication required. Please log in again.")
        }
        
        // Check if we have assessment results in localStorage
        const resultKey = `assessment_result_${pdfId}`
        const storedResult = localStorage.getItem(resultKey)
        
        if (storedResult) {
          const parsedResult = JSON.parse(storedResult)
          setAssessmentResults(parsedResult)
          
          // Get assessment questions from localStorage
          const questionsKey = `assessment_${pdfId}`
          const storedQuestions = localStorage.getItem(questionsKey)
          
          if (storedQuestions) {
            const parsedQuestions = JSON.parse(storedQuestions)
            const formattedQuestions = formatQuestionsWithResults(parsedQuestions, parsedResult)
            setQuestions(formattedQuestions)
          }
          
          // Set PDF details
          setPdfDetails({
            id: pdfId,
            title: "PDF Assessment",
            file_name: parsedResult.pdf_name || "PDF Document"
          })
          
          setIsLoading(false)
          return
        }
        
        // If not in localStorage, fetch from API
        const response = await fetch(buildApiUrlNoPort(`${API_ENDPOINTS.PDF_ASSESSMENTS}/${pdfId}`), {
          headers: {
            "x-auth-session": authToken
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment results: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!result.data || !result.data.questions) {
          throw new Error("No assessment data found for this PDF")
        }
        
        setAssessmentResults(result.data)
        
        // Format questions with results
        const formattedQuestions = formatQuestionsWithResults(result.data.questions, result.data)
        setQuestions(formattedQuestions)
        
        // Set PDF details
        setPdfDetails({
          id: pdfId,
          title: result.data.title || "PDF Assessment",
          file_name: result.data.file_name || result.data.pdf_name || "PDF Document",
          description: result.data.description || ""
        })
      } catch (err) {
        console.error("Error fetching assessment results:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error loading assessment results"
        setError(errorMessage)
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAssessmentData()
  }, [pdfId])

  // Format questions with results
  const formatQuestionsWithResults = (questionsData: any[], results: any): Question[] => {
    return questionsData.map((q: any) => {
      const questionId = q.id || q._id || q.questionid
      const questionResult = results.results?.find((r: any) => r.questionid === questionId)
      
      // Determine question type
      const questionTypeApi = q.question_type?.toLowerCase()
      let determinedType: "mcq" | "true-false" | "descriptive"

      if (questionTypeApi === "mcq" || (q.options || q.option1)) {
        determinedType = "mcq"
      } else if (questionTypeApi === "truefalse" || q.correct_answer !== undefined || typeof q.correctanswer === 'boolean') {
        determinedType = "true-false"
      } else {
        determinedType = "descriptive"
      }
      
      const formattedQuestion: Question = {
        id: questionId,
        questionid: questionId,
        text: q.question || q.text || "",
        type: determinedType,
        question_type: q.question_type,
        is_correct: questionResult?.is_correct || false,
        feedback: questionResult?.feedback || q.feedback || "",
        explanation: q.explanation || "",
        studentanswer: questionResult?.studentanswer || q.studentanswer,
        rawCorrectAnswer: q.correctanswer !== undefined ? q.correctanswer : q.correct_answer || q.correct_option
      }
      
      // Handle image if present
      if (q.image_url) {
        formattedQuestion.image_url = q.image_url
      }
      
      // Handle different formats of MCQ options
      if (formattedQuestion.type === "mcq") {
        if (q.options && Array.isArray(q.options)) {
          // If options is an array of strings
          if (typeof q.options[0] === 'string') {
            formattedQuestion.options = q.options
          } 
          // If options is an array of objects with id and text properties
          else if (q.options[0].id) {
            formattedQuestion.options = q.options
          }
        } else if (q.option1) {
          formattedQuestion.options = []
          formattedQuestion.option1 = q.option1
          if (q.option1) {
            formattedQuestion.options.push(q.option1)
          }
          if (q.option2) {
            formattedQuestion.options.push(q.option2)
            formattedQuestion.option2 = q.option2
          }
          if (q.option3) {
            formattedQuestion.options.push(q.option3)
            formattedQuestion.option3 = q.option3
          }
          if (q.option4) {
            formattedQuestion.options.push(q.option4)
            formattedQuestion.option4 = q.option4
          }
        }
        
        formattedQuestion.correct_option = q.correct_option || q.correctAnswer
      }
      
      return formattedQuestion
    })
  }

  // Format time
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleString()
    } catch (e) {
      return timeStr
    }
  }

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      if (questionContentRef.current) questionContentRef.current.scrollTop = 0
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      if (questionContentRef.current) questionContentRef.current.scrollTop = 0
    }
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      if (questionContentRef.current) questionContentRef.current.scrollTop = 0
    }
  }

  const toggleExplanation = (questionId: string) => {
    if (expandedExplanations.includes(questionId)) {
      setExpandedExplanations(expandedExplanations.filter(id => id !== questionId))
    } else {
      setExpandedExplanations([...expandedExplanations, questionId])
    }
  }

  // Calculate performance metrics
  const calculatePerformance = () => {
    if (!questions.length) return { correctCount: 0, incorrectCount: 0, score: 0 }
    
    const correctCount = questions.filter(q => q.is_correct).length
    const incorrectCount = questions.length - correctCount
    const score = Math.round((correctCount / questions.length) * 100)
    
    return { correctCount, incorrectCount, score }
  }

  // Get strengths and weaknesses
  const getStrengthsAndWeaknesses = () => {
    // This would ideally come from API but for now we'll derive some basic ones
    const strengths = []
    const weaknesses = []
    
    // Group questions by type
    const mcqQuestions = questions.filter(q => q.type === "mcq")
    const trueFalseQuestions = questions.filter(q => q.type === "true-false")
    const descriptiveQuestions = questions.filter(q => q.type === "descriptive")
    
    // Check performance by type
    if (mcqQuestions.length > 0) {
      const mcqCorrect = mcqQuestions.filter(q => q.is_correct).length
      const mcqPerformance = mcqCorrect / mcqQuestions.length
      
      if (mcqPerformance >= 0.7) {
        strengths.push("Strong performance on multiple choice questions")
      } else if (mcqPerformance <= 0.4) {
        weaknesses.push("Needs improvement on multiple choice questions")
      }
    }
    
    if (trueFalseQuestions.length > 0) {
      const tfCorrect = trueFalseQuestions.filter(q => q.is_correct).length
      const tfPerformance = tfCorrect / trueFalseQuestions.length
      
      if (tfPerformance >= 0.7) {
        strengths.push("Good at true/false evaluation")
      } else if (tfPerformance <= 0.4) {
        weaknesses.push("Work on true/false concept clarity")
      }
    }
    
    if (descriptiveQuestions.length > 0) {
      const descCorrect = descriptiveQuestions.filter(q => q.is_correct).length
      const descPerformance = descCorrect / descriptiveQuestions.length
      
      if (descPerformance >= 0.7) {
        strengths.push("Excellent at descriptive answers")
      } else if (descPerformance <= 0.4) {
        weaknesses.push("Need to improve descriptive responses")
      }
    }
    
    // Add generic ones if we don't have enough
    if (strengths.length === 0) {
      strengths.push("Completed the assessment fully")
    }
    
    if (weaknesses.length === 0) {
      const { score } = calculatePerformance()
      if (score < 70) {
        weaknesses.push("Review the PDF material again for better comprehension")
      } else {
        weaknesses.push("Practice with more varied questions")
      }
    }
    
    return { strengths, weaknesses }
  }

  // Handle go back
  const handleGoBack = () => {
    router.push("/home/files/english")
  }

  // Handle retry
  const handleRetry = () => {
    router.push(`/home/assessment/english/pdf/${pdfId}`)
  }

  // Get user answer display text
  const getUserAnswerText = (question: Question): string => {
    if (!question.studentanswer) return "No answer provided"
    
    if (question.type === "mcq") {
      // If studentanswer is in option1 format
      if (question.studentanswer.startsWith("option")) {
        const optionNumber = parseInt(question.studentanswer.replace("option", ""))
        if (question.options) {
          // Handle both string[] and Option[] formats
          if (typeof question.options[0] === 'string') {
            return (question.options[optionNumber - 1] as string) || "Unknown option"
          } else {
            const optionObj = question.options[optionNumber - 1] as Option
            return optionObj?.text || "Unknown option"
          }
        }
        // Fallback to optionN properties
        return (question[`option${optionNumber}` as keyof Question] as string) || "Unknown option"
      }
      
      // If studentanswer is the actual option text
      return question.studentanswer
    }
    
    if (question.type === "true-false") {
      return question.studentanswer === "true" ? "True" : "False"
    }
    
    // For descriptive questions
    return question.studentanswer
  }

  // Get correct answer text
  const getCorrectAnswerText = (question: Question): string => {
    if (question.type === "mcq") {
      if (question.correct_option && question.correct_option.startsWith("option")) {
        const optionNumber = parseInt(question.correct_option.replace("option", ""))
        if (question.options) {
          // Handle both string[] and Option[] formats
          if (typeof question.options[0] === 'string') {
            return (question.options[optionNumber - 1] as string) || "Unknown option"
          } else {
            const optionObj = question.options[optionNumber - 1] as Option
            return optionObj?.text || "Unknown option"
          }
        }
        // Fallback to optionN properties
        return (question[`option${optionNumber}` as keyof Question] as string) || "Unknown option"
      } else if (question.correct_option) {
        return question.correct_option
      } else if (question.correctAnswer) {
        return question.correctAnswer
      }
    }
    
    if (question.type === "true-false") {
      const correctAnswer = question.correct_option || question.correctAnswer || question.rawCorrectAnswer
      if (correctAnswer) {
        return String(correctAnswer).toLowerCase() === "true" ? "True" : "False"
      }
    }
    
    return "No correct answer provided"
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin mb-4">
          <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p className="text-gray-600">Loading assessment results...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error Loading Assessment Results
            </CardTitle>
            <CardDescription>We encountered a problem loading this assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={handleGoBack}>Return to Files</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results Unavailable</CardTitle>
            <CardDescription>No results are available for this assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">There are no results available for this PDF assessment. Please try taking the assessment again.</p>
            <Button onClick={handleRetry}>Take Assessment</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const { correctCount, incorrectCount, score } = calculatePerformance()
  const { strengths, weaknesses } = getStrengthsAndWeaknesses()

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col space-y-6">
        {/* Header with title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <Button variant="outline" size="icon" onClick={handleGoBack} className="mr-3">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Assessment Results</h1>
                <p className="text-sm text-gray-500">{pdfDetails?.file_name || "PDF Document"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Download</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden md:inline">Share</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Print</span>
            </Button>
          </div>
        </div>
        
        {/* Performance summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Score summary */}
              <div className="md:col-span-4 p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
                <Progress value={score} className="h-2 w-full" />
                <div className="mt-2 flex items-center justify-center">
                  <div className="flex items-center text-sm text-gray-600 mr-4">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                    <span>{correctCount} correct</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-1"></div>
                    <span>{incorrectCount} incorrect</span>
                  </div>
                </div>
                <p className="text-sm mt-2 text-gray-500">{assessmentResults?.submission_time ? formatTime(assessmentResults.submission_time) : "Recently completed"}</p>
              </div>
              
              {/* Strengths */}
              <div className="md:col-span-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium flex items-center text-green-800 mb-2">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {strengths.map((strength, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Areas to improve */}
              <div className="md:col-span-4 p-4 bg-amber-50 rounded-lg">
                <h3 className="font-medium flex items-center text-amber-800 mb-2">
                  <LightbulbIcon className="h-4 w-4 mr-1" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content with question review */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Question navigation sidebar */}
          {!isMobile && (
            <div className="hidden md:block md:col-span-3">
              <Card className="sticky top-4">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileQuestion className="h-5 w-5 mr-2" />
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {questions.map((question, index) => (
                      <Button
                        key={question.id}
                        variant={index === currentQuestionIndex ? "default" : "outline"}
                        size="sm"
                        className={`h-10 w-full ${
                          question.is_correct
                            ? "border-green-500"
                            : "border-red-500"
                        }`}
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Correct</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Incorrect</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Current question display */}
          <div className="md:col-span-9">
            <Card>
              <CardHeader className="p-4 md:p-6 pb-0">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      currentQuestion.is_correct
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {currentQuestion.is_correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{currentQuestion.text}</CardTitle>
                <CardDescription>
                  {currentQuestion.type === "mcq"
                    ? "Multiple Choice Question"
                    : currentQuestion.type === "true-false"
                    ? "True/False Question"
                    : "Descriptive Question"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6" ref={questionContentRef}>
                {/* Question image if available */}
                {currentQuestion.image_url && (
                  <div className="mb-6">
                    <Image
                      src={currentQuestion.image_url}
                      alt="Question image"
                      width={600}
                      height={400}
                      className="rounded-lg border border-gray-200 object-contain w-full max-h-80"
                    />
                  </div>
                )}
                
                {/* Your answer */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Your Answer:</h3>
                  <div
                    className={`p-4 rounded-lg ${
                      currentQuestion.is_correct
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-start">
                      {currentQuestion.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{getUserAnswerText(currentQuestion)}</p>
                        {!currentQuestion.is_correct && (
                          <p className="text-sm text-gray-600 mt-1">
                            Correct answer: {getCorrectAnswerText(currentQuestion)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Explanation */}
                {(currentQuestion.explanation || currentQuestion.feedback) && (
                  <div>
                    <Button 
                      variant="ghost" 
                      className="flex items-center justify-between w-full text-left p-0 h-auto"
                      onClick={() => toggleExplanation(currentQuestion.id)}
                    >
                      <h3 className="text-sm font-medium text-gray-500">Explanation:</h3>
                      {expandedExplanations.includes(currentQuestion.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {expandedExplanations.includes(currentQuestion.id) && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{currentQuestion.explanation || currentQuestion.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="p-4 md:p-6 border-t flex justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {/* Mobile question navigation */}
                  {isMobile && (
                    <div className="flex items-center space-x-1 mx-2">
                      {Array.from({ length: Math.min(5, questions.length) }, (_, i) => (
                        <Button
                          key={i}
                          variant={i === currentQuestionIndex ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            questions[i]?.is_correct
                              ? "border-green-500"
                              : "border-red-500"
                          }`}
                          onClick={() => goToQuestion(i)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      {questions.length > 5 && <span>...</span>}
                    </div>
                  )}
                  
                  <Button
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Action buttons at the bottom */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleGoBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Files
          </Button>
          
          <Button onClick={handleRetry} className="gap-1 bg-blue-600 hover:bg-blue-700">
            <BookOpen className="h-4 w-4 mr-1" />
            Retry Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
