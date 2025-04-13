"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { MoreHorizontal, Send, Users, MessageSquare, Lock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Loading from "@/app/(protected)/chats/[id]/loading"
import { useRealtimeMessages } from "@/hooks/use-realtime-messages"
import { useGroupData } from "@/hooks/use-group-data"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export default function ChatPage() {
  const params = useParams()
  const id = params.id
  const groupId = id ? (typeof id === "string" ? parseInt(id) : parseInt(id[0])) : 0
  
  return (
    <Suspense fallback={<Loading />}>
      <ChatContent groupId={groupId} />
    </Suspense>
  )
}

function ChatContent({ groupId }: { groupId: number }) {
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const [showMembersDialog, setShowMembersDialog] = useState(false)

  useEffect(() => {
    // Only prefetch if we have a valid groupId
    if (groupId > 0) {
      queryClient.prefetchQuery({
        queryKey: ['group', groupId],
        queryFn: async () => {
          const { data: groupInfo, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single()
          
          if (groupError) throw groupError
          
          const { data: membersData, error: membersError } = await supabase
            .from('group_members')
            .select(`
              id,
              user_id
            `)
            .eq('group_id', groupId)
          
          if (membersError) throw membersError
          
          let members: { id: number; user_id: string | null; profiles?: { email: string | null; image_url: string | null } }[] = []
          
          if (membersData && membersData.length > 0) {
            const userIds = membersData
              .map(member => member.user_id)
              .filter(Boolean) as string[]
            
            if (userIds.length > 0) {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, email, image_url')
                .in('user_id', userIds)
              
              const profileMap = profiles?.reduce((map: Record<string, any>, profile) => {
                if (profile.user_id) {
                  map[profile.user_id] = profile
                }
                return map
              }, {}) || {}
              
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
        staleTime: 1000 * 60 * 5, // 5 minutes
      })
    }
  }, [groupId, queryClient])

  const { 
    group, 
    members, 
    isLoading: isLoadingGroup, 
    error: groupError 
  } = useGroupData(groupId)

  const { 
    messages, 
    isLoading: isLoadingMessages, 
    error: messagesError,
    sendMessage 
  } = useRealtimeMessages(groupId)

  const isExpired = group?.expires_at 
    ? new Date(group.expires_at).getTime() <= new Date().getTime() 
    : false

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || isExpired) return
    
    try {
      await sendMessage(message, user.id)
      setMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (isLoadingGroup || isLoadingMessages) {
    return <Loading />
  }

  if (groupError) {
    return <div>Error loading group: {groupError.message}</div>
  }

  if (!group) {
    return <div>Group not found</div>
  }

  if (messagesError) {
    return <div>Error loading messages: {messagesError.message}</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{group.description || "Group Chat"}</Badge>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {members.length} members
                </span>
                {isExpired && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Archived
                  </Badge>
                )}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setShowMembersDialog(true)}>
                  View members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Members Dialog */}
        <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Group Members
              </DialogTitle>
              <DialogDescription>
                {members.length} {members.length === 1 ? 'member' : 'members'} in this group
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="mt-2 max-h-[60vh]">
              {groupError ? (
                <div className="p-4 text-center text-destructive">
                  <p>Error loading members: {(groupError as Error).message}</p>
                </div>
              ) : members.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No members found in this group</p>
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {members.map((member) => {
                    const isCurrentUser = member.user_id === user?.id;
                    const displayName = member.profiles?.email?.split('@')[0] || 'User';
                    
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarImage 
                            src={member.profiles?.image_url || "/placeholder.svg"} 
                            alt={displayName} 
                          />
                          <AvatarFallback>
                            {(member.profiles?.email?.charAt(0) || 'U').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="font-medium">{displayName}</p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {member.profiles?.email || 'No email available'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <CardContent className="flex-1 overflow-auto p-0">
          <div className="flex flex-col p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === user?.id
                const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId
                const isConsecutiveMessage = index > 0 && messages[index - 1].senderId === msg.senderId
                const isLastInSequence = 
                  index === messages.length - 1 || 
                  messages[index + 1]?.senderId !== msg.senderId
                
                const showMessageTail = isLastInSequence

                return (
                  <div key={msg.id} 
                       className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} 
                                   ${isConsecutiveMessage ? "mt-1" : "mt-4"}`}
                  >
                    <div className={`
                      flex 
                      ${isCurrentUser ? "flex-row-reverse" : "flex-row"} 
                      max-w-[85%] 
                      gap-2
                    `}>
                      {/* Avatar only for non-current user and only at the start of message groups */}
                      {!isCurrentUser && showAvatar && (
                        <div className="flex-shrink-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.senderAvatar || "/placeholder.svg"} alt={msg.senderName} />
                            <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      {/* Avatar placeholder to maintain alignment for consecutive messages */}
                      {!isCurrentUser && !showAvatar && (
                        <div className="w-8 flex-shrink-0"></div>
                      )}
                      
                      <div className={`
                        flex 
                        flex-col 
                        ${!isCurrentUser ? "items-start" : "items-end"}
                      `}>
                        {/* Sender name - only for non-current user and only at the start of message groups */}
                        {!isCurrentUser && showAvatar && (
                          <p className="text-xs text-muted-foreground ml-1 mb-1">{msg.senderName}</p>
                        )}
                        
                        {/* Message bubble */}
                        <div className={`
                          relative
                          px-4 
                          py-2 
                          rounded-2xl
                          ${isCurrentUser 
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                          }
                          ${!isConsecutiveMessage 
                            ? isCurrentUser ? "rounded-tr-2xl" : "rounded-tl-2xl"
                            : isCurrentUser ? "rounded-tr-md" : "rounded-tl-md"
                          }
                          ${!isLastInSequence
                            ? isCurrentUser ? "rounded-br-md" : "rounded-bl-md"
                            : ""
                          }
                          ${showMessageTail
                            ? isCurrentUser ? "message-bubble-user rounded-br-sm" : "message-bubble-other rounded-bl-sm"
                            : ""
                          }
                          shadow-sm
                        `}>
                          <p className="break-words">{msg.content}</p>
                        </div>
                        
                        {/* Timestamp - only show on last message in sequence */}
                        {isLastInSequence && (
                          <p className={`
                            text-xs 
                            text-muted-foreground 
                            mt-1 
                            ${isCurrentUser ? "mr-1" : "ml-1"}
                          `}>
                            {formatTimestamp(msg.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-2 opacity-50" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-sm">Be the first to send a message in this group!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <Separator />
        <div className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={isExpired ? "This chat has been archived" : "Type your message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              disabled={isExpired}
            />
            <Button type="submit" disabled={!message.trim() || isExpired}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
          {isExpired && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This group has been archived. You can view messages but cannot send new ones.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
