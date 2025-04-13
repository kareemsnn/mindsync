"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MessageCircle, Users } from "lucide-react"
import Link from "next/link"
import { useGroups } from "@/hooks/use-group-data"
import { useQuestions } from "@/hooks/use-questions"
import Loading from "./loading"
import { useRouter } from "next/navigation"


export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { activeGroups, isLoading: groupsLoading } = useGroups(user?.id)
  const { 
    questions, 
    theme, 
    timeLeft, 
    expiryDate: fdateExpiry,
    isExpired,
    progress,
    isLoading: questionsLoading 
  } = useQuestions(user?.id)
  
  const [currentTime, setCurrentTime] = useState(new Date())

  // Calculate total messages across all active groups
  const totalMessages = activeGroups.reduce((sum, group) => sum + group.messageCount, 0)

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Calculate days until Friday (5 is Friday in JavaScript's Date.getDay())
  const getDaysUntilFriday = () => {
    const today = currentTime.getDay()
    return today <= 5 ? 5 - today : 7 - today + 5
  }

  const daysUntilFriday = getDaysUntilFriday()
  const isGroupChatDay = currentTime.getDay() === 5 // Friday

  if (questionsLoading || groupsLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.profile?.email?.split('@')[0]}! Here's what's happening this week.</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Weekly Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>
            {isGroupChatDay
              ? "Group chats are now active! Join the conversation."
              : `${daysUntilFriday} days until group chats are activated`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {questions.filter(q => q.answered).length} of {questions.length} questions answered
                </span>
                <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time Left</p>
                    <p className="text-2xl font-bold">{timeLeft.includes("day") ? timeLeft.split(" ")[0] : "< 1d"}</p>
                    {fdateExpiry && (
                      <p className="text-xs text-muted-foreground">
                        Expires on {new Date(fdateExpiry).toLocaleDateString()} at {new Date(fdateExpiry).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Active Groups</p>
                    <p className="text-2xl font-bold">{activeGroups.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Messages</p>
                    <p className="text-2xl font-bold">{totalMessages}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Questions Preview */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Questions</CardTitle>
          <CardDescription>Theme: {theme}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.slice(0, 4).map((q, index) => (
              <div key={q.id} className="space-y-2">
                <h3 className="font-medium">Question {index + 1}</h3>
                <p className="text-muted-foreground">
                  {q.question}
                </p>
                {q.answered ? (
                  <div className="bg-muted/50 p-3 rounded-md mt-2">
                    <p className="text-sm italic">Your response has been submitted.</p>
                  </div>
                ) : (
                  <Button variant="outline" disabled={isExpired} size="sm" className={`mt-2 ${isExpired ? "opacity-50 cursor-not-allowed" : ""}`} asChild>
                    <Link href="/questions">Answer Question</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button asChild>
              <Link href="/questions">View All Questions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Groups */}
      {(isGroupChatDay || activeGroups.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Groups</CardTitle>
            <CardDescription>Join the conversation in your matched groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGroups.length === 0 ? (
                  <p className="text-muted-foreground col-span-2">No active groups found. Check back later!</p>
                ) : (
                  activeGroups.slice(0, 3).map((group) => (
                    <Card key={group.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group.members.length} members • {group.messageCount} messages
                            </p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/chats/${group.id}`}>Join Chat</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="/groups">View All Groups</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}