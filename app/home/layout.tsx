import type React from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"

// Create a simple loading component for the sidebar
function SidebarLoading() {
  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  )
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<SidebarLoading />}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
