import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-72 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="flex mt-2 mb-6 gap-4">
        <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-4"></div>
          
          {/* Form fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-24 w-full bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-end">
              <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 