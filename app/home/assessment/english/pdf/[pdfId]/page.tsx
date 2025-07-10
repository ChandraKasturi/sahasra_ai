"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Flag, Clock, CheckCircle, ArrowRight, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" 
import { useMobile } from "@/hooks/use-mobile"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

// Types
interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  questionid: string
  text: string
  question: string
  type: "mcq" | "true-false" | "descriptive"
  question_type: string
  options?: string[]
  image_url?: string
  option1?: string
  option2?: string
  option3?: string
  option4?: string
  correct_option?: string
  explanation?: string
}

interface PdfDetails {
  id: string
  title: string
  file_name: string
  description: string
}

export default function PdfAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const pdfId = params.pdfId as string
  const isMobile = useMobile()

  // State
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pdfDetails, setPdfDetails] = useState<PdfDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)

  // Load assessment data and questions
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Get auth token
        const authToken = getAuthToken()
        if (!authToken) {
          throw new Error("Authentication required. Please log in again.")
        }
        
        // First check if we have current assessment data in localStorage
        const currentAssessment = localStorage.getItem("current-assessment")
        if (currentAssessment) {
          const parsedAssessment = JSON.parse(currentAssessment)
          
          // Check if this PDF ID matches the one we're looking for
          if (parsedAssessment.assessment?.pdf_id === pdfId) {
            setAssessmentId(parsedAssessment.assessment_id)
            
            // Transform the questions data
            const transformedQuestions = transformQuestionsData(parsedAssessment.assessment.questions)
            setQuestions(transformedQuestions)
            
            // Set PDF details
            setPdfDetails({
              id: pdfId,
              title: parsedAssessment.assessment.title || "PDF Assessment",
              file_name: parsedAssessment.assessment.title || "PDF Assessment",
              description: parsedAssessment.assessment.description || ""
            })
            
            setIsLoading(false)
            return
          }
        }
        
        // If we don't have the data in localStorage, fetch from API
        const response = await fetch(buildApiUrlNoPort(`${API_ENDPOINTS.PDF_ASSESSMENTS}/${pdfId}`), {
          headers: {
            "x-auth-session": authToken
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!result.data || !result.data.questions) {
          throw new Error("No assessment data found for this PDF")
        }
        
        // Set assessment ID
        setAssessmentId(result.data.id || result.data._id)
        
        // Transform the questions data
        const transformedQuestions = transformQuestionsData(result.data.questions)
        setQuestions(transformedQuestions)
        
        // Set PDF details
        setPdfDetails({
          id: pdfId,
          title: result.data.title || "PDF Assessment",
          file_name: result.data.file_name || result.data.title || "PDF Assessment",
          description: result.data.description || ""
        })
      } catch (err) {
        console.error("Error fetching assessment:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error loading assessment"
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
    
    fetchData()
  }, [pdfId])

  // Transform questions data to a consistent format
  const transformQuestionsData = (questionsData: any[]): Question[] => {
    return questionsData.map((q) => {
      const questionType = q.question_type?.toLowerCase() || 
                          (q.option1 || q.options ? "mcq" : q.correct_answer !== undefined ? "true-false" : "descriptive")
      
      const transformedQuestion: Question = {
        id: q.id || q._id || Math.random().toString(36).substring(2),
        questionid: q.id || q._id || Math.random().toString(36).substring(2),
        text: q.question || q.text || "",
        question: q.question || q.text || "",
        type: questionType === "mcq" ? "mcq" : 
              questionType === "truefalse" ? "true-false" : "descriptive",
        question_type: q.question_type || (questionType === "mcq" ? "MCQ" : 
                       questionType === "truefalse" ? "TRUEFALSE" : "DESCRIPTIVE"),
        explanation: q.explanation
      }
      
      // Handle different formats of MCQ options
      if (transformedQuestion.type === "mcq") {
        if (q.options && Array.isArray(q.options)) {
          transformedQuestion.options = q.options
        } else if (q.option1) {
          transformedQuestion.options = []
          transformedQuestion.option1 = q.option1
          if (q.option1) transformedQuestion.options.push(q.option1)
          if (q.option2) {
            transformedQuestion.options.push(q.option2)
            transformedQuestion.option2 = q.option2
          }
          if (q.option3) {
            transformedQuestion.options.push(q.option3)
            transformedQuestion.option3 = q.option3
          }
          if (q.option4) {
            transformedQuestion.options.push(q.option4)
            transformedQuestion.option4 = q.option4
          }
        }
        
        transformedQuestion.correct_option = q.correct_option
      }
      
      // Handle image if present
      if (q.image_url) {
        transformedQuestion.image_url = q.image_url
      }
      
      return transformedQuestion
    })
  }

  // Timer
  useEffect(() => {
    if (isLoading || error) return
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLoading, error])

  // Current question
  const currentQuestion = questions[currentQuestionIndex]

  // Progress percentage
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Handle answer change
  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })
  }

  // Handle flag question
  const handleFlagQuestion = () => {
    if (flaggedQuestions.includes(currentQuestion.id)) {
      setFlaggedQuestions(flaggedQuestions.filter((id) => id !== currentQuestion.id))
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion.id])
    }
  }

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Navigate to specific question
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Format student answer for submission
  const formatStudentAnswer = (questionId: string, questionType: string) => {
    const answer = answers[questionId]
    if (!answer) return null
    
    if (questionType.toLowerCase() === "mcq") {
      // For MCQ, return the option id (option1, option2, etc.)
      const question = questions.find(q => q.id === questionId)
      if (!question || !question.options) return null
      
      const optionIndex = question.options.findIndex(opt => opt === answer)
      if (optionIndex === -1) return answer
      
      return `option${optionIndex + 1}`
    }
    
    // For other types, return the answer as is
    return answer
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!assessmentId) {
      toast({
        title: "Error",
        description: "Assessment ID not found. Please try again.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)

    try {
      // Get auth token
      const authToken = getAuthToken()
      if (!authToken) {
        throw new Error("Authentication required. Please log in again.")
      }
      
      // Create payload for submission
      const payload = {
        assessment_id: assessmentId,
        questions: questions.map(q => ({
          questionid: q.id,
          studentanswer: formatStudentAnswer(q.id, q.question_type),
          question_type: q.question_type
        })).filter(q => q.studentanswer !== null)
      }
      
      // Submit answers
      const response = await fetch(buildApiUrlNoPort(API_ENDPOINTS.ASSESSMENT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to submit assessment: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Store the result temporarily
      localStorage.setItem(`assessment_result_${pdfId}`, JSON.stringify(result))
      
      // Redirect to review page
      router.push(`/home/assessment/english/pdf/${pdfId}/review`)
    } catch (err) {
      console.error("Error submitting assessment:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error submitting assessment"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle go back
  const handleGoBack = () => {
    router.push("/home/files/english")
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
        <p className="text-gray-600">Loading assessment...</p>
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
              Error Loading Assessment
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
            <CardTitle>Assessment Unavailable</CardTitle>
            <CardDescription>No questions are available for this assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">There are no questions available for this PDF. Please try generating a new assessment.</p>
            <Button onClick={handleGoBack}>Return to Files</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="outline" size="icon" onClick={handleGoBack} className="mr-3">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <div className="bg-blue-100 p-1.5 md:p-2 rounded-full mr-2 md:mr-3">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">PDF Assessment</h1>
              <p className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-[400px]">
                {pdfDetails?.title || pdfDetails?.file_name || "PDF Document"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-3 py-2 rounded-full">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700">{formatTimeRemaining()}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Questions sidebar on larger screens */}
        {!isMobile && (
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Questions</h3>
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={index === currentQuestionIndex ? "default" : "outline"}
                      size="sm"
                      className={`h-10 w-full p-0 ${
                        answers[question.id] ? "border-blue-500" : ""
                      } ${flaggedQuestions.includes(question.id) ? "border-orange-500" : ""}`}
                      onClick={() => navigateToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                    <span>Flagged</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleFlagQuestion}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.includes(currentQuestion.id) ? "Unflag Question" : "Flag Question"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current question */}
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {currentQuestion.type === "mcq"
                    ? "Multiple Choice"
                    : currentQuestion.type === "true-false"
                    ? "True/False"
                    : "Descriptive"}
                </Badge>
                {isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={flaggedQuestions.includes(currentQuestion.id) ? "text-orange-500" : ""}
                    onClick={handleFlagQuestion}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-semibold mb-4">{currentQuestion.text}</h3>

              {/* Display image if available */}
              {currentQuestion.image_url && (
                <div className="mb-6">
                  <Image
                    src={currentQuestion.image_url}
                    alt="Question image"
                    width={600}
                    height={400}
                    className="rounded-lg border object-contain mx-auto"
                  />
                </div>
              )}

              {/* Answer options */}
              <div className="mt-6">
                {currentQuestion.type === "mcq" && currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`option-${index}`}
                          className="border-blue-500 text-blue-600 mt-1"
                        />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer p-3 border rounded-md hover:bg-blue-50"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === "true-false" && (
                  <div className="space-y-3">
                    {["True", "False"].map((option) => (
                      <div key={option} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`option-${option}`}
                          checked={answers[currentQuestion.id] === option}
                          onClick={() => handleAnswerChange(option)}
                          className="border-blue-500 text-blue-600 mt-1"
                        />
                        <Label
                          htmlFor={`option-${option}`}
                          className="flex-1 cursor-pointer p-3 border rounded-md hover:bg-blue-50"
                          onClick={() => handleAnswerChange(option)}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {currentQuestion.type === "descriptive" && (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="min-h-[200px]"
                  />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Assessment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom navigation for mobile */}
      {isMobile && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => {
            const question = questions[i]
            if (!question) return null
            return (
              <Button
                key={question.id}
                variant={i === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className={`${
                  answers[question.id] ? "border-blue-500" : ""
                } ${flaggedQuestions.includes(question.id) ? "border-orange-500" : ""}`}
                onClick={() => navigateToQuestion(i)}
              >
                {i + 1}
              </Button>
            )
          })}
        </div>
      )}

      {/* Submit button at the bottom */}
      <div className="mt-8">
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Assessment...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit Assessment ({questions.length - Object.keys(answers).length} unanswered)
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
