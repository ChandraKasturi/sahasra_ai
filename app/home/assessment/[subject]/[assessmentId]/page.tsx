"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowLeft,
  X,
  FileText,
  ListChecks,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

// Types
type Subject = "english" | "hindi" | "mathematics" | "science" | "social-science"
type QuestionType = "mcq" | "true-false" | "descriptive"
type DifficultyLevel = "Easy" | "Medium" | "Hard"

interface Topic {
  id: string
  name: string
}

interface Option {
  id: string
  text: string
  imageUrl?: string
}

interface Question {
  id: string
  type: QuestionType
  text: string
  imageUrl?: string
  options?: Option[]
  correctAnswer?: string | string[]
  topic: string
}

interface AssessmentDetails {
  id: string
  subject: Subject
  topics: Topic[]
  questionTypes: string[]
  difficultyLevel: DifficultyLevel
  numberOfQuestions: number
  timeLimit: number // in minutes
}

// Mock data generator
const generateMockData = (subject: Subject, assessmentId: string, numberOfQuestions = 10) => {
  // Generate topics based on subject
  const topics: Topic[] = [
    { id: "t1", name: "Grammar" },
    { id: "t2", name: "Vocabulary" },
    { id: "t3", name: "Reading Comprehension" },
    { id: "t4", name: "Writing Skills" },
  ]

  // Generate assessment details
  const assessmentDetails: AssessmentDetails = {
    id: assessmentId,
    subject,
    topics: topics,
    questionTypes: ["mcq", "true-false", "descriptive"],
    difficultyLevel: "Medium",
    numberOfQuestions,
    timeLimit: numberOfQuestions * 2, // 2 minutes per question
  }

  // Generate questions
  const questions: Question[] = []

  for (let i = 0; i < numberOfQuestions; i++) {
    const questionType: QuestionType = i % 3 === 0 ? "mcq" : i % 3 === 1 ? "true-false" : "descriptive"
    const topicIndex = i % topics.length

    if (questionType === "mcq") {
      questions.push({
        id: `q${i + 1}`,
        type: "mcq",
        text: `Question ${i + 1}: ${getMCQQuestionText(subject, i)}`,
        imageUrl: i % 5 === 0 ? "/placeholder.svg?height=200&width=400" : undefined,
        options: [
          { id: "a", text: `Option A for question ${i + 1}` },
          { id: "b", text: `Option B for question ${i + 1}` },
          { id: "c", text: `Option C for question ${i + 1}` },
          { id: "d", text: `Option D for question ${i + 1}` },
        ],
        correctAnswer: "a", // For demo purposes
        topic: topics[topicIndex].name,
      })
    } else if (questionType === "true-false") {
      questions.push({
        id: `q${i + 1}`,
        type: "true-false",
        text: `Question ${i + 1}: ${getTrueFalseQuestionText(subject, i)}`,
        imageUrl: i % 7 === 0 ? "/placeholder.svg?height=200&width=400" : undefined,
        options: [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ],
        correctAnswer: "true", // For demo purposes
        topic: topics[topicIndex].name,
      })
    } else {
      questions.push({
        id: `q${i + 1}`,
        type: "descriptive",
        text: `Question ${i + 1}: ${getDescriptiveQuestionText(subject, i)}`,
        topic: topics[topicIndex].name,
      })
    }
  }

  return { assessmentDetails, questions }
}

// Helper functions for generating question text
const getMCQQuestionText = (subject: Subject, index: number) => {
  if (subject === "english") {
    const questions = [
      "Choose the correct form of the verb to complete the sentence: She _____ to the store yesterday.",
      "Which word is a synonym for 'happy'?",
      "Identify the correct sentence:",
      "What is the past tense of 'run'?",
      "Choose the correct pronoun: _____ went to the park yesterday.",
    ]
    return questions[index % questions.length]
  }
  return `Multiple choice question about ${subject}`
}

const getTrueFalseQuestionText = (subject: Subject, index: number) => {
  if (subject === "english") {
    const questions = [
      "A noun is a person, place, or thing.",
      "The past tense of 'go' is 'gone'.",
      "Adverbs modify nouns.",
      "A complete sentence must have a subject and a verb.",
      "Pronouns replace adjectives in a sentence.",
    ]
    return questions[index % questions.length]
  }
  return `True or false: This statement about ${subject} is correct.`
}

const getDescriptiveQuestionText = (subject: Subject, index: number) => {
  if (subject === "english") {
    const questions = [
      "Write a paragraph describing your favorite book and why you enjoy it. Please include details about the plot, characters, and themes that resonated with you. Also explain how this book has influenced your perspective or thinking. Consider discussing the author's writing style and what makes it effective. If possible, compare this book to others you've read in the same genre.",
      "Explain the difference between 'their', 'there', and 'they're' with examples. For each word, provide at least three example sentences that demonstrate proper usage. Then, explain common mistakes people make when using these words and how to avoid these errors. Finally, create a mnemonic device that could help someone remember the correct usage of each word.",
      "Rewrite the following sentence to correct any errors: 'The boy and girl goes to the store.' Explain what grammatical rules were violated in the original sentence. Then provide three additional examples of sentences with similar errors, and correct each one. Discuss why this type of error is common and strategies for avoiding it in your own writing.",
      "Write three sentences using the word 'remarkable' as different parts of speech. For each sentence, identify which part of speech 'remarkable' functions as. Then, provide the definition of 'remarkable' that applies to each usage. Finally, suggest three synonyms that could replace 'remarkable' in each of your example sentences.",
      "Describe the main character in the last story you read. Include physical characteristics, personality traits, motivations, and how the character changes throughout the story. Analyze how the author developed this character and what literary techniques were used. Discuss how this character relates to the main themes of the story and why readers might connect with or learn from this character.",
    ]
    return questions[index % questions.length]
  }
  return `Write a short answer about ${subject}.`
}

// Get subject color
const getSubjectColor = (subject: Subject) => {
  switch (subject) {
    case "english":
      return {
        primary: "text-blue-600",
        bg: "bg-blue-600",
        bgLight: "bg-blue-100",
        border: "border-blue-600",
        hover: "hover:bg-blue-700",
        text: "text-blue-600",
      }
    case "hindi":
      return {
        primary: "text-orange-600",
        bg: "bg-orange-600",
        bgLight: "bg-orange-100",
        border: "border-orange-600",
        hover: "hover:bg-orange-700",
        text: "text-orange-600",
      }
    case "mathematics":
      return {
        primary: "text-red-600",
        bg: "bg-red-600",
        bgLight: "bg-red-100",
        border: "border-red-600",
        hover: "hover:bg-red-700",
        text: "text-red-600",
      }
    case "science":
      return {
        primary: "text-green-600",
        bg: "bg-green-600",
        bgLight: "bg-green-100",
        border: "border-green-600",
        hover: "hover:bg-green-700",
        text: "text-green-600",
      }
    case "social-science":
      return {
        primary: "text-purple-600",
        bg: "bg-purple-600",
        bgLight: "bg-purple-100",
        border: "border-purple-600",
        hover: "hover:bg-purple-700",
        text: "text-purple-600",
      }
    default:
      return {
        primary: "text-blue-600",
        bg: "bg-blue-600",
        bgLight: "bg-blue-100",
        border: "border-blue-600",
        hover: "hover:bg-blue-700",
        text: "text-blue-600",
      }
  }
}

// Get subject name
const getSubjectName = (subject: Subject) => {
  switch (subject) {
    case "english":
      return "English"
    case "hindi":
      return "Hindi"
    case "mathematics":
      return "Mathematics"
    case "science":
      return "Science"
    case "social-science":
      return "Social Science"
    default:
      return subject
  }
}

// Format time
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

export default function AssessmentPage({
  params,
}: {
  params: { subject: Subject; assessmentId: string }
}) {
  const router = useRouter()
  const { subject, assessmentId } = params
  const colors = getSubjectColor(subject)

  // Generate mock data
  const { assessmentDetails, questions } = generateMockData(subject, assessmentId, 10)

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(assessmentDetails.timeLimit * 60)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<{
    score: number
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    unanswered: number
  } | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Ref for scrolling to top of question content
  const questionContentRef = useRef<HTMLDivElement>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start timer
  useEffect(() => {
    if (!isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isSubmitted])

  // Scroll to top when question changes
  useEffect(() => {
    if (questionContentRef.current) {
      questionContentRef.current.scrollTop = 0
    }
  }, [currentQuestionIndex])

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  // Handle flag question
  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  // Navigate to specific question
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Check if question is answered
  const isQuestionAnswered = (questionId: string) => {
    return !!answers[questionId]
  }

  // Check if question is flagged
  const isQuestionFlagged = (questionId: string) => {
    return flaggedQuestions.includes(questionId)
  }

  // Calculate progress
  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length
    return (answeredCount / questions.length) * 100
  }

  // Handle submit
  const handleSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Calculate results (mock for demo)
    const answeredQuestions = Object.keys(answers).length
    const correctAnswers = Math.floor(answeredQuestions * 0.8) // Assume 80% correct for demo
    const incorrectAnswers = answeredQuestions - correctAnswers
    const unanswered = questions.length - answeredQuestions

    setResults({
      score: Math.round((correctAnswers / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers,
      incorrectAnswers,
      unanswered,
    })

    setIsSubmitted(true)
    setIsSubmitDialogOpen(false)
  }

  // Handle exit
  const handleExit = () => {
    router.push(`/home/assessment/${subject}`)
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!isSubmitted ? (
        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="bg-white py-4 px-4 md:px-6 border-b">
            <div className="container mx-auto">
              {/* Assessment Title */}
              <div className="mb-4">
                <h1 className={`text-2xl md:text-3xl font-bold ${colors.text}`}>
                  {getSubjectName(subject)} Assessment
                </h1>
                <p className="text-gray-600 mt-1">
                  {assessmentDetails.difficultyLevel} • {assessmentDetails.timeLimit} minutes • {questions.length}{" "}
                  questions
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <Progress value={calculateProgress()} className="h-2" />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>
                    {Object.keys(answers).length} of {questions.length} answered
                  </span>
                  <span>{Math.round(calculateProgress())}% complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Question Navigation - Only shown on mobile */}
          {isMobile && (
            <div className="bg-white border-b px-4">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between py-2"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                <span className="font-medium">Questions Navigation</span>
                {isMobileSidebarOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              {isMobileSidebarOpen && (
                <div className="mt-2 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Questions</h3>
                    <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
                      {Object.keys(answers).length}/{questions.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => (
                      <Button
                        key={question.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-10 w-10 p-0 font-normal relative",
                          currentQuestionIndex === index && `${colors.border} ${colors.text}`,
                          isQuestionAnswered(question.id) && "bg-gray-100",
                        )}
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                        {isQuestionFlagged(question.id) && (
                          <span className="absolute -top-1 -right-1">
                            <Flag className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </span>
                        )}
                        {isQuestionAnswered(question.id) && (
                          <span className="absolute -bottom-1 -right-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button
                      className={`w-full ${colors.bg} ${colors.hover}`}
                      onClick={() => setIsSubmitDialogOpen(true)}
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content Area with Sidebar and Question */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Question Navigation (Desktop Only) */}
            {!isMobile && (
              <div className="w-[280px] flex-shrink-0 border-r bg-white overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Questions</h3>
                    <Badge variant="outline" className={`${colors.text} ${colors.border}`}>
                      {Object.keys(answers).length}/{questions.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => (
                      <Button
                        key={question.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-10 w-10 p-0 font-normal relative",
                          currentQuestionIndex === index && `${colors.border} ${colors.text}`,
                          isQuestionAnswered(question.id) && "bg-gray-100",
                        )}
                        onClick={() => goToQuestion(index)}
                      >
                        {index + 1}
                        {isQuestionFlagged(question.id) && (
                          <span className="absolute -top-1 -right-1">
                            <Flag className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </span>
                        )}
                        {isQuestionAnswered(question.id) && (
                          <span className="absolute -bottom-1 -right-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-sm text-gray-600">Flagged for review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${colors.bg}`} />
                      <span className="text-sm text-gray-600">Current question</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Assessment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subject:</span>
                        <span className="font-medium">{getSubjectName(subject)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className="font-medium">{assessmentDetails.difficultyLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Questions:</span>
                        <span className="font-medium">{questions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-medium">{assessmentDetails.timeLimit} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      className={`w-full ${colors.bg} ${colors.hover}`}
                      onClick={() => setIsSubmitDialogOpen(true)}
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Question Display with Scrollable Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Top Navigation Bar */}
              <div className="bg-white p-4 flex items-center justify-between border-b">
                <Button variant="ghost" className="gap-1" onClick={handleExit}>
                  <ArrowLeft className="h-4 w-4" />
                  Exit
                </Button>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className={`font-medium ${timeRemaining < 60 ? "text-red-500" : ""}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>

              {/* Scrollable Question Content */}
              <div ref={questionContentRef} className="flex-1 overflow-y-auto p-4">
                <Tabs defaultValue="question" className="w-full">
                  <TabsList className="mb-4 sticky top-0 bg-white z-10">
                    <TabsTrigger value="question" className="flex gap-1">
                      <FileText className="h-4 w-4" />
                      Question
                    </TabsTrigger>
                    <TabsTrigger value="instructions" className="flex gap-1">
                      <Info className="h-4 w-4" />
                      Instructions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="question" className="mt-0">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between mb-4">
                          <Badge variant="outline" className={`${colors.text}`}>
                            {currentQuestion.topic}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("gap-1", isQuestionFlagged(currentQuestion.id) && "text-amber-500")}
                            onClick={() => handleFlagQuestion(currentQuestion.id)}
                          >
                            <Flag
                              className={cn("h-4 w-4", isQuestionFlagged(currentQuestion.id) && "fill-amber-500")}
                            />
                            {isQuestionFlagged(currentQuestion.id) ? "Flagged" : "Flag for review"}
                          </Button>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-2">{currentQuestion.text}</h3>

                          {currentQuestion.imageUrl && (
                            <div className="mt-4 mb-6">
                              <Image
                                src={currentQuestion.imageUrl || "/placeholder.svg"}
                                alt="Question image"
                                width={400}
                                height={200}
                                className="rounded-md"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {currentQuestion.type === "mcq" && (
                            <RadioGroup
                              value={(answers[currentQuestion.id] as string) || ""}
                              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                              className="space-y-3"
                            >
                              {currentQuestion.options?.map((option) => (
                                <div
                                  key={option.id}
                                  className={cn(
                                    "flex items-start space-x-3 rounded-md border p-4 transition-all",
                                    answers[currentQuestion.id] === option.id && `${colors.border} ${colors.bgLight}`,
                                  )}
                                >
                                  <RadioGroupItem
                                    value={option.id}
                                    id={`${currentQuestion.id}-${option.id}`}
                                    className={answers[currentQuestion.id] === option.id ? colors.text : ""}
                                  />
                                  <Label
                                    htmlFor={`${currentQuestion.id}-${option.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="font-medium">{option.text}</div>
                                    {option.imageUrl && (
                                      <div className="mt-2">
                                        <Image
                                          src={option.imageUrl || "/placeholder.svg"}
                                          alt={`Option ${option.id}`}
                                          width={200}
                                          height={100}
                                          className="rounded-md"
                                        />
                                      </div>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}

                          {currentQuestion.type === "true-false" && (
                            <RadioGroup
                              value={(answers[currentQuestion.id] as string) || ""}
                              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                              className="space-y-3"
                            >
                              {currentQuestion.options?.map((option) => (
                                <div
                                  key={option.id}
                                  className={cn(
                                    "flex items-start space-x-3 rounded-md border p-4 transition-all",
                                    answers[currentQuestion.id] === option.id && `${colors.border} ${colors.bgLight}`,
                                  )}
                                >
                                  <RadioGroupItem
                                    value={option.id}
                                    id={`${currentQuestion.id}-${option.id}`}
                                    className={answers[currentQuestion.id] === option.id ? colors.text : ""}
                                  />
                                  <Label
                                    htmlFor={`${currentQuestion.id}-${option.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    {option.text}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}

                          {currentQuestion.type === "descriptive" && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Write your answer here..."
                                className="min-h-[150px]"
                                value={(answers[currentQuestion.id] as string) || ""}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{((answers[currentQuestion.id] as string) || "").length} characters</span>
                                <span>
                                  {((answers[currentQuestion.id] as string) || "").split(/\s+/).filter(Boolean).length}{" "}
                                  words
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between mt-6 mb-6">
                      <Button
                        variant="outline"
                        className="gap-1"
                        onClick={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <Button
                        className={`gap-1 ${colors.bg} ${colors.hover}`}
                        onClick={goToNextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="instructions" className="mt-0">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">Assessment Instructions</h3>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <ListChecks className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium">Question Types</h4>
                              <p className="text-gray-600">
                                This assessment contains multiple choice, true/false, and descriptive questions. Answer
                                each question to the best of your ability.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium">Time Limit</h4>
                              <p className="text-gray-600">
                                You have {assessmentDetails.timeLimit} minutes to complete this assessment. The timer is
                                displayed at the top of the page.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Flag className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium">Flagging Questions</h4>
                              <p className="text-gray-600">
                                If you're unsure about an answer, you can flag the question for review. Flagged
                                questions are marked with a flag icon in the question navigator.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium">Submitting</h4>
                              <p className="text-gray-600">
                                Click the "Submit Assessment" button when you're ready to finish. You'll see your
                                results immediately after submission.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium">Important Notes</h4>
                              <p className="text-gray-600">
                                Do not refresh the page or navigate away during the assessment. Your progress may be
                                lost if you do so.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results Page */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto p-6 overflow-y-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Assessment Completed!</h2>
                <p className="text-gray-600">You've completed the {getSubjectName(subject)} assessment.</p>
              </div>

              <div className="flex justify-center mb-8">
                <div className="relative h-40 w-40">
                  <div className={`h-40 w-40 rounded-full ${colors.bgLight} flex items-center justify-center`}>
                    <span className={`text-4xl font-bold ${colors.text}`}>{results?.score}%</span>
                  </div>
                  <svg className="absolute top-0 left-0" width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#e6e6e6" strokeWidth="8" />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={colors.bg}
                      strokeWidth="8"
                      strokeDasharray="440"
                      strokeDashoffset={440 - (440 * (results?.score || 0)) / 100}
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <h4 className="text-sm text-gray-600 mb-1">Correct Answers</h4>
                  <p className="text-2xl font-bold text-green-600">{results?.correctAnswers}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <h4 className="text-sm text-gray-600 mb-1">Incorrect Answers</h4>
                  <p className="text-2xl font-bold text-red-600">{results?.incorrectAnswers}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <h4 className="text-sm text-gray-600 mb-1">Unanswered</h4>
                  <p className="text-2xl font-bold text-gray-600">{results?.unanswered}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-medium">Assessment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-gray-600">Subject</h4>
                    <p className="font-medium">{getSubjectName(subject)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-600">Difficulty</h4>
                    <p className="font-medium">{assessmentDetails.difficultyLevel}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-600">Total Questions</h4>
                    <p className="font-medium">{questions.length}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-600">Time Taken</h4>
                    <p className="font-medium">
                      {assessmentDetails.timeLimit - Math.floor(timeRemaining / 60)} minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button variant="outline" className="gap-1" onClick={handleExit}>
                  <ArrowLeft className="h-4 w-4" />
                  Return to Assessments
                </Button>
                <Button
                  className={`gap-1 ${colors.bg} ${colors.hover}`}
                  onClick={() => router.push(`/home/assessment/${subject}/${assessmentId}/review`)}
                >
                  View Detailed Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your assessment? You won't be able to change your answers after
              submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Assessment Summary</h4>
                <p className="text-gray-600">
                  You have answered {Object.keys(answers).length} out of {questions.length} questions.
                  {flaggedQuestions.length > 0 && ` You have flagged ${flaggedQuestions.length} questions for review.`}
                </p>
              </div>
            </div>

            {flaggedQuestions.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-md">
                <h4 className="font-medium flex items-center gap-1">
                  <Flag className="h-4 w-4 text-amber-500" />
                  Flagged Questions
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  You have flagged questions{" "}
                  {flaggedQuestions
                    .map((id) => {
                      const index = questions.findIndex((q) => q.id === id)
                      return index + 1
                    })
                    .join(", ")}{" "}
                  for review.
                </p>
              </div>
            )}

            {questions.length - Object.keys(answers).length > 0 && (
              <div className="bg-red-50 p-3 rounded-md">
                <h4 className="font-medium flex items-center gap-1">
                  <X className="h-4 w-4 text-red-500" />
                  Unanswered Questions
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  You have {questions.length - Object.keys(answers).length} unanswered questions.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Continue Assessment
            </Button>
            <Button className={`${colors.bg} ${colors.hover}`} onClick={handleSubmit}>
              Submit Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
