"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data for chats
const mockChats = [
  {
    id: 1,
    name: "AI Ethics Enthusiasts",
    theme: "Technology & Innovation",
    lastMessage: {
      sender: "Jordan Lee",
      content: "What do you all think about the ethical implications of AI decision-making?",
      timestamp: "10:15 AM",
    },
    unread: 2,
  },
  {
    id: 2,
    name: "Digital Wellness Group",
    theme: "Technology & Innovation",
    lastMessage: {
      sender: "Riley Davis",
      content:
        "I use the Pomodoro technique - 25 minutes of focused work followed by a 5-minute break away from screens.",
      timestamp: "11:05 AM",
    },
    unread: 0,
  },
  {
    id: 3,
    name: "Future Tech Visionaries",
    theme: "Technology & Innovation",
    lastMessage: {
      sender: "Sam Chen",
      content: "Hello future tech visionaries! What emerging technology are you most excited about?",
      timestamp: "12:00 PM",
    },
    unread: 1,
  },
  {
    id: 4,
    name: "Personal Growth Circle",
    theme: "Personal Growth & Learning",
    lastMessage: {
      sender: "Alex Morgan",
      content: "I've been practicing mindfulness meditation for the past month and it's been transformative.",
      timestamp: "May 7",
    },
    unread: 0,
    archived: true,
  },
  {
    id: 5,
    name: "Productivity Masters",
    theme: "Work & Productivity",
    lastMessage: {
      sender: "Taylor Swift",
      content: "Has anyone tried the time-blocking method? I'm curious about your experiences.",
      timestamp: "Apr 30",
    },
    unread: 0,
    archived: true,
  },
]

export default function ChatsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = mockChats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.theme.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeChats = filteredChats.filter((chat) => !chat.archived)
  const archivedChats = filteredChats.filter((chat) => chat.archived)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chats</h1>
        <p className="text-muted-foreground">Connect with your matched groups through conversations</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search chats..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Chats</h2>
          <div className="space-y-2">
            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <Link href={`/chats/${chat.id}`} key={chat.id}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{chat.name}</h3>
                            {chat.unread > 0 && (
                              <Badge className="bg-primary text-primary-foreground">{chat.unread}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                              <span className="font-medium">{chat.lastMessage.sender}:</span> {chat.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{chat.lastMessage.timestamp}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No active chats found</p>
            )}
          </div>
        </div>

        {archivedChats.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Archived Chats</h2>
            <div className="space-y-2">
              {archivedChats.map((chat) => (
                <Link href={`/chats/${chat.id}`} key={chat.id}>
                  <Card className="hover:bg-muted/50 transition-colors opacity-70">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{chat.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                              <span className="font-medium">{chat.lastMessage.sender}:</span> {chat.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">{chat.lastMessage.timestamp}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
