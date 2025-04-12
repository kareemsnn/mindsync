"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MessageCircle, Users } from "lucide-react"
import Link from "next/link"

// Mock data for the dashboard
const mockWeeklyProgress = 75
const mockDaysLeft = 2
const mockActiveGroups = 3

export default function DashboardPage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Here's what's happening this week.</p>
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
                <span className="text-sm font-medium">Question Responses</span>
                <span className="text-sm text-muted-foreground">{mockWeeklyProgress}%</span>
              </div>
              <Progress value={mockWeeklyProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Days Left</p>
                    <p className="text-2xl font-bold">{mockDaysLeft}</p>
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
                    <p className="text-2xl font-bold">{mockActiveGroups}</p>
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
                    <p className="text-2xl font-bold">12</p>
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
          <CardDescription>Theme: Technology & Innovation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Question 1</h3>
              <p className="text-muted-foreground">
                How do you think artificial intelligence will impact your field in the next 5 years?
              </p>
              {mockWeeklyProgress >= 25 ? (
                <div className="bg-muted/50 p-3 rounded-md mt-2">
                  <p className="text-sm italic">Your response has been submitted.</p>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-2">
                  Answer Question
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Question 2</h3>
              <p className="text-muted-foreground">What emerging technology are you most excited about and why?</p>
              {mockWeeklyProgress >= 50 ? (
                <div className="bg-muted/50 p-3 rounded-md mt-2">
                  <p className="text-sm italic">Your response has been submitted.</p>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-2">
                  Answer Question
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Question 3</h3>
              <p className="text-muted-foreground">
                How do you balance screen time and digital wellness in your daily life?
              </p>
              {mockWeeklyProgress >= 75 ? (
                <div className="bg-muted/50 p-3 rounded-md mt-2">
                  <p className="text-sm italic">Your response has been submitted.</p>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-2">
                  Answer Question
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Question 4</h3>
              <p className="text-muted-foreground">
                What technological innovation has had the biggest impact on your life so far?
              </p>
              {mockWeeklyProgress >= 100 ? (
                <div className="bg-muted/50 p-3 rounded-md mt-2">
                  <p className="text-sm italic">Your response has been submitted.</p>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="mt-2">
                  Answer Question
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Button asChild>
              <Link href="/questions">View All Questions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Groups */}
      {isGroupChatDay && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Groups</CardTitle>
            <CardDescription>Join the conversation in your matched groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">AI Ethics Enthusiasts</h3>
                        <p className="text-sm text-muted-foreground">4 members • 8 messages</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Join Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Digital Wellness Group</h3>
                        <p className="text-sm text-muted-foreground">5 members • 12 messages</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Join Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Future Tech Visionaries</h3>
                        <p className="text-sm text-muted-foreground">3 members • 5 messages</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Join Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
