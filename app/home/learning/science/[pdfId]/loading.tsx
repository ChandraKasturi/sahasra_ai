import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8">
      {/* PDF Info Banner Skeleton */}
      <Skeleton className="w-full h-16 mb-4 rounded-lg" />

      {/* Chat Container Skeleton */}
      <Card className="flex-1 mb-4 border-gray-200">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="space-y-4 flex-1">
            <Skeleton className="w-3/4 h-16 rounded-lg" />
            <div className="flex justify-end">
              <Skeleton className="w-1/2 h-12 rounded-lg" />
            </div>
            <Skeleton className="w-3/4 h-16 rounded-lg" />
          </div>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <Skeleton className="w-full h-10 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
