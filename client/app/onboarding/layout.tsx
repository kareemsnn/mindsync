"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Loading from "@/app/(protected)/loading"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // If no user, redirect to login
    if (!user) {
      router.push("/")
      return
    }

    // If already onboarded, redirect to dashboard
    if (user.profile?.is_onboarded) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <Loading />
  }

  // If no user or already onboarded, don't render children while redirecting
  if (!user || user.profile?.is_onboarded) {
    return null
  }

  return <>{children}</>
} 