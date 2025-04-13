"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { Tables } from "@/database.types"

type UserProfile = Tables<"profiles">

type AuthUser = {
  id: string
  email: string | undefined
  profile: UserProfile | null
}

type AuthContextType = {
  user: AuthUser | null
  session: Session | null
  isInitializing: boolean
  isUpdating: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (name: string, email: string, password: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* 
  AuthProvider is a component that provides the auth context to the app.
  It is used to wrap the app in a provider so that the auth context is available to all components.
*/
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      setIsInitializing(true)
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsInitializing(false)
      }

      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession)
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            setIsInitializing(true)
            try {
              await fetchUserProfile(newSession.user)
            } finally {
              setIsInitializing(false)
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    initializeAuth()
  }, [])
  
  /* 
    fetchUserProfile retrieves the user's profile data without creating new profiles
    to avoid race conditions. Profile creation is handled during the registration process.
  */
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }
      
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        profile: profile || null,
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  /* 
    login is a function that logs the user in using the supabase auth service.
  */
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Auth signin error:', error)
        return { error }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Login error:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error during login') }
    }
  }

  /* 
    register is a function that registers a new user using the supabase auth service
    and creates their profile directly in the profiles table.
  */
  const register = async (name: string, email: string, password: string) => {
    try {
      // Sign up the user with Supabase Auth (profile creation is handled by the database trigger)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })
      
      if (error) {
        console.error('Auth signup error:', error)
        console.error('Auth error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: JSON.stringify(error, null, 2)
        })
        return { error }
      }
      
      if (!data || !data.user) {
        console.error('Auth signup failed: No user returned')
        return { error: new Error('User creation failed') }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Registration error:', err)
      // Enhanced catch block logging
      if (err instanceof Error) {
        console.error('Registration error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
          details: JSON.stringify(err, null, 2)
        })
      } else {
        console.error('Non-Error registration exception:', typeof err, err)
      }
      return { error: err instanceof Error ? err : new Error('Unknown error during registration') }
    }
  }

  /* 
    logout is a function that logs the user out using the supabase auth service.
  */
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  /* 
    updateProfile is a function that updates the user's profile data in the profiles table.
  */
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) return
    
    setIsUpdating(true)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error updating profile:', error)
        return
      }
      
      if (session?.user) {
        await fetchUserProfile(session.user)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        isInitializing,
        isUpdating,
        login, 
        register, 
        logout, 
        updateProfile 
      }}
    >
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