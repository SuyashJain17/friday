'use client'

import { useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

export default function ConversationRedirectPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = params.id as string
  const followUpParam = searchParams.get('followUp')

  useEffect(() => {
    if (conversationId) {
      const url = followUpParam 
        ? `/search/${conversationId}?followUp=${encodeURIComponent(followUpParam)}`
        : `/search/${conversationId}`
      router.replace(url)
    }
  }, [conversationId, followUpParam, router])

  return (
    <div className="flex-1 flex items-center justify-center min-h-full bg-transparent">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}
