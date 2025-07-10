"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Award, CheckCircle, XCircle, Calculator, Share2, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

// Mock user answers (in a real app, this would come from a database or state)
const mockUserAnswers = {
  1: "b", // correct
  2: "a", // correct
  3: "a", // correct
  4: "b", // correct
  5: "c", // correct
  6: "b", // incorrect, correct is d
  7: "a", // correct
  8: "b", // correct
  9: "c", // incorrect, correct is a
  10: "b", // correct
}

export default function MathematicsAssessmentReviewPage({ params }: { params: { assessmentId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [percentage, setPercentage] = useState(0)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    // Get score from URL params or calculate it
    const scoreParam = searchParams.get("score")
    const calculatedScore = scoreParam
      ? Number.parseInt(scoreParam)
      : mockAssessment.questions.reduce((acc, question) => {
          if (mockUserAnswers[question.id as keyof typeof mockUserAnswers] === question.correctAnswer) {
            return acc + 1
          }
          return acc
        }, 0)

    setScore(calculatedScore)
    const calculatedPercentage = (calculatedScore / mockAssessment.questions.length) * 100
    setPercentage(calculatedPercentage)

    // Determine grade
    if (calculatedPercentage >= 90) {
      setGrade("A")
      setFeedback("Excellent! You have a strong understanding of algebraic and geometric concepts.")
    } else if (calculatedPercentage >= 80) {
      setGrade("B")
      setFeedback("Very good! You have a solid grasp of mathematics, with just a few areas to improve.")
    } else if (calculatedPercentage >= 70) {
      setGrade("C")
      setFeedback("Good effort! You understand the basics but need more practice with complex problems.")
    } else if (calculatedPercentage >= 60) {
      setGrade("D")
      setFeedback("You need to strengthen your understanding of fundamental mathematical concepts.")
    } else {
      setGrade("F")
      setFeedback("You should focus on building a stronger foundation in basic mathematical principles.")
    }
  }, [searchParams])

  // Get color based on score percentage
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-red-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/home/assessment/mathematics")}
          className="text-red-600 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="mr-2 h-6 w-6 text-red-600" />
          {mockAssessment.title} - Results
        </h1>
        <p className="text-gray-600 mt-1">Your assessment results and detailed feedback</p>
      </div>

      {/* Score Overview */}
      <Card className="mb-8 border-red-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Result</h2>
              <p className="opacity-90">You performed well on this assessment!</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="bg-white rounded-full p-4 h-24 w-24 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                </div>
              </div>
              <div className="ml-4 text-center md:text-left">
                <div className="text-3xl font-bold">{grade}</div>
                <div className="text-sm opacity-90">Grade</div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {score}/{mockAssessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {mockAssessment.questions.length - score}/{mockAssessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {Math.round((score / mockAssessment.questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">Feedback</h3>
            <p className="text-gray-700 p-4 bg-red-50 rounded-lg border border-red-100">{feedback}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/home/assessment/mathematics")}>
              <Award className="mr-2 h-4 w-4" /> View Other Assessments
            </Button>
            <Button variant="outline" className="border-red-200 text-red-600">
              <Share2 className="mr-2 h-4 w-4" /> Share Results
            </Button>
            <Button variant="outline" className="border-red-200 text-red-600">
              <Download className="mr-2 h-4 w-4" /> Download Certificate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <h2 className="text-xl font-bold mb-4">Detailed Review</h2>
      <div className="space-y-6 mb-8">
        {mockAssessment.questions.map((question) => {
          const userAnswer = mockUserAnswers[question.id as keyof typeof mockUserAnswers]
          const isCorrect = userAnswer === question.correctAnswer
          return (
            <Card key={question.id} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{question.text}</CardTitle>
                  {isCorrect ? (
                    <Badge className="bg-green-100 text-green-800">Correct</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Incorrect</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-lg flex items-center ${
                        option.id === question.correctAnswer
                          ? "bg-green-100 border border-green-200"
                          : option.id === userAnswer && option.id !== question.correctAnswer
                            ? "bg-red-100 border border-red-200"
                            : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {option.id === question.correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      ) : option.id === userAnswer && option.id !== question.correctAnswer ? (
                        <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 mr-2" />
                      )}
                      <span>{option.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-1">Explanation:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{question.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recommendations */}
      <Card className="mb-8 border-red-200">
        <CardHeader>
          <CardTitle>Recommended Practice</CardTitle>
          <CardDescription>Use these resources to improve your mathematics skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-100 rounded-lg bg-red-50">
              <h3 className="font-medium text-red-800 mb-2">Algebra Practice</h3>
              <p className="text-gray-700 mb-3">
                Strengthen your understanding of algebraic expressions and equations.
              </p>
              <Button variant="outline" className="text-red-600 border-red-200">
                Start Practice
              </Button>
            </div>
            <div className="p-4 border border-red-100 rounded-lg bg-red-50">
              <h3 className="font-medium text-red-800 mb-2">Geometry Concepts</h3>
              <p className="text-gray-700 mb-3">Review geometric principles and practice solving geometric problems.</p>
              <Button variant="outline" className="text-red-600 border-red-200">
                Start Practice
              </Button>
            </div>
            <div className="p-4 border border-red-100 rounded-lg bg-red-50">
              <h3 className="font-medium text-red-800 mb-2">Problem-Solving Techniques</h3>
              <p className="text-gray-700 mb-3">
                Learn strategies to approach and solve complex mathematical problems.
              </p>
              <Button variant="outline" className="text-red-600 border-red-200">
                Start Practice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
        <h3 className="text-xl font-bold text-red-700 mb-2">Next Steps</h3>
        <p className="text-red-600 mb-4">
          Continue practicing regularly and take more assessments to improve your mathematics skills.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => router.push("/home/assessment/mathematics")}>
            View Other Assessments
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600"
            onClick={() => router.push("/home/learning/mathematics")}
          >
            Continue Learning Mathematics
          </Button>
        </div>
      </div>
    </div>
  )
}
