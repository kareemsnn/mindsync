import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWelcomeMessage } from './use-welcome-message'
import { Database } from '@/database.types'

export type GroupMember = {
  id: number
  user_id: string | null
  profiles?: {
    email: string | null
    image_url: string | null
  }
}

export type Group = Database['public']['Tables']['groups']['Row']

export type GroupWithDetails = Group & {
  members: {
    id: string
    name: string
    avatar: string
  }[]
  messageCount: number
  lastActive: string | null
}

export const useGroups = (userId: string | undefined) => {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')
      
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId)
      
      if (memberError) throw memberError
      
      if (!memberData || memberData.length === 0) {
        return { activeGroups: [], pastGroups: [] }
      }
      
      const groupIds = memberData
        .map(m => m.group_id)
        .filter(id => id !== null) as number[]
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
      
      if (groupsError) throw groupsError
      
      if (!groupsData || groupsData.length === 0) {
        return { activeGroups: [], pastGroups: [] }
      }
      
      const processedGroups = await Promise.all(
        groupsData.map(async (group) => {
          const { data: membersData, error: membersError } = await supabase
            .from('group_members')
            .select('user_id')
            .eq('group_id', group.id)
          
          if (membersError) throw membersError
          
          const userIds = membersData
            .map(m => m.user_id)
            .filter(Boolean) as string[]
          
          let profiles: { user_id: string | null, email: string | null, image_url: string | null }[] = []
          
          if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('user_id, email, image_url')
              .in('user_id', userIds)
              
            if (profilesError) throw profilesError
            if (profilesData) profiles = profilesData
          }
          
          const formattedMembers = membersData.map(member => {
            const profile = profiles.find(p => p.user_id === member.user_id)
            return {
              id: member.user_id || '',
              name: profile?.email?.split('@')[0] || 'User',
              avatar: profile?.image_url || '/placeholder.svg'
            }
          })
          
          const { count: messageCount, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('group_id', group.id)
          
          if (countError) throw countError
          
          const { data: latestMessage, error: latestError } = await supabase
            .from('messages')
            .select('created_at')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
          
          if (latestError) throw latestError
          
          const lastActive = latestMessage && latestMessage.length > 0 
            ? latestMessage[0].created_at
            : null
          
          return {
            id: group.id,
            name: group.name,
            description: group.description,
            members: formattedMembers,
            messageCount: messageCount || 0,
            lastActive,
            expires_at: group.expires_at,
            created_at: group.created_at,
            welcomed: group.welcomed
          }
        })
      )
      
      // Split groups into active and past based on expires_at timestamp
      const now = new Date().getTime()
      
      const activeGroups = processedGroups.filter(group => {
        if (!group.expires_at) return true
        const expiryTime = new Date(group.expires_at).getTime()
        return expiryTime > now
      })
      
      const pastGroups = processedGroups.filter(group => {
        if (!group.expires_at) return false
        const expiryTime = new Date(group.expires_at).getTime()
        return expiryTime <= now
      })
      
      return { activeGroups, pastGroups }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  })

  return {
    activeGroups: data?.activeGroups || [],
    pastGroups: data?.pastGroups || [],
    isLoading,
    error: error as Error | null
  }
}

// For single group data
export const useGroupData = (groupId: number) => {
  const { sendWelcomeMessage } = useWelcomeMessage(groupId.toString());
  
  const {
    data: groupData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (groupId === undefined || groupId === null || groupId <= 0) {
        throw new Error('Valid group ID is required')
      }
      
      const { data: groupInfo, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()
      
      if (groupError) throw groupError
      
      const { count: messageCount, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', groupId)

      if (countError) throw countError

      // If this is a new group that hasn't been welcomed yet, send the welcome message
      if (messageCount === 0 && groupInfo && !groupInfo.welcomed) {
        try {
          await sendWelcomeMessage();
        } catch (err) {
          console.error('Failed to send welcome message:', err);
        }
      }
      
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id
        `)
        .eq('group_id', groupId)
      
      if (membersError) throw membersError
      
      let members: GroupMember[] = []
      
      if (membersData && membersData.length > 0) {
        const userIds = membersData
          .map(member => member.user_id)
          .filter(Boolean) as string[]
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, email, image_url')
            .in('user_id', userIds)
          
          const profileMap = profiles?.reduce((map, profile) => {
            if (profile.user_id) {
              map[profile.user_id] = profile
            }
            return map
          }, {} as Record<string, any>) || {}
          
          members = membersData.map(member => ({
            id: member.id,
            user_id: member.user_id,
            profiles: member.user_id ? profileMap[member.user_id] : undefined
          }))
        } else {
          members = membersData
        }
      }
      
      return {
        group: groupInfo,
        members
      }
    },
    enabled: groupId > 0, // Only enable the query when we have a valid groupId (greater than 0)
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  })

  return {
    group: groupData?.group ?? null,
    members: groupData?.members ?? [],
    isLoading,
    error: error as Error | null
  }
} 