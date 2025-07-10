"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Award, CheckCircle, XCircle, Languages, Share2, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

// Mock user answers (in a real app, this would come from a database or state)
const mockUserAnswers = {
  1: "a", // correct
  2: "c", // correct
  3: "c", // correct
  4: "b", // correct
  5: "a", // incorrect, correct is d
  6: "d", // correct
  7: "b", // correct
  8: "d", // correct
  9: "c", // incorrect, correct is d
  10: "c", // correct
}

export default function HindiAssessmentReviewPage({ params }: { params: { assessmentId: string } }) {
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
      setFeedback("उत्कृष्ट! आपने हिंदी व्याकरण और साहित्य की गहरी समझ दिखाई है।")
    } else if (calculatedPercentage >= 80) {
      setGrade("B")
      setFeedback("बहुत अच्छा! आपकी हिंदी भाषा की समझ अच्छी है, लेकिन कुछ क्षेत्रों में सुधार की गुंजाइश है।")
    } else if (calculatedPercentage >= 70) {
      setGrade("C")
      setFeedback("अच्छा प्रयास! आपके पास हिंदी के बुनियादी ज्ञान है, लेकिन अभ्यास की आवश्यकता है।")
    } else if (calculatedPercentage >= 60) {
      setGrade("D")
      setFeedback("संतोषजनक। आपको हिंदी व्याकरण और साहित्य के मूल सिद्धांतों पर अधिक ध्यान देने की आवश्यकता है।")
    } else {
      setGrade("F")
      setFeedback("आपको हिंदी के बुनियादी नियमों और अवधारणाओं पर अधिक अभ्यास करने की आवश्यकता है।")
    }
  }, [searchParams])

  // Get color based on score percentage
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-orange-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push("/home/assessment/hindi")} className="text-orange-600 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> वापस जाएँ
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Languages className="mr-2 h-6 w-6 text-orange-600" />
          {mockAssessment.title} - परिणाम
        </h1>
        <p className="text-gray-600 mt-1">आपके मूल्यांकन के परिणाम और विस्तृत प्रतिक्रिया</p>
      </div>

      {/* Score Overview */}
      <Card className="mb-8 border-orange-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">आपका परिणाम</h2>
              <p className="opacity-90">आपने इस मूल्यांकन में अच्छा प्रदर्शन किया!</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="bg-white rounded-full p-4 h-24 w-24 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                </div>
              </div>
              <div className="ml-4 text-center md:text-left">
                <div className="text-3xl font-bold">{grade}</div>
                <div className="text-sm opacity-90">ग्रेड</div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {score}/{mockAssessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">सही उत्तर</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {mockAssessment.questions.length - score}/{mockAssessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">गलत उत्तर</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {Math.round((score / mockAssessment.questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">सटीकता</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">प्रतिक्रिया</h3>
            <p className="text-gray-700 p-4 bg-orange-50 rounded-lg border border-orange-100">{feedback}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => router.push("/home/assessment/hindi")}>
              <Award className="mr-2 h-4 w-4" /> अन्य मूल्यांकन देखें
            </Button>
            <Button variant="outline" className="border-orange-200 text-orange-600">
              <Share2 className="mr-2 h-4 w-4" /> परिणाम साझा करें
            </Button>
            <Button variant="outline" className="border-orange-200 text-orange-600">
              <Download className="mr-2 h-4 w-4" /> प्रमाणपत्र डाउनलोड करें
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <h2 className="text-xl font-bold mb-4">विस्तृत समीक्षा</h2>
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
                    <Badge className="bg-green-100 text-green-800">सही</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">गलत</Badge>
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

                <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-1">व्याख्या:</h4>
                  <p className="text-gray-700">{question.explanation}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recommendations */}
      <Card className="mb-8 border-orange-200">
        <CardHeader>
          <CardTitle>अनुशंसित अभ्यास</CardTitle>
          <CardDescription>अपने हिंदी कौशल में सुधार के लिए इन संसाधनों का उपयोग करें</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
              <h3 className="font-medium text-orange-800 mb-2">व्याकरण अभ्यास</h3>
              <p className="text-gray-700 mb-3">हिंदी व्याकरण के नियमों और अवधारणाओं का अभ्यास करें।</p>
              <Button variant="outline" className="text-orange-600 border-orange-200">
                अभ्यास शुरू करें
              </Button>
            </div>
            <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
              <h3 className="font-medium text-orange-800 mb-2">शब्दावली विस्तार</h3>
              <p className="text-gray-700 mb-3">अपनी हिंदी शब्दावली का विस्तार करें और नए शब्द सीखें।</p>
              <Button variant="outline" className="text-orange-600 border-orange-200">
                अभ्यास शुरू करें
              </Button>
            </div>
            <div className="p-4 border border-orange-100 rounded-lg bg-orange-50">
              <h3 className="font-medium text-orange-800 mb-2">साहित्य समझ</h3>
              <p className="text-gray-700 mb-3">हिंदी साहित्य के विभिन्न रूपों और शैलियों को समझें।</p>
              <Button variant="outline" className="text-orange-600 border-orange-200">
                अभ्यास शुरू करें
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
        <h3 className="text-xl font-bold text-orange-700 mb-2">अगले कदम</h3>
        <p className="text-orange-600 mb-4">अपने हिंदी कौशल में सुधार के लिए नियमित रूप से अभ्यास करें और अधिक मूल्यांकन लें।</p>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => router.push("/home/assessment/hindi")}>
            अन्य मूल्यांकन देखें
          </Button>
          <Button
            variant="outline"
            className="border-orange-200 text-orange-600"
            onClick={() => router.push("/home/learning/hindi")}
          >
            हिंदी सीखना जारी रखें
          </Button>
        </div>
      </div>
    </div>
  )
}
