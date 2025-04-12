"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { MoreHorizontal, Send, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for the chat
const mockGroupData = {
  1: {
    id: 1,
    name: "AI Ethics Enthusiasts",
    theme: "Technology & Innovation",
    members: [
      { id: 1, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 2, name: "Jamie Smith", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 3, name: "Taylor Brown", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 4, name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: "Alex Johnson",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content:
          "Welcome everyone to our AI Ethics discussion group! I'm excited to chat with you all about the questions we answered this week.",
        timestamp: "2023-05-12T10:00:00Z",
      },
      {
        id: 2,
        senderId: 2,
        senderName: "Jamie Smith",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content:
          "Thanks for the welcome! I found the question about AI's impact on our fields particularly interesting. In healthcare, I think we'll see AI taking over routine diagnostics but human doctors will still be essential for complex cases and patient relationships.",
        timestamp: "2023-05-12T10:05:00Z",
      },
      {
        id: 3,
        senderId: 3,
        senderName: "Taylor Brown",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content:
          "I agree with Jamie. In my field (education), I think AI will help personalize learning experiences but teachers will remain crucial for emotional support and guiding critical thinking.",
        timestamp: "2023-05-12T10:10:00Z",
      },
      {
        id: 4,
        senderId: 4,
        senderName: "Jordan Lee",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content:
          "What do you all think about the ethical implications of AI decision-making? I'm concerned about bias in algorithms affecting important decisions.",
        timestamp: "2023-05-12T10:15:00Z",
      },
    ],
  },
  2: {
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
    messages: [
      {
        id: 1,
        senderId: 5,
        senderName: "Casey Wilson",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content:
          "Hi everyone! I'm looking forward to discussing digital wellness with you all. What strategies do you use to maintain a healthy relationship with technology?",
        timestamp: "2023-05-12T11:00:00Z",
      },
      {
        id: 2,
        senderId: 6,
        senderName: "Riley Davis",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content:
          "I use the Pomodoro technique - 25 minutes of focused work followed by a 5-minute break away from screens. It's been really helpful for me!",
        timestamp: "2023-05-12T11:05:00Z",
      },
    ],
  },
  3: {
    id: 3,
    name: "Future Tech Visionaries",
    theme: "Technology & Innovation",
    members: [
      { id: 10, name: "Sam Chen", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 11, name: "Drew Patel", avatar: "/placeholder.svg?height=40&width=40" },
      { id: 12, name: "Reese Kim", avatar: "/placeholder.svg?height=40&width=40" },
    ],
    messages: [
      {
        id: 1,
        senderId: 10,
        senderName: "Sam Chen",
        senderAvatar: "/placeholder.svg?height=40&width=40",
        content: "Hello future tech visionaries! What emerging technology are you most excited about?",
        timestamp: "2023-05-12T12:00:00Z",
      },
    ],
  },
}

export default function ChatPage() {
  const { id } = useParams()
  const groupId = typeof id === "string" ? id : id[0]
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [group, setGroup] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    const groupData = mockGroupData[groupId as keyof typeof mockGroupData]
    if (groupData) {
      setGroup(groupData)
      setMessages(groupData.messages)
    }
  }, [groupId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim() && user) {
      const newMessage = {
        id: messages.length + 1,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar || "/placeholder.svg?height=40&width=40",
        content: message,
        timestamp: new Date().toISOString(),
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!group) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">{group.theme}</Badge>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {group.members.length} members
                </span>
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
                <DropdownMenuItem>View members</DropdownMenuItem>
                <DropdownMenuItem>Mute notifications</DropdownMenuItem>
                <DropdownMenuItem>Report issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="flex flex-col p-4 space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === user?.id
              const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId

              return (
                <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] gap-2`}>
                    {!isCurrentUser && showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.senderAvatar || "/placeholder.svg"} alt={msg.senderName} />
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      {!isCurrentUser && showAvatar && (
                        <p className="text-xs text-muted-foreground mb-1">{msg.senderName}</p>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">{formatTimestamp(msg.timestamp)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
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
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
