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
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        
        if (currentSession?.user) {
          await fetchUserProfile(currentSession.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }

      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession)
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            setIsLoading(true)
            try {
              await fetchUserProfile(newSession.user)
            } finally {
              setIsLoading(false)
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
    setIsLoading(true)
    
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
    } finally {
      setIsLoading(false)
    }
  }

  /* 
    register is a function that registers a new user using the supabase auth service
    and creates their profile directly in the profiles table.
  */
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    
    try {
      console.log('Attempting to register user with email:', email)
      
      // Step 1: Create the user account using the built-in Supabase Auth API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      })
      
      if (authError) {
        console.error('Auth signup error:', authError)
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          code: authError.code,
          details: JSON.stringify(authError, null, 2)
        })
        return { error: authError }
      }
      
      if (!authData || !authData.user) {
        console.error('Auth signup failed: No user returned')
        return { error: new Error('User creation failed') }
      }
      
      console.log('Auth signup successful, creating profile...')
      
      // Step 2: Create the profile directly in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: name,
          email: email,
          is_onboarded: false,
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { error: profileError }
      }
      
      console.log('Profile created successfully')
      
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
    } finally {
      setIsLoading(false)
    }
  }

  /* 
    logout is a function that logs the user out using the supabase auth service.
  */
  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setIsLoading(false)
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
        isLoading,
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
