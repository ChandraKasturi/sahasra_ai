"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Clock, Flag, Atom, HelpCircle, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getAuthToken } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

// Mock assessment data for Science
const mockAssessment = {
  id: "science-assessment-1",
  title: "Physics and Chemistry Fundamentals",
  description: "Test your knowledge of basic physics principles and chemical reactions.",
  timeLimit: 20, // in minutes
  questions: [
    {
      id: 1,
      text: "What is the SI unit of force?",
      options: [
        { id: "a", text: "Watt" },
        { id: "b", text: "Joule" },
        { id: "c", text: "Newton" },
        { id: "d", text: "Pascal" },
      ],
      correctAnswer: "c",
      explanation:
        "The SI unit of force is the Newton (N), named after Sir Isaac Newton. It is defined as the force needed to accelerate a mass of one kilogram by one meter per second squared.",
    },
    {
      id: 2,
      text: "Which of the following is NOT a state of matter?",
      options: [
        { id: "a", text: "Solid" },
        { id: "b", text: "Liquid" },
        { id: "c", text: "Gas" },
        { id: "d", text: "Energy" },
      ],
      correctAnswer: "d",
      explanation:
        "The three common states of matter are solid, liquid, and gas. Plasma is often considered the fourth state. Energy is not a state of matter but a property that matter can possess.",
    },
    {
      id: 3,
      text: "What is the chemical formula for water?",
      options: [
        { id: "a", text: "H2O" },
        { id: "b", text: "CO2" },
        { id: "c", text: "NaCl" },
        { id: "d", text: "O2" },
      ],
      correctAnswer: "a",
      explanation:
        "Water has the chemical formula H2O, indicating that each molecule consists of two hydrogen atoms bonded to one oxygen atom.",
    },
    {
      id: 4,
      text: "Which of the following is an example of a chemical change?",
      options: [
        { id: "a", text: "Melting ice" },
        { id: "b", text: "Cutting paper" },
        { id: "c", text: "Rusting iron" },
        { id: "d", text: "Dissolving sugar in water" },
      ],
      correctAnswer: "c",
      explanation:
        "Rusting iron is a chemical change because a new substance (iron oxide) is formed. Melting ice, cutting paper, and dissolving sugar in water are physical changes as no new substances are formed.",
    },
    {
      id: 5,
      text: "What is the speed of light in a vacuum?",
      options: [
        { id: "a", text: "300,000 km/s" },
        { id: "b", text: "150,000 km/s" },
        { id: "c", text: "3,000 km/s" },
        { id: "d", text: "30,000 km/s" },
      ],
      correctAnswer: "a",
      explanation:
        "The speed of light in a vacuum is approximately 300,000 kilometers per second (or more precisely, 299,792,458 meters per second).",
    },
    {
      id: 6,
      text: "Which of the following is NOT a type of electromagnetic radiation?",
      options: [
        { id: "a", text: "X-rays" },
        { id: "b", text: "Ultraviolet rays" },
        { id: "c", text: "Sound waves" },
        { id: "d", text: "Gamma rays" },
      ],
      correctAnswer: "c",
      explanation:
        "Sound waves are mechanical waves that require a medium to travel through, not electromagnetic radiation. X-rays, ultraviolet rays, and gamma rays are all types of electromagnetic radiation.",
    },
    {
      id: 7,
      text: "What is the main function of mitochondria in a cell?",
      options: [
        { id: "a", text: "Protein synthesis" },
        { id: "b", text: "Energy production" },
        { id: "c", text: "Cell division" },
        { id: "d", text: "Waste removal" },
      ],
      correctAnswer: "b",
      explanation:
        "Mitochondria are often referred to as the 'powerhouse of the cell' because their primary function is to produce energy in the form of ATP through cellular respiration.",
    },
    {
      id: 8,
      text: "Which element has the chemical symbol 'Fe'?",
      options: [
        { id: "a", text: "Fluorine" },
        { id: "b", text: "Francium" },
        { id: "c", text: "Iron" },
        { id: "d", text: "Fermium" },
      ],
      correctAnswer: "c",
      explanation: "The chemical symbol 'Fe' represents iron. It comes from the Latin word 'ferrum' meaning iron.",
    },
    {
      id: 9,
      text: "What is the law of conservation of energy?",
      options: [
        { id: "a", text: "Energy can be created but not destroyed" },
        { id: "b", text: "Energy can be destroyed but not created" },
        { id: "c", text: "Energy can be neither created nor destroyed, only transformed" },
        { id: "d", text: "Energy can be both created and destroyed" },
      ],
      correctAnswer: "c",
      explanation:
        "The law of conservation of energy states that energy can neither be created nor destroyed, only transformed from one form to another or transferred from one object to another.",
    },
    {
      id: 10,
      text: "Which of the following is NOT a renewable energy source?",
      options: [
        { id: "a", text: "Solar energy" },
        { id: "b", text: "Wind energy" },
        { id: "c", text: "Coal" },
        { id: "d", text: "Hydroelectric power" },
      ],
      correctAnswer: "c",
      explanation:
        "Coal is a fossil fuel and is not renewable. Solar energy, wind energy, and hydroelectric power are all renewable energy sources as they are naturally replenished.",
    },
  ],
}

// Type for question formats
type QuestionType = "mcq" | "true-false" | "short-answer" | "very-short-answer" | "long-answer" | "case-study"

export default function ScienceAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = Array.isArray(params.assessmentId) ? params.assessmentId[0] : params.assessmentId
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load generated questions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`assessment_${assessmentId}`)
    if (stored) {
      const raw = JSON.parse(stored) as any[]
      // Map raw API questions to page's question format
      const formatted = raw.map((q) => {
        // Build options array
        let options: Array<{ id: string; text: string }> = []
        
        // Map API question types to frontend types
        const mapQuestionType = (apiType: string): QuestionType => {
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
        
        if (questionType === "mcq") {
          options = [
            { id: 'option1', text: q.option1 },
            { id: 'option2', text: q.option2 },
            { id: 'option3', text: q.option3 },
            { id: 'option4', text: q.option4 },
          ]
        } else if (questionType === "true-false") {
          options = [
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' },
          ]
        }
        // Other question types won't have options
        
        return {
          _id: q._id,
          id: q._id,
          text: q.question,
          options,
          correctAnswer: q.correct_answer || q.correctanswer,
          explanation: q.explaination,
          questionType: questionType,
          apiQuestionType: q.question_type,
        }
      })
      setQuestions(formatted)
      setLoaded(true)
    } else {
      setQuestions(mockAssessment.questions)
      setLoaded(true)
    }
  }, [assessmentId])

  // Handle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [questions])

  // Calculate progress
  const progress = questions.length ? (Object.keys(selectedAnswers).length / questions.length) * 100 : 0

  // Handle answer selection
  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setShowExplanation(false)
    }
  }

  // Handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setShowExplanation(false)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Build submission payload
      const answers = questions.map((q) => ({
        questionid: q._id || q.id,
        studentanswer: selectedAnswers[q._id || q.id] || "",
        question_type: q.apiQuestionType || "",
      }))
      const payload = {
        assessment_id: assessmentId,
        questions: answers,
      }
      // Call submission API
      const authToken = getAuthToken()
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ASSESSMENT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken || "",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`)
      }
      const resultData = await response.json()
      // Store review data and navigate
      localStorage.setItem(`review_${assessmentId}`, JSON.stringify(resultData))
      // Also save the user's answers for the review screen
      localStorage.setItem(`answers_${assessmentId}`, JSON.stringify(selectedAnswers))
      // Navigate to the review page
      router.push(`/home/assessment/science/${assessmentId}/review`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const question = questions[currentQuestion]

  // Helper function to get question type display name
  const getQuestionTypeDisplayName = (type: QuestionType) => {
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

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Early returns after all hooks
  if (!loaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    )
  }
  if (loaded && questions.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
        <p className="text-lg text-gray-700">No assessment questions found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-green-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-green-600" />
            <span className="font-medium text-lg text-green-600">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Atom className="mr-2 h-6 w-6 text-green-600" />
          {mockAssessment.title}
        </h1>
        <p className="text-gray-600 mt-1">{mockAssessment.description}</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">
            {Object.keys(selectedAnswers).length}/{questions.length} Questions
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="bg-green-100 text-green-800 mb-2">
                Question {currentQuestion + 1}/{questions.length}
              </Badge>
              <Badge variant="outline" className="text-gray-600 border-gray-200 mb-2 ml-2">
                {getQuestionTypeDisplayName(question.questionType)}
              </Badge>
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              <HelpCircle className="h-4 w-4 mr-1" /> Hint
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {question.questionType === "mcq" ? (
            <RadioGroup
              value={selectedAnswers[question._id || question.id] || ""}
              onValueChange={(value) => handleSelectAnswer(question._id || question.id, value)}
            >
              <div className="space-y-3">
                {question.options.map((option: any, index: number) => (
                  <div
                    key={option.id}
                    className={`flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAnswers[question._id || question.id] === option.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-200 hover:bg-green-50/50"
                    }`}
                    onClick={() => handleSelectAnswer(question._id || question.id, option.id)}
                  >
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} className="text-green-600" />
                    <Label htmlFor={`option-${option.id}`} className="flex-grow ml-3 font-medium cursor-pointer">
                      {question.questionType === "mcq" ? `${index + 1}. ${option.text}` : option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : question.questionType === "true-false" ? (
            <RadioGroup
              value={selectedAnswers[question._id || question.id] || ""}
              onValueChange={(value) => handleSelectAnswer(question._id || question.id, value)}
            >
              <div className="space-y-3">
                {question.options.map((option: any, index: number) => (
                  <div
                    key={option.id}
                    className={`flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAnswers[question._id || question.id] === option.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-200 hover:bg-green-50/50"
                    }`}
                    onClick={() => handleSelectAnswer(question._id || question.id, option.id)}
                  >
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} className="text-green-600" />
                    <Label htmlFor={`option-${option.id}`} className="flex-grow ml-3 font-medium cursor-pointer">
                      {question.questionType === "true-false" ? `${index + 1}. ${option.text}` : option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          ) : question.questionType === "short-answer" || question.questionType === "very-short-answer" || question.questionType === "long-answer" || question.questionType === "case-study" ? (
            <div className="mt-4 space-y-3">
              <textarea
                className={`w-full border border-gray-300 rounded-md p-3 resize-none ${
                  question.questionType === "very-short-answer" ? "min-h-[100px]" :
                  question.questionType === "short-answer" ? "min-h-[150px]" :
                  question.questionType === "long-answer" ? "min-h-[250px]" :
                  question.questionType === "case-study" ? "min-h-[300px]" : "min-h-[150px]"
                }`}
                placeholder="Enter your answer here..."
                value={selectedAnswers[question._id || question.id] || ""}
                onChange={(e) => handleSelectAnswer(question._id || question.id, e.target.value)}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  {question.questionType === "very-short-answer" && "Keep your answer brief (1-2 sentences)"}
                  {question.questionType === "short-answer" && "Provide a concise answer (2-3 sentences)"}
                  {question.questionType === "long-answer" && "Provide a detailed explanation"}
                  {question.questionType === "case-study" && "Analyze the scenario thoroughly"}
                </span>
                <span>Word count: {selectedAnswers[question._id || question.id]?.trim().split(/\s+/).filter(Boolean).length || 0}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-gray-700">This question type is not yet implemented.</p>
            </div>
          )}

          {showExplanation && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">Explanation:</h4>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="text-green-600 border-green-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestion < questions.length - 1 ? (
            <Button onClick={handleNextQuestion} className="bg-green-600 hover:bg-green-700">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Question Navigation */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {questions.map((q, index) => (
          <Button
            key={q._id || q.id}
            variant="outline"
            size="sm"
            className={`h-10 w-10 p-0 ${
              index === currentQuestion
                ? "border-green-500 bg-green-100 text-green-800"
                : selectedAnswers[q._id || q.id]
                  ? "border-green-500 bg-green-100 text-green-800"
                  : "border-gray-200"
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      {/* Submit Button (Fixed at Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(selectedAnswers).length === 0}
          className="bg-green-600 hover:bg-green-700 w-full max-w-md"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Flag className="mr-2 h-4 w-4" /> Submit Assessment
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
