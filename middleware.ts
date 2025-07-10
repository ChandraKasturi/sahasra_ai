import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public paths that don't require authentication
const publicPaths = ["/signin", "/signup", "/forgot-password","/update-password","/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Get the authentication token from cookies
  const authToken = request.cookies.get("auth-token")?.value

  // TEMPORARY: Development bypass - remove before production
  const isDevelopmentBypass =
    process.env.NODE_ENV === "development" && request.cookies.get("dev-bypass")?.value === "true"

  // If the path is not public and there's no auth token, redirect to signin
  // TEMPORARY: Skip redirect if using development bypass
  if (!isPublicPath && !authToken && !isDevelopmentBypass) {
    const signinUrl = new URL("/signin", request.url)
    return NextResponse.redirect(signinUrl)
  }

  // If the user is authenticated and trying to access signin/signup, redirect to home
  if ((authToken || isDevelopmentBypass) && (pathname === "/signin" || pathname === "/signup")) {
    const homeUrl = new URL("/home", request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
