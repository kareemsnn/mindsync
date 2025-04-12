import { Loader2 } from "lucide-react"
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

      <div className="space-y-6">
        {/* Profile Header Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1 text-center md:text-left">
                <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                <div className="h-4 w-36 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-6 w-36 bg-gray-200 rounded-md animate-pulse mb-4"></div>
            <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
          </CardContent>
        </Card>

        {/* Interests & Traits Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="h-6 w-36 bg-gray-200 rounded-md animate-pulse mb-4"></div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 