export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div>
          <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse mb-1"></div>
          <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            {i % 2 !== 0 && (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2 shrink-0"></div>
            )}
            <div 
              className={`max-w-[80%] p-4 rounded-lg ${
                i % 2 === 0 ? 'rounded-tr-none bg-gray-200 animate-pulse' : 'rounded-tl-none bg-gray-200 animate-pulse'
              }`}
            >
              <div className="h-4 w-full bg-gray-300 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-300 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-4/6 bg-gray-300 rounded-md animate-pulse"></div>
            </div>
            {i % 2 === 0 && (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse ml-2 shrink-0"></div>
            )}
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="border-t p-4">
        <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
} 