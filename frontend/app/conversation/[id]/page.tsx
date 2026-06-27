'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { fetchConversation } from '@/lib/api'
import { Conversation, Message } from '@/lib/types'
import { ResponseStream } from '@/components/ResponseStream'
import { SearchBar } from '@/components/SearchBar'
import { useStreaming, useAuthCheck } from '@/lib/hooks'
import Link from 'next/link'

export default function ConversationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = params.id as string
  const followUpParam = searchParams.get('followUp')

  const { isLoading: isAuthLoading } = useAuthCheck()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoadingConvo, setIsLoadingConvo] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    response,
    followUps,
    isLoading: isStreaming,
    startStreaming,
  } = useStreaming({ query: followUpParam || '', conversationId })

  useEffect(() => {
    const load = async () => {
      if (isAuthLoading) return
      const data = await fetchConversation(conversationId)
      if (data) setConversation(data)
      setIsLoadingConvo(false)
    }
    load()
  }, [conversationId, isAuthLoading])

  useEffect(() => {
    if (followUpParam && conversation) startStreaming()
  }, [followUpParam, conversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [response])

  const handleQuestion = (q: string) => {
    if (q.trim()) router.push(`/conversation/${conversationId}?followUp=${encodeURIComponent(q)}`)
  }

  if (isAuthLoading || isLoadingConvo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-mono text-xs text-muted-foreground animate-pulse">
          {isAuthLoading ? 'authenticating' : 'loading conversation'}
        </span>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Conversation not found.</p>
        <Link href="/" className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
          Back to Friday &rarr;
        </Link>
      </div>
    )
  }

  const messages: Message[] = conversation.messages || []

  return (
    <div className="flex-1 flex flex-col justify-between min-h-full bg-[#0A0A0A]">
      {/* Title bar */}
      <div className="px-6 md:px-12 py-3 border-b border-[#181818] bg-[#0C0C0C]/50 flex items-center justify-between shrink-0">
        <p className="text-xs font-mono text-[#888] truncate max-w-lg">
          {conversation.title || 'Untitled Search'}
        </p>
      </div>

      {/* Message thread */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 md:px-0 py-10 space-y-12">
        {messages.map((msg, idx) => (
          <div key={msg.id} className="animate-in" style={{ animationDelay: `${idx * 30}ms` }}>
            {msg.role === 'user' ? (
              <div className="space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  You
                </p>
                <h2 className="text-xl font-semibold text-foreground leading-snug">
                  {msg.content}
                </h2>
                <hr className="rule" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Friday
                </p>
                <ResponseStream content={msg.content} />
              </div>
            )}
          </div>
        ))}

        {/* Streaming response */}
        {(isStreaming || response) && (
          <div className="animate-in">
            {followUpParam && (
              <div className="space-y-3 mb-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  You
                </p>
                <h2 className="text-xl font-semibold text-foreground leading-snug">
                  {followUpParam}
                </h2>
                <hr className="rule" />
              </div>
            )}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Friday
              </p>
              <ResponseStream content={response} isLoading={isStreaming} />
            </div>

            {!isStreaming && response && followUps.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Go further
                </p>
                <div className="space-y-px">
                  {followUps.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestion(q)}
                      className="w-full text-left px-4 py-3 border border-border text-sm font-light text-muted-foreground hover:text-foreground hover:border-primary transition-colors duration-150"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sticky input */}
      <div className="sticky bottom-0 bg-background border-t border-border px-6 md:px-12 py-4">
        <div className="max-w-3xl mx-auto">
          <SearchBar
            onSearch={handleQuestion}
            isLoading={isStreaming}
            placeholder="Ask a follow-up..."
            showSuggestions={false}
          />
        </div>
      </div>
    </div>
  )
}
