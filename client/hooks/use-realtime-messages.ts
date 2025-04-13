import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'

type Message = Database['public']['Tables']['messages']['Row']
type PartialProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'user_id' | 'email' | 'image_url'>

export type FormattedMessage = {
  id: number
  senderId: string | null
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
}

export const useRealtimeMessages = (groupId: number) => {
  const queryClient = useQueryClient()
  const [realtimeMessages, setRealtimeMessages] = useState<FormattedMessage[]>([])
  
  // Formatting helper function
  const formatMessage = useCallback((
    message: Message, 
    profileMap: Record<string, PartialProfile>
  ): FormattedMessage => {
    const profile = message.user_id ? profileMap[message.user_id] : null
    
    return {
      id: message.id,
      senderId: message.user_id,
      senderName: profile?.email?.split('@')[0] || 'User',
      senderAvatar: profile?.image_url || "/placeholder.svg",
      content: message.content,
      timestamp: message.created_at || new Date().toISOString()
    }
  }, [])

  // Query for initial message loading with caching
  const { 
    data: initialMessages,
    isLoading,
    error
  } = useQuery({
    queryKey: ['messages', groupId],
    queryFn: async () => {
      if (!groupId || groupId <= 0) throw new Error('Valid group ID is required')
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`id, content, created_at, user_id, group_id`)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
      
      if (messagesError) throw messagesError
      
      if (!messagesData || messagesData.length === 0) {
        return []
      }
      
      const userIds = [...new Set(messagesData.map(msg => msg.user_id).filter(Boolean) as string[])]
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, image_url')
        .in('user_id', userIds)
      
      if (profilesError) throw profilesError
      
      const profileMap: Record<string, PartialProfile> = {}
      
      if (profiles) {
        profiles.forEach(profile => {
          if (profile.user_id) {
            profileMap[profile.user_id] = {
              user_id: profile.user_id,
              email: profile.email,
              image_url: profile.image_url
            }
          }
        })
      }
      
      return messagesData.map(msg => formatMessage(msg, profileMap))
    },
    enabled: groupId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes 
  })

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, userId }: { content: string, userId: string }) => {
      if (!content.trim() || !userId || !groupId || groupId <= 0) {
        throw new Error('Missing required fields or invalid group ID')
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          group_id: groupId,
          user_id: userId
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  })

  // Set up realtime subscription
  useEffect(() => {
    if (!groupId || groupId <= 0) return
    if (initialMessages) {
      setRealtimeMessages(initialMessages)
    }

    const channel = supabase
      .channel(`messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          console.log('New message received:', payload)
          const message = payload.new as Message
          
          let profile: PartialProfile | null = null
          
          if (message.user_id) {
            const { data } = await supabase
              .from('profiles')
              .select('email, image_url, user_id')
              .eq('user_id', message.user_id)
              .single()
            
            if (data) {
              profile = {
                user_id: data.user_id,
                email: data.email,
                image_url: data.image_url
              }
            }
          }
          
          const profileMap: Record<string, PartialProfile> = {}
          if (message.user_id && profile) {
            profileMap[message.user_id] = profile
          }

          const formattedMessage = formatMessage(message, profileMap)
          
          setRealtimeMessages(current => [...current, formattedMessage])
    
          queryClient.setQueryData(['messages', groupId], (oldData: FormattedMessage[] | undefined) => {
            if (!oldData) return [formattedMessage]
            return [...oldData, formattedMessage]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, initialMessages, formatMessage, queryClient])

  // Combine the functionality
  const sendMessage = async (content: string, userId: string) => {
    return sendMessageMutation.mutateAsync({ content, userId })
  }

  const messages = realtimeMessages.length > 0 ? realtimeMessages : (initialMessages || [])

  return {
    messages,
    isLoading,
    error: error as Error | null,
    sendMessage
  }
} 