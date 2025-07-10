"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { setAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"

export function SignInForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
  })

  const validateForm = () => {
    const newErrors = {
      identifier: "",
      password: "",
    }
    let isValid = true

    // Validate identifier (email or mobile)
    if (!formData.identifier) {
      newErrors.identifier = "Email or mobile number is required"
      isValid = false
    } else {
      // Check if it's an email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      // Check if it's a 10-digit mobile number
      const mobileRegex = /^[0-9]{10}$/

      if (!emailRegex.test(formData.identifier) && !mobileRegex.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid email or 10-digit mobile number"
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

    setErrors(newErrors)
    return isValid
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Prepare the request payload
      const payload = {
        mobilenumberoremail: formData.identifier,
        password: formData.password,
      }

      // Make API call to the server
      const response = await fetch(buildApiUrl(API_ENDPOINTS.LOGIN), {
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

        toast({
          variant: "success",
          title: "Login successful",
          description: "Welcome back to Sahasra!",
          icon: <CheckCircle className="h-5 w-5" />,
        })

        // Redirect to home page
        router.push("/home")
      } else if (response.status === 400) {
        // Login failed
        toast({
          title: "Login failed",
          description: "Invalid email/mobile or password. Please try again.",
          variant: "destructive",
        })
      } else {
        // Other errors
        toast({
          title: "Something went wrong",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Connection error",
        description: "Could not connect to the server. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevBypass = () => {
    // Set a development bypass cookie
    document.cookie = "dev-bypass=true; path=/; max-age=86400" // 24 hours

    toast({
      variant: "success",
      title: "Development bypass activated",
      description: "You can now access protected routes without authentication",
      icon: <CheckCircle className="h-5 w-5" />,
    })

    // Redirect to home page
    router.push("/home")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        {errors.identifier && <p className="text-sm text-red-500">{errors.identifier}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm text-brand-coral hover:text-brand-navy transition-colors">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "border-red-500 pr-10" : "pr-10"}
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
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Don't have an account?</span>{" "}
        <Link href="/signup" className="font-medium text-brand-coral hover:text-brand-navy transition-colors">
          Sign up
        </Link>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8">
        <p>Test credentials:</p>
        <p>Email: test@example.com or Mobile: 9876543210</p>
        <p>Password: Password123</p>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
          <div className="bg-yellow-50 p-3 rounded-md mb-4">
            <p className="text-xs text-yellow-800 font-medium">DEVELOPMENT MODE ONLY</p>
            <p className="text-xs text-yellow-700">This button bypasses authentication for testing purposes.</p>
            <p className="text-xs text-yellow-700 font-bold">Remove before production!</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100"
            onClick={handleDevBypass}
          >
            Bypass Authentication (Dev Only)
          </Button>
        </div>
      )}
    </form>
  )
}
