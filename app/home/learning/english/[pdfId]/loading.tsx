import { Loader2 } from "lucide-react"

export default function PDFLearningLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-brand-coral" />
        <p className="text-sm text-gray-500">Loading document learning...</p>
      </div>
    </div>
  )
}
