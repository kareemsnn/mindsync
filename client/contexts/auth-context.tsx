"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { Tables } from "@/database.types"

type UserProfile = Tables<"profiles">

type UserData = {
  id: string
  email: string | undefined
  name: string | undefined
  avatar?: string
  profile: UserProfile | null
}

type AuthContextType = {
  user: UserData | null
  session: Session | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (name: string, email: string, password: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      
      if (currentSession?.user) {
        await refreshUserData(currentSession.user)
      }
      setIsLoading(false)

      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession)
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            await refreshUserData(newSession.user)
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
  
  // Function to fetch user profile data from the profiles table
  const refreshUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch user profile from public.profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
      }
      
      // Create user data object combining auth and profile data
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: profile?.email?.split('@')[0] || supabaseUser.email?.split('@')[0] || 'User',
        avatar: profile?.image_url || undefined,
        profile: profile || null
      })
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      // Sign in to Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error }
      }
      
      // Check if profile exists for this user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      // If no profile exists, create one
      if (profileError && profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email
          })
          
        if (insertError) {
          console.error('Error creating profile on login:', insertError)
        }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Login error:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error during login') }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    
    try {
      // Step 1: Create the user in auth.users
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })
      
      if (error) {
        return { error }
      }
      
      if (!data.user) {
        return { error: new Error('User creation failed') }
      }
      
      // Step 2: Create a profile in public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: email
        })
      
      if (profileError) {
        console.error('Error creating profile during registration:', profileError)
        // Consider handling this error - possibly delete the auth user or notify admin
        return { error: new Error('Profile creation failed') }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Registration error:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error during registration') }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }
  
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error updating profile:', error)
        return
      }
      
      // Refresh user data
      if (session?.user) {
        await refreshUserData(session.user)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        isLoading, 
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
