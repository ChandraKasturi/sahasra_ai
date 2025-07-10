// Store the authentication token
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    // Store in localStorage for client-side access
    localStorage.setItem("auth-token", token)

    // Also set as a cookie for middleware access
    document.cookie = `auth-token=${token}; path=/; max-age=2592000` // 30 days
  }
}

// Get the stored authentication token
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth-token")
  }
  return null
}

// Remove the authentication token
export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    // Remove from localStorage
    localStorage.removeItem("auth-token")

    // Remove the cookie
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
  }
}

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window !== "undefined") {
    // Check for actual auth token
    const hasAuthToken = !!localStorage.getItem("auth-token")

    // TEMPORARY: Check for development bypass
    const hasDevBypass = document.cookie.includes("dev-bypass=true") && process.env.NODE_ENV === "development"

    return hasAuthToken || hasDevBypass
  }
  return false
}
