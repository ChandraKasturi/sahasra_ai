import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SubjectProgressLoading() {
  return (
    <div className="p-6 space-y-8">
      <Skeleton className="h-10 w-32" />

      <div className="flex flex-col space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="flex space-x-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[350px]">
          <Loader2 className="h-12 w-12 animate-spin text-gray-300" />
        </CardContent>
      </Card>
    </div>
  )
}
