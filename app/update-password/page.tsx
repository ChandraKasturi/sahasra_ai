"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ArrowLeft, KeyRoundIcon, CheckCircleIcon, Eye, EyeOff } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config";

function UpdatePasswordFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast: useToastToast } = useToast();

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token.");
      useToastToast({
        title: "Error",
        description: "Invalid or missing reset token. Please request a new password reset link.",
        variant: "destructive",
      });
    }
  }, [token, useToastToast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!token) {
      useToastToast({
        title: "Error",
        description: "Missing token. Cannot update password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      useToastToast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please re-enter.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) { // Basic password strength, adjust as needed
      useToastToast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.UPDATE_PASSWORD), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, token }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Password Updated Successfully You May Login Now");
        useToastToast({
          title: "Success",
          description: data.message || "Password updated successfully!",
        });
        setIsSuccess(true);
      } else {
        // Normalize the error message, removing "return" if present
        const errorMessage = (data.message || "An error occurred.").replace(/^return\s*"?|"?$/g, "").trim();
        setMessage(errorMessage);
        useToastToast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update password error:", error);
      setMessage("An unexpected error occurred. Please try again later.");
      useToastToast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Password Updated!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {message || "Your password has been updated successfully."}
        </p>
        <div className="mt-6">
          <Link href="/sign-in">
            <Button className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-800">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Update Your Password
        </h2>
        {!token && message && (
          <p className="mt-2 text-center text-sm text-red-500 dark:text-red-400">
            {message}
          </p>
        )}
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">New Password</label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !token}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
            <div className="relative">
              <Input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !token}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-800"
            disabled={isLoading || !token || !password || !confirmPassword}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
      {message && !isSuccess && (
        <p className={`mt-4 text-center text-sm ${message.toLowerCase().includes("error") || message.toLowerCase().includes("wrong") || message.toLowerCase().includes("invalid") ? "text-red-500" : "text-green-500"} dark:text-gray-300`}>
          {message}
        </p>
      )}
      <div className="mt-4 text-center text-sm">
        <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Suspense fallback={<div>Loading token...</div>}>
        <UpdatePasswordFormComponent />
      </Suspense>
    </div>
  );
} 