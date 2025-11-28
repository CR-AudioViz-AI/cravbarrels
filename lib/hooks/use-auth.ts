// lib/hooks/use-auth.ts
// BarrelVerse Authentication Hook

'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  const supabase = getClient()

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('bv_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
        }))
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  // Sign up with email
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }))
      return { data: null, error: error as Error }
    }
  }

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }))
      return { data: null, error: error as Error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }))
      return { error: error as Error }
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error } = await supabase
        .from('bv_profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({ ...prev, profile: data as Profile }))
      return { data: data as Profile, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Verify age
  const verifyAge = async (birthDate: Date) => {
    if (!state.user) return { success: false, error: new Error('Not authenticated') }

    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const isOver21 = age > 21 || (age === 21 && today >= new Date(birthDate.setFullYear(birthDate.getFullYear() + 21)))

    if (!isOver21) {
      return { success: false, error: new Error('Must be 21 or older') }
    }

    const { error } = await updateProfile({
      birth_date: birthDate.toISOString().split('T')[0],
      age_verified: true,
      age_verified_at: new Date().toISOString(),
    })

    return { success: !error, error }
  }

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    verifyAge,
    isAuthenticated: !!state.user,
    isVerified: state.profile?.age_verified ?? false,
    isPremium: state.profile?.is_premium ?? false,
  }
}
