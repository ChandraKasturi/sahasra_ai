export default function MathematicsAssessmentLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="h-4 w-full max-w-md bg-gray-200 rounded animate-pulse mb-8"></div>

      {/* Welcome card skeleton */}
      <div className="h-48 w-full bg-gray-100 rounded-lg animate-pulse mb-8"></div>

      {/* Tabs skeleton */}
      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>

      {/* Bottom card skeleton */}
      <div className="h-40 w-full bg-gray-100 rounded-lg animate-pulse"></div>
    </div>
  )
}
