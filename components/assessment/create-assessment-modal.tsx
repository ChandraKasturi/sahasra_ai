"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  FileQuestion,
  GraduationCap,
  Hash,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

// Types
export type Subject = "english" | "hindi" | "mathematics" | "science" | "social-science"

export interface Topic {
  id: string
  name: string
}

export interface QuestionType {
  id: string
  name: string
  description: string
}

export type DifficultyLevel = "Easy" | "Medium" | "Hard"

export interface AssessmentConfig {
  topics: Topic[]
  questionTypes: QuestionType[]
  difficultyLevel: DifficultyLevel | null
  numberOfQuestions: number
}

interface CreateAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  subject: Subject
  subjectColor: string
  availableTopics: Topic[]
}

// Question types available for different subjects
const getQuestionTypesForSubject = (subject: Subject): QuestionType[] => {
  const baseTypes = [
    {
      id: "mcq",
      name: "Multiple Choice",
      description: "Questions with multiple options where one or more options are correct",
    },
    {
      id: "true-false",
      name: "True / False",
      description: "Statements that must be marked as either true or false",
    },
  ]

  if (subject === "english" || subject === "science") {
    return [
      ...baseTypes,
      {
        id: "short-answer",
        name: "Short Answer",
        description: "Brief written responses requiring 2-3 sentences",
      },
      {
        id: "very-short-answer",
        name: "Very Short Answer",
        description: "One-word or one-sentence responses to direct questions",
      },
      {
        id: "long-answer",
        name: "Long Answer",
        description: "Detailed written responses requiring paragraphs or explanations",
      },
      {
        id: "case-study",
        name: "Case Study",
        description: "Analysis of scenarios or real-world situations with detailed explanations",
      },
    ]
  }

  // For other subjects (hindi, mathematics, social-science)
  return [
    ...baseTypes,
    {
      id: "descriptive",
      name: "Fill Blanks / Descriptive",
      description: "Questions requiring written answers or filling in blanks",
    },
  ]
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export function CreateAssessmentModal({
  isOpen,
  onClose,
  subject,
  subjectColor,
  availableTopics,
}: CreateAssessmentModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(25)
  const [config, setConfig] = useState<AssessmentConfig>({
    topics: [],
    questionTypes: [],
    difficultyLevel: null,
    numberOfQuestions: 10,
  })
  const [topicsOpen, setTopicsOpen] = useState(false)
  const [questionTypesOpen, setQuestionTypesOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get question types for current subject
  const questionTypes = getQuestionTypesForSubject(subject)

  // Update progress based on current step (showing completed steps)
  useEffect(() => {
    setProgress((step - 1) * 25)
  }, [step])

  // Handle topic selection
  const handleTopicClick = (topic: Topic) => {
    const isSelected = config.topics.some((t) => t.id === topic.id)

    if (isSelected) {
      setConfig({
        ...config,
        topics: config.topics.filter((t) => t.id !== topic.id),
      })
    } else {
      setConfig({
        ...config,
        topics: [...config.topics, topic],
      })
    }
  }

  // Handle question type selection
  const handleQuestionTypeClick = (questionType: QuestionType) => {
    const isSelected = config.questionTypes.some((qt) => qt.id === questionType.id)

    if (isSelected) {
      setConfig({
        ...config,
        questionTypes: config.questionTypes.filter((qt) => qt.id !== questionType.id),
      })
    } else {
      setConfig({
        ...config,
        questionTypes: [...config.questionTypes, questionType],
      })
    }
  }

  // Handle difficulty selection
  const handleDifficultyChange = (value: string) => {
    setConfig({
      ...config,
      difficultyLevel: value as DifficultyLevel,
    })
  }

  // Handle number of questions change
  const handleNumberOfQuestionsChange = (value: number[]) => {
    setConfig({
      ...config,
      numberOfQuestions: value[0],
    })
  }

  // Check if current step is valid to proceed
  const isStepValid = () => {
    switch (step) {
      case 1:
        return config.topics.length > 0
      case 2:
        return config.questionTypes.length > 0
      case 3:
        return config.difficultyLevel !== null
      case 4:
        return config.numberOfQuestions >= 5
      default:
        return true
    }
  }

  // Handle next step
  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  // Handle submit: generate real assessment via API
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Map difficulty level to numeric values
      const levelMap: Record<string, number> = { Easy: 3, Medium: 4, Hard: 5 }
      const numericLevel = config.difficultyLevel ? levelMap[config.difficultyLevel] : undefined
      
      // Map question type IDs to API format
      const mapQuestionTypeToAPI = (questionTypeId: string): string => {
        switch (questionTypeId) {
          case "mcq":
            return "MCQ"
          case "true-false":
            return "TRUEFALSE"
          case "short-answer":
            return "SHORT_ANSWER"
          case "very-short-answer":
            return "VERY_SHORT_ANSWER"
          case "long-answer":
            return "LONG_ANSWER"
          case "case-study":
            return "CASE_STUDY"
          case "descriptive":
            return "DESCRIPTIVE"
          default:
            return questionTypeId.replace(/-/g, "").toUpperCase()
        }
      }

      const payload = {
        subject,
        topics: config.topics.map((t) => t.id),
        level: numericLevel,
        question_types: config.questionTypes.map((qt) => mapQuestionTypeToAPI(qt.id)),
        number_of_questions: config.numberOfQuestions,
      }
      // Get auth token
      const authToken = getAuthToken()
      // Call API to generate assessment
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ASSESSMENT_API), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken || "",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`Failed to generate assessment: ${response.status}`)
      }
      const data = await response.json()
      const assessmentId = data.assessment_id
      const questions = data.questions || []
      // Store questions in localStorage
      localStorage.setItem(`assessment_${assessmentId}`, JSON.stringify(questions))
      // Navigate to the assessment page
      router.push(`/home/assessment/${subject}/${assessmentId}`)
      // Close modal and reset form
      onClose()
      setStep(1)
      setConfig({ topics: [], questionTypes: [], difficultyLevel: null, numberOfQuestions: 10 })
    } catch (error) {
      console.error("Error generating assessment:", error)
      toast({
        title: "Error",
        description: "Could not generate assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get color classes based on subject color
  const getColorClasses = () => {
    switch (subjectColor) {
      case "blue":
        return {
          bg: "bg-blue-500",
          text: "text-blue-500",
          border: "border-blue-500",
          hover: "hover:bg-blue-600",
          light: "bg-blue-100",
          lightHover: "hover:bg-blue-50",
          progress: "bg-blue-500",
        }
      case "orange":
        return {
          bg: "bg-orange-500",
          text: "text-orange-500",
          border: "border-orange-500",
          hover: "hover:bg-orange-600",
          light: "bg-orange-100",
          lightHover: "hover:bg-orange-50",
          progress: "bg-orange-500",
        }
      case "red":
        return {
          bg: "bg-red-500",
          text: "text-red-500",
          border: "border-red-500",
          hover: "hover:bg-red-600",
          light: "bg-red-100",
          lightHover: "hover:bg-red-50",
          progress: "bg-red-500",
        }
      case "green":
        return {
          bg: "bg-green-500",
          text: "text-green-500",
          border: "border-green-500",
          hover: "hover:bg-green-600",
          light: "bg-green-100",
          lightHover: "hover:bg-green-50",
          progress: "bg-green-500",
        }
      case "purple":
        return {
          bg: "bg-purple-500",
          text: "text-purple-500",
          border: "border-purple-500",
          hover: "hover:bg-purple-600",
          light: "bg-purple-100",
          lightHover: "hover:bg-purple-50",
          progress: "bg-purple-500",
        }
      default:
        return {
          bg: "bg-blue-500",
          text: "text-blue-500",
          border: "border-blue-500",
          hover: "hover:bg-blue-600",
          light: "bg-blue-100",
          lightHover: "hover:bg-blue-50",
          progress: "bg-blue-500",
        }
    }
  }

  const colors = getColorClasses()

  // Get step icon
  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <ListChecks className="h-5 w-5" />
      case 2:
        return <FileQuestion className="h-5 w-5" />
      case 3:
        return <GraduationCap className="h-5 w-5" />
      case 4:
        return <Hash className="h-5 w-5" />
      case 5:
        return <Sparkles className="h-5 w-5" />
      default:
        return <CheckCircle2 className="h-5 w-5" />
    }
  }

  // Render topic selection step
  const renderTopicSelection = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Topics</label>
          <div className="grid grid-cols-1 gap-2">
            {availableTopics.map((topic) => {
              const isSelected = config.topics.some((t) => t.id === topic.id)
              return (
                <div
                  key={topic.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? `${colors.border} ${colors.light}` : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="flex items-center justify-between">
                    <span>{topic.name}</span>
                    <div
                      className={`h-5 w-5 rounded-sm border flex items-center justify-center ${
                        isSelected ? colors.border : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className={`h-3 w-3 ${colors.text}`} />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {config.topics.length > 0 && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2">Selected topics:</p>
            <div className="flex flex-wrap gap-2">
              {config.topics.map((topic) => (
                <Badge
                  key={topic.id}
                  className={`${colors.light} ${colors.text} border-0`}
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic.name}
                  <X className="ml-1 h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <div className={`p-4 rounded-lg ${colors.light} flex items-start gap-3`}>
            <AlertCircle className={`${colors.text} h-5 w-5 mt-0.5`} />
            <div>
              <h4 className="font-medium">Topic Selection Tips</h4>
              <p className="text-sm text-gray-600">
                Select multiple topics to create a comprehensive assessment. Focusing on specific topics helps you
                target areas you want to improve.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render question type selection step
  const renderQuestionTypeSelection = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {questionTypes.map((type) => (
            <div
              key={type.id}
              className={`p-4 rounded-lg border ${
                config.questionTypes.some((t) => t.id === type.id)
                  ? `${colors.border} ${colors.light} border-opacity-50`
                  : "border-gray-200"
              } cursor-pointer hover:border-opacity-100 transition-all`}
              onClick={() => handleQuestionTypeClick(type)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{type.name}</h4>
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-sm border",
                    config.questionTypes.some((t) => t.id === type.id) ? colors.border : "border-gray-300",
                  )}
                >
                  {config.questionTypes.some((t) => t.id === type.id) && (
                    <Check className={cn("h-4 w-4", colors.text)} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          ))}
        </div>

        {config.questionTypes.length > 0 && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-2">Selected question types:</p>
            <div className="flex flex-wrap gap-2">
              {config.questionTypes.map((type) => (
                <Badge
                  key={type.id}
                  className={`${colors.light} ${colors.text} border-0`}
                  onClick={() => handleQuestionTypeClick(type)}
                >
                  {type.name}
                  <X className="ml-1 h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render difficulty selection step
  const renderDifficultySelection = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${
              config.difficultyLevel === "Easy" ? "border-green-500 bg-green-50" : "border-gray-200"
            } cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all`}
            onClick={() => handleDifficultyChange("Easy")}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-700">Easy</h4>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-sm border",
                  config.difficultyLevel === "Easy" ? "border-green-500" : "border-gray-300",
                )}
              >
                {config.difficultyLevel === "Easy" && <Check className="h-4 w-4 text-green-500" />}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Basic concepts and straightforward questions suitable for beginners.
            </p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              config.difficultyLevel === "Medium" ? "border-amber-500 bg-amber-50" : "border-gray-200"
            } cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all`}
            onClick={() => handleDifficultyChange("Medium")}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-amber-700">Medium</h4>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-sm border",
                  config.difficultyLevel === "Medium" ? "border-amber-500" : "border-gray-300",
                )}
              >
                {config.difficultyLevel === "Medium" && <Check className="h-4 w-4 text-amber-500" />}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">Moderate difficulty requiring good understanding of concepts.</p>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              config.difficultyLevel === "Hard" ? "border-red-500 bg-red-50" : "border-gray-200"
            } cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all`}
            onClick={() => handleDifficultyChange("Hard")}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-red-700">Hard</h4>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-sm border",
                  config.difficultyLevel === "Hard" ? "border-red-500" : "border-gray-300",
                )}
              >
                {config.difficultyLevel === "Hard" && <Check className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Challenging questions that test deep understanding and application.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render number of questions step
  const renderNumberOfQuestions = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Number of Questions</label>
              <span className={`text-sm font-medium ${colors.text}`}>{config.numberOfQuestions}</span>
            </div>
            <Slider
              defaultValue={[config.numberOfQuestions]}
              min={5}
              max={30}
              step={1}
              onValueChange={handleNumberOfQuestionsChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${colors.light} flex items-start gap-3 mt-4`}>
            <AlertCircle className={`${colors.text} h-5 w-5 mt-0.5`} />
            <div>
              <h4 className="font-medium">Choosing the Right Number</h4>
              <p className="text-sm text-gray-600">
                More questions provide a comprehensive assessment but take longer to complete. Choose based on your
                available time and assessment goals.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="font-medium mb-2">Estimated Time</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-gray-500">Easy</p>
                <p className="font-medium">{Math.round(config.numberOfQuestions * 0.5)} min</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-gray-500">Medium</p>
                <p className="font-medium">{Math.round(config.numberOfQuestions * 1)} min</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-gray-500">Hard</p>
                <p className="font-medium">{Math.round(config.numberOfQuestions * 1.5)} min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render review step
  const renderReview = () => {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg border ${colors.border} bg-opacity-10 ${colors.light}`}>
          <h3 className="font-medium mb-4">Assessment Summary</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-gray-500">Selected Topics</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {config.topics.map((topic) => (
                  <Badge key={topic.id} variant="outline" className={colors.text}>
                    {topic.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Question Types</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {config.questionTypes.map((type) => (
                  <Badge key={type.id} variant="outline" className={colors.text}>
                    {type.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Difficulty Level</h4>
              <p className="font-medium mt-1">{config.difficultyLevel || "Not selected"}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Number of Questions</h4>
              <p className="font-medium mt-1">{config.numberOfQuestions}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500">Estimated Time</h4>
              <p className="font-medium mt-1">
                {config.difficultyLevel === "Easy" && `${Math.round(config.numberOfQuestions * 0.5)} minutes`}
                {config.difficultyLevel === "Medium" && `${Math.round(config.numberOfQuestions * 1)} minutes`}
                {config.difficultyLevel === "Hard" && `${Math.round(config.numberOfQuestions * 1.5)} minutes`}
                {!config.difficultyLevel && "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
          <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-700">Ready to Begin!</h4>
            <p className="text-sm text-gray-600">
              Your assessment is ready to start. Click "Create Assessment" to begin or go back to make changes.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="sticky top-0 z-10 bg-white">
          <DialogHeader className={`p-6 pb-2 ${colors.text}`}>
            <DialogTitle className="text-xl flex items-center gap-2">
              {getStepIcon(step)}
              {step === 1 && "Select Topics"}
              {step === 2 && "Choose Question Types"}
              {step === 3 && "Set Difficulty Level"}
              {step === 4 && "Number of Questions"}
              {step === 5 && "Review & Create"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "Choose one or more topics for your assessment"}
              {step === 2 && "Select the types of questions you want to include"}
              {step === 3 && "Choose the difficulty level for your assessment"}
              {step === 4 && "Decide how many questions you want to answer"}
              {step === 5 && "Review your selections and create your assessment"}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4">
            <Progress value={progress} className="h-2" style={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
              <div
                className={`h-full ${colors.bg}`}
                style={{ width: `${progress}%`, transition: "width 0.3s ease-in-out" }}
              />
            </Progress>

            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span className={step >= 1 ? colors.text : ""}>Topics</span>
              <span className={step >= 2 ? colors.text : ""}>Question Types</span>
              <span className={step >= 3 ? colors.text : ""}>Difficulty</span>
              <span className={step >= 4 ? colors.text : ""}>Questions</span>
              <span className={step >= 5 ? colors.text : ""}>Review</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={`step-${step}`} initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
              {step === 1 && renderTopicSelection()}
              {step === 2 && renderQuestionTypeSelection()}
              {step === 3 && renderDifficultySelection()}
              {step === 4 && renderNumberOfQuestions()}
              {step === 5 && renderReview()}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="p-6 pt-2 border-t">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={step === 1 ? onClose : handlePrevious} className="gap-1">
              {step === 1 ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </>
              )}
            </Button>

            <Button
              onClick={step === 5 ? handleSubmit : handleNext}
              disabled={!isStepValid()}
              className={`${colors.bg} hover:${colors.hover} gap-1`}
            >
              {step === 5 ? (
                <>
                  Create Assessment
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
