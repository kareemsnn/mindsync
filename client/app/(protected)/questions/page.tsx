"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Clock, Send } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Loading from "@/app/(protected)/questions/loading"
import { useQuestions } from "@/hooks/use-questions"

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

export default function QuestionsPage() {
  const { user } = useAuth()
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [response, setResponse] = useState("")
  const {
    questions,
    theme,
    timeLeft,
    isExpired,
    progress,
    isLoading,
    submitAnswer,
    isSubmitting
  } = useQuestions(user?.id)

  const handleSubmitResponse = async () => {
    if (activeQuestion !== null && response.trim()) {
      const currentQuestion = questions.find(q => q.id === activeQuestion)
      await submitAnswer(activeQuestion, response, currentQuestion?.answered)
      setActiveQuestion(null)
      setResponse("")
    }
  }

  if (isLoading) {
    return <Loading />
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
                    {questions.filter(q => q.answered).length} of {questions.length} questions answered
                  </span>
                  <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
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
                      disabled={isExpired}
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
                      <Button 
                        onClick={handleSubmitResponse} 
                        disabled={!response.trim() || isExpired || isSubmitting}
                      >
                        {isSubmitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" /> Submit
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setActiveQuestion(q.id)} disabled={isExpired}>
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
