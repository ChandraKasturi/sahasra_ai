export default function FilesLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
      <div className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
