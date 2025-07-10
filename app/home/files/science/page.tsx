"use client"

import { useState, useEffect, useRef } from "react"
import { FileList, type FileItem } from "@/components/files/file-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { CreatePdfAssessmentModal } from "@/components/assessment/create-pdf-assessment-modal"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

// PDF processing status enum
enum ProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

// PDF document interface
interface PdfDocument {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  title: string
  description?: string
  pages?: number
  upload_date: string
  processing_status: ProcessingStatus
  processing_error?: string
  process_start_time?: string
  process_end_time?: string
  metadata: Record<string, any>
}

export default function ScienceFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeTab, setActiveTab] = useState("files")
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null)
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [grade, setGrade] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Auth token
  const [authToken, setAuthToken] = useState<string | null>(null)
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  
  // Poll intervals for processing status (in ms)
  const POLL_INTERVALS = {
    PENDING: 5000,
    PROCESSING: 3000
  }
  
  // Learning states
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false)
  const [learningQuestion, setLearningQuestion] = useState("")
  const [isLearningSubmitting, setIsLearningSubmitting] = useState(false)
  
  // Fetch auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (token) {
      setAuthToken(token)
    } else {
      setError("Authentication token not found. Please log in again.")
      setIsLoading(false)
      toast({
        title: "Authentication Error",
        description: "You must be logged in to view and upload files.",
        variant: "destructive"
      })
    }
  }, [toast])
  
  // Fetch PDFs when auth token is available
  useEffect(() => {
    if (authToken) {
      fetchPdfs(authToken)
    }
  }, [authToken])
  
  // Function to fetch PDFs
  const fetchPdfs = async (token: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(buildApiUrlNoPort(`${API_ENDPOINTS.PDF_LIST}?subject=science`), {
        headers: {
          "x-auth-session": token
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDFs: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.data) {
        // Parse each PDF document string to JSON
        const pdfs = result.data.map((pdfString: string) => {
          try {
            return JSON.parse(pdfString)
          } catch (e) {
            console.error("Error parsing PDF data:", e)
            return null
          }
        }).filter(Boolean) // Remove any null entries
        
        // Convert to FileItem format
        const fileItems: FileItem[] = pdfs.map((pdf: PdfDocument) => ({
          id: pdf.id,
          name: pdf.file_name,
          status: mapProcessingStatusToFileStatus(pdf.processing_status),
          uploadedAt: formatDate(pdf.upload_date),
          size: formatFileSize(pdf.file_size),
          subject: "science",
          description: pdf.description,
          metadata: pdf.metadata
        }))
        
        setFiles(fileItems)
      } else {
        setFiles([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching PDFs"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }
  
  // Handle form submission for file upload
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload files.",
        variant: "destructive"
      })
      return
    }
    
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a PDF file to upload.",
        variant: "destructive"
      })
      return
    }
    
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the PDF.",
        variant: "destructive"
      })
      return
    }
    
    setIsUploading(true)
    
    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("title", title.trim())
    formData.append("description", description.trim())
    formData.append("subject", "science") // Hardcoded for this page
    formData.append("grade", grade.trim())
    
    try {
      const response = await fetch(buildApiUrlNoPort(API_ENDPOINTS.PDF_UPLOAD), {
        method: "POST",
        headers: {
          "x-auth-session": authToken
        },
        body: formData
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: "Upload Successful",
          description: result.message || "PDF uploaded successfully and queued for processing.",
          variant: "success"
        })
        
        // Reset form
        setTitle("")
        setDescription("")
        setGrade("")
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        
        // Parse the uploaded PDF data to create a new file item
        try {
          const uploadedPdf = JSON.parse(result.data)
    const newFile: FileItem = {
            id: uploadedPdf.id,
            name: uploadedPdf.file_name,
            status: "processing", // Start with processing status
      uploadedAt: "Just now",
            size: formatFileSize(uploadedPdf.file_size),
      subject: "science",
    }

          setFiles(prevFiles => [newFile, ...prevFiles])

          // Switch to files tab
    setActiveTab("files")

          // Start polling for status updates
          startPollingStatus(uploadedPdf.id)
        } catch (parseError) {
          console.error("Error parsing uploaded PDF data:", parseError)
          // Still switch to files tab and refresh the list
          setActiveTab("files")
          if (authToken) {
            fetchPdfs(authToken)
          }
        }
      } else {
        throw new Error(result.message || "Upload failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during upload"
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  // Poll for status updates on a PDF
  const startPollingStatus = (pdfId: string) => {
    if (!authToken) return
    
    let attempts = 0
    const maxAttempts = 10
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) return
      
      try {
        const response = await fetch(buildApiUrlNoPort(`api/pdf/${pdfId}/status`), {
          headers: {
            "x-auth-session": authToken
          }
        })
        
        if (!response.ok) {
          throw new Error("Failed to check processing status")
        }
        
        const result = await response.json()
        const status = result.data.mongodb_status
        
        // Update the file status in our state
        setFiles(prevFiles => 
          prevFiles.map(file => {
            if (file.id === pdfId) {
              // Ensure we return a valid FileItem status
              const newStatus = status === ProcessingStatus.COMPLETED 
                ? "ready" 
                : status === ProcessingStatus.FAILED 
                  ? "error" 
                  : "processing";
              
              return {
                ...file,
                status: newStatus
              }
            }
            return file
          })
        )
        
        // Continue polling if still processing
        if (status === ProcessingStatus.PENDING || status === ProcessingStatus.PROCESSING) {
          attempts++
          setTimeout(checkStatus, 3000) // Check every 3 seconds
        }
      } catch (err) {
        console.error("Error checking PDF status:", err)
        attempts++
        setTimeout(checkStatus, 5000) // Retry after 5 seconds on error
      }
    }
    
    // Start checking
    setTimeout(checkStatus, 2000) // First check after 2 seconds
  }
  
  // Utility function to map API processing status to file status for UI
  const mapProcessingStatusToFileStatus = (status: string): string => {
    switch (status) {
      case ProcessingStatus.COMPLETED:
        return "ready"
      case ProcessingStatus.FAILED:
        return "error"
      case ProcessingStatus.PROCESSING:
      case ProcessingStatus.PENDING:
      default:
        return "processing"
    }
  }
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
      
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
      
      return date.toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  // Handle file deletion
  const handleDeleteFile = async (id: string) => {
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to delete files.",
        variant: "destructive"
      })
      return
    }
    
    const fileToDelete = files.find(f => f.id === id)
    if (!fileToDelete) return
    
    try {
      const response = await fetch(buildApiUrlNoPort(`api/pdf/${id}`), {
        method: "DELETE",
        headers: {
          "x-auth-session": authToken
        }
      })
      
      if (response.ok) {
        setFiles(files.filter(file => file.id !== id))
        toast({
          title: "File Deleted",
          description: `${fileToDelete.name} has been deleted successfully.`,
          variant: "success"
        })
      } else {
        const result = await response.json()
        throw new Error(result.message || "Failed to delete file")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error deleting file"
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }
  
  // Handle assessment file
  const handleAssessFile = async (id: string) => {
    const selectedFile = files.find((file) => file.id === id)
    if (selectedFile) {
      if (selectedFile.status !== "ready") {
        toast({
          title: "File Not Ready",
          description: "Please wait for the file to finish processing before creating an assessment.",
          variant: "destructive"
        })
        return
      }
      setSelectedPdfId(id)
      setSelectedPdfName(selectedFile.name)
      setIsAssessmentModalOpen(true)
    }
  }
  
  // Handle learn from file
  const handleLearnFromFile = async (id: string, question: string) => {
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to access learning features.",
        variant: "destructive"
      })
      return
    }
    
    const selectedFile = files.find((file) => file.id === id)
    if (!selectedFile) {
      toast({
        title: "File Not Found",
        description: "The selected file could not be found.",
        variant: "destructive"
      })
      return
    }
    
    if (selectedFile.status !== "ready") {
      toast({
        title: "File Not Ready",
        description: "Please wait for the file to finish processing before starting learning.",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Create learning session
      const response = await fetch(buildApiUrlNoPort(`api/pdf/${id}/learn`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken
        },
        body: JSON.stringify({
          question: question.trim()
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Learning Session Created",
          description: "Redirecting to your learning session...",
          variant: "success"
        })
        
        // Redirect to learning page with session ID
        window.location.href = `/home/learning/science/${id}?question=${encodeURIComponent(question)}`
      } else {
        const result = await response.json()
        throw new Error(result.message || "Failed to create learning session")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error creating learning session"
      toast({
        title: "Learning Session Failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }
  
  // Generate assessment
  const generateAssessment = async (pdfId: string, numQuestions: number = 10, questionTypes: string[] = ["MCQ", "DESCRIPTIVE", "FILL_BLANKS", "TRUEFALSE"]) => {
    if (!authToken) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to generate assessments.",
        variant: "destructive"
      })
      return null
    }
    
    try {
      const response = await fetch(buildApiUrlNoPort("api/assessment/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken
        },
        body: JSON.stringify({
          pdf_id: pdfId,
          subject: "science",
          num_questions: numQuestions,
          question_types: questionTypes
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        return JSON.parse(result.data)
      } else {
        const result = await response.json()
        throw new Error(result.message || "Failed to generate assessment")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error generating assessment"
      toast({
        title: "Assessment Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
      return null
    }
  }
  
  // Handle opening learning modal
  const handleOpenLearningModal = (id: string) => {
    const selectedFile = files.find((file) => file.id === id)
    if (selectedFile) {
      if (selectedFile.status !== "ready") {
        toast({
          title: "File Not Ready",
          description: "Please wait for the file to finish processing before starting learning.",
          variant: "destructive"
        })
        return
      }
      setSelectedPdfId(id)
      setSelectedPdfName(selectedFile.name)
      setLearningQuestion("")
      setIsLearningModalOpen(true)
    }
  }
  
  // Handle learning form submission
  const handleLearningSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPdfId) {
      toast({
        title: "Error",
        description: "No file selected for learning.",
        variant: "destructive"
      })
      return
    }
    
    if (!learningQuestion.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question to start learning.",
        variant: "destructive"
      })
      return
    }
    
    setIsLearningSubmitting(true)
    
    try {
      await handleLearnFromFile(selectedPdfId, learningQuestion.trim())
      setIsLearningModalOpen(false)
    } finally {
      setIsLearningSubmitting(false)
    }
  }

  // Show loading state
  if (isLoading && files.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Loading your Science files...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && files.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Files</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => { if (authToken) fetchPdfs(authToken) }} disabled={!authToken}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center mb-4 md:mb-6">
        <div className="bg-green-100 p-1.5 md:p-2 rounded-full mr-2 md:mr-3">
          <FileText className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Science Files</h1>
      </div>

      <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">
        Upload and manage your Science files, notes, and resources.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 md:mb-6 w-full">
          <TabsTrigger value="files" className="flex-1">
            My Files
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            Upload New File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Science Files</CardTitle>
              <CardDescription className="text-sm">Manage your uploaded Science files</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              {files.length > 0 ? (
                <FileList 
                  files={files} 
                  onDeleteFile={handleDeleteFile} 
                  onAssessFile={handleAssessFile}
                  onLearnFile={handleOpenLearningModal}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No files found</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    You haven't uploaded any Science files yet.
                  </p>
                  <Button onClick={() => setActiveTab("upload")} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Your First File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Upload Science File</CardTitle>
              <CardDescription className="text-sm">
                Upload PDF files for Science subject
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="file" className="block mb-1 text-sm font-medium">
                    PDF File <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="file"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="cursor-pointer"
                    disabled={isUploading}
                  />
                  {selectedFile && (
                    <p className="mt-1 text-xs text-gray-500">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title" className="block mb-1 text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your PDF"
                    required
                    maxLength={100}
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="block mb-1 text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the contents of this file"
                    maxLength={500}
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <Label htmlFor="grade" className="block mb-1 text-sm font-medium">
                    Grade (Optional)
                  </Label>
                  <Input
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g., 10th, 12th, College"
                    disabled={isUploading}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isUploading || !authToken}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload PDF"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Learning Dialog */}
      <Dialog open={isLearningModalOpen} onOpenChange={setIsLearningModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Learn from {selectedPdfName}</DialogTitle>
            <DialogDescription>
              Ask a question about this document to receive AI-generated insights and explanations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLearningSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="learningQuestion">Your Question</Label>
                <Textarea
                  id="learningQuestion"
                  value={learningQuestion}
                  onChange={(e) => setLearningQuestion(e.target.value)}
                  placeholder="E.g., What are the main themes discussed in this document?"
                  className="min-h-[100px]"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsLearningModalOpen(false)}
                disabled={isLearningSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLearningSubmitting || !learningQuestion.trim()}>
                {isLearningSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Learning"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedPdfId && (
        <CreatePdfAssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          subject="science"
          subjectColor="green"
          pdfId={selectedPdfId}
          pdfName={selectedPdfName || undefined}
        />
      )}
    </div>
  )
}