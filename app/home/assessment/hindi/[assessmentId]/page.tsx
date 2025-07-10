"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Flag, Languages, HelpCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Mock assessment data for Hindi
const mockAssessment = {
  id: "hindi-assessment-1",
  title: "हिंदी व्याकरण और साहित्य मूल्यांकन",
  description: "इस मूल्यांकन में व्याकरण, शब्दावली और साहित्य समझ के प्रश्न शामिल हैं।",
  timeLimit: 20, // in minutes
  questions: [
    {
      id: 1,
      text: "निम्नलिखित में से कौन सा शब्द स्त्रीलिंग है?",
      options: [
        { id: "a", text: "पुस्तक" },
        { id: "b", text: "घर" },
        { id: "c", text: "आकाश" },
        { id: "d", text: "समय" },
      ],
      correctAnswer: "a",
      explanation: "पुस्तक एक स्त्रीलिंग शब्द है। हिंदी में कुछ शब्दों का लिंग उनके अर्थ से नहीं, बल्कि परंपरा से निर्धारित होता है।",
    },
    {
      id: 2,
      text: "निम्नलिखित में से कौन सा वाक्य शुद्ध है?",
      options: [
        { id: "a", text: "मैं स्कूल जा रहा हूँ।" },
        { id: "b", text: "मैं स्कूल जाता है।" },
        { id: "c", text: "मैं स्कूल जाता हूँ।" },
        { id: "d", text: "मैं स्कूल जाती हूँ।" },
      ],
      correctAnswer: "c",
      explanation: "पुल्लिंग एकवचन के लिए 'जाता हूँ' सही क्रिया रूप है।",
    },
    {
      id: 3,
      text: "निम्नलिखित में से कौन सा शब्द तत्सम है?",
      options: [
        { id: "a", text: "आँख" },
        { id: "b", text: "कान" },
        { id: "c", text: "नयन" },
        { id: "d", text: "हाथ" },
      ],
      correctAnswer: "c",
      explanation: "नयन संस्कृत से सीधे लिया गया शब्द है, इसलिए यह तत्सम है।",
    },
    {
      id: 4,
      text: "निम्नलिखित पंक्तियों का भाव क्या है? 'जहाँ डाल-डाल पर सोने की चिड़िया करती है बसेरा, वो भारत देश है मेरा'",
      options: [
        { id: "a", text: "भारत में सोने की चिड़िया रहती है" },
        { id: "b", text: "भारत एक समृद्ध देश है" },
        { id: "c", text: "भारत में पेड़ों पर चिड़िया रहती है" },
        { id: "d", text: "भारत में सोना बहुत है" },
      ],
      correctAnswer: "b",
      explanation: "यह पंक्ति भारत की समृद्धि और संपन्नता का प्रतीकात्मक वर्णन करती है।",
    },
    {
      id: 5,
      text: "निम्नलिखित में से कौन सा शब्द विलोम नहीं है?",
      options: [
        { id: "a", text: "अंधकार - प्रकाश" },
        { id: "b", text: "आदर - निरादर" },
        { id: "c", text: "आकाश - धरती" },
        { id: "d", text: "आम - नीम" },
      ],
      correctAnswer: "d",
      explanation: "आम और नीम विलोम शब्द नहीं हैं, ये दोनों फलों/पेड़ों के नाम हैं।",
    },
    {
      id: 6,
      text: "निम्नलिखित में से कौन सा वाक्य भूतकाल में है?",
      options: [
        { id: "a", text: "वह खाना खाएगा।" },
        { id: "b", text: "वह खाना खा रहा है।" },
        { id: "c", text: "वह खाना खाता है।" },
        { id: "d", text: "उसने खाना खाया था।" },
      ],
      correctAnswer: "d",
      explanation: "उसने खाना खाया था' पूर्ण भूतकाल में है।",
    },
    {
      id: 7,
      text: "कबीरदास किस काल के कवि थे?",
      options: [
        { id: "a", text: "आदिकाल" },
        { id: "b", text: "भक्तिकाल" },
        { id: "c", text: "रीतिकाल" },
        { id: "d", text: "आधुनिक काल" },
      ],
      correctAnswer: "b",
      explanation: "कबीरदास भक्तिकाल के प्रमुख कवि थे और निर्गुण भक्ति धारा के प्रवर्तक माने जाते हैं।",
    },
    {
      id: 8,
      text: "निम्नलिखित में से कौन सा शब्द पर्यायवाची नहीं है?",
      options: [
        { id: "a", text: "चंद्रमा - शशि" },
        { id: "b", text: "पानी - जल" },
        { id: "c", text: "आकाश - अंबर" },
        { id: "d", text: "दिन - रात" },
      ],
      correctAnswer: "d",
      explanation: "दिन और रात पर्यायवाची नहीं, विलोम शब्द हैं।",
    },
    {
      id: 9,
      text: "निम्नलिखित में से कौन सा शब्द संधि का उदाहरण है?",
      options: [
        { id: "a", text: "राजकुमार" },
        { id: "b", text: "देवालय" },
        { id: "c", text: "विद्यालय" },
        { id: "d", text: "महात्मा" },
      ],
      correctAnswer: "d",
      explanation: "महात्मा = महा + आत्मा, यह दीर्घ संधि का उदाहरण है।",
    },
    {
      id: 10,
      text: "प्रेमचंद की प्रसिद्ध कहानी कौन सी है?",
      options: [
        { id: "a", text: "मृगतृष्णा" },
        { id: "b", text: "पंचतंत्र" },
        { id: "c", text: "पंचपरमेश्वर" },
        { id: "d", text: "हीरा-मोती" },
      ],
      correctAnswer: "c",
      explanation: "पंचपरमेश्वर प्रेमचंद की प्रसिद्ध कहानियों में से एक है।",
    },
  ],
}

export default function HindiAssessmentPage({ params }: { params: { assessmentId: string } }) {
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
      router.push(`/home/assessment/hindi/${params.assessmentId}/review?score=${score}`)
    }, 1500)
  }

  const question = mockAssessment.questions[currentQuestion]

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-orange-600">
            <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएँ
          </Button>
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-orange-600" />
            <span className="font-medium text-lg text-orange-600">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Languages className="mr-2 h-6 w-6 text-orange-600" />
          {mockAssessment.title}
        </h1>
        <p className="text-gray-600 mt-1">{mockAssessment.description}</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">प्रगति</span>
          <span className="text-sm font-medium">
            {Object.keys(selectedAnswers).length}/{mockAssessment.questions.length} प्रश्न
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6 border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 mb-2">
                प्रश्न {currentQuestion + 1}/{mockAssessment.questions.length}
              </Badge>
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              <HelpCircle className="h-4 w-4 mr-1" /> सहायता
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
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                  }`}
                  onClick={() => handleSelectAnswer(question.id, option.id)}
                >
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} className="text-orange-600" />
                  <Label htmlFor={`option-${option.id}`} className="flex-grow ml-3 font-medium cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {showExplanation && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-1">व्याख्या:</h4>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-3">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            className="text-orange-600 border-orange-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> पिछला
          </Button>
          {currentQuestion < mockAssessment.questions.length - 1 ? (
            <Button onClick={handleNextQuestion} className="bg-orange-600 hover:bg-orange-700">
              अगला <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? "जमा कर रहे हैं..." : "मूल्यांकन जमा करें"}
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
                ? "border-orange-500 bg-orange-100 text-orange-800"
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
          className="bg-orange-600 hover:bg-orange-700 w-full max-w-md"
        >
          {isSubmitting ? (
            "जमा कर रहे हैं..."
          ) : (
            <>
              <Flag className="mr-2 h-4 w-4" /> मूल्यांकन जमा करें
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
