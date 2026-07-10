'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { ResponseStream } from '@/components/ResponseStream'
import { SourcesList } from '@/components/SourcesList'
import { useStreaming, useAuthCheck } from '@/lib/hooks'
import { Source } from '@/lib/types'
import Link from 'next/link'
import { Pencil, Check, X } from 'lucide-react'
import { FridayLogo } from '@/components/FridayLogo'
import { FollowUpsList } from '@/components/FollowUpsList'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoading: isAuthLoading } = useAuthCheck()
  const query = searchParams.get('q') || ''
  const [sources, setSources] = useState<Source[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isEditingQuery, setIsEditingQuery] = useState(false)
  const [editQueryText, setEditQueryText] = useState(query)

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
    if (newConversationId && !conversationId) {
      setConversationId(newConversationId)
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/search/${newConversationId}`)
      }
    }
  }, [newConversationId])

  const handleNewSearch = (newQuery: string) => {
    if (!newQuery.trim()) return
    if (conversationId) {
      router.push(`/search/${conversationId}?followUp=${encodeURIComponent(newQuery)}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(newQuery)}`)
    }
  }

  const handleFollowUp = (q: string) => {
    if (conversationId) {
      router.push(`/search/${conversationId}?followUp=${encodeURIComponent(q)}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }


  return (
    <div className="flex-1 flex flex-col justify-between min-h-full">
      {/* 2-Column Perplexity Layout: Left Chat Stream + Right Side Separate Sources */}
      <div className="flex-1 w-full pl-6 md:pl-8 lg:pl-10 pr-0 py-8 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start justify-between">
        {/* Left Column: Chat Stream — Enforced max-w-[680px] so question/answer area is NOT way too big! */}
        <div className="flex-1 w-full max-w-[680px] lg:mx-auto lg:translate-x-4 space-y-8">
          {/* User Question as sleek right-aligned Chat Bubble (Image 2) */}
          {query && (
            <div className="flex justify-end w-full animate-in group relative">
              <div className="bg-[#1e1e1e]/90 hover:bg-[#252525] border border-white/10 rounded-3xl px-5 py-3.5 max-w-[85%] text-sm md:text-[15px] text-white font-sans leading-relaxed shadow-sm relative">
                {!isEditingQuery && (
                  <button
                    onClick={() => {
                      setIsEditingQuery(true)
                      setEditQueryText(query)
                    }}
                    className="absolute -top-3 -left-3 p-1.5 rounded-full bg-[#2a2a2a] hover:bg-primary text-[#aaa] hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md border border-white/10"
                    title="Edit Question"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}

                {isEditingQuery ? (
                  <div className="space-y-3 min-w-[280px] md:min-w-[400px]">
                    <textarea
                      value={editQueryText}
                      onChange={(e) => setEditQueryText(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0a0a0a] text-white text-sm md:text-[15px] p-3 rounded-xl border border-primary focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsEditingQuery(false)}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingQuery(false)
                          handleNewSearch(editQueryText)
                        }}
                        className="px-3 py-1 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 transition-colors shadow-md cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{query}</p>
                )}
              </div>
            </div>
          )}

          {/* Assistant Answer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FridayLogo className="w-4 h-4" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Friday
              </p>
            </div>
            <ResponseStream content={response} isLoading={isLoading} />

            {/* Perplexity Vertical Follow-up list at the bottom! */}
            {!isLoading && response && (
              <FollowUpsList
                followUps={followUps.length > 0 ? followUps : [
                  `Explain ${query} in simple terms`,
                  `What are the implications of ${query}?`,
                  `What is the history behind ${query}?`,
                ]}
                onSelect={handleFollowUp}
              />
            )}
          </div>
        </div>

        {/* Right Column: Compact scrollable sources panel like Perplexity */}
        {(sources.length > 0 || isLoading) && (
          <div className="w-full lg:w-[310px] shrink-0 lg:sticky lg:top-24 lg:ml-auto lg:-translate-x-5 lg:-translate-y-2.5">
            <SourcesList sources={sources} isLoading={isLoading} layout="sidebar" />
          </div>
        )}
      </div>

      {/* Sticky search bar at bottom */}
      <div className="sticky bottom-0 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-[#1E1E1E] px-6 md:px-12 py-3.5 z-20 mt-8">
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
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 md:px-10 py-8 space-y-6 animate-pulse">
        <div className="w-48 h-8 bg-white/10 rounded-lg" />
        <div className="space-y-3">
          <div className="w-full h-16 bg-white/5 rounded-xl border border-white/5" />
          <div className="w-full h-16 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
