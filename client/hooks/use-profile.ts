import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { resizeAndCompressImage, convertFileToBase64, hexToDataUrl } from '@/utils/fileUtils'

// Define the personality traits vector interface 
export interface PersonalityTraitsVector {
  personality_results: {
    // Full trait names
    agreeableness?: number;
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    neuroticism?: number;
    // Single character keys (OCEAN)
    O?: number;
    C?: number;
    E?: number;
    A?: number;
    N?: number;
    // Allow string indexing for dynamic access
    [key: string]: number | undefined;
  }
}

export type ProfileData = {
  bio: string | null
  full_name: string | null
  interests: string[] | null
  describe: string[] | null
  image_url: string | null
  traits_vector: any | null // Keep as any to match database type but cast when needed
  // Additional property for displaying image in UI
  displayImageUrl?: string
}

export type UpdateProfileData = Partial<ProfileData>

export const useProfile = () => {
  const { user } = useAuth()
  const userId = user?.id
  const queryClient = useQueryClient()
  
  // Local states for image upload
  const [isUploading, setIsUploading] = useState(false)
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string>("")
  
  // Profile data query
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        
      if (error) throw error
      
      // Process the image_url to convert it to a usable format if it exists
      let processedData: ProfileData = { ...data }
      if (data?.image_url) {
        try {
          const dataUrl = hexToDataUrl(data.image_url)
          processedData.displayImageUrl = dataUrl
        } catch (error) {
          console.error("Error processing image data:", error)
          processedData.displayImageUrl = ""
        }
      }
      
      return processedData
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      if (!userId) throw new Error('User ID is required')
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId)
        
      if (error) throw error
      
      return profileData
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      // Don't show toast for image updates as they have their own success messaging
      if (!data.image_url) {
        toast.success('Profile updated successfully')
      }
    },
    onError: (error) => {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  })
  
  // Helper to update profile with proper error handling
  const updateProfile = async (profileData: UpdateProfileData) => {
    try {
      await updateProfileMutation.mutateAsync(profileData)
      return { success: true }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { success: false, error }
    }
  }
  
  // Handle profile image upload
  const uploadProfileImage = async (file: File): Promise<{ success: boolean, error?: any }> => {
    if (!userId) {
      toast.error('User ID is required')
      return { success: false, error: 'User ID is required' }
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return { success: false, error: 'File too large' }
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return { success: false, error: 'Invalid file type' }
    }
    
    setIsUploading(true)
    
    try {
      // Create a temporary URL for immediate display
      if (avatarObjectUrl) {
        // Revoke the old object URL if it exists
        URL.revokeObjectURL(avatarObjectUrl)
      }
      
      const tempUrl = URL.createObjectURL(file)
      setAvatarObjectUrl(tempUrl)
      
      // Skip compression for small files (less than 100KB)
      let imageToConvert = file
      if (file.size > 100 * 1024) {
        console.log("Image is larger than 100KB, performing compression")
        imageToConvert = await resizeAndCompressImage(file)
        console.log("Image compressed from", file.size, "to approximately", imageToConvert.size, "bytes")
      } else {
        console.log("Image is small, skipping compression")
      }
      
      // Convert the image to base64
      console.log("Converting image to base64")
      const base64Image = await convertFileToBase64(imageToConvert)
      const truncatedBase64 = base64Image.substring(0, 50) + "..." + base64Image.substring(base64Image.length - 10)
      console.log("Base64 conversion complete, result:", truncatedBase64, "Length:", base64Image.length)
      
      // Store the base64 data directly
      try {
        // Update the user's profile with the base64 image directly
        console.log("Updating profile with image data")
        await updateProfileMutation.mutateAsync({ image_url: base64Image })
        console.log("Profile update completed successfully")
        
        toast.success("Profile picture updated successfully!")
        return { success: true }
      } catch (updateError) {
        console.error("Error updating profile:", updateError)
        throw updateError
      }
    } catch (error) {
      console.error("Error in image upload process:", error)
      toast.error("Failed to upload image. Please try again.")
      return { success: false, error }
    } finally {
      setIsUploading(false)
    }
  }
  
  // Cleanup function for object URLs
  const cleanupObjectUrl = () => {
    if (avatarObjectUrl) {
      URL.revokeObjectURL(avatarObjectUrl)
      setAvatarObjectUrl("")
    }
  }
  
  return {
    profile,
    isLoading,
    error,
    isUploading,
    isUpdating: updateProfileMutation.isLoading,
    updateProfile,
    uploadProfileImage,
    cleanupObjectUrl,
    avatarObjectUrl
  }
} 