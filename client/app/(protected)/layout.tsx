"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import { Loader2 } from "lucide-react"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    } else if (!isLoading && user && !user.onboardingComplete && !pathname.includes("/onboarding")) {
      router.push("/onboarding")
    }
  }, [isLoading, user, router, pathname])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <main className="container mx-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
