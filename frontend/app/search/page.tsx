'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { ResponseStream } from '@/components/ResponseStream'
import { SourcesList } from '@/components/SourcesList'
import { useStreaming, useAuthCheck } from '@/lib/hooks'
import { Source } from '@/lib/types'
import Link from 'next/link'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoading: isAuthLoading } = useAuthCheck()
  const query = searchParams.get('q') || ''
  const [sources, setSources] = useState<Source[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)

  const {
    response,
    sources: streamedSources,
    followUps,
    conversationId: newConversationId,
    isLoading,
    startStreaming,
  } = useStreaming({ query })

  useEffect(() => {
    if (query.trim() && !isAuthLoading) startStreaming()
  }, [query, isAuthLoading])

  useEffect(() => {
    if (streamedSources.length > 0) setSources(streamedSources)
  }, [streamedSources])

  useEffect(() => {
    if (newConversationId && !conversationId) setConversationId(newConversationId)
  }, [newConversationId])

  const handleNewSearch = (newQuery: string) => {
    if (newQuery.trim()) router.push(`/search?q=${encodeURIComponent(newQuery)}`)
  }

  const handleFollowUp = (q: string) => {
    if (conversationId) {
      router.push(`/conversation/${conversationId}?followUp=${encodeURIComponent(q)}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-mono text-xs text-muted-foreground animate-pulse">authenticating</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-full">
      {/* Main layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-6xl w-full mx-auto">
        {/* Left column — answer */}
        <div className="flex-1 px-6 md:px-10 py-8 md:border-r border-[#1E1E1E]">
          {/* Query as headline */}
          {query && (
            <div className="mb-6 animate-in">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-snug tracking-tight">
                {query}
              </h1>
              <hr className="rule mt-4" />
            </div>
          )}

          {/* Response */}
          <div className="animate-in delay-1">
            <ResponseStream content={response} isLoading={isLoading} />
          </div>

          {/* Follow-up suggestions */}
          {!isLoading && response && (
            <div className="mt-8 animate-in delay-2">
              <hr className="rule mb-5" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Related
              </p>
              <div className="space-y-1">
                {(followUps.length > 0 ? followUps : [
                  `Explain ${query} in simple terms`,
                  `What are the implications of ${query}?`,
                  `What is the history behind ${query}?`,
                ]).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFollowUp(q)}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#222] text-xs font-light text-[#BBB] hover:text-foreground hover:border-primary/50 transition-all"
                  >
                    <span className="text-primary mr-2 font-mono">&rarr;</span> {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — sources */}
        {(sources.length > 0 || isLoading) && (
          <aside className="w-full md:w-72 lg:w-80 shrink-0 px-6 md:px-8 py-8">
            <SourcesList sources={sources} isLoading={isLoading} />
          </aside>
        )}
      </div>

      {/* Sticky search bar at bottom */}
      <div className="sticky bottom-0 bg-[#0A0A0A] border-t border-[#1E1E1E] px-6 md:px-12 py-3.5 z-20 mt-8">
        <div className="max-w-4xl mx-auto">
          <SearchBar
            onSearch={handleNewSearch}
            isLoading={isLoading}
            placeholder="Ask a follow-up..."
            showSuggestions={false}
          />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-mono text-xs text-muted-foreground animate-pulse">loading</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
