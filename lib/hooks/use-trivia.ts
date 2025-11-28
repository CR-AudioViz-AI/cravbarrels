// lib/hooks/use-trivia.ts
// BarrelVerse Trivia Game Hook

'use client'

import { useState, useCallback } from 'react'
import { getClient } from '@/lib/supabase/client'
import type { TriviaQuestion, TriviaCategory, Difficulty, GameType } from '@/lib/types/database'

interface GameState {
  questions: TriviaQuestion[]
  currentIndex: number
  score: number
  proofEarned: number
  answers: { questionId: string; correct: boolean; timeMs: number }[]
  gameType: GameType
  category: TriviaCategory | null
  difficulty: Difficulty | null
  isComplete: boolean
  isLoading: boolean
  error: Error | null
}

const initialState: GameState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  proofEarned: 0,
  answers: [],
  gameType: 'quick_pour',
  category: null,
  difficulty: null,
  isComplete: false,
  isLoading: false,
  error: null,
}

export function useTrivia() {
  const [state, setState] = useState<GameState>(initialState)
  const supabase = getClient()

  // Fetch random trivia questions
  const fetchQuestions = useCallback(async (
    category?: TriviaCategory,
    difficulty?: Difficulty,
    limit: number = 10
  ): Promise<TriviaQuestion[]> => {
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

    const { data, error } = await query.limit(limit * 3) // Fetch extra for randomization

    if (error) throw error

    // Shuffle and take requested amount
    const shuffled = (data || []).sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit)
  }, [supabase])

  // Start a new game
  const startGame = async (
    gameType: GameType = 'quick_pour',
    category?: TriviaCategory,
    difficulty?: Difficulty,
    questionCount: number = 10
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const questions = await fetchQuestions(category, difficulty, questionCount)

      if (questions.length === 0) {
        throw new Error('No questions available for selected criteria')
      }

      setState({
        questions,
        currentIndex: 0,
        score: 0,
        proofEarned: 0,
        answers: [],
        gameType,
        category: category || null,
        difficulty: difficulty || null,
        isComplete: false,
        isLoading: false,
        error: null,
      })

      return { success: true, questionCount: questions.length }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }))
      return { success: false, error: error as Error }
    }
  }

  // Submit an answer
  const submitAnswer = (selectedAnswer: string, timeMs: number = 0) => {
    const currentQuestion = state.questions[state.currentIndex]
    if (!currentQuestion || state.isComplete) return null

    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    const proofForQuestion = isCorrect ? currentQuestion.proof_reward : 0

    const answer = {
      questionId: currentQuestion.id,
      correct: isCorrect,
      timeMs,
    }

    const newAnswers = [...state.answers, answer]
    const newScore = state.score + (isCorrect ? 1 : 0)
    const newProofEarned = state.proofEarned + proofForQuestion
    const isLastQuestion = state.currentIndex >= state.questions.length - 1

    setState(prev => ({
      ...prev,
      currentIndex: isLastQuestion ? prev.currentIndex : prev.currentIndex + 1,
      score: newScore,
      proofEarned: newProofEarned,
      answers: newAnswers,
      isComplete: isLastQuestion,
    }))

    return {
      isCorrect,
      correctAnswer: currentQuestion.correct_answer,
      explanation: currentQuestion.explanation,
      proofEarned: proofForQuestion,
      isComplete: isLastQuestion,
    }
  }

  // Get current question with shuffled answers
  const getCurrentQuestion = () => {
    const question = state.questions[state.currentIndex]
    if (!question) return null

    // Parse wrong_answers if it's a string
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

    // Combine and shuffle answers
    const allAnswers = [question.correct_answer, ...wrongAnswers]
    const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5)

    return {
      ...question,
      shuffledAnswers,
      questionNumber: state.currentIndex + 1,
      totalQuestions: state.questions.length,
    }
  }

  // Save game session to database
  const saveGameSession = async (userId?: string) => {
    if (state.questions.length === 0) return { success: false, error: new Error('No game to save') }

    try {
      const { data, error } = await supabase
        .from('bv_game_sessions')
        .insert({
          user_id: userId || null,
          game_type: state.gameType,
          category: state.category,
          difficulty: state.difficulty,
          total_questions: state.questions.length,
          correct_answers: state.score,
          total_proof_earned: state.proofEarned,
          time_taken: state.answers.reduce((sum, a) => sum + a.timeMs, 0),
          completed: state.isComplete,
          completed_at: state.isComplete ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (error) throw error

      // Save individual question progress if user is logged in
      if (userId && state.answers.length > 0) {
        const progressData = state.answers.map(answer => ({
          user_id: userId,
          question_id: answer.questionId,
          answered_correctly: answer.correct,
          time_to_answer: answer.timeMs,
          proof_earned: answer.correct ? 
            state.questions.find(q => q.id === answer.questionId)?.proof_reward || 0 : 0,
        }))

        await supabase.from('bv_trivia_progress').insert(progressData)
      }

      return { success: true, sessionId: data?.id }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  // Reset game
  const resetGame = () => {
    setState(initialState)
  }

  // Get game stats
  const getGameStats = () => {
    const totalTime = state.answers.reduce((sum, a) => sum + a.timeMs, 0)
    const accuracy = state.questions.length > 0 
      ? (state.score / state.questions.length) * 100 
      : 0

    return {
      score: state.score,
      total: state.questions.length,
      accuracy: Math.round(accuracy),
      proofEarned: state.proofEarned,
      totalTimeMs: totalTime,
      averageTimeMs: state.answers.length > 0 
        ? Math.round(totalTime / state.answers.length) 
        : 0,
    }
  }

  return {
    ...state,
    currentQuestion: getCurrentQuestion(),
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

// Category display info
export const CATEGORY_INFO: Record<TriviaCategory, { label: string; icon: string; color: string }> = {
  bourbon: { label: 'Bourbon', icon: '🥃', color: 'amber' },
  scotch: { label: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'orange' },
  irish: { label: 'Irish', icon: '🍀', color: 'green' },
  japanese: { label: 'Japanese', icon: '🇯🇵', color: 'red' },
  wine: { label: 'Wine', icon: '🍷', color: 'purple' },
  beer: { label: 'Beer', icon: '🍺', color: 'yellow' },
  tequila: { label: 'Tequila', icon: '🌵', color: 'lime' },
  rum: { label: 'Rum', icon: '🏝️', color: 'brown' },
  gin: { label: 'Gin', icon: '🌿', color: 'cyan' },
  vodka: { label: 'Vodka', icon: '❄️', color: 'blue' },
  cognac: { label: 'Cognac', icon: '🍇', color: 'violet' },
  sake: { label: 'Sake', icon: '🍶', color: 'slate' },
  general: { label: 'General', icon: '📚', color: 'gray' },
  history: { label: 'History', icon: '📜', color: 'stone' },
  production: { label: 'Production', icon: '🏭', color: 'zinc' },
  brands: { label: 'Brands', icon: '🏷️', color: 'neutral' },
}

// Difficulty display info
export const DIFFICULTY_INFO: Record<Difficulty, { label: string; color: string; multiplier: number }> = {
  easy: { label: 'Easy', color: 'green', multiplier: 1 },
  medium: { label: 'Medium', color: 'yellow', multiplier: 1.5 },
  hard: { label: 'Hard', color: 'orange', multiplier: 2 },
  expert: { label: 'Expert', color: 'red', multiplier: 2.5 },
}
