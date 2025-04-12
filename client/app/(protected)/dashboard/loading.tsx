import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-5 w-72 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-36 bg-gray-200 rounded-md animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 w-full bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 