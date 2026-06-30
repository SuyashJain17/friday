'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FridayLogo } from '@/components/FridayLogo'

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
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
      <FridayLogo className="w-10 h-10 animate-pulse" />
      <span className="font-sans text-xs text-[#888]">Completing sign in...</span>
    </div>
  )
}
