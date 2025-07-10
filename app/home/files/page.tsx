"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, AlertCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { buildApiUrlNoPort, API_ENDPOINTS } from "@/lib/config"

// File summary interface
interface FileSummary {
  totalFiles: number
  filesBySubject: {
    english: number
    hindi: number
    science: number
    socialScience: number
    mathematics: number
  }
}

const initialFileSummary: FileSummary = {
  totalFiles: 0,
  filesBySubject: {
    english: 0,
    hindi: 0,
    science: 0,
    socialScience: 0,
    mathematics: 0,
  },
}

export default function FilesPage() {
  const [fileSummary, setFileSummary] = useState<FileSummary>(initialFileSummary)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

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
        description: "You must be logged in to view files.",
        variant: "destructive"
      })
    }
  }, [toast])

  // Fetch file summary when auth token is available
  useEffect(() => {
    if (authToken) {
      fetchFileSummary(authToken)
    }
  }, [authToken])

  // Function to fetch PDFs for a specific subject or all
  const fetchPdfs = async (token: string, subject?: string): Promise<number> => {
    try {
      const url = subject 
        ? buildApiUrlNoPort(`${API_ENDPOINTS.PDF_LIST}?subject=${subject}`)
        : buildApiUrlNoPort(API_ENDPOINTS.PDF_LIST)
      
      const response = await fetch(url, {
        headers: {
          "x-auth-session": token
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDFs: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.data && Array.isArray(result.data)) {
        // Parse each PDF document string to JSON and count valid entries
        return result.data.filter((pdfString: string) => {
          try {
            JSON.parse(pdfString)
            return true
          } catch (e) {
            console.error("Error parsing PDF data:", e)
            return false
          }
        }).length
      }
      
      return 0
    } catch (err) {
      console.error(`Error fetching ${subject || 'all'} PDFs:`, err)
      return 0
    }
  }

  // Function to fetch file summary data
  const fetchFileSummary = async (token: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch counts for all subjects in parallel
      const [totalFiles, englishCount, hindiCount, scienceCount, socialScienceCount, mathematicsCount] = 
        await Promise.all([
          fetchPdfs(token),
          fetchPdfs(token, 'english'),
          fetchPdfs(token, 'hindi'),
          fetchPdfs(token, 'science'),
          fetchPdfs(token, 'social-science'),
          fetchPdfs(token, 'mathematics')
        ])

      const summary: FileSummary = {
        totalFiles,
        filesBySubject: {
          english: englishCount,
          hindi: hindiCount,
          science: scienceCount,
          socialScience: socialScienceCount,
          mathematics: mathematicsCount,
        },
      }

      setFileSummary(summary)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error fetching file summary"
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

  // Subject card colors
  const subjectColors = {
    english: "bg-blue-50 border-blue-200",
    hindi: "bg-orange-50 border-orange-200",
    science: "bg-green-50 border-green-200",
    socialScience: "bg-purple-50 border-purple-200",
    mathematics: "bg-red-50 border-red-200",
  }

  // Handle navigation with scroll to top
  const handleNavigation = (href: string) => {
    router.push(href)
    window.scrollTo(0, 0)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-brand-navy">Files</h1>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Loading your files...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-brand-navy">Files</h1>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Files</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => { if (authToken) fetchFileSummary(authToken) }} 
              disabled={!authToken}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-brand-navy">Files</h1>
      <p className="text-gray-600 mb-8">
        Upload and manage your subject files. Select a subject to upload and view files.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Files</CardTitle>
            <CardDescription>Across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-brand-navy mr-3" />
              <span className="text-3xl font-bold">{fileSummary.totalFiles}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Upload Limits</CardTitle>
            <CardDescription>File restrictions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                <span>PDF files only</span>
              </li>
              <li className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                <span>Maximum 25MB per file</span>
              </li>
              <li className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                <span>Maximum 10 pages per document</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Quick Upload</CardTitle>
            <CardDescription>Select a subject to upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => handleNavigation("/home/files/english")}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                English
              </button>
              <button
                onClick={() => handleNavigation("/home/files/hindi")}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors"
              >
                Hindi
              </button>
              <button
                onClick={() => handleNavigation("/home/files/science")}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                Science
              </button>
              <button
                onClick={() => handleNavigation("/home/files/social-science")}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                Social Science
              </button>
              <button
                onClick={() => handleNavigation("/home/files/mathematics")}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
              >
                Mathematics
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Cards */}
      <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-brand-navy">Subject Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SubjectCard
          title="English"
          href="/home/files/english"
          description={`${fileSummary.filesBySubject.english} files uploaded`}
          color={subjectColors.english}
          icon={<FileText className="h-6 w-6 text-blue-600" />}
          onClick={() => handleNavigation("/home/files/english")}
        />
        <SubjectCard
          title="Hindi"
          href="/home/files/hindi"
          description={`${fileSummary.filesBySubject.hindi} files uploaded`}
          color={subjectColors.hindi}
          icon={<FileText className="h-6 w-6 text-orange-600" />}
          onClick={() => handleNavigation("/home/files/hindi")}
        />
        <SubjectCard
          title="Science"
          href="/home/files/science"
          description={`${fileSummary.filesBySubject.science} files uploaded`}
          color={subjectColors.science}
          icon={<FileText className="h-6 w-6 text-green-600" />}
          onClick={() => handleNavigation("/home/files/science")}
        />
        <SubjectCard
          title="Social Science"
          href="/home/files/social-science"
          description={`${fileSummary.filesBySubject.socialScience} files uploaded`}
          color={subjectColors.socialScience}
          icon={<FileText className="h-6 w-6 text-purple-600" />}
          onClick={() => handleNavigation("/home/files/social-science")}
        />
        <SubjectCard
          title="Mathematics"
          href="/home/files/mathematics"
          description={`${fileSummary.filesBySubject.mathematics} files uploaded`}
          color={subjectColors.mathematics}
          icon={<FileText className="h-6 w-6 text-red-600" />}
          onClick={() => handleNavigation("/home/files/mathematics")}
        />
      </div>
    </div>
  )
}

function SubjectCard({
  title,
  href,
  description,
  color,
  icon,
  onClick,
}: {
  title: string
  href: string
  description: string
  color: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left p-4 md:p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${color}`}
    >
      <div className="flex items-center mb-2 md:mb-3">
        {icon}
        <h3 className="text-lg md:text-xl font-semibold ml-2 text-brand-navy">{title}</h3>
      </div>
      <p className="text-sm md:text-base text-gray-600">{description}</p>
      <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm font-medium text-brand-navy">
        <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1" />
        <span>Upload Files</span>
      </div>
    </button>
  )
}
