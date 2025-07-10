"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

type Step = "identifier" | "otp" | "reset" | "success"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<Step>("identifier")
  const [isLoading, setIsLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    identifier: "",
    otp: ["", "", "", "", "", ""],
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    identifier: "",
    otp: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (currentStep === "otp" && resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      setResendDisabled(false)
      setCountdown(30)
    }
    return () => clearTimeout(timer)
  }, [currentStep, resendDisabled, countdown])

  const validateIdentifier = () => {
    if (!formData.identifier) {
      setErrors((prev) => ({ ...prev, identifier: "Email or mobile number is required" }))
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const mobileRegex = /^[0-9]{10}$/
    if (!emailRegex.test(formData.identifier) && !mobileRegex.test(formData.identifier)) {
      setErrors((prev) => ({
        ...prev,
        identifier: "Please enter a valid email or 10-digit mobile number",
      }))
      return false
    }
    setErrors((prev) => ({ ...prev, identifier: "" }))
    return true
  }

  const validateOTP = () => {
    const otpValue = formData.otp.join("")
    if (otpValue.length !== 6 || !/^[0-9]+$/.test(otpValue)) {
      setErrors((prev) => ({ ...prev, otp: "Please enter a valid 6-digit OTP" }))
      return false
    }
    setErrors((prev) => ({ ...prev, otp: "" }))
    return true
  }

  const validatePassword = () => {
    let isValid = true
    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "New password is required" }))
      isValid = false
    } else if (formData.password.length < 8) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters" }))
      isValid = false
    } else {
      setErrors((prev) => ({ ...prev, password: "" }))
    }

    if (!formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Please confirm your new password" }))
      isValid = false
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      isValid = false
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }))
    }
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value && !/^[0-9]+$/.test(value)) return
    const newOTP = [...formData.otp]
    newOTP[index] = value
    setFormData((prev) => ({ ...prev, otp: newOTP }))
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }))
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    if (pastedData.length <= 6 && /^[0-9]+$/.test(pastedData)) {
      const newOTP = [...formData.otp]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOTP[i] = pastedData[i]
      }
      setFormData((prev) => ({ ...prev, otp: newOTP }))
      const nextEmptyIndex = newOTP.findIndex((digit) => !digit)
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
      document.getElementById(`otp-${focusIndex}`)?.focus()
    }
  }

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!validateIdentifier()) return

    setIsLoading(true)
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.FORGOT_PASSWORD), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobilenumberoremail: formData.identifier }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "OTP Sent",
          description: data.message || `An OTP has been sent to ${formData.identifier}. Please check.`,
          variant: "success",
        })
        setCurrentStep("otp")
        setResendDisabled(true)
        setCountdown(30)
      } else {
        setErrors((prev) => ({ ...prev, identifier: data.message || "Failed to send OTP. Please try again." }))
        toast({ title: "Error", description: data.message || "Failed to send OTP.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Request OTP error:", error)
      setErrors((prev) => ({ ...prev, identifier: "An unexpected error occurred." }))
      toast({ title: "Error", description: "An unexpected error occurred while requesting OTP.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateOTP()) return

    setCurrentStep("reset")
    setErrors(prev => ({ ...prev, otp: "" }))
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setIsLoading(true)
    const otpValue = formData.otp.join("")

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPDATE_PASSWORD), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: formData.password, token: otpValue }),
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Password Updated",
          description: data.message || "Password updated successfully! You may now sign in.",
          variant: "success",
        })
        setCurrentStep("success")
      } else {
        const errorMessage = (data.message || "error OTP is Wrong or Expired.").replace(/^return\s*\"?|\"?$/g, "").trim()
        setErrors((prev) => ({ ...prev, confirmPassword: errorMessage }))
        toast({ title: "Update Failed", description: errorMessage, variant: "destructive" })
      }
    } catch (error) {
      console.error("Reset password error:", error)
      setErrors((prev) => ({ ...prev, confirmPassword: "An unexpected error occurred." }))
      toast({ title: "Error", description: "An unexpected error occurred while updating password.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const renderIdentifierStep = () => (
    <form onSubmit={handleRequestOTP} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="identifier">Email or Mobile Number</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          placeholder="Enter your email or mobile number"
          value={formData.identifier}
          onChange={handleChange}
          className={errors.identifier ? "border-red-500" : ""}
          disabled={isLoading}
        />
        {errors.identifier && <p className="text-sm text-red-500 pt-1">{errors.identifier}</p>}
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending OTP...
          </>
        ) : (
          "Request OTP"
        )}
      </Button>
      <div className="text-center">
        <Link
          href="/signin"
          className="flex items-center justify-center text-sm text-brand-coral hover:text-brand-navy transition-colors"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to Sign In
        </Link>
      </div>
    </form>
  )

  const renderOTPStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="otp-0">Enter Verification Code</Label>
          <button
            type="button"
            onClick={() => {
              setCurrentStep("identifier")
              setErrors({ identifier: "", otp: "", password: "", confirmPassword: "" })
            }}
            className="flex items-center text-sm text-gray-500 hover:text-brand-navy"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </button>
        </div>
        <p className="text-sm text-gray-500">We've sent a 6-digit code to {formData.identifier}</p>
        <div className="flex justify-between gap-2 mt-4">
          {formData.otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleOTPKeyDown(index, e)}
              onPaste={index === 0 ? handleOTPPaste : undefined}
              className={`w-10 h-10 md:w-12 md:h-12 text-center text-lg ${errors.otp ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
          ))}
        </div>
        {errors.otp && <p className="text-sm text-red-500 pt-1">{errors.otp}</p>}
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={() => {
              if (!resendDisabled) handleRequestOTP()
            }}
            className={`font-medium ${resendDisabled ? "text-gray-400 cursor-not-allowed" : "text-brand-coral hover:text-brand-navy cursor-pointer"}`}
            disabled={resendDisabled || isLoading}
          >
            {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
          </button>
        </p>
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
        disabled={isLoading || formData.otp.join("").length !== 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Proceeding...
          </>
        ) : (
          "Proceed to Reset Password"
        )}
      </Button>
    </form>
  )

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">New Password</Label>
          <button
            type="button"
            onClick={() => {
              setCurrentStep("otp")
              setErrors({ identifier: "", otp: "", password: "", confirmPassword: "" })
            }}
            className="flex items-center text-sm text-gray-500 hover:text-brand-navy"
          >
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your new password (min. 8 characters)"
            value={formData.password}
            onChange={handleChange}
            className={`${errors.password ? "border-red-500" : ""} pr-10`}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-500 pt-1">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`${errors.confirmPassword ? "border-red-500" : ""} pr-10`}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-red-500 pt-1">{errors.confirmPassword}</p>}
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Password...
          </>
        ) : (
          "Update Password"
        )}
      </Button>
    </form>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-brand-navy">Password Updated Successfully!</h3>
      <p className="text-gray-600 mt-2">You can now sign in with your new password.</p>
      <Button asChild className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90">
        <Link href="/signin">Go to Sign In</Link>
      </Button>
    </div>
  )

  return (
    <div>
      {currentStep === "identifier" && renderIdentifierStep()}
      {currentStep === "otp" && renderOTPStep()}
      {currentStep === "reset" && renderResetStep()}
      {currentStep === "success" && renderSuccessStep()}
    </div>
  )
}
