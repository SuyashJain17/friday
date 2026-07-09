'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { streamSearch } from './api'
import { Source } from './types'
import { supabase } from './supabase'

interface UseStreamingOptions {
  query: string
  conversationId?: string
}

interface UseStreamingReturn {
  response: string
  sources: Source[]
  followUps: string[]
  conversationId: string | null
  isLoading: boolean
  error: string | null
  startStreaming: () => Promise<void>
}

export function useStreaming({
  query,
  conversationId,
}: UseStreamingOptions): UseStreamingReturn {
  const [response, setResponse] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [followUps, setFollowUps] = useState<string[]>([])
  const [newConversationId, setNewConversationId] = useState<string | null>(conversationId || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startStreaming = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setResponse('')
    setSources([])
    setFollowUps([])

    try {
      for await (const chunk of streamSearch({ query, conversationId })) {
        if (chunk.type === 'text') {
          setResponse((prev) => prev + chunk.data)
        } else if (chunk.type === 'sources') {
          try {
            const parsedSources = JSON.parse(chunk.data)
            setSources(Array.isArray(parsedSources) ? parsedSources : [parsedSources])
          } catch (e) {
            console.error('Failed to parse sources:', e)
          }
        } else if (chunk.type === 'conversation_id') {
          setNewConversationId(chunk.data)
        } else if (chunk.type === 'follow_ups') {
          try {
            const parsedFollowUps = JSON.parse(chunk.data)
            if (Array.isArray(parsedFollowUps)) setFollowUps(parsedFollowUps)
          } catch (e) {
            console.error('Failed to parse follow ups:', e)
          }
        } else if (chunk.type === 'error') {
          setError(chunk.data)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [query, conversationId])

  return {
    response,
    sources,
    followUps,
    conversationId: newConversationId,
    isLoading,
    error,
    startStreaming,
  }
}

export function useAuthCheck() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasAuthHash = typeof window !== 'undefined' && 
      (window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token='))

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !hasAuthHash) {
        localStorage.removeItem('authToken')
        router.push('/auth')
        setIsLoading(false)
      } else if (session) {
        localStorage.setItem('authToken', session.access_token)
        setIsAuthenticated(true)
        setIsLoading(false)
        if (hasAuthHash && typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
    }

    checkAuth()

    const { data: authStateListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.setItem('authToken', session.access_token)
        setIsAuthenticated(true)
        setIsLoading(false)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      } else if (event === 'SIGNED_OUT' || (!session && !hasAuthHash)) {
        localStorage.removeItem('authToken')
        router.push('/auth')
        setIsLoading(false)
      }
    })

    return () => {
      authStateListener.subscription.unsubscribe()
    }
  }, [router])

  return { isAuthenticated, isLoading }
}
