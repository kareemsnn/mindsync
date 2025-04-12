export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-72 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="flex h-[calc(100vh-200px)] gap-4">
        {/* Sidebar */}
        <div className="hidden md:block w-72 border rounded-lg">
          <div className="p-4 border-b">
            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="p-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-3 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 border rounded-lg flex flex-col">
          <div className="border-b p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                  <div className="h-16 w-48 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
