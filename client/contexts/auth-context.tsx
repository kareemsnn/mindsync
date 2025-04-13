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
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        
        if (currentSession?.user) {
          await refreshUserData(currentSession.user)
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
              await refreshUserData(newSession.user)
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
    refreshUserData is a function that fetches the user's profile data from the profiles table.
    It is used to refresh the user's data when the user is signed in.
  */
  const refreshUserData = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }
      
      // If no profile found but user exists, create a default profile
      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: supabaseUser.id,
            email: supabaseUser.email,
          })
        
        if (insertError) {
          console.error('Error creating default profile:', insertError)
        } else {
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', supabaseUser.id)
            .maybeSingle()
          
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email,
            profile: newProfile || null,
          })
          return
        }
      }
      
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        profile: profile || null,
      })
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  /* 
    login is a function that logs the user in using the supabase auth service.
  */
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Auth signin error:', error)
        return { error }
      }
      
      // Check if profile exists
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()
      
      // Create profile if it doesn't exist
      if (!profile && !fetchError) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email
          })
          
        if (insertError) {
          console.error('Error creating profile on login:', insertError)
        }
      } else if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for profile on login:', fetchError)
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
    register is a function that registers a new user using the supabase auth service.
  */
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    
    try {
      // First sign up the user with Supabase Auth
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
        console.error('Auth signup error:', error)
        return { error }
      }
      
      if (!data.user) {
        return { error: new Error('User creation failed') }
      }
      
      // Check if profile already exists to avoid duplicate creation
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()
      // Only create a profile if it doesn't exist yet and there was no network error
      if (!existingProfile && !fetchError) {
        console.log("name", name)
        // Create the profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: email,
            full_name: name 
          })
        
        if (profileError) {
          console.error('Error creating profile during registration:', profileError)
          return { error: new Error('Profile creation failed') }
        }
      } else if (fetchError && fetchError.code !== 'PGRST116') {
        // Log other fetch errors that aren't just "no rows returned"
        console.error('Error checking for existing profile:', fetchError)
      }
      
      return { error: null }
    } catch (err) {
      console.error('Registration error:', err)
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
      // Add debug logging for image data
      if (data.image_url) {
        console.log("Updating profile with image_url, length:", data.image_url.length);
        // Log the first and last few characters
        const truncatedUrl = data.image_url.substring(0, 50) + "..." + data.image_url.substring(data.image_url.length - 10);
        console.log("Image URL starts with:", truncatedUrl);
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error updating profile:', error)
        return
      }
      
      if (session?.user) {
        await refreshUserData(session.user)
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
