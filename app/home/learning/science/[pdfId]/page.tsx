"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Copy, ThumbsUp, ThumbsDown, Volume2, Send, Mic, Paperclip, Loader2, ArrowLeft, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

// Define the Message type
type Message = {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  image?: {
    url: string
    caption: string
    page: number
  }
}

interface PdfDetails {
  id: string
  file_name: string
  file_size: number
  title?: string
  description?: string
  pages?: number
  upload_date: string
}

export default function PDFLearningPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const initialQuestion = searchParams.get("question")
  const pdfId = params.pdfId as string

  // State for messages
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfDetails, setPdfDetails] = useState<PdfDetails | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (token) {
      setAuthToken(token)
    } else {
      setError("Authentication token not found. Please log in again.")
      setIsInitializing(false)
    }
  }, [])

  // Fetch PDF details
  useEffect(() => {
    if (!authToken || !pdfId) return

    const fetchPdfDetails = async () => {
      try {
        const response = await fetch(buildApiUrlNoPort(`api/pdf/${pdfId}`), {
          headers: {
            "x-auth-session": authToken
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF details: ${response.status}`)
        }

        const result = await response.json()
        if (result.data) {
          const pdfData = typeof result.data === 'string' 
            ? JSON.parse(result.data) 
            : result.data
          
          setPdfDetails(pdfData)
        } else {
          throw new Error("No PDF details returned from the server")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error fetching PDF details"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsInitializing(false)
      }
    }

    fetchPdfDetails()
  }, [authToken, pdfId])

  // Set initial welcome message once PDF details are loaded
  useEffect(() => {
    if (pdfDetails && !messages.length) {
      const fileName = pdfDetails.title || pdfDetails.file_name || "Your Document"
      
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content: `# Learning from ${fileName}

I'm your Science learning assistant. I'll help you understand the content in this document. You can ask me:

- Questions about specific sections
- To summarize key points
- For explanations of concepts
- How to apply what you're learning
- For practice exercises related to the content

What would you like to know about this document?`,
          timestamp: new Date(),
        },
      ])

      // If there's an initial question from query params, send it
      if (initialQuestion && initialQuestion.trim()) {
        setInputValue(initialQuestion)
        setTimeout(() => {
          handleSendMessage(initialQuestion)
        }, 1000)
      }
    }
  }, [pdfDetails, messages.length, initialQuestion])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (questionText?: string) => {
    const question = questionText || inputValue
    if (!question.trim() || !authToken || !pdfId) return

    // Add user message
    const userMessageId = Date.now().toString()
    const newUserMessage: Message = {
      id: userMessageId,
      type: "user",
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch(buildApiUrlNoPort(`api/pdf/${pdfId}/learn`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken
        },
        body: JSON.stringify({
          question: question.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.data) {
        const newAIMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: result.data.answer || "I couldn't find specific information about that in the document.",
          timestamp: new Date(),
        }

        // Add image if available
        if (result.data.has_image && result.data.image_url) {
          newAIMessage.image = {
            url: result.data.image_url,
            caption: result.data.image_caption || "Image from document",
            page: result.data.image_page || 1
          }
        }

        setMessages((prev) => [...prev, newAIMessage])
      } else {
        throw new Error("No data returned from the learning API")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error processing your question"
      
      // Add error message as AI response
      const errorAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `I'm sorry, I encountered an error while processing your question: ${errorMessage}. Please try again or ask a different question.`,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorAIMessage])
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })
  }

  const handleSpeak = (content: string) => {
    // Text-to-speech functionality would be implemented here
    toast({
      title: "Coming Soon",
      description: "Text-to-speech functionality will be implemented soon.",
    })
  }

  const handleFeedback = (isPositive: boolean) => {
    // Feedback functionality would be implemented here
    toast({
      title: "Feedback Recorded",
      description: `Thank you for your ${isPositive ? "positive" : "negative"} feedback.`,
    })
  }

  const handleExitFileMode = () => {
    router.push("/home/learning/science")
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Show loading state
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Document</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={handleExitFileMode}>
            Return to Learning Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* PDF Info Banner */}
      <div className="bg-green-100/20 border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-medium text-sm">{pdfDetails?.title || pdfDetails?.file_name || "Document"}</h3>
            <p className="text-xs text-gray-500">
              {pdfDetails ? formatFileSize(pdfDetails.file_size) : ""} 
              {pdfDetails?.pages ? ` • ${pdfDetails.pages} pages` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleExitFileMode}>
          <ArrowLeft className="h-3 w-3" />
          Exit File Mode
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={message.type === "ai" ? "bg-green-100/20" : "bg-green-600/20"}>
                    <AvatarFallback>{message.type === "ai" ? "AI" : "You"}</AvatarFallback>
                    {message.type === "ai" && (
                      <AvatarImage
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QLEZpPlECWtj3bIM6kVOkaj25Bmai.png"
                        alt="Sahasra AI"
                      />
                    )}
                  </Avatar>

                  <Card className={`p-4 ${message.type === "user" ? "bg-green-600 text-white" : "bg-white border"}`}>
                    {message.type === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="space-y-4">
                        <ReactMarkdown
                          components={{
                            img: ({ node, ...props }) => (
                              <div className="my-4">
                                <img {...props} className="rounded-md max-w-full h-auto" alt={props.alt || "Image"} />
                              </div>
                            ),
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {message.image && (
                          <div className="my-4 border rounded-md overflow-hidden">
                            <div className="relative h-48 w-full">
                              <Image 
                                src={message.image.url} 
                                alt={message.image.caption}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600">
                              <p>{message.image.caption}</p>
                              <p className="text-gray-400">Page {message.image.page}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(message.content)}
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSpeak(message.content)}
                            title="Listen"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleFeedback(false)} title="Not helpful">
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleFeedback(true)} title="Helpful">
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed input area */}
      <div className="border-t bg-white w-full">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything about ${pdfDetails?.title || pdfDetails?.file_name || "this document"}...`}
              className="min-h-[60px] pr-24 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <Button variant="ghost" size="icon" title="Attach file" disabled={isLoading}>
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" title="Voice input" disabled={isLoading}>
                <Mic className="h-5 w-5 text-gray-500" />
              </Button>
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-600 hover:bg-green-600/90 text-white"
                title="Send message"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
