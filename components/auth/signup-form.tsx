"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle, AlertTriangle, X, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { setAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

// Education boards in India
const EDUCATION_BOARDS = [
  { value: "cbse", label: "CBSE" },
  { value: "icse", label: "ICSE" },
  { value: "state-ap", label: "Andhra Pradesh State Board" },
  { value: "state-tn", label: "Tamil Nadu State Board" },
  { value: "state-ka", label: "Karnataka State Board" },
  { value: "state-mh", label: "Maharashtra State Board" },
  { value: "state-dl", label: "Delhi State Board" },
  { value: "state-wb", label: "West Bengal State Board" },
  { value: "state-up", label: "Uttar Pradesh State Board" },
  { value: "state-gj", label: "Gujarat State Board" },
  { value: "other", label: "Other" },
]

// Available class options
const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`,
}))

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1 for initial form, 2 for OTP
  const [showPassword, setShowPassword] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    class: "",
    board: "",
    password: "",
  })

  // OTP-related states
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpRetries, setOtpRetries] = useState(0)
  const [maxRetriesReached, setMaxRetriesReached] = useState(false)

  // Form validation errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    class: "",
    board: "",
    password: "",
    otp: "",
  })

  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Manage OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [otpTimer])

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Handle dropdown select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user selects
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validate first step form
  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      class: "",
      board: "",
      password: "",
      otp: "",
    }
    let isValid = true

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters"
      isValid = false
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required"
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email"
        isValid = false
      }
    }

    // Validate phone
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
      isValid = false
    } else {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Please enter a valid 10-digit phone number"
        isValid = false
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      isValid = false
    }

    // Validate class selection
    if (!formData.class) {
      newErrors.class = "Class is required"
      isValid = false
    }

    // Validate board selection
    if (!formData.board) {
      newErrors.board = "Education board is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Validate OTP
  const validateOtp = () => {
    if (!otp) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP is required",
      }))
      return false
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP must be 6 digits",
      }))
      return false
    }

    return true
  }

  // Handle OTP send
  const handleSendOtp = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Prepare the request payload
      const payload = {
        phonenumber: formData.phone,
        email: formData.email,
      }

      // Make API call to send OTP
      const response = await fetch(buildApiUrl(API_ENDPOINTS.GET_OTP), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 200) {
        // Set OTP sent and timer
        setOtpSent(true)
        setOtpTimer(30)
        setOtpRetries((prev) => prev + 1)
        setStep(2)

        // Show toast for OTP sent
        toast({
          variant: "success",
          title: "OTP Sent",
          description: `A verification code has been sent to ${formData.phone} and ${formData.email}`,
          icon: <CheckCircle className="h-5 w-5" />,
        })
      } else if (response.status === 400) {
        // Email or phone already registered
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Email or phone number is already registered. Please try logging in.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      } else if (response.status === 500) {
        // Server error
        toast({
          variant: "destructive",
          title: "OTP Sending Failed",
          description: "We are unable to send OTP at this time. Please try again later.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      } else {
        // Other errors
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again later.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      }
    } catch (error) {
      console.error("OTP sending error:", error)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the server. Please check your internet connection.",
        icon: <AlertTriangle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (otpRetries >= 3) {
      setMaxRetriesReached(true)
      return
    }

    setIsLoading(true)

    try {
      // Prepare the request payload
      const payload = {
        phonenumber: formData.phone,
        email: formData.email,
      }

      // Make API call to resend OTP
      const response = await fetch(buildApiUrl(API_ENDPOINTS.GET_OTP), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 200) {
        // Reset timer and increment retry count
        setOtpTimer(30)
        setOtpRetries((prev) => prev + 1)

        // Show toast for OTP resent
        toast({
          variant: "success",
          title: "OTP Resent",
          description: `A new verification code has been sent to ${formData.phone} and ${formData.email}`,
          icon: <CheckCircle className="h-5 w-5" />,
        })
      } else if (response.status === 400) {
        // Email or phone already registered
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Email or phone number is already registered. Please try logging in.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      } else if (response.status === 500) {
        // Server error
        toast({
          variant: "destructive",
          title: "OTP Sending Failed",
          description: "We are unable to send OTP at this time. Please try again later.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      } else {
        // Other errors
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again later.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      }
    } catch (error) {
      console.error("OTP resending error:", error)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the server. Please check your internet connection.",
        icon: <AlertTriangle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification and form submission
  const handleVerifyOtp = async () => {
    if (!validateOtp()) return

    setIsLoading(true)

    try {
      // Prepare the request payload
      const payload = {
        username: formData.name,
        email: formData.email,
        mobilenumber: formData.phone,
        password: formData.password,
        Class: formData.class, // Note the capital 'C'
        educationboard: formData.board,
        token: otp, // OTP is sent as 'token'
      }

      // Make API call to register user
      const response = await fetch(buildApiUrl(API_ENDPOINTS.REGISTER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 200) {
        // Extract the authentication token from response headers
        const authToken = response.headers.get("x-auth-session")

        if (authToken) {
          // Store the authentication token
          setAuthToken(authToken)
        } else {
          console.warn("Authentication token not found in response headers")
        }

        // Show success toast
        toast({
          variant: "success",
          title: "Registration successful!",
          description: "Your account has been created successfully.",
          icon: <CheckCircle className="h-5 w-5" />,
        })

        // Redirect to home page
        router.push("/home")
      } else if (response.status === 400) {
        // Invalid OTP
        setErrors((prev) => ({
          ...prev,
          otp: "Invalid OTP or OTP expired. Please try again.",
        }))

        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "Invalid OTP or OTP expired. Please try again.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      } else {
        // Other errors
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "Something went wrong. Please try again later.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the server. Please check your internet connection.",
        icon: <AlertTriangle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form and go back to step 1
  const handleGoBack = () => {
    setStep(1)
    setOtp("")
    setErrors((prev) => ({
      ...prev,
      otp: "",
    }))
  }

  // Dismiss the max retries alert
  const dismissMaxRetriesAlert = () => {
    setMaxRetriesReached(false)
  }

  return (
    <>
      {/* Max retries reached alert */}
      {maxRetriesReached && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              <span>Maximum retries reached</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-red-100"
              onClick={dismissMaxRetriesAlert}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </AlertTitle>
          <AlertDescription className="pl-6">
            <p>You've reached the maximum number of OTP retries.</p>
            <p>Please contact our support at support@sahasra.ai for assistance.</p>
          </AlertDescription>
        </Alert>
      )}

      {step === 1 ? (
        /* Step 1: Initial form */
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "border-red-500" : ""}
              disabled={isLoading || maxRetriesReached}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "border-red-500" : ""}
              disabled={isLoading || maxRetriesReached}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter your 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "border-red-500" : ""}
              disabled={isLoading || maxRetriesReached}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min. 8 characters)"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                disabled={isLoading || maxRetriesReached}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class/Grade</Label>
              <Select
                value={formData.class}
                onValueChange={(value) => handleSelectChange("class", value)}
                disabled={isLoading || maxRetriesReached}
              >
                <SelectTrigger className={errors.class ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.class && <p className="text-sm text-red-500">{errors.class}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="board">Education Board</Label>
              <Select
                value={formData.board}
                onValueChange={(value) => handleSelectChange("board", value)}
                disabled={isLoading || maxRetriesReached}
              >
                <SelectTrigger className={errors.board ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_BOARDS.map((board) => (
                    <SelectItem key={board.value} value={board.value}>
                      {board.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.board && <p className="text-sm text-red-500">{errors.board}</p>}
            </div>
          </div>

          <Button
            type="button"
            className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
            onClick={handleSendOtp}
            disabled={isLoading || maxRetriesReached}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Get OTP"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>{" "}
            <Link href="/signin" className="font-medium text-brand-coral hover:text-brand-navy transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      ) : (
        /* Step 2: OTP verification */
        <div className="space-y-5">
          <div className="text-center mb-6">
            <div className="bg-brand-coral/10 inline-block rounded-full p-3 mb-3">
              <CheckCircle className="h-6 w-6 text-brand-coral" />
            </div>
            <h2 className="text-lg font-semibold text-brand-navy">Verify Your Phone & Email</h2>
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to {formData.phone} and {formData.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">Enter 6-digit OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                if (errors.otp) {
                  setErrors((prev) => ({ ...prev, otp: "" }))
                }
              }}
              maxLength={6}
              className={`text-center tracking-widest text-lg ${errors.otp ? "border-red-500" : ""}`}
              placeholder="------"
              disabled={isLoading || maxRetriesReached}
            />
            {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
              onClick={handleVerifyOtp}
              disabled={isLoading || maxRetriesReached}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-brand-navy text-brand-navy hover:bg-brand-navy/10"
              onClick={handleGoBack}
              disabled={isLoading || maxRetriesReached}
            >
              Back
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              {otpTimer > 0 ? (
                <span className="text-brand-navy font-medium">Resend in {otpTimer}s</span>
              ) : (
                <button
                  type="button"
                  className={`text-brand-coral hover:text-brand-navy font-medium transition-colors ${
                    otpRetries >= 3 || maxRetriesReached ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || otpRetries >= 3 || isLoading || maxRetriesReached}
                >
                  Resend OTP
                </button>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-2">{otpRetries > 0 && `Resent ${otpRetries}/3 times`}</p>
          </div>
        </div>
      )}
    </>
  )
}
