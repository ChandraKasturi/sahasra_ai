"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  BookOpen,
  ClipboardCheck,
  BarChart2,
  ChevronDown,
  CreditCard,
  User,
  LogOut,
  Crown,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  ChevronUp,
  Folder,
  Calendar,
  MessageSquare,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { removeAuthToken, getAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { format, subDays, differenceInDays, isAfter, isBefore, parseISO } from "date-fns"

// Main navigation items
const MAIN_NAV_ITEMS = [
  { id: "learning", label: "Learning", icon: BookOpen },
  { id: "assessment", label: "Assessment", icon: ClipboardCheck },
  { id: "progress", label: "Progress", icon: BarChart2 },
  { id: "files", label: "Files", icon: FileText },
]

// Subject items (these would come from the backend in a real implementation)
const SUBJECT_ITEMS = [
  { id: "english", label: "English" },
  { id: "hindi", label: "Hindi" },
  { id: "science", label: "Science" },
  { id: "social-science", label: "Social Science" },
  { id: "mathematics", label: "Mathematics" },
]

// Generate chat history dates dynamically
const generateChatHistoryDates = (oldestDate: Date | null, visibleCount: number = 7) => {
  const today = new Date()
  const dates = []
  
  console.log('generateChatHistoryDates called with:')
  console.log('- oldestDate:', oldestDate)
  console.log('- visibleCount:', visibleCount)
  console.log('- today:', format(today, "yyyy-MM-dd"))
  
  if (!oldestDate) {
    console.log('No oldest date, using fallback')
    // If no oldest date available, show last 7 days as fallback
    for (let i = 0; i < visibleCount; i++) {
      const date = subDays(today, i)
      dates.push({
        id: format(date, "yyyy-MM-dd"),
        label: format(date, "dd-MMM-yy"),
        date: date,
      })
    }
    return dates
  }

  // Normalize dates to start of day for accurate day calculation
  const todayStartOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const oldestStartOfDay = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), oldestDate.getDate())

  // Calculate total days between today and oldest date
  const totalDays = differenceInDays(todayStartOfDay, oldestStartOfDay)
  const maxDays = Math.min(totalDays + 1, visibleCount) // +1 to include today
  
  console.log('Date calculation:')
  console.log('- todayStartOfDay:', format(todayStartOfDay, "yyyy-MM-dd"))
  console.log('- oldestStartOfDay:', format(oldestStartOfDay, "yyyy-MM-dd"))
  console.log('- totalDays between today and oldest:', totalDays)
  console.log('- maxDays to show:', maxDays)

  for (let i = 0; i < maxDays; i++) {
    const date = subDays(today, i)
    console.log(`- Checking date ${i}: ${format(date, "yyyy-MM-dd")}`)
    
    // Don't go beyond the oldest date (compare with start of day)
    const dateStartOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    if (isBefore(dateStartOfDay, oldestStartOfDay)) {
      console.log(`  -> Breaking because ${format(date, "yyyy-MM-dd")} is before oldest date`)
      break
    }
    
    console.log(`  -> Adding date: ${format(date, "yyyy-MM-dd")}`)
    dates.push({
      id: format(date, "yyyy-MM-dd"),
      label: format(date, "dd-MMM-yy"),
      date: date,
    })
  }

  console.log('Final generated dates:', dates.map(d => d.id))
  return dates
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  studentName?: string
  educationBoard?: string
  studentImage?: string
}

export function Sidebar({
  className,
  studentName = "John Doe",
  educationBoard = "CBSE",
  studentImage,
  ...props
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMainItem, setSelectedMainItem] = useState<string | null>("learning") // Default to learning
  const [selectedSubject, setSelectedSubject] = useState<string | null>("english") // Default to English
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(true)
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(true)
  const [oldestDate, setOldestDate] = useState<Date | null>(null)
  const [visibleDatesCount, setVisibleDatesCount] = useState(7)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [chatHistoryDates, setChatHistoryDates] = useState<Array<{id: string, label: string, date: Date}>>([])
  const searchParams = useSearchParams()

  // Fetch oldest conversation date
  const fetchOldestDate = async () => {
    if (!selectedSubject) return
    
    setIsLoadingHistory(true)
    try {
      const authToken = getAuthToken()
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.GET_HISTORY}/${selectedSubject}?oldest_first=true`), {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "x-auth-session": authToken }),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`)
      }

      const data = await response.json()
      console.log('History API response:', data)
      
      if (data.history && data.history.length > 0) {
        // Get the oldest date from the first item (since oldest_first=true)
        const oldestTime = data.history[0].time
        console.log('Raw oldest time from API:', oldestTime)
        if (oldestTime) {
          // Parse the ISO string (format: 2025-06-04T09:08:30.492000)
          // This timestamp is already in Asia/Kolkata timezone, no conversion needed
          const parsedOldestDate = parseISO(oldestTime)
          console.log('Parsed oldest date:', parsedOldestDate)
          console.log('Oldest date formatted:', format(parsedOldestDate, "yyyy-MM-dd"))
          setOldestDate(parsedOldestDate)
        }
      } else {
        // No history found for this subject
        console.log('No history found for subject:', selectedSubject)
        setOldestDate(null)
      }
    } catch (error) {
      console.error('Error fetching oldest date:', error)
      // Don't show error toast, just continue with fallback behavior
      setOldestDate(null)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Generate and update chat history dates
  useEffect(() => {
    const newDates = generateChatHistoryDates(oldestDate, visibleDatesCount)
    setChatHistoryDates(newDates)
  }, [oldestDate, visibleDatesCount])

  // Fetch oldest date on component mount and when subject changes
  useEffect(() => {
    if (selectedSubject) {
      // Reset state when subject changes
      setOldestDate(null)
      setVisibleDatesCount(7)
      fetchOldestDate()
    }
  }, [selectedSubject])

  // Calculate if there are more dates to show
  const hasMoreDates = () => {
    if (!oldestDate) return false
    const today = new Date()
    const totalDays = differenceInDays(today, oldestDate) + 1
    return visibleDatesCount < totalDays
  }

  // Show more dates
  const showMoreDates = () => {
    if (!oldestDate) return
    const today = new Date()
    const totalDays = differenceInDays(today, oldestDate) + 1
    const newCount = Math.min(visibleDatesCount + 7, totalDays)
    setVisibleDatesCount(newCount)
  }

  // Auto-select first subject when main item changes
  useEffect(() => {
    if (selectedMainItem && !selectedSubject) {
      setSelectedSubject("english")
      window.location.href = `/home/${selectedMainItem}/english`
    }
  }, [selectedMainItem, selectedSubject])

  // Initialize based on current path
  useEffect(() => {
    if (pathname) {
      const pathParts = pathname.split("/").filter(Boolean)
      if (pathParts.length >= 2 && pathParts[0] === "home") {
        const mainItem = pathParts[1]
        if (MAIN_NAV_ITEMS.some((item) => item.id === mainItem)) {
          setSelectedMainItem(mainItem)

          if (pathParts.length >= 3) {
            const subject = pathParts[2]
            if (SUBJECT_ITEMS.some((item) => item.id === subject)) {
              setSelectedSubject(subject)
            }
          } else if (mainItem !== "learning" && mainItem !== "assessment") {
            // Only default to English if not on the main learning or assessment page
            setSelectedSubject("english")
          }
        }
      }
    }
  }, [pathname])

  // Determine if a main nav item is active based on the current path
  const getIsMainItemActive = (id: string) => {
    return pathname?.includes(`/home/${id}`)
  }

  // Determine if a subject item is active based on the current path
  const getIsSubjectActive = (subjectId: string) => {
    return pathname?.includes(`/home/${selectedMainItem}/${subjectId}`)
  }

  // Determine if a history date is active
  const getIsHistoryDateActive = (dateId: string) => {
    // Check if the URL has a date parameter matching this date
    return searchParams?.get("date") === dateId
  }

  // Handle main item selection
  const handleMainItemSelect = (id: string) => {
    setSelectedMainItem(id)

    if (id === "learning" || id === "assessment" || id === "files" || id === "progress") {
      // For learning, assessment, files, and progress, go to the main dashboard
      window.location.href = `/home/${id}`
    } else {
      // For other sections, auto-select English
      setSelectedSubject("english")
      window.location.href = `/home/${id}/english`
    }
  }

  // Handle subject item selection
  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    // Navigate to the subject page within the main section
    window.location.href = `/home/${selectedMainItem}/${subjectId}`
  }

  // Handle history date selection
  const handleHistoryDateSelect = (dateId: string) => {
    // Navigate to the main English page with a date parameter
    window.location.href = `/home/${selectedMainItem}/${selectedSubject}?date=${dateId}`
  }

  const handleLogout = async () => {
    try {
      // Clear the authentication token
      removeAuthToken()

      // Show success toast
      toast({
        variant: "success",
        title: "Logged out successfully",
        description: "You have been logged out of your account",
        icon: <CheckCircle className="h-5 w-5" />,
      })

      // Redirect to signin page with actual URL navigation
      window.location.href = "/signin"
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to close the sheet
  const closeSheet = () => {
    setIsOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex flex-col h-full transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-64",
        className,
      )}
      {...props}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border rounded-full p-1 shadow-md z-10 hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Sidebar header */}
      <div className="py-4">
        <div className={cn("flex items-center", isCollapsed ? "justify-center px-2" : "px-4")}>
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QLEZpPlECWtj3bIM6kVOkaj25Bmai.png"
              alt="Sahasra Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            {!isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-brand-navy to-brand-coral bg-clip-text text-transparent">
                Sahasra
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Main navigation dropdown */}
        <div className={cn("px-3 mb-2", isCollapsed && "px-2")}>
          <button
            onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors",
              isCollapsed && "justify-center",
            )}
          >
            {!isCollapsed && (
              <>
                <span className="font-medium text-sm">Navigation</span>
                {isMainDropdownOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </>
            )}
            {isCollapsed && <Folder className="h-5 w-5 text-gray-500" />}
          </button>
        </div>

        {/* Main navigation items */}
        {isMainDropdownOpen && (
          <div className={cn("py-2", isCollapsed ? "px-2" : "px-3")}>
            <div className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive = getIsMainItemActive(item.id)
                const isSelected = selectedMainItem === item.id
                const Icon = item.icon

                return (
                  <Button
                    key={item.id}
                    variant={isActive || isSelected ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      isCollapsed && "justify-center px-0",
                      (isActive || isSelected) && "bg-brand-coral/10 text-brand-coral hover:bg-brand-coral/20",
                    )}
                    onClick={() => handleMainItemSelect(item.id)}
                  >
                    <Icon className={cn("h-4 w-4", (isActive || isSelected) && "text-brand-coral")} />
                    {!isCollapsed && item.label}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Subject items - only show if a main item is selected */}
        {selectedMainItem && (
          <div className={cn("py-2", isCollapsed ? "px-2" : "px-3")}>
            {!isCollapsed && (
              <h3 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-500 uppercase">Subjects</h3>
            )}
            <div className="space-y-1">
              {SUBJECT_ITEMS.map((subject) => {
                const isActive = getIsSubjectActive(subject.id)

                return (
                  <Button
                    key={subject.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "justify-center px-0",
                      isActive && "bg-brand-coral/10 text-brand-coral hover:bg-brand-coral/20",
                    )}
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    {!isCollapsed && subject.label}
                    {isCollapsed && subject.label.charAt(0)}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Chat History - show for learning subjects */}
        {selectedMainItem === "learning" && selectedSubject && !isCollapsed && (
          <div className="py-2 px-3">
            <div className="mb-2 px-2 flex items-center justify-between">
              <button
                onClick={() => setIsHistoryDropdownOpen(!isHistoryDropdownOpen)}
                className="text-gray-500 hover:text-gray-700 flex items-center w-full justify-between"
              >
                <span className="text-xs font-semibold tracking-tight text-gray-500 uppercase flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />{" "}
                  {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)} History
                </span>
                {isHistoryDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {isHistoryDropdownOpen && (
              <div className="space-y-1">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-xs text-gray-500">Loading history...</div>
                  </div>
                ) : (
                  <>
                    {chatHistoryDates.map((date) => {
                      const isActive = getIsHistoryDateActive(date.id)

                      return (
                        <Button
                          key={date.id}
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start text-xs pl-4",
                            isActive && "bg-brand-coral/10 text-brand-coral hover:bg-brand-coral/20",
                          )}
                          onClick={() => handleHistoryDateSelect(date.id)}
                        >
                          <MessageSquare className="h-3 w-3 mr-2 opacity-70" />
                          {date.label}
                        </Button>
                      )
                    })}
                    
                    {hasMoreDates() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs mt-2 text-gray-500 hover:text-gray-700"
                        onClick={showMoreDates}
                      >
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Show more dates
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar footer - fixed at bottom */}
      <div className="py-3 px-3 bg-gray-50 rounded-lg mx-2 mb-2 mt-auto">
        <Button
          variant="ghost"
          className={cn("w-full", isCollapsed ? "justify-center p-2" : "justify-between items-center px-4")}
          onClick={() => setIsOpen(true)}
        >
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {studentImage ? (
                <Image src={studentImage || "/placeholder.svg"} alt={studentName} fill className="object-cover" />
              ) : (
                <User className="h-5 w-5 absolute inset-0 m-auto text-gray-500" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm truncate max-w-[140px]">{studentName}</span>
                <span className="text-xs text-gray-500 truncate max-w-[140px]">{educationBoard} - Class 10</span>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sheet for account options */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[300px]">
          <SheetHeader>
            <SheetTitle>Account Settings</SheetTitle>
            <SheetDescription>Manage your account and subscription</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <Link href="/home/upgrade" onClick={closeSheet}>
                <Crown className="h-4 w-4 text-brand-coral" />
                Upgrade to Pro
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <Link href="/home/account" onClick={closeSheet}>
                <User className="h-4 w-4" />
                Account
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <Link href="/home/billing" onClick={closeSheet}>
                <CreditCard className="h-4 w-4" />
                Billing
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <Link href="/home/settings" onClick={closeSheet}>
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
          <SheetFooter className="border-t pt-4">
            <Button
              variant="destructive"
              className="w-full justify-start gap-2"
              onClick={() => {
                handleLogout()
                closeSheet()
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={closeSheet}>
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
