// lib/hooks/use-proof.ts
// BarrelVerse $PROOF Token Hook

'use client'

import { useState, useCallback, useEffect } from 'react'
import { getClient } from '@/lib/supabase/client'
import type { ProofTransaction, TransactionType } from '@/lib/types/database'

interface ProofState {
  balance: number
  totalEarned: number
  transactions: ProofTransaction[]
  isLoading: boolean
  error: Error | null
}

export function useProof(userId?: string) {
  const [state, setState] = useState<ProofState>({
    balance: 0,
    totalEarned: 0,
    transactions: [],
    isLoading: false,
    error: null,
  })

  const supabase = getClient()

  // Fetch user's $PROOF balance and transactions
  const fetchProofData = useCallback(async () => {
    if (!userId) {
      setState(prev => ({ ...prev, balance: 0, totalEarned: 0, transactions: [] }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Fetch profile for balance
      const { data: profile, error: profileError } = await supabase
        .from('bv_profiles')
        .select('proof_balance, total_proof_earned')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Fetch recent transactions
      const { data: transactions, error: txError } = await supabase
        .from('bv_proof_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (txError) throw txError

      setState({
        balance: profile?.proof_balance || 0,
        totalEarned: profile?.total_proof_earned || 0,
        transactions: transactions || [],
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }))
    }
  }, [userId, supabase])

  // Award $PROOF to user
  const awardProof = async (
    amount: number,
    source: string,
    description?: string,
    referenceId?: string
  ) => {
    if (!userId) return { success: false, error: new Error('Must be logged in') }
    if (amount <= 0) return { success: false, error: new Error('Amount must be positive') }

    try {
      // Call the database function to award proof
      const { data, error } = await supabase.rpc('award_proof', {
        p_user_id: userId,
        p_amount: amount,
        p_source: source,
        p_description: description || null,
        p_reference_id: referenceId || null,
      })

      if (error) throw error

      // Update local state
      const newBalance = data as number
      setState(prev => ({
        ...prev,
        balance: newBalance,
        totalEarned: prev.totalEarned + amount,
      }))

      // Refresh transactions
      await fetchProofData()

      return { success: true, newBalance }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  // Spend $PROOF
  const spendProof = async (
    amount: number,
    source: string,
    description?: string,
    referenceId?: string
  ) => {
    if (!userId) return { success: false, error: new Error('Must be logged in') }
    if (amount <= 0) return { success: false, error: new Error('Amount must be positive') }
    if (amount > state.balance) return { success: false, error: new Error('Insufficient balance') }

    try {
      // Call the database function with negative amount for spending
      const { data, error } = await supabase.rpc('award_proof', {
        p_user_id: userId,
        p_amount: -amount,
        p_source: source,
        p_description: description || null,
        p_reference_id: referenceId || null,
      })

      if (error) throw error

      const newBalance = data as number
      setState(prev => ({
        ...prev,
        balance: newBalance,
      }))

      // Refresh transactions
      await fetchProofData()

      return { success: true, newBalance }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }

  // Get transaction history by type
  const getTransactionsByType = useCallback((type: TransactionType): ProofTransaction[] => {
    return state.transactions.filter(tx => tx.transaction_type === type)
  }, [state.transactions])

  // Get recent earnings
  const getRecentEarnings = useCallback((days: number = 7): number => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return state.transactions
      .filter(tx => {
        const txDate = new Date(tx.created_at)
        return txDate >= cutoffDate && tx.amount > 0
      })
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [state.transactions])

  // Get earning rate (per day average)
  const getEarningRate = useCallback((): number => {
    if (state.transactions.length === 0) return 0

    const earnings = state.transactions.filter(tx => tx.amount > 0)
    if (earnings.length === 0) return 0

    const oldestTx = earnings[earnings.length - 1]
    const daysSinceFirst = Math.max(1, 
      Math.floor((Date.now() - new Date(oldestTx.created_at).getTime()) / (1000 * 60 * 60 * 24))
    )

    return Math.round(state.totalEarned / daysSinceFirst)
  }, [state.transactions, state.totalEarned])

  // Format amount with $PROOF symbol
  const formatProof = (amount: number): string => {
    return `${amount.toLocaleString()} $PROOF`
  }

  // Load data on mount
  useEffect(() => {
    fetchProofData()
  }, [fetchProofData])

  return {
    ...state,
    fetchProofData,
    awardProof,
    spendProof,
    getTransactionsByType,
    getRecentEarnings,
    getEarningRate,
    formatProof,
    canAfford: (cost: number) => state.balance >= cost,
  }
}

// Transaction type display info
export const TRANSACTION_TYPE_INFO: Record<TransactionType, { 
  label: string
  icon: string
  color: string
  isPositive: boolean 
}> = {
  earn: { label: 'Earned', icon: '💰', color: 'green', isPositive: true },
  spend: { label: 'Spent', icon: '🛒', color: 'red', isPositive: false },
  bonus: { label: 'Bonus', icon: '🎁', color: 'purple', isPositive: true },
  refund: { label: 'Refund', icon: '↩️', color: 'blue', isPositive: true },
  transfer_in: { label: 'Received', icon: '📥', color: 'green', isPositive: true },
  transfer_out: { label: 'Sent', icon: '📤', color: 'orange', isPositive: false },
  purchase: { label: 'Purchase', icon: '💎', color: 'amber', isPositive: true },
}

// Source display info
export const SOURCE_INFO: Record<string, { label: string; icon: string }> = {
  trivia_game: { label: 'Trivia Game', icon: '🎮' },
  daily_bonus: { label: 'Daily Bonus', icon: '📅' },
  achievement: { label: 'Achievement', icon: '🏆' },
  referral: { label: 'Referral', icon: '👥' },
  course_completion: { label: 'Course Complete', icon: '🎓' },
  review_bonus: { label: 'Review Bonus', icon: '⭐' },
  collection_milestone: { label: 'Collection', icon: '📦' },
  reward_redemption: { label: 'Reward', icon: '🎁' },
  subscription_bonus: { label: 'Premium Bonus', icon: '👑' },
  admin_adjustment: { label: 'Adjustment', icon: '⚙️' },
}
