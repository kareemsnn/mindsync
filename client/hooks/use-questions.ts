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

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: true })
      
      if (questionsError) throw questionsError
      
      let theme = "General"
      let expiryDate = ""
      
      if (questionsData && questionsData.length > 0) {
        const firstQuestion = questionsData[0]
        if (firstQuestion.theme) {
          theme = firstQuestion.theme
        }
      }
      
      const { data: fdateData, error: fdateError } = await supabase
        .from('fdate')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        
      if (fdateError) throw fdateError
      
      if (fdateData && fdateData.length > 0) {
        expiryDate = fdateData[0].expire_date
      }
      
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('user_id', userId)
        .in('question_id', questionsData.map(q => q.id))
      
      if (answersError) throw answersError
      
      const questionsWithAnswers = questionsData.map(question => ({
        id: question.id,
        question: question.question,
        created_at: question.created_at,
        theme: question.theme,
        answered: answersData?.some(a => a.question_id === question.id && a.user_id === userId) || false,
        answer: answersData?.find(a => a.question_id === question.id && a.user_id === userId)?.answer || undefined
      }))
      
      const answeredCount = questionsWithAnswers.filter(q => q.answered).length
      const progress = questionsWithAnswers.length > 0 
        ? (answeredCount / questionsWithAnswers.length) * 100 
        : 0
      
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
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions', userId] })
      toast.success('Answers submitted successfully')
    },
    onError: (error) => {
      console.error('Error submitting answer:', error)
      toast.error('Error submitting answer')
    }
  })

  const classifyAnswersMutation = useMutation({
    mutationFn: async ({ userId, answers }: { userId: string, answers: { answer: string | undefined }[] }) => {
      const apiUrl = process.env.NEXT_PUBLIC_HEROKU_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured. Please set NEXT_PUBLIC_HEROKU_API_URL.');
      }

      try {
        const response = await fetch(`${apiUrl}/classifyUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            texts: answers.map(a => ({ answer: a.answer }))
          }),
          mode: 'cors',
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error: ${response.status}` }));
          console.error("Classification API Error:", response.status, errorData);
          throw new Error(errorData.message || `Failed to submit answers for classification (Status: ${response.status})`);
        }

        const data = await response.json();
        return { status: data.status || 200 };
      } catch (error) {
        console.error("Classification request failed:", error);
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          throw new Error('Network error: The server is unreachable or CORS is blocking the request');
        }
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log("Classification successful:", data);
      toast.success('Answers submitted for classification successfully!');
    },
    onError: (error: Error) => {
      console.error('Error submitting answers for classification:', error);
      toast.error(`Classification failed: ${error.message}`);
    }
  });

  const handleClassification = () => {
    if (!userId || !data?.questions || data.questions.length === 0) {
      toast.error("No user or questions data available for classification.");
      return;
    }
    const allAnswered = data.questions.every(q => q.answered);
    if (!allAnswered) {
      toast.warning("Please answer all questions before submitting for classification.");
      return;
    }
    if (data.isExpired) {
      toast.error("Cannot classify answers for expired questions.");
      return;
    }

    classifyAnswersMutation.mutate({
      userId,
      answers: data.questions.map(q => ({ answer: q.answer }))
    });
    
    toast.info('Processing your answers in the background...');
    return;
  };

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
    handleClassification,
    isSubmitting: submitAnswer.isLoading,
    isClassifying: classifyAnswersMutation.isLoading,
  }
} 