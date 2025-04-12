"use client"

import type React from "react"
import { Suspense } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import Loading from "./loading"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    // Wait until loading is complete
    if (isLoading) return;
    
    // No user? Redirect to homepage
    if (!user) {
      router.push("/");
      return;
    }
    
    // Handle missing profile case (shouldn't happen with our improved auth context)
    if (!user.profile) {
      console.error("User exists but profile is missing");
      return;
    }
    
    const isOnboardingRoute = pathname.includes("/onboarding");
    const isUserOnboarded = Boolean(user.profile.is_onboarded);
    
    // Debug logging
    console.log('Route check:', { 
      isOnboardingRoute, 
      isUserOnboarded, 
      path: pathname,
      profile: user.profile
    });
    
    // Redirect based on onboarding status
    if (isUserOnboarded && isOnboardingRoute) {
      // Onboarded users shouldn't access onboarding
      router.push("/dashboard");
    } else if (!isUserOnboarded && !isOnboardingRoute) {
      // Non-onboarded users must complete onboarding
      router.push("/onboarding");
    }
  }, [isLoading, user, router, pathname])
  if (isLoading) {
    return <Loading />
  }
  if (!user) {
    return null
  }
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <main className="container mx-auto p-4 md:p-6">
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}