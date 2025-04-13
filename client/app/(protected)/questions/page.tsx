"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Clock, Send, Brain } from "lucide-react"
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
      {
        id: 1,
        question: "What skill have you recently learned or are currently learning?",
        answer: "I've been learning React and Next.js to build modern web applications. The component-based architecture has changed how I think about UI development."
      },
      {
        id: 2,
        question: "How do you overcome challenges in your learning process?",
        answer: "I break down complex problems into smaller, manageable pieces and focus on understanding one concept at a time. I also use online communities like Stack Overflow when I get stuck."
      },
      {
        id: 3,
        question: "What resources do you find most valuable for self-education?",
        answer: "Documentation, video tutorials, and hands-on projects are my go-to resources. I learn best by building real things rather than just consuming content."
      },
      {
        id: 4,
        question: "How do you apply what you've learned to your daily life?",
        answer: "I try to implement new techniques in my work projects and also create personal projects that challenge me to use what I've learned in different contexts."
      },
    ],
  },
  {
    id: 2,
    theme: "Work & Productivity",
    date: "April 24 - April 30, 2023",
    questions: [
      {
        id: 1,
        question: "What productivity techniques work best for you?",
        answer: "The Pomodoro technique and time blocking have significantly improved my focus. I also use the Getting Things Done methodology to organize tasks."
      },
      {
        id: 2,
        question: "How do you maintain work-life balance?",
        answer: "I set clear boundaries by having dedicated work hours and turning off notifications after work. I also prioritize regular exercise and family time."
      },
      {
        id: 3,
        question: "What tools or apps are essential to your workflow?",
        answer: "Notion for note-taking and project management, VS Code for development, and Slack for communication. I also use Forest app to stay focused."
      },
      {
        id: 4,
        question: "How do you handle procrastination?",
        answer: "I use the 5-minute rule - committing to just 5 minutes of work on a task often leads to longer focus periods. I also identify and address the root causes of my procrastination."
      },
    ],
  },
]

export default function QuestionsPage() {
  const { user } = useAuth()
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null)
  const [response, setResponse] = useState("")
  const [isClassified, setIsClassified] = useState(false)
  const {
    questions,
    theme,
    timeLeft,
    isExpired,
    progress,
    isLoading,
    submitAnswer,
    isSubmitting,
    handleClassification,
    isClassifying
  } = useQuestions(user?.id)

  // Function to normalize response by removing double quotations
  const normalizeResponse = (text: string): string => {
    return text.replace(/"/g, '');
  }

  const handleSubmitResponse = async () => {
    if (activeQuestion !== null && response.trim()) {
      const currentQuestion = questions.find(q => q.id === activeQuestion)
      const normalizedResponse = normalizeResponse(response.trim());
      await submitAnswer(activeQuestion, normalizedResponse, currentQuestion?.answered)
      setActiveQuestion(null)
      setResponse("")
    }
  }

  const handleSubmitAssessment = async () => {
    try {
      await handleClassification();
      setIsClassified(true);
    } catch (error) {
      console.error("Error during assessment submission:", error);
      // Don't set isClassified to true if there was an error
    }
  }

  // Check if all questions have been answered
  const allQuestionsAnswered = questions.length > 0 && questions.every(q => q.answered);

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
                  {activeQuestion === q.id ? (
                    <div className="relative">
                      <Textarea
                        placeholder="Type your response here..."
                        className="min-h-[120px]"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                      />
                      {!response.trim() && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 pointer-events-none">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Send className="h-8 w-8" />
                            <p>Type your response here</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : q.answered ? (
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Your Response:</p>
                          <p className="mt-1">{q.answer}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-muted-foreground italic">
                      Click "Answer Question" to provide your response.
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  {activeQuestion === q.id ? (
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
                        disabled={!response.trim() || isExpired || isSubmitting || isClassified}
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
                  ) : q.answered ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveQuestion(q.id)
                        setResponse(q.answer || "")
                      }}
                      disabled={isExpired || isClassified}
                    >
                      Edit Response
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        setActiveQuestion(q.id)
                        setResponse("")
                      }} 
                      disabled={isExpired || isClassified}
                    >
                      Answer Question
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Submit Personality Assessment Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto"
                  disabled={!allQuestionsAnswered || isExpired || isClassified || isClassifying}
                  onClick={handleSubmitAssessment}
                >
                  <Brain className="mr-2 h-5 w-5" />
                  {isClassifying 
                    ? "Processing..." 
                    : isClassified 
                      ? "Personality Assessment Submitted" 
                      : "Submit Personality Assessment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previous" className="space-y-6">
          {previousWeeks.map((week) => (
            <Card key={week.id}>
              <CardHeader>
                <CardTitle>{week.theme}</CardTitle>
                <CardDescription>{week.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {week.questions.map((question, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex flex-col">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p className="text-muted-foreground">{question.question}</p>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-md">
                        <div className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Your Response:</p>
                            <p className="mt-1">{question.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
