"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { User, Camera, Info, CheckCircle, AlertTriangle, Loader2, PenLine } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Client component that contains all the account page functionality
function AccountPageContent() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // User profile state
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "9876543210",
    board: "CBSE",
    class: "10",
    plan: "Trial", // Trial, Basic, Pro, ProMax
  })

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(profile.name)
  const [isChangingPlan, setIsChangingPlan] = useState(false)

  // OTP states
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpRetries, setOtpRetries] = useState(0)
  const [maxRetriesReached, setMaxRetriesReached] = useState(false)
  const [verificationField, setVerificationField] = useState<"phone" | "email" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  // Handle profile picture upload
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)

      // Simulate upload delay
      setTimeout(() => {
        const reader = new FileReader()
        reader.onload = (event) => {
          setProfilePicture(event.target?.result as string)
          setIsUploading(false)

          toast({
            variant: "success",
            title: "Profile picture updated",
            description: "Your profile picture has been updated successfully.",
            icon: <CheckCircle className="h-5 w-5" />,
          })
        }
        reader.readAsDataURL(file)
      }, 1500)
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Handle name update
  const handleNameUpdate = () => {
    if (newName.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Name must be at least 3 characters long.",
        icon: <AlertTriangle className="h-5 w-5" />,
      })
      return
    }

    setProfile({ ...profile, name: newName })
    setIsEditingName(false)

    toast({
      variant: "success",
      title: "Name updated",
      description: "Your name has been updated successfully.",
      icon: <CheckCircle className="h-5 w-5" />,
    })
  }

  // Open phone verification dialog
  const openPhoneVerification = () => {
    setIsVerifyingPhone(true)
    setNewPhone("")
    setOtp("")
    setOtpSent(false)
    setOtpTimer(0)
    setOtpRetries(0)
    setMaxRetriesReached(false)
    setVerificationField("phone")
  }

  // Open email verification dialog
  const openEmailVerification = () => {
    setIsVerifyingEmail(true)
    setNewEmail("")
    setOtp("")
    setOtpSent(false)
    setOtpTimer(0)
    setOtpRetries(0)
    setMaxRetriesReached(false)
    setVerificationField("email")
  }

  // Open plan change dialog
  const openPlanChangeDialog = () => {
    setIsChangingPlan(true)
  }

  // Handle plan change
  const handlePlanChange = (newPlan: string) => {
    setProfile({ ...profile, plan: newPlan })
    setIsChangingPlan(false)

    toast({
      variant: "success",
      title: "Plan updated",
      description: `Your subscription has been updated to ${newPlan}.`,
      icon: <CheckCircle className="h-5 w-5" />,
    })
  }

  // Handle OTP send
  const handleSendOtp = async (field: "phone" | "email") => {
    if (otpRetries >= 3) {
      setMaxRetriesReached(true)
      return
    }

    setIsLoading(true)
    setVerificationField(field)

    // Validate input
    if (field === "phone" && (!/^[0-9]{10}$/.test(newPhone) || newPhone === profile.phone)) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description:
          field === "phone" && newPhone === profile.phone
            ? "New phone number must be different from current one."
            : "Please enter a valid 10-digit phone number.",
        icon: <AlertTriangle className="h-5 w-5" />,
      })
      setIsLoading(false)
      return
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail) || newEmail === profile.email) {
        toast({
          variant: "destructive",
          title: "Invalid email",
          description:
            field === "email" && newEmail === profile.email
              ? "New email must be different from current one."
              : "Please enter a valid email address.",
          icon: <AlertTriangle className="h-5 w-5" />,
        })
        setIsLoading(false)
        return
      }
    }

    // Prepare the request payload
    const payload = {
      phonenumber: field === "phone" ? newPhone : profile.phone,
      email: field === "email" ? newEmail : profile.email,
    }

    // Simulate API call
    setTimeout(() => {
      setOtpSent(true)
      setOtpTimer(30)
      setOtpRetries((prev) => prev + 1)

      toast({
        variant: "success",
        title: "OTP Sent",
        description: `A verification code has been sent to your ${field === "phone" ? "phone" : "email"}.`,
        icon: <CheckCircle className="h-5 w-5" />,
      })

      setIsLoading(false)
    }, 1500)
  }

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (otpRetries >= 3) {
      setMaxRetriesReached(true)
      return
    }

    setIsLoading(true)

    // Prepare the request payload
    const payload = {
      phonenumber: verificationField === "phone" ? newPhone : profile.phone,
      email: verificationField === "email" ? newEmail : profile.email,
    }

    // Simulate API call
    setTimeout(() => {
      setOtpTimer(30)
      setOtpRetries((prev) => prev + 1)

      toast({
        variant: "success",
        title: "OTP Resent",
        description: `A new verification code has been sent to your ${
          verificationField === "phone" ? "phone" : "email"
        }.`,
        icon: <CheckCircle className="h-5 w-5" />,
      })

      setIsLoading(false)
    }, 1500)
  }

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        icon: <AlertTriangle className="h-5 w-5" />,
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (verificationField === "phone") {
        setProfile({ ...profile, phone: newPhone })
        setIsVerifyingPhone(false)
      } else if (verificationField === "email") {
        setProfile({ ...profile, email: newEmail })
        setIsVerifyingEmail(false)
      }

      setOtp("")
      setOtpSent(false)
      setVerificationField(null)
      setOtpRetries(0)

      toast({
        variant: "success",
        title: "Verification successful",
        description: `Your ${verificationField === "phone" ? "phone number" : "email"} has been updated successfully.`,
        icon: <CheckCircle className="h-5 w-5" />,
      })

      setIsLoading(false)
    }, 1500)
  }

  // Reset verification state
  const resetVerification = () => {
    setOtp("")
    setOtpSent(false)
    setVerificationField(null)
    setNewPhone("")
    setNewEmail("")
    setIsVerifyingPhone(false)
    setIsVerifyingEmail(false)
    setOtpRetries(0)
    setMaxRetriesReached(false)
  }

  // Dismiss the max retries alert
  const dismissMaxRetriesAlert = () => {
    setMaxRetriesReached(false)
  }

  // Get plan badge color
  const getPlanBadgeColor = () => {
    switch (profile.plan) {
      case "Trial":
        return "bg-gray-200 text-gray-800"
      case "Basic":
        return "bg-blue-100 text-blue-800"
      case "Pro":
        return "bg-purple-100 text-purple-800"
      case "ProMax":
        return "bg-gradient-to-r from-brand-navy to-brand-coral text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <User className="h-8 w-8 text-brand-navy" />
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Picture Card */}
        <Card className="md:col-span-1 border-brand-coral/70 border-2 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-brand-navy to-brand-coral border-b border-brand-coral/50">
            <CardTitle className="text-lg text-white">Profile Picture</CardTitle>
            <CardDescription className="text-white/80">Update your profile picture</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-brand-coral/30 shadow-md">
                <AvatarImage src={profilePicture || "/placeholder.svg?height=128&width=128"} />
                <AvatarFallback className="text-3xl bg-brand-navy text-white">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-brand-coral text-white p-2 rounded-full shadow-md hover:bg-brand-navy transition-colors"
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureUpload}
            />

            <Button variant="outline" onClick={triggerFileInput} disabled={isUploading} className="w-full">
              {isUploading ? "Uploading..." : "Change Picture"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card className="md:col-span-2 border-brand-navy/70 border-2 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-brand-navy to-brand-coral border-b border-brand-navy/50">
            <CardTitle className="text-lg text-white">Account Information</CardTitle>
            <CardDescription className="text-white/80">Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-md font-medium mb-3 text-brand-navy">Personal Information</h3>

              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">
                    Full Name
                  </Label>
                  <div className="flex items-center gap-2">
                    {isEditingName ? (
                      <>
                        <Input
                          id="name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleNameUpdate} className="bg-brand-navy hover:bg-brand-navy/90">
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingName(false)
                            setNewName(profile.name)
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 py-2 px-3 border border-brand-navy/20 rounded-md bg-gradient-to-r from-white to-brand-coral/5">
                          {profile.name}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingName(true)
                            setNewName(profile.name)
                          }}
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Education Board */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="board" className="text-sm text-muted-foreground">
                      Education Board
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Info about changing board</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contact Support to change the Board. We are open 24/7</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex-1 py-2 px-3 border border-brand-navy/20 rounded-md bg-gradient-to-r from-white to-brand-coral/5">
                    {profile.board}
                  </div>
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="class" className="text-sm text-muted-foreground">
                      Class/Grade
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Info about changing class</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Contact Support to change the Class. We are open 24/7</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex-1 py-2 px-3 border border-brand-navy/20 rounded-md bg-gradient-to-r from-white to-brand-coral/5">
                    Class {profile.class}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-brand-navy/20 via-brand-coral/30 to-brand-navy/20" />

            {/* Contact Information */}
            <div>
              <h3 className="text-md font-medium mb-3 text-brand-navy">Contact Information</h3>

              <div className="space-y-4">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-muted-foreground">
                    Phone Number
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 py-2 px-3 border border-brand-navy/20 rounded-md bg-gradient-to-r from-white to-brand-coral/5">
                      {profile.phone}
                    </div>
                    <Button size="sm" variant="ghost" onClick={openPhoneVerification}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 py-2 px-3 border border-brand-navy/20 rounded-md bg-gradient-to-r from-white to-brand-coral/5">
                      {profile.email}
                    </div>
                    <Button size="sm" variant="ghost" onClick={openEmailVerification}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-brand-navy/20 via-brand-coral/30 to-brand-navy/20" />

            {/* Subscription */}
            <div>
              <h3 className="text-md font-medium mb-3 text-brand-navy">Subscription</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="plan" className="text-sm text-muted-foreground">
                    Current Plan
                  </Label>
                  <Button size="sm" variant="ghost" onClick={openPlanChangeDialog}>
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getPlanBadgeColor()}>{profile.plan}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {profile.plan === "Trial" && "Your trial expires in 14 days"}
                  {profile.plan === "Basic" && "Basic features with limited access"}
                  {profile.plan === "Pro" && "Full access to all features"}
                  {profile.plan === "ProMax" && "Premium access with priority support"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phone Verification Dialog */}
      <Dialog open={isVerifyingPhone} onOpenChange={setIsVerifyingPhone}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Phone Number</DialogTitle>
            <DialogDescription>Enter your new phone number and verify with OTP</DialogDescription>
          </DialogHeader>

          {maxRetriesReached && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-800">Maximum retries reached</h4>
              </div>
              <p className="mt-1 text-sm text-red-700 pl-7">
                You've reached the maximum number of OTP retries. Please contact our support at support@sahasra.ai for
                assistance.
              </p>
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-phone">New Phone Number</Label>
                <Input
                  id="new-phone"
                  placeholder="Enter 10-digit phone number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={maxRetriesReached}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-center mb-4">
                <div className="bg-brand-coral/10 inline-block rounded-full p-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-brand-coral" />
                </div>
                <h2 className="text-lg font-semibold text-brand-navy">Verify Your Phone</h2>
                <p className="text-sm text-gray-600">We've sent a 6-digit code to {newPhone}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center tracking-widest text-lg"
                  placeholder="------"
                  disabled={maxRetriesReached}
                />
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

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button type="button" variant="outline" onClick={resetVerification}>
              Cancel
            </Button>

            {!otpSent ? (
              <Button
                type="button"
                onClick={() => handleSendOtp("phone")}
                disabled={isLoading || maxRetriesReached}
                className="bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
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
            ) : (
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || maxRetriesReached}
                className="bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Update"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog open={isVerifyingEmail} onOpenChange={setIsVerifyingEmail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Email Address</DialogTitle>
            <DialogDescription>Enter your new email address and verify with OTP</DialogDescription>
          </DialogHeader>

          {maxRetriesReached && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-800">Maximum retries reached</h4>
              </div>
              <p className="mt-1 text-sm text-red-700 pl-7">
                You've reached the maximum number of OTP retries. Please contact our support at support@sahasra.ai for
                assistance.
              </p>
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="Enter your new email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={maxRetriesReached}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-center mb-4">
                <div className="bg-brand-coral/10 inline-block rounded-full p-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-brand-coral" />
                </div>
                <h2 className="text-lg font-semibold text-brand-navy">Verify Your Email</h2>
                <p className="text-sm text-gray-600">We've sent a 6-digit code to {newEmail}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center tracking-widest text-lg"
                  placeholder="------"
                  disabled={maxRetriesReached}
                />
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

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button type="button" variant="outline" onClick={resetVerification}>
              Cancel
            </Button>

            {!otpSent ? (
              <Button
                type="button"
                onClick={() => handleSendOtp("email")}
                disabled={isLoading || maxRetriesReached}
                className="bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
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
            ) : (
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading || maxRetriesReached}
                className="bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Update"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      <Dialog open={isChangingPlan} onOpenChange={setIsChangingPlan}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>Select a new subscription plan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  profile.plan === "Trial"
                    ? "border-brand-coral bg-brand-coral/5"
                    : "border-gray-200 hover:border-brand-coral/50 hover:bg-brand-coral/5"
                }`}
                onClick={() => handlePlanChange("Trial")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Trial</h3>
                    <p className="text-sm text-muted-foreground">Free for 14 days</p>
                  </div>
                  {profile.plan === "Trial" && <CheckCircle className="h-5 w-5 text-brand-coral" />}
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  profile.plan === "Basic"
                    ? "border-brand-coral bg-brand-coral/5"
                    : "border-gray-200 hover:border-brand-coral/50 hover:bg-brand-coral/5"
                }`}
                onClick={() => handlePlanChange("Basic")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Basic</h3>
                    <p className="text-sm text-muted-foreground">₹499/month</p>
                  </div>
                  {profile.plan === "Basic" && <CheckCircle className="h-5 w-5 text-brand-coral" />}
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  profile.plan === "Pro"
                    ? "border-brand-coral bg-brand-coral/5"
                    : "border-gray-200 hover:border-brand-coral/50 hover:bg-brand-coral/5"
                }`}
                onClick={() => handlePlanChange("Pro")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Pro</h3>
                    <p className="text-sm text-muted-foreground">₹999/month</p>
                  </div>
                  {profile.plan === "Pro" && <CheckCircle className="h-5 w-5 text-brand-coral" />}
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  profile.plan === "ProMax"
                    ? "border-brand-coral bg-brand-coral/5"
                    : "border-gray-200 hover:border-brand-coral/50 hover:bg-brand-coral/5"
                }`}
                onClick={() => handlePlanChange("ProMax")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Pro Max</h3>
                    <p className="text-sm text-muted-foreground">₹1499/month</p>
                  </div>
                  {profile.plan === "ProMax" && <CheckCircle className="h-5 w-5 text-brand-coral" />}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsChangingPlan(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Wrap the client component in a Suspense boundary
export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  )
}
