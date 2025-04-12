import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-200 to-sky-100 flex items-center justify-center p-4">
      <div className="bg-white/70 backdrop-blur-md p-12 rounded-lg shadow-lg border border-white/50 flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
        <p className="mt-4 text-sky-700 font-medium">Loading your profile...</p>
      </div>
    </div>
  )
} 