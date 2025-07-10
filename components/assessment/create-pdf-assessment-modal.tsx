"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CheckCircle } from "lucide-react"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

interface CreatePdfAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  subject: string
  subjectColor: string
  pdfId: string
  pdfName?: string
}

// Define available question types per subject
const getQuestionTypesForSubject = (subject: string) => {
  const baseTypes = [
    { id: "mcq", label: "Multiple Choice Questions", apiValue: "MCQ" },
    { id: "true-false", label: "True/False Questions", apiValue: "TRUEFALSE" },
  ]

  if (subject === "english" || subject === "science") {
    return [
      ...baseTypes,
      { id: "short-answer", label: "Short Answer Questions", apiValue: "SHORT_ANSWER" },
      { id: "very-short-answer", label: "Very Short Answer Questions", apiValue: "VERY_SHORT_ANSWER" },
      { id: "long-answer", label: "Long Answer Questions", apiValue: "LONG_ANSWER" },
      { id: "case-study", label: "Case Study Questions", apiValue: "CASE_STUDY" },
    ]
  }

  // For other subjects (hindi, mathematics, social-science)
  return [
    ...baseTypes,
    { id: "descriptive", label: "Descriptive Questions", apiValue: "DESCRIPTIVE" },
    { id: "fill-blanks", label: "Fill in the Blanks", apiValue: "FILL_BLANKS" },
  ]
}

export function CreatePdfAssessmentModal({
  isOpen,
  onClose,
  subject,
  subjectColor,
  pdfId,
  pdfName = "Document",
}: CreatePdfAssessmentModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [questionTypes, setQuestionTypes] = useState<string[]>(["MCQ"])
  const [numberOfQuestions, setNumberOfQuestions] = useState<string>("10")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get available question types for current subject
  const availableQuestionTypes = getQuestionTypesForSubject(subject)

  // Create mapping from UI IDs to API values
  const questionTypesMap: Record<string, string> = {}
  availableQuestionTypes.forEach(type => {
    questionTypesMap[type.id] = type.apiValue
  })

  const handleQuestionTypeChange = (type: string) => {
    if (questionTypes.includes(questionTypesMap[type])) {
      setQuestionTypes(questionTypes.filter((t) => t !== questionTypesMap[type]))
    } else {
      setQuestionTypes([...questionTypes, questionTypesMap[type]])
    }
  }

  const handleNumberOfQuestionsChange = (value: string) => {
    setNumberOfQuestions(value)
  }

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleCreateAssessment()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }

  const handleCreateAssessment = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const token = localStorage.getItem("auth-token")
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch(buildApiUrlNoPort(API_ENDPOINTS.GENERATE_PDF_ASSESSMENT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": token
        },
        body: JSON.stringify({
          pdf_id: pdfId,
          question_types: questionTypes,
          num_questions: parseInt(numberOfQuestions, 10)
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Store the assessment data in localStorage
        localStorage.setItem("current-assessment", JSON.stringify(result))
        
        // Get the assessment ID from the response
        const assessmentId = result.assessment_id
        const pdfId = result.assessment.pdf_id
        console.log(`pdfId: ${pdfId}`)
        // Also store the questions array with the specific key format the assessment page expects
        if (result.assessment && result.assessment.questions) {
          localStorage.setItem(
            `assessment_${pdfId}`, 
            JSON.stringify(result.assessment.questions)
          )
        }
        
        onClose()
        // Redirect to the PDF-specific assessment page
        router.push(`/home/assessment/${subject}/pdf/${pdfId}`)
      } else {
        throw new Error(result.Message || "Failed to create assessment")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error creating assessment"
      setError(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className={`bg-${subjectColor}-100 p-1.5 rounded-full`}>
              <FileText className={`h-5 w-5 text-${subjectColor}-600`} />
            </div>
            Create PDF Assessment
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-1">PDF Document</h3>
            <p className="text-sm text-gray-600 truncate">{pdfName}</p>
          </div>

          <Tabs value={`step-${step}`} className="mt-6">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="step-1" disabled>
                <span
                  className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${step >= 1 ? `bg-${subjectColor}-600 text-white` : "border border-gray-200"}`}
                >
                  {step > 1 ? <CheckCircle className="h-3.5 w-3.5" /> : "1"}
                </span>
                Question Types
              </TabsTrigger>
              <TabsTrigger value="step-2" disabled>
                <span
                  className={`mr-2 flex h-6 w-6 items-center justify-center rounded-full ${step >= 2 ? `bg-${subjectColor}-600 text-white` : "border border-gray-200"}`}
                >
                  {step > 2 ? <CheckCircle className="h-3.5 w-3.5" /> : "2"}
                </span>
                Number of Questions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="step-1" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Select Question Types</h3>
                <p className="text-sm text-gray-600 mb-4">Choose the types of questions to include in the assessment</p>

                <div className="space-y-3">
                  {availableQuestionTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type.id}
                        checked={questionTypes.includes(questionTypesMap[type.id])}
                        onChange={() => handleQuestionTypeChange(type.id)}
                        className={`h-4 w-4 text-${subjectColor}-600 focus:ring-${subjectColor}-500 border-gray-300 rounded`}
                      />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step-2" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Number of Questions</h3>
                <p className="text-sm text-gray-600 mb-4">Select how many questions to include in the assessment</p>

                <RadioGroup
                  value={numberOfQuestions}
                  onValueChange={handleNumberOfQuestionsChange}
                  className="grid grid-cols-2 gap-3"
                >
                  {[5, 10, 15, 20].map((num) => (
                    <div key={num} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={num.toString()}
                        id={`questions-${num}`}
                        className={`text-${subjectColor}-600`}
                      />
                      <Label htmlFor={`questions-${num}`}>{num} Questions</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            className={`bg-${subjectColor}-600 hover:bg-${subjectColor}-700`}
            disabled={questionTypes.length === 0 || isCreating}
          >
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : step < 2 ? (
              "Next"
            ) : (
              "Create Assessment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
