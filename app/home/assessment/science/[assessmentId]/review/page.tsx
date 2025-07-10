"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Award, CheckCircle, XCircle, Atom, Share2, Download, Loader2, Printer } from "lucide-react"
import { motion } from "framer-motion"
import { useIsMobile as useMobile } from "@/hooks/use-mobile"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Animation variants for fade-in and slide-up effects
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
}
const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
}

export default function ScienceAssessmentReviewPage() {
  const router = useRouter()
  const params = useParams()
  const isMobile = useMobile()
  const assessmentId = Array.isArray(params.assessmentId) ? params.assessmentId[0] : params.assessmentId
  const [loading, setLoading] = useState(true)
  const [reviewData, setReviewData] = useState<{
    assessment_id: string;
    student_id: string;
    submission_time: { $date: string };
    results: Array<{ questionid: string; is_correct: boolean; feedback: string }>;
    correct_count: number;
    total_questions: number;
    score_percentage: number;
  } | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isNavigationOpen, setIsNavigationOpen] = useState(!isMobile)
  // Ref for question content container to reset scroll position
  const questionContentRef = useRef<HTMLDivElement>(null)

  // Load review and original questions
  useEffect(() => {
    // Load questions for text lookup
    const qStored = localStorage.getItem(`assessment_${assessmentId}`)
    if (qStored) {
      const parsed = JSON.parse(qStored)
      const mappedQuestions = parsed.map((q: any) => {
        let options: Array<{ id: string; text: string }> = [];
        
        if (q.question_type === "MCQ") {
          options = [
            { id: "option1", text: q.option1 },
            { id: "option2", text: q.option2 },
            { id: "option3", text: q.option3 },
            { id: "option4", text: q.option4 }
          ]
        } else if (q.question_type === "TRUEFALSE") {
          options = [
            { id: "true", text: "True" },
            { id: "false", text: "False" }
          ]
        }
        // DESCRIPTIVE type won't have options
        
        return {
          id: q._id,
          text: q.question,
          options,
          correctAnswer:
            q.question_type === "DESCRIPTIVE"
              ? q.model_answer
              : q.correctanswer || (q as any).correct_answer,
          explanation: q.explaination,
          questionType: q.question_type,
          subject: q.subject,
          topic: q.topic,
          subtopic: q.subtopic,
          level: q.level,
          questionset: q.questionset,
          marks: q.marks,
          createdAt: q.created_at,
        }
      })
      setQuestions(mappedQuestions)
    }
    // Load review result
    const rStored = localStorage.getItem(`review_${assessmentId}`)
    if (rStored) {
      setReviewData(JSON.parse(rStored))
    }
    // Load student answers
    const aStored = localStorage.getItem(`answers_${assessmentId}`)
    if (aStored) {
      setAnswersMap(JSON.parse(aStored))
    }
    setLoading(false)
  }, [assessmentId])

  // Scroll resets when changing questions (for future navigation)
  useEffect(() => {
    if (questionContentRef.current) {
      questionContentRef.current.scrollTop = 0
    }
  }, [currentQuestionIndex])

  // Get color based on score
  const getScoreColor = (pct: number) => {
    if (pct >= 90) return "text-green-600"
    if (pct >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading || !reviewData) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div variants={slideUp} className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/home/assessment/science")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4 text-green-600" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-green-600">Assessment Review</h1>
            </div>
            <p className="text-gray-600 mt-1">
              Assessment {reviewData.assessment_id} • Completed on {new Date(reviewData.submission_time.$date).toLocaleString()}
            </p>
            <p className="text-gray-600">Student ID: {reviewData.student_id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </motion.div>
      {/* Score Overview */}
      <Card className="mb-8 border-green-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Result</h2>
              <p className="opacity-90">You performed well on this assessment!</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="bg-white rounded-full p-4 h-24 w-24 flex items-center justify-center">
                <div className="text-center">
                  <span className={`text-2xl font-bold ${getScoreColor(reviewData.score_percentage)}`}>{reviewData.score_percentage}%</span>
                </div>
              </div>
              <div className="ml-4 text-center md:text-left">
                <div className="text-3xl font-bold">{reviewData.correct_count}/{reviewData.total_questions}</div>
                <div className="text-sm opacity-90">Grade</div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {reviewData.correct_count}/{reviewData.total_questions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {reviewData.total_questions - reviewData.correct_count}/{reviewData.total_questions}
              </div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {reviewData.score_percentage}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">Overall Feedback</h3>
            <p className="text-gray-700 p-4 bg-green-50 rounded-lg border border-green-100">{reviewData.results.map(r=>r.feedback).join(' ')}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/home/assessment/science")}>
              <Award className="mr-2 h-4 w-4" /> View Other Assessments
            </Button>
            <Button variant="outline" className="border-green-200 text-green-600">
              <Share2 className="mr-2 h-4 w-4" /> Share Results
            </Button>
            <Button variant="outline" className="border-green-200 text-green-600">
              <Download className="mr-2 h-4 w-4" /> Download Certificate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Separator className="my-6" />
      <h2 className="text-xl font-bold mb-4">Detailed Review</h2>
      <div className="space-y-6 mb-8">
        {reviewData.results.map((res) => {
          const q = questions.find((qItem) => qItem.id === res.questionid)
          const isCorrect = res.is_correct
          const studentAnswer = answersMap[res.questionid]
          return (
            <Card key={res.questionid} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{q?.text || "Question"}</CardTitle>
                  <Badge className={`${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {q?.questionType === "DESCRIPTIVE" ? (
                  <>
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Your answer:</h4>
                      <div className="p-3 bg-gray-50 rounded-lg mt-1 min-h-[50px]">
                        {studentAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                      </div>
                    </div>
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Model answer:</h4>
                      <div className="p-3 bg-green-50 rounded-lg mt-1 min-h-[50px]">
                        {q?.correctAnswer || <span className="text-gray-400 italic">No model answer available</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Your answer: {q?.questionType === "MCQ" 
                        ? `${Number(studentAnswer.replace("option", ""))}. ${q?.options.find((o: { id: string; text: string }) => o.id === studentAnswer)?.text || studentAnswer}`
                        : q?.options.find((o: { id: string; text: string }) => o.id === studentAnswer)?.text || studentAnswer}
                    </p>
                    <p className="text-sm text-gray-600">
                      Correct answer: {q?.questionType === "MCQ"
                        ? `${Number(q.correctAnswer.replace("option", ""))}. ${q?.options.find((o: { id: string; text: string }) => o.id === q.correctAnswer)?.text || q.correctAnswer}`
                        : q?.options.find((o: { id: string; text: string }) => o.id === q.correctAnswer)?.text || q.correctAnswer}
                    </p>
                  </>
                )}
                <p className="mt-2 text-gray-700">{res.feedback}</p>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  {q?.explanation && (
                    <p className="text-sm text-gray-700 italic mb-2">{q.explanation}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {q?.topic && (
                      <Badge className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {q.topic}
                      </Badge>
                    )}
                    {q?.subtopic && (
                      <Badge className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {q.subtopic}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recommendations */}
      <Card className="mb-8 border-green-200">
        <CardHeader>
          <CardTitle>Recommended Practice</CardTitle>
          <CardDescription>Use these resources to improve your science skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-green-100 rounded-lg bg-green-50">
              <h3 className="font-medium text-green-800 mb-2">Physics Fundamentals</h3>
              <p className="text-gray-700 mb-3">Strengthen your understanding of basic physics principles and laws.</p>
              <Button variant="outline" className="text-green-600 border-green-200">
                Start Practice
              </Button>
            </div>
            <div className="p-4 border border-green-100 rounded-lg bg-green-50">
              <h3 className="font-medium text-green-800 mb-2">Chemistry Concepts</h3>
              <p className="text-gray-700 mb-3">Review chemical reactions, elements, and compounds.</p>
              <Button variant="outline" className="text-green-600 border-green-200">
                Start Practice
              </Button>
            </div>
            <div className="p-4 border border-green-100 rounded-lg bg-green-50">
              <h3 className="font-medium text-green-800 mb-2">Scientific Method</h3>
              <p className="text-gray-700 mb-3">Learn how to apply the scientific method to solve problems.</p>
              <Button variant="outline" className="text-green-600 border-green-200">
                Start Practice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
        <h3 className="text-xl font-bold text-green-700 mb-2">Next Steps</h3>
        <p className="text-green-600 mb-4">
          Continue practicing regularly and take more assessments to improve your science skills.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/home/assessment/science")}>
            View Other Assessments
          </Button>
          <Button
            variant="outline"
            className="border-green-200 text-green-600"
            onClick={() => router.push("/home/learning/science")}
          >
            Continue Learning Science
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
