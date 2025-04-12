"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  onboardingComplete: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  completeOnboarding: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("mindsync_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("mindsync_user", JSON.stringify(user))
    }
  }, [user])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data - in a real app, this would come from your backend
    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      onboardingComplete: Math.random() > 0.5, // Randomly determine if onboarding is complete
    }

    setUser(mockUser)
    setIsLoading(false)
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data - in a real app, this would come from your backend
    const mockUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      onboardingComplete: false, // New users need to complete onboarding
    }

    setUser(mockUser)
    setIsLoading(false)
  }

  const logout = () => {
    localStorage.removeItem("mindsync_user")
    setUser(null)
  }

  const completeOnboarding = () => {
    if (user) {
      setUser({
        ...user,
        onboardingComplete: true,
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
