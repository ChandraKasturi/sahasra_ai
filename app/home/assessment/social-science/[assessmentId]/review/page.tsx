"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Award, CheckCircle, XCircle, Globe, Share2, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

// Mock user answers (in a real app, this would come from a database or state)
const mockUserAnswers = {
  1: "c", // correct
  2: "b", // correct
  3: "b", // correct
  4: "c", // correct
  5: "b", // correct
  6: "d", // correct
  7: "c", // correct
  8: "c", // correct
  9: "a", // incorrect, correct is b
  10: "c", // correct
}

export default function SocialScienceAssessmentReviewPage({ params }: { params: { assessmentId: string } }) {
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
      setFeedback("Excellent! You have a strong understanding of history and geography concepts.")
    } else if (calculatedPercentage >= 80) {
      setGrade("B")
      setFeedback("Very good! You have a solid grasp of social science concepts, with just a few areas to improve.")
    } else if (calculatedPercentage >= 70) {
      setGrade("C")
      setFeedback("Good effort! You understand the basics but need more practice with complex social science concepts.")
    } else if (calculatedPercentage >= 60) {
      setGrade("D")
      setFeedback("You need to strengthen your understanding of fundamental social science principles.")
    } else {
      setGrade("F")
      setFeedback("You should focus on building a stronger foundation in basic social science concepts.")
    }
  }, [searchParams])

  // Get color based on score percentage
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-purple-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/home/assessment/social-science")}
          className="text-purple-600 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Globe className="mr-2 h-6 w-6 text-purple-600" />
          {mockAssessment.title} - Results
        </h1>
        <p className="text-gray-600 mt-1">Your assessment results and detailed feedback</p>
      </div>

      {/* Score Overview */}
      <Card className="mb-8 border-purple-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
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
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {score}/{mockAssessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {mockAssessment.questions.length - score}/{mockAssessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {Math.round((score / mockAssessment.questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">Feedback</h3>
            <p className="text-gray-700 p-4 bg-purple-50 rounded-lg border border-purple-100">{feedback}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push("/home/assessment/social-science")}
            >
              <Award className="mr-2 h-4 w-4" /> View Other Assessments
            </Button>
            <Button variant="outline" className="border-purple-200 text-purple-600">
              <Share2 className="mr-2 h-4 w-4" /> Share Results
            </Button>
            <Button variant="outline" className="border-purple-200 text-purple-600">
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

                <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-1">Explanation:</h4>
                  <p className="text-gray-700">{question.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recommendations */}
      <Card className="mb-8 border-purple-200">
        <CardHeader>
          <CardTitle>Recommended Practice</CardTitle>
          <CardDescription>Use these resources to improve your social science skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
              <h3 className="font-medium text-purple-800 mb-2">History Timeline</h3>
              <p className="text-gray-700 mb-3">
                Strengthen your understanding of historical events and their chronology.
              </p>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                Start Practice
              </Button>
            </div>
            <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
              <h3 className="font-medium text-purple-800 mb-2">Geography Concepts</h3>
              <p className="text-gray-700 mb-3">Review geographical features, countries, and their relationships.</p>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                Start Practice
              </Button>
            </div>
            <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
              <h3 className="font-medium text-purple-800 mb-2">Political Systems</h3>
              <p className="text-gray-700 mb-3">Learn about different political systems and governance structures.</p>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                Start Practice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
        <h3 className="text-xl font-bold text-purple-700 mb-2">Next Steps</h3>
        <p className="text-purple-600 mb-4">
          Continue practicing regularly and take more assessments to improve your social science skills.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => router.push("/home/assessment/social-science")}
          >
            View Other Assessments
          </Button>
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600"
            onClick={() => router.push("/home/learning/social-science")}
          >
            Continue Learning Social Science
          </Button>
        </div>
      </div>
    </div>
  )
}
