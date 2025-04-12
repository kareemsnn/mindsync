"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users } from "lucide-react"
import Link from "next/link"

// Mock data for active groups
const activeGroups = [
  {
    id: 1,
    name: "AI Ethics Enthusiasts",
    theme: "Technology & Innovation",
    members: [
      { id: 1, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 2, name: "Jamie Smith", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 3, name: "Taylor Brown", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 4, name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    messageCount: 24,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Digital Wellness Group",
    theme: "Technology & Innovation",
    members: [
      { id: 5, name: "Casey Wilson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 6, name: "Riley Davis", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 7, name: "Avery Miller", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 8, name: "Morgan Taylor", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 9, name: "Quinn Roberts", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    messageCount: 36,
    lastActive: "30 minutes ago",
  },
  {
    id: 3,
    name: "Future Tech Visionaries",
    theme: "Technology & Innovation",
    members: [
      { id: 10, name: "Sam Chen", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 11, name: "Drew Patel", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 12, name: "Reese Kim", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    messageCount: 18,
    lastActive: "1 day ago",
  },
]

// Mock data for past groups
const pastGroups = [
  {
    id: 4,
    name: "Personal Growth Circle",
    theme: "Personal Growth & Learning",
    members: 5,
    messageCount: 87,
    date: "May 1 - May 7, 2023",
  },
  {
    id: 5,
    name: "Productivity Masters",
    theme: "Work & Productivity",
    members: 4,
    messageCount: 62,
    date: "April 24 - April 30, 2023",
  },
  {
    id: 6,
    name: "Creative Minds",
    theme: "Arts & Creativity",
    members: 6,
    messageCount: 103,
    date: "April 17 - April 23, 2023",
  },
]

export default function GroupsPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{group.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-1">
                          {group.theme}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {group.messageCount}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Members</h3>
                      <div className="flex -space-x-2">
                        {group.members.map((member) => (
                          <Avatar key={member.id} className="border-2 border-background h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.members.length} members</span>
                      <span className="mx-2">•</span>
                      <span>Last active {group.lastActive}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/chats/${group.id}`}>Join Chat</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mt-1">
                      {group.theme}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.members} members</span>
                      <span className="mx-2">•</span>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{group.messageCount} messages</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{group.date}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/chats/${group.id}`}>View Archive</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
