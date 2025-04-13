"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { Calendar, Clock, MessageCircle, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

// Mock data for the dashboard
const mockDaysLeft = 2
const mockActiveGroups = 3

type Question = {
  id: number
  question: string
  created_at: string | null
  answered: boolean
  answer?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [theme, setTheme] = useState<string>("General")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [expires_at, setExpires_at] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<string>("")

  // Calculate time left
  const calculateTimeLeft = () => {
    const targetDate = new Date(expires_at)
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
  
    // If the difference is less than or equal to zero, time is up
    if (diff <= 0) {
      return "Time's up for this week's questions";
    }
  
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left to answer`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''} left`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
    }
  }

  // Fetch theme and questions from Supabase
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('id', { ascending: true })
        if (questionsError) throw questionsError
        
        // Get expires_at and theme from the first question
        if (questionsData && questionsData.length > 0) {
          const firstQuestion = questionsData[0] as any;
          if (firstQuestion.expires_at) {
            setExpires_at(firstQuestion.expires_at);
          }
          if (firstQuestion.theme) {
            setTheme(firstQuestion.theme);
          }
        }

        // Fetch user's answers for these questions
        const { data: answersData, error: answersError } = await supabase
          .from('answers')
          .select('*')
          .eq('user_id', user.id)
          .in('question_id', questionsData.map(q => q.id))

        if (answersError) throw answersError

        // Combine questions with answers
        const questionsWithAnswers = questionsData.map(question => ({
          id: question.id,
          question: question.question,
          created_at: question.created_at,
          answered: false,
          answer: undefined,
          ...answersData?.find(a => a.question_id === question.id && a.user_id === user.id)
            ? {
                answered: true,
                answer: answersData.find(a => a.question_id === question.id)?.answer
              }
            : {}
        }))
        
        setQuestions(questionsWithAnswers)
        setTimeLeft(calculateTimeLeft());
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    return () => clearInterval(timer)
  }, [expires_at])

  // Calculate days until Friday (5 is Friday in JavaScript's Date.getDay())
  const getDaysUntilFriday = () => {
    const today = currentTime.getDay()
    return today <= 5 ? 5 - today : 7 - today + 5
  }

  const daysUntilFriday = getDaysUntilFriday()
  const isGroupChatDay = currentTime.getDay() === 5 // Friday

  // Calculate progress for the progress bar
  const answeredCount = questions.filter(q => q.answered).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  if (loading) {
    return <div>Loading dashboard...</div>
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
                  {answeredCount} of {questions.length} questions answered
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
                  <Button variant="outline" size="sm" className="mt-2" asChild>
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
