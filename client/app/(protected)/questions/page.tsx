"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Clock, Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

// Mock data for previous weeks
const previousWeeks = [
  {
    id: 1,
    theme: "Personal Growth & Learning",
    date: "May 1 - May 7, 2023",
    questions: [
      "What skill have you recently learned or are currently learning?",
      "How do you overcome challenges in your learning process?",
      "What resources do you find most valuable for self-education?",
      "How do you apply what you've learned to your daily life?",
    ],
  },
  {
    id: 2,
    theme: "Work & Productivity",
    date: "April 24 - April 30, 2023",
    questions: [
      "What productivity techniques work best for you?",
      "How do you maintain work-life balance?",
      "What tools or apps are essential to your workflow?",
      "How do you handle procrastination?",
    ],
  },
]

type Question = {
  id: number
  question: string
  created_at: string | null
  answered: boolean
  answer?: string
}

export default function QuestionsPage() {
  const { user } = useAuth()
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [response, setResponse] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [expires_at, setExpires_at] = useState<string>("")
  const [test] = useState("2025-04-13T16:30:00+00:00")
  const [timeUp, setTimeUp] = useState(false)
  const [theme, setTheme] = useState<string>("General")

  
  const calculateTimeLeft = () => {
    const targetDate = new Date(expires_at)
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
  
    // If the difference is less than or equal to zero, time is up
    if (diff <= 0) {
      setTimeUp(true)
      return "Time's up for this week's questions";
    }
    
    setTimeUp(false)
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

  // Check if time is up
  useEffect(() => {
    // Check if time is up when expires_at changes or component mounts
    if (expires_at) {
      const targetDate = new Date(expires_at);
      const now = new Date();
      setTimeUp(targetDate.getTime() - now.getTime() <= 0);
    }
  }, [expires_at]);

  // Update the time left every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // Update every minute

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    return () => clearInterval(timer)
  }, [expires_at])

  useEffect(() => {
    async function loadQuestions() {
      try {
        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('id', { ascending: true })  // Order by ID ascending to show Question 1 first
        if (questionsError) throw questionsError
        
        // Get expires_at from the first question (all questions have the same expiration)
        if (questionsData && questionsData.length > 0) {
          const firstQuestion = questionsData[0] as any;
          if (firstQuestion.expires_at) {
            setExpires_at(firstQuestion.expires_at);
          }
          // Get theme from the first question (all questions have the same theme)
          if (firstQuestion.theme) {
            setTheme(firstQuestion.theme);
          }
        }

        // Fetch user's answers for these questions
        const { data: answersData, error: answersError } = await supabase
          .from('answers')
          .select('*')
          .eq('user_id', user!.id)
          .in('question_id', questionsData.map(q => q.id))

        if (answersError) throw answersError

        // Combine questions with answers
        const questionsWithAnswers = questionsData.map(question => ({
          id: question.id,
          question: question.question,
          created_at: question.created_at,
          answered: false,
          answer: undefined,
          ...answersData?.find(a => a.question_id === question.id && a.user_id === user!.id)
            ? {
                answered: true,
                answer: answersData.find(a => a.question_id === question.id)?.answer
              }
            : {}
        }))
        
        setQuestions(questionsWithAnswers)
      } catch (error) {
        console.error('Error loading questions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadQuestions()
    }
  }, [user])

  const handleSubmitResponse = async () => {
    if (activeQuestion !== null && response.trim() && user) {
      try {
        // Insert or update the answer
        const { error } = await supabase
          .from('answers')
          .upsert({
            question_id: activeQuestion,
            user_id: user.id,
            answer: response.trim(),
            created_at: new Date().toISOString()
          })

        if (error) throw error

        // Update local state
        setQuestions(questions.map(q => 
          q.id === activeQuestion 
            ? { ...q, answered: true, answer: response.trim() } 
            : q
        ))
        setActiveQuestion(null)
        setResponse("")
      } catch (error) {
        console.error('Error submitting answer:', error)
        // You might want to show an error message to the user here
      }
    }
  }

  const answeredCount = questions.filter((q) => q.answered).length
  const progress = (answeredCount / questions.length) * 100

  if (loading) {
    return <div>Loading this week's questions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Questions</h1>
        <p className="text-muted-foreground">Answer this week's questions to be matched with like-minded individuals</p>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Week</TabsTrigger>
          <TabsTrigger value="previous">Previous Weeks</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Theme: {theme}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {answeredCount} of {questions.length} questions answered
                  </span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>{timeLeft}</span>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q) => (
              <Card key={q.id} className={activeQuestion === q.id ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="text-lg">Question {q.id}</CardTitle>
                  <CardDescription>{q.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  {q.answered && activeQuestion !== q.id ? (
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Your Response:</p>
                          <p className="mt-1">{q.answer}</p>
                        </div>
                      </div>
                    </div>
                  ) : activeQuestion === q.id ? (
                    <Textarea
                      placeholder="Type your response here..."
                      className="min-h-[120px]"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    />
                  ) : null}
                </CardContent>
                <CardFooter className="flex justify-end">
                  {q.answered && activeQuestion !== q.id ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveQuestion(q.id)
                        setResponse(q.answer || "")
                      }}
                      disabled={timeUp}
                    >
                      Edit Response
                    </Button>
                  ) : activeQuestion === q.id ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveQuestion(null)
                          setResponse("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitResponse} disabled={!response.trim() || timeUp}>
                        <Send className="mr-2 h-4 w-4" /> Submit
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setActiveQuestion(q.id)} disabled={timeUp}>
                      {q.answered ? "Edit Response" : "Answer Question"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="previous" className="space-y-6">
          {previousWeeks.map((week) => (
            <Card key={week.id}>
              <CardHeader>
                <CardTitle>{week.theme}</CardTitle>
                <CardDescription>{week.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {week.questions.map((question, index) => (
                    <div key={index} className="space-y-1">
                      <h3 className="font-medium">Question {index + 1}</h3>
                      <p className="text-muted-foreground">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">View Your Responses</Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
