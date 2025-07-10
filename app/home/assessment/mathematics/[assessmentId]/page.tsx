"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Flag, Calculator, HelpCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Mock assessment data for Mathematics
const mockAssessment = {
  id: "math-assessment-1",
  title: "Algebra and Geometry Assessment",
  description: "Test your knowledge of algebraic expressions, equations, and geometric principles.",
  timeLimit: 25, // in minutes
  questions: [
    {
      id: 1,
      text: "Solve for x: 2x + 5 = 13",
      options: [
        { id: "a", text: "x = 3" },
        { id: "b", text: "x = 4" },
        { id: "c", text: "x = 5" },
        { id: "d", text: "x = 6" },
      ],
      correctAnswer: "b",
      explanation: "2x + 5 = 13\n2x = 13 - 5\n2x = 8\nx = 4",
    },
    {
      id: 2,
      text: "What is the area of a circle with radius 5 units?",
      options: [
        { id: "a", text: "25π square units" },
        { id: "b", text: "10π square units" },
        { id: "c", text: "5π square units" },
        { id: "d", text: "15π square units" },
      ],
      correctAnswer: "a",
      explanation:
        "The area of a circle is given by A = πr². For a circle with radius 5 units, A = π(5)² = 25π square units.",
    },
    {
      id: 3,
      text: "Simplify: (3x² + 2x - 1) - (x² - 3x + 4)",
      options: [
        { id: "a", text: "2x² + 5x - 5" },
        { id: "b", text: "4x² - x - 5" },
        { id: "c", text: "2x² + 5x - 3" },
        { id: "d", text: "4x² - x + 3" },
      ],
      correctAnswer: "a",
      explanation: "(3x² + 2x - 1) - (x² - 3x + 4) = 3x² + 2x - 1 - x² + 3x - 4 = 2x² + 5x - 5",
    },
    {
      id: 4,
      text: "What is the value of x in the equation log₂(x) = 3?",
      options: [
        { id: "a", text: "6" },
        { id: "b", text: "8" },
        { id: "c", text: "9" },
        { id: "d", text: "16" },
      ],
      correctAnswer: "b",
      explanation: "If log₂(x) = 3, then x = 2³ = 8.",
    },
    {
      id: 5,
      text: "In a right-angled triangle, if one angle is 30°, what is the other acute angle?",
      options: [
        { id: "a", text: "30°" },
        { id: "b", text: "45°" },
        { id: "c", text: "60°" },
        { id: "d", text: "90°" },
      ],
      correctAnswer: "c",
      explanation:
        "In a triangle, the sum of all angles is 180°. In a right-angled triangle, one angle is 90°. If another angle is 30°, then the third angle is 180° - 90° - 30° = 60°.",
    },
    {
      id: 6,
      text: "What is the slope of a line perpendicular to y = 3x + 2?",
      options: [
        { id: "a", text: "3" },
        { id: "b", text: "-3" },
        { id: "c", text: "1/3" },
        { id: "d", text: "-1/3" },
      ],
      correctAnswer: "d",
      explanation:
        "The slope of the line y = 3x + 2 is 3. The slope of a perpendicular line is the negative reciprocal of the original slope. So, the slope of the perpendicular line is -1/3.",
    },
    {
      id: 7,
      text: "Solve the inequality: 2x - 5 > 7",
      options: [
        { id: "a", text: "x > 6" },
        { id: "b", text: "x > 5" },
        { id: "c", text: "x < 6" },
        { id: "d", text: "x < 5" },
      ],
      correctAnswer: "a",
      explanation: "2x - 5 > 7\n2x > 12\nx > 6",
    },
    {
      id: 8,
      text: "What is the value of sin(30°)?",
      options: [
        { id: "a", text: "1/4" },
        { id: "b", text: "1/2" },
        { id: "c", text: "√3/2" },
        { id: "d", text: "1" },
      ],
      correctAnswer: "b",
      explanation: "sin(30°) = 1/2 is a standard trigonometric value.",
    },
    {
      id: 9,
      text: "If f(x) = x² - 3x + 2, what is f(4)?",
      options: [
        { id: "a", text: "6" },
        { id: "b", text: "8" },
        { id: "c", text: "10" },
        { id: "d", text: "12" },
      ],
      correctAnswer: "a",
      explanation: "f(4) = 4² - 3(4) + 2 = 16 - 12 + 2 = 6",
    },
    {
      id: 10,
      text: "What is the perimeter of a rectangle with length 8 units and width 5 units?",
      options: [
        { id: "a", text: "13 units" },
        { id: "b", text: "26 units" },
        { id: "c", text: "40 units" },
        { id: "d", text: "20 units" },
      ],
      correctAnswer: "b",
      explanation:
        "The perimeter of a rectangle is given by P = 2(l + w). For a rectangle with length 8 units and width 5 units, P = 2(8 + 5) = 2(13) = 26 units.",
    },
  ],
}

export default function MathematicsAssessmentPage({ params }: { params: { assessmentId: string } }) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(mockAssessment.timeLimit * 60) // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

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
  }, [])

  // Calculate progress
  const progress = (Object.keys(selectedAnswers).length / mockAssessment.questions.length) * 100

  // Handle answer selection
  const handleSelectAnswer = (questionId: number, answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < mockAssessment.questions.length - 1) {
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
  const handleSubmit = () => {
    setIsSubmitting(true)
    // Calculate score
    const score = mockAssessment.questions.reduce((acc, question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        return acc + 1
      }
      return acc
    }, 0)

    // Navigate to results page
    setTimeout(() => {
      router.push(`/home/assessment/mathematics/${params.assessmentId}/review?score=${score}`)
    }, 1500)
  }

  const question = mockAssessment.questions[currentQuestion]

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-red-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-red-600" />
            <span className="font-medium text-lg text-red-600">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="mr-2 h-6 w-6 text-red-600" />
          {mockAssessment.title}
        </h1>
        <p className="text-gray-600 mt-1">{mockAssessment.description}</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium">
            {Object.keys(selectedAnswers).length}/{mockAssessment.questions.length} Questions
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6 border-red-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="bg-red-100 text-red-800 mb-2">
                Question {currentQuestion + 1}/{mockAssessment.questions.length}
              </Badge>
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              <HelpCircle className="h-4 w-4 mr-1" /> Hint
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswers[question.id] || ""}
            onValueChange={(value) => handleSelectAnswer(question.id, value)}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAnswers[question.id] === option.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-200 hover:bg-red-50/50"
                  }`}
                  onClick={() => handleSelectAnswer(question.id, option.id)}
                >
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} className="text-red-600" />
                  <Label htmlFor={`option-${option.id}`} className="flex-grow ml-3 font-medium cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {showExplanation && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-1">Explanation:</h4>
              <p className="text-gray-700 whitespace-pre-line">{question.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="text-red-600 border-red-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestion < mockAssessment.questions.length - 1 ? (
            <Button onClick={handleNextQuestion} className="bg-red-600 hover:bg-red-700">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Question Navigation */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {mockAssessment.questions.map((q, index) => (
          <Button
            key={q.id}
            variant="outline"
            size="sm"
            className={`h-10 w-10 p-0 ${
              index === currentQuestion
                ? "border-red-500 bg-red-100 text-red-800"
                : selectedAnswers[q.id]
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
          className="bg-red-600 hover:bg-red-700 w-full max-w-md"
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
