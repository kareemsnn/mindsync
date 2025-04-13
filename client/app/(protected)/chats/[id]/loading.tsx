import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className={`flex ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"} max-w-[80%] gap-2`}>
                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <div>
                  {i % 2 === 0 && <Skeleton className="h-3 w-24 mb-1" />}
                  <Skeleton className={`h-16 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-lg`} />
                  <Skeleton className="h-3 w-12 mt-1 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <Separator />
        <div className="p-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </Card>
    </div>
  )
} 