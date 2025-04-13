"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useGroups } from "@/hooks/use-group-data"


export default function GroupsPage() {
  const { user } = useAuth()
  const { 
    activeGroups, 
    pastGroups, 
    isLoading, 
    error 
  } = useGroups(user?.id)

  const formatLastActive = (timestamp: string | null): string => {
    if (!timestamp) return 'No activity'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Groups</h1>
        <p className="text-muted-foreground">Connect with your matched groups based on your weekly responses</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Groups</TabsTrigger>
          <TabsTrigger value="past">Past Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center p-6 text-destructive">
              <p>Error loading groups: {error.message}</p>
            </div>
          ) : activeGroups.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No active groups found</h3>
              <p className="text-muted-foreground">You are not currently a member of any groups.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mt-1">
                        {group.description || "Group Chat"}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Members</h3>
                        <div className="flex -space-x-2 overflow-hidden">
                          {group.members.slice(0, 5).map((member) => (
                            <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 5 && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{group.members.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{group.members.length} members</span>
                        <span className="mx-2">•</span>
                        <span>
                          {group.lastActive ? `Last active ${formatLastActive(group.lastActive)}` : 'No activity yet'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <GroupChatLink groupId={group.id} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pastGroups.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">No past groups found</h3>
              <p className="text-muted-foreground">You have not participated in any past groups.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mt-1">
                        {group.description || "Group Chat"}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{group.members.length} members</span>
                        <span className="mx-2">•</span>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{group.messageCount} messages</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <GroupChatLink groupId={group.id} isArchived={true} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const GroupChatLink = ({ groupId, isArchived = false }: { groupId: number, isArchived?: boolean }) => {
  const router = useRouter()
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    router.push(`/chats/${groupId}`)
  }
  
  return (
    <Button 
      onClick={handleClick} 
      variant={isArchived ? "outline" : "default"} 
      className="w-full"
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      {isArchived ? "View Archive" : "Open Chat"}
    </Button>
  )
}
