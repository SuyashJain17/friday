'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        localStorage.setItem('authToken', session.access_token)
        router.push('/')
      } else {
        const { data: authStateListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            localStorage.setItem('authToken', session.access_token)
            router.push('/')
          }
        })

        const timeout = setTimeout(() => {
          router.push('/auth')
        }, 5000)

        return () => {
          authStateListener.subscription.unsubscribe()
          clearTimeout(timeout)
        }
      }
    }
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <span className="font-mono text-xs text-muted-foreground animate-pulse">completing sign in...</span>
    </div>
  )
}
