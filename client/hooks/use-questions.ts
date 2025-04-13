import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'
import { toast } from 'sonner'

export type Question = {
  id: number
  question: string
  created_at: string | null
  answered: boolean
  answer?: string
  theme?: string | null
}

export type QuestionWithExpiry = {
  questions: Question[]
  theme: string
  expiryDate: string
  timeLeft: string
  isExpired: boolean
  progress: number
}

type AnswerInsert = Database['public']['Tables']['answers']['Insert']
type AnswerUpdate = Database['public']['Tables']['answers']['Update']

export const useQuestions = (userId?: string) => {
  const queryClient = useQueryClient()
  
  const calculateTimeLeft = (expiryDate: string) => {
    const targetDate = new Date(expiryDate)
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
  
    // If the difference is less than or equal to zero, time is up
    if (diff <= 0) {
      return { timeLeft: "Time's up for this week's questions", isExpired: true }
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
    let timeLeft = ''
    if (days > 0) {
      timeLeft = `${days} day${days > 1 ? 's' : ''} left to answer`
    } else if (hours > 0) {
      timeLeft = `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''} left`
    } else {
      timeLeft = `${minutes} minute${minutes > 1 ? 's' : ''} left`
    }
    
    return { timeLeft, isExpired: false }
  }

  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['questions', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')

      // Get the questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true })
      
      if (questionsError) throw questionsError
      
      let theme = "General"
      let expiryDate = ""
      
      // Try to get the theme and expiry date from the first question or fdate table
      if (questionsData && questionsData.length > 0) {
        const firstQuestion = questionsData[0]
        if (firstQuestion.theme) {
          theme = firstQuestion.theme
        }
      }
      
      // Fetch the expiration date from fdate table (more reliable than the questions table)
      const { data: fdateData, error: fdateError } = await supabase
        .from('fdate')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        
      if (fdateError) throw fdateError
      
      if (fdateData && fdateData.length > 0) {
        expiryDate = fdateData[0].expire_date
      }
      
      // Get user's answers for these questions
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('user_id', userId)
        .in('question_id', questionsData.map(q => q.id))
      
      if (answersError) throw answersError
      
      // Combine questions with answers
      const questionsWithAnswers = questionsData.map(question => ({
        id: question.id,
        question: question.question,
        created_at: question.created_at,
        theme: question.theme,
        answered: answersData?.some(a => a.question_id === question.id && a.user_id === userId) || false,
        answer: answersData?.find(a => a.question_id === question.id && a.user_id === userId)?.answer || undefined
      }))
      
      // Calculate progress
      const answeredCount = questionsWithAnswers.filter(q => q.answered).length
      const progress = questionsWithAnswers.length > 0 
        ? (answeredCount / questionsWithAnswers.length) * 100 
        : 0
      
      // Calculate time left
      const { timeLeft, isExpired } = calculateTimeLeft(expiryDate)
      
      return {
        questions: questionsWithAnswers,
        theme,
        expiryDate,
        timeLeft,
        isExpired,
        progress
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60, // Refetch every minute to update time remaining
  })
  
  const submitAnswer = useMutation({
    mutationFn: async ({
      questionId,
      answer,
      isEdit = false
    }: {
      questionId: number
      answer: string
      isEdit?: boolean
    }) => {
      if (!userId) throw new Error('User ID is required')
      
      if (isEdit) {
        const { error: updateError } = await supabase
          .from('answers')
          .update({ answer: answer.trim() })
          .eq('question_id', questionId)
          .eq('user_id', userId)
        
        if (updateError) throw updateError
      } else {
        const answerData: AnswerInsert = {
          question_id: questionId,
          user_id: userId,
          answer: answer.trim(),
          created_at: new Date().toISOString()
        }
        
        const { error: insertError } = await supabase
          .from('answers')
          .insert(answerData)
        
        if (insertError) throw insertError
      }
      
      return { questionId, answer }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', userId] })
      toast.success(variables.isEdit ? 'Answer updated successfully' : 'Answer submitted successfully')
    },
    onError: (error) => {
      console.error('Error submitting answer:', error)
      toast.error('Error submitting answer')
    }
  })

  return {
    questionsData: data,
    questions: data?.questions || [],
    theme: data?.theme || 'General',
    expiryDate: data?.expiryDate || '',
    timeLeft: data?.timeLeft || '',
    isExpired: data?.isExpired || false,
    progress: data?.progress || 0,
    isLoading,
    error: error as Error | null,
    submitAnswer: (questionId: number, answer: string, isEdit: boolean = false) => 
      submitAnswer.mutate({ questionId, answer, isEdit }),
    isSubmitting: submitAnswer.isPending
  }
} 