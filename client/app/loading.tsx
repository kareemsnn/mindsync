import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-handwriting">mindsync</h1>
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    </div>
  )
}
