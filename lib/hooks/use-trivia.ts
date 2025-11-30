'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TriviaQuestion, TriviaCategory, Difficulty, GameType } from '@/lib/types/database'

// Category display information - ALL TriviaCategory values
export const CATEGORY_INFO: Record<TriviaCategory, { label: string; icon: string; color: string }> = {
  bourbon: { label: 'Bourbon', icon: '🥃', color: 'amber' },
  scotch: { label: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'amber' },
  irish: { label: 'Irish', icon: '☘️', color: 'green' },
  japanese: { label: 'Japanese', icon: '🇯🇵', color: 'red' },
  tequila: { label: 'Tequila', icon: '🌵', color: 'lime' },
  rum: { label: 'Rum', icon: '🏝️', color: 'orange' },
  gin: { label: 'Gin', icon: '🫒', color: 'teal' },
  cognac: { label: 'Cognac', icon: '🍇', color: 'purple' },
  general: { label: 'General', icon: '📚', color: 'blue' },
  production: { label: 'Production', icon: '🏭', color: 'stone' },
  history: { label: 'History', icon: '📜', color: 'amber' },
  wine: { label: 'Wine', icon: '🍷', color: 'red' },
  beer: { label: 'Beer', icon: '🍺', color: 'yellow' },
  vodka: { label: 'Vodka', icon: '🧊', color: 'slate' },
  sake: { label: 'Sake', icon: '🍶', color: 'white' },
  brands: { label: 'Brands', icon: '🏷️', color: 'blue' },
}

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; multiplier: number; color: string }> = {
  easy: { label: 'Easy', multiplier: 1, color: 'green' },
  medium: { label: 'Medium', multiplier: 1.5, color: 'yellow' },
  hard: { label: 'Hard', multiplier: 2, color: 'orange' },
  expert: { label: 'Expert', multiplier: 3, color: 'red' },
}

interface TriviaState {
  questions: TriviaQuestion[]
  shuffledAnswersMap: Map<string, string[]>
  currentIndex: number
  score: number
  proofEarned: number
  answers: { questionId: string; answer: string; correct: boolean; timeMs: number }[]
  isComplete: boolean
  gameType: GameType | null
  startTime: Date | null
}

const initialState: TriviaState = {
  questions: [],
  shuffledAnswersMap: new Map(),
  currentIndex: 0,
  score: 0,
  proofEarned: 0,
  answers: [],
  isComplete: false,
  gameType: null,
  startTime: null,
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function useTrivia() {
  const [state, setState] = useState<TriviaState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const preprocessQuestions = useCallback((questions: TriviaQuestion[]): Map<string, string[]> => {
    const answersMap = new Map<string, string[]>()
    
    for (const question of questions) {
      let wrongAnswers: string[]
      if (typeof question.wrong_answers === 'string') {
        try {
          wrongAnswers = JSON.parse(question.wrong_answers)
        } catch {
          wrongAnswers = []
        }
      } else if (Array.isArray(question.wrong_answers)) {
        wrongAnswers = question.wrong_answers as string[]
      } else {
        wrongAnswers = []
      }
      
      const allAnswers = [question.correct_answer, ...wrongAnswers]
      answersMap.set(question.id, shuffleArray(allAnswers))
    }
    
    return answersMap
  }, [])

  const startGame = useCallback(async (
    gameType: GameType,
    category?: TriviaCategory,
    difficulty?: Difficulty,
    limit = 10
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('bv_trivia_questions')
        .select('*')
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const shuffled = shuffleArray(data || []).slice(0, limit)
      const answersMap = preprocessQuestions(shuffled)

      setState({
        questions: shuffled,
        shuffledAnswersMap: answersMap,
        currentIndex: 0,
        score: 0,
        proofEarned: 0,
        answers: [],
        isComplete: false,
        gameType,
        startTime: new Date(),
      })
    } catch (err) {
      console.error('Error starting game:', err)
      setError('Failed to load questions')
    } finally {
      setIsLoading(false)
    }
  }, [preprocessQuestions])

  const submitAnswer = useCallback(async (answer: string, responseTimeMs: number) => {
    const currentQuestion = state.questions[state.currentIndex]
    if (!currentQuestion) return null

    const isCorrect = answer === currentQuestion.correct_answer
    const difficultyMultiplier = DIFFICULTY_INFO[currentQuestion.difficulty]?.multiplier || 1
    const proofForQuestion = isCorrect ? Math.round((currentQuestion.proof_reward || 10) * difficultyMultiplier) : 0

    const isLastQuestion = state.currentIndex >= state.questions.length - 1

    setState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      proofEarned: prev.proofEarned + proofForQuestion,
      answers: [...prev.answers, {
        questionId: currentQuestion.id,
        answer,
        correct: isCorrect,
        timeMs: responseTimeMs,
      }],
      currentIndex: isLastQuestion ? prev.currentIndex : prev.currentIndex + 1,
      isComplete: isLastQuestion,
    }))

    return {
      correct: isCorrect,
      correctAnswer: currentQuestion.correct_answer,
      explanation: currentQuestion.explanation,
      proofEarned: proofForQuestion,
      isComplete: isLastQuestion,
    }
  }, [state.currentIndex, state.questions])

  const currentQuestion = useMemo(() => {
    const question = state.questions[state.currentIndex]
    if (!question) return null

    const shuffledAnswers = state.shuffledAnswersMap.get(question.id) || []

    return {
      ...question,
      shuffledAnswers,
      questionNumber: state.currentIndex + 1,
      totalQuestions: state.questions.length,
    }
  }, [state.questions, state.currentIndex, state.shuffledAnswersMap])

  const saveGameSession = useCallback(async (userId?: string) => {
    if (state.questions.length === 0) return { success: false, error: new Error('No game to save') }

    try {
      const supabase = createClient()
      const { error: saveError } = await supabase.from('bv_game_sessions').insert({
        user_id: userId,
        game_type: state.gameType,
        total_questions: state.questions.length,
        correct_answers: state.score,
        proof_earned: state.proofEarned,
        completed_at: new Date().toISOString(),
      })

      if (saveError) throw saveError

      if (userId && state.proofEarned > 0) {
        const { error: updateError } = await supabase.rpc('add_proof', {
          p_user_id: userId,
          p_amount: state.proofEarned,
          p_transaction_type: 'trivia_reward',
          p_description: `${state.gameType} game: ${state.score}/${state.questions.length} correct`,
        })
        if (updateError) console.error('Failed to add proof:', updateError)
      }

      return { success: true }
    } catch (err) {
      console.error('Error saving game:', err)
      return { success: false, error: err }
    }
  }, [state])

  const resetGame = useCallback(() => {
    setState(initialState)
  }, [])

  const getGameStats = useCallback(() => {
    const totalQuestions = state.questions.length
    const correctAnswers = state.score
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    const avgTimeMs = state.answers.length > 0
      ? Math.round(state.answers.reduce((sum, a) => sum + a.timeMs, 0) / state.answers.length)
      : 0

    return {
      total: totalQuestions,
      score: correctAnswers,
      accuracy,
      avgTimeMs,
      proofEarned: state.proofEarned,
      gameType: state.gameType,
    }
  }, [state])

  return {
    questions: state.questions,
    currentQuestion,
    score: state.score,
    proofEarned: state.proofEarned,
    answers: state.answers,
    isComplete: state.isComplete,
    isLoading,
    error,
    startGame,
    submitAnswer,
    saveGameSession,
    resetGame,
    getGameStats,
    progress: {
      current: state.currentIndex + 1,
      total: state.questions.length,
      percentage: state.questions.length > 0 
        ? Math.round(((state.currentIndex + 1) / state.questions.length) * 100) 
        : 0,
    },
  }
}
