import Image from "next/image"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-navy to-brand-coral relative">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md text-white">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QLEZpPlECWtj3bIM6kVOkaj25Bmai.png"
              alt="Sahasra Logo"
              width={80}
              height={80}
              className="mb-8"
            />
            <h2 className="text-3xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-lg opacity-90">
              Don't worry, it happens to the best of us. Let's get you back into your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QLEZpPlECWtj3bIM6kVOkaj25Bmai.png"
                alt="Sahasra Logo"
                width={50}
                height={50}
                className="md:hidden"
              />
            </div>
            <h1 className="text-2xl font-bold text-brand-navy">Reset your password</h1>
            <p className="text-gray-600 mt-2">Follow the steps to create a new password</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  )
}
