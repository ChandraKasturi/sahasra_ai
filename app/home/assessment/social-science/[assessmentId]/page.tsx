"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Flag, Globe, HelpCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Mock assessment data for Social Science
const mockAssessment = {
  id: "social-science-assessment-1",
  title: "History and Geography Assessment",
  description: "Test your knowledge of world history, geography, and social structures.",
  timeLimit: 25, // in minutes
  questions: [
    {
      id: 1,
      text: "Which of the following civilizations built the Machu Picchu?",
      options: [
        { id: "a", text: "Aztec" },
        { id: "b", text: "Maya" },
        { id: "c", text: "Inca" },
        { id: "d", text: "Olmec" },
      ],
      correctAnswer: "c",
      explanation:
        "Machu Picchu was built by the Inca civilization in the 15th century. It is located in present-day Peru and is one of the most famous archaeological sites in the world.",
    },
    {
      id: 2,
      text: "Which river is the longest in the world?",
      options: [
        { id: "a", text: "Amazon" },
        { id: "b", text: "Nile" },
        { id: "c", text: "Yangtze" },
        { id: "d", text: "Mississippi" },
      ],
      correctAnswer: "b",
      explanation:
        "The Nile River is generally considered the longest river in the world, with a length of about 6,650 kilometers (4,130 miles). The Amazon River is a close second.",
    },
    {
      id: 3,
      text: "Who was the first Prime Minister of India?",
      options: [
        { id: "a", text: "Mahatma Gandhi" },
        { id: "b", text: "Jawaharlal Nehru" },
        { id: "c", text: "Sardar Vallabhbhai Patel" },
        { id: "d", text: "B.R. Ambedkar" },
      ],
      correctAnswer: "b",
      explanation:
        "Jawaharlal Nehru was the first Prime Minister of independent India, serving from 1947 until his death in 1964.",
    },
    {
      id: 4,
      text: "Which of the following is NOT one of the seven continents?",
      options: [
        { id: "a", text: "Europe" },
        { id: "b", text: "Australia" },
        { id: "c", text: "Atlantis" },
        { id: "d", text: "Antarctica" },
      ],
      correctAnswer: "c",
      explanation:
        "Atlantis is a mythical island mentioned in Plato's works and is not one of the seven continents. The seven continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America.",
    },
    {
      id: 5,
      text: "The French Revolution began in which year?",
      options: [
        { id: "a", text: "1689" },
        { id: "b", text: "1789" },
        { id: "c", text: "1889" },
        { id: "d", text: "1989" },
      ],
      correctAnswer: "b",
      explanation:
        "The French Revolution began in 1789 with the storming of the Bastille on July 14, which is now celebrated as Bastille Day in France.",
    },
    {
      id: 6,
      text: "Which mountain range separates Europe from Asia?",
      options: [
        { id: "a", text: "Alps" },
        { id: "b", text: "Himalayas" },
        { id: "c", text: "Andes" },
        { id: "d", text: "Ural Mountains" },
      ],
      correctAnswer: "d",
      explanation:
        "The Ural Mountains are generally considered to form part of the conventional boundary between Europe and Asia.",
    },
    {
      id: 7,
      text: "Who wrote the 'Communist Manifesto'?",
      options: [
        { id: "a", text: "Vladimir Lenin" },
        { id: "b", text: "Joseph Stalin" },
        { id: "c", text: "Karl Marx and Friedrich Engels" },
        { id: "d", text: "Leon Trotsky" },
      ],
      correctAnswer: "c",
      explanation:
        "The 'Communist Manifesto' was written by Karl Marx and Friedrich Engels and published in 1848. It is one of the world's most influential political documents.",
    },
    {
      id: 8,
      text: "Which of the following is NOT a branch of social science?",
      options: [
        { id: "a", text: "Economics" },
        { id: "b", text: "Sociology" },
        { id: "c", text: "Astronomy" },
        { id: "d", text: "Political Science" },
      ],
      correctAnswer: "c",
      explanation:
        "Astronomy is a natural science that studies celestial objects and phenomena. It is not a branch of social science, which typically includes disciplines like economics, sociology, political science, anthropology, and psychology.",
    },
    {
      id: 9,
      text: "The United Nations was founded in which year?",
      options: [
        { id: "a", text: "1919" },
        { id: "b", text: "1945" },
        { id: "c", text: "1955" },
        { id: "d", text: "1965" },
      ],
      correctAnswer: "b",
      explanation:
        "The United Nations was founded on October 24, 1945, after World War II, to replace the League of Nations, to prevent another such conflict, and to promote international cooperation.",
    },
    {
      id: 10,
      text: "Which of the following is the largest democracy in the world by population?",
      options: [
        { id: "a", text: "United States" },
        { id: "b", text: "Brazil" },
        { id: "c", text: "India" },
        { id: "d", text: "Indonesia" },
      ],
      correctAnswer: "c",
      explanation:
        "India is the largest democracy in the world by population, with over 1.3 billion people. It has been a democratic republic since 1950.",
    },
  ],
}

export default function SocialScienceAssessmentPage({ params }: { params: { assessmentId: string } }) {
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
      router.push(`/home/assessment/social-science/${params.assessmentId}/review?score=${score}`)
    }, 1500)
  }

  const question = mockAssessment.questions[currentQuestion]

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-purple-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-purple-600" />
            <span className="font-medium text-lg text-purple-600">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Globe className="mr-2 h-6 w-6 text-purple-600" />
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
      <Card className="mb-6 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 mb-2">
                Question {currentQuestion + 1}/{mockAssessment.questions.length}
              </Badge>
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-200"
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
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                  }`}
                  onClick={() => handleSelectAnswer(question.id, option.id)}
                >
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} className="text-purple-600" />
                  <Label htmlFor={`option-${option.id}`} className="flex-grow ml-3 font-medium cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {showExplanation && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-1">Explanation:</h4>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="text-purple-600 border-purple-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestion < mockAssessment.questions.length - 1 ? (
            <Button onClick={handleNextQuestion} className="bg-purple-600 hover:bg-purple-700">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
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
                ? "border-purple-500 bg-purple-100 text-purple-800"
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
          className="bg-purple-600 hover:bg-purple-700 w-full max-w-md"
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
