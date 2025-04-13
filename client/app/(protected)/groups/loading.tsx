export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-72 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="h-9 w-28 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-9 w-28 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="h-5 w-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="flex -space-x-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-8 w-8 rounded-full bg-gray-200 animate-pulse border-2 border-background"></div>
                  ))}
                </div>
              </div>
              <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  )
} 