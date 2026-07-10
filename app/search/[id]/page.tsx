'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { fetchConversation } from '@/lib/api'
import { Conversation, Message } from '@/lib/types'
import { ResponseStream } from '@/components/ResponseStream'
import { SearchBar } from '@/components/SearchBar'
import { useStreaming, useAuthCheck } from '@/lib/hooks'
import Link from 'next/link'
import { Pencil, Check, X } from 'lucide-react'
import { FridayLogo } from '@/components/FridayLogo'
import { SourcesList } from '@/components/SourcesList'
import { FollowUpsList } from '@/components/FollowUpsList'

export default function SearchConversationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const conversationId = params.id as string
  const followUpParam = searchParams.get('followUp')

  const { isLoading: isAuthLoading } = useAuthCheck()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoadingConvo, setIsLoadingConvo] = useState(true)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editMsgText, setEditMsgText] = useState<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    response,
    sources: streamedSources,
    followUps,
    isLoading: isStreaming,
    startStreaming,
    resetStream,
  } = useStreaming({ query: followUpParam || '', conversationId })

  const lastStreamedFollowUpRef = useRef<string | null>(null)

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
    if (!followUpParam) {
      lastStreamedFollowUpRef.current = null
      return
    }
    if (conversation && followUpParam !== lastStreamedFollowUpRef.current) {
      lastStreamedFollowUpRef.current = followUpParam
      startStreaming()
    }
  }, [followUpParam, conversation, startStreaming])

  useEffect(() => {
    if (!isStreaming && response && followUpParam) {
      const reloadAndClean = async () => {
        const data = await fetchConversation(conversationId, true)
        if (data) {
          setConversation(data)
          resetStream()
          router.replace(`/search/${conversationId}`, { scroll: false })
        }
      }
      reloadAndClean()
    }
  }, [isStreaming, response, followUpParam, conversationId, resetStream, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [response])

  const handleQuestion = (q: string) => {
    if (q.trim()) router.push(`/search/${conversationId}?followUp=${encodeURIComponent(q)}`)
  }

  if (isAuthLoading || isLoadingConvo) {
    return (
      <div className="flex-1 flex flex-col justify-between min-h-full bg-transparent">
        <div className="flex-1 max-w-4xl w-full mx-auto px-6 md:px-10 py-12 space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="w-20 h-4 bg-white/10 rounded-md" />
            <div className="w-3/4 h-8 bg-white/10 rounded-lg" />
          </div>
          <div className="space-y-3 pt-6">
            <div className="w-32 h-4 bg-white/10 rounded-md" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-white/5 rounded" />
              <div className="w-5/6 h-4 bg-white/5 rounded" />
              <div className="w-4/6 h-4 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Search thread not found.</p>
        <Link href="/" className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
          Back to Friday &rarr;
        </Link>
      </div>
    )
  }

  const messages: Message[] = conversation.messages || []
  const activeSources = streamedSources.length > 0
    ? streamedSources
    : messages.slice().reverse().find(m => m.role === 'assistant' && m.sources && m.sources.length > 0)?.sources || []

  return (
    <div className="flex-1 flex flex-col justify-between min-h-full bg-transparent">


      {/* 2-Column Perplexity Layout: Left Chat Stream + Right Side Separate Sources */}
      <div className="flex-1 w-full pl-6 md:pl-8 lg:pl-10 pr-0 py-10 flex flex-col lg:flex-row gap-10 lg:gap-12 items-start justify-between">

        {/* Left Column: Entire Chat Stream — Enforced max-w-[680px] so question/answer area is NOT way too big! */}
        <div className="flex-1 w-full max-w-[680px] lg:mx-auto lg:translate-x-4 space-y-8">
          {messages.map((msg, idx) => {
            const isEditing = editingMsgId === (msg.id || `msg-${idx}`)
            return (
              <div key={msg.id || idx} className="animate-in" style={{ animationDelay: `${idx * 30}ms` }}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end w-full group relative">
                    <div className="bg-[#1e1e1e]/90 hover:bg-[#252525] border border-white/10 rounded-3xl px-5 py-3.5 max-w-[85%] text-sm md:text-[15px] text-white font-sans leading-relaxed shadow-sm relative">
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingMsgId(msg.id || `msg-${idx}`)
                            setEditMsgText(msg.content)
                          }}
                          className="absolute -top-3 -left-3 p-1.5 rounded-full bg-[#2a2a2a] hover:bg-primary text-[#aaa] hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md border border-white/10"
                          title="Edit Question"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isEditing ? (
                        <div className="space-y-3 min-w-[280px] md:min-w-[400px]">
                          <textarea
                            value={editMsgText}
                            onChange={(e) => setEditMsgText(e.target.value)}
                            rows={3}
                            className="w-full bg-[#0a0a0a] text-white text-sm md:text-[15px] p-3 rounded-xl border border-primary focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-none"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingMsgId(null)}
                              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                setEditingMsgId(null)
                                handleQuestion(editMsgText)
                              }}
                              className="px-3 py-1 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 transition-colors shadow-md cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FridayLogo className="w-4 h-4" />
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Friday
                      </p>
                    </div>
                    <ResponseStream content={msg.content} />
                    {msg.followUps && msg.followUps.length > 0 && (
                      <FollowUpsList followUps={msg.followUps} onSelect={handleQuestion} />
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Streaming response */}
          {(isStreaming || response) && (
            <div className="animate-in space-y-8">
              {followUpParam && (
                <div className="flex justify-end w-full group relative">
                  <div className="bg-[#1e1e1e]/90 hover:bg-[#252525] border border-white/10 rounded-3xl px-5 py-3.5 max-w-[85%] text-sm md:text-[15px] text-white font-sans leading-relaxed shadow-sm relative">
                    {editingMsgId !== 'follow-up' && (
                      <button
                        onClick={() => {
                          setEditingMsgId('follow-up')
                          setEditMsgText(followUpParam)
                        }}
                        className="absolute -top-3 -left-3 p-1.5 rounded-full bg-[#2a2a2a] hover:bg-primary text-[#aaa] hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md border border-white/10"
                        title="Edit Question"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {editingMsgId === 'follow-up' ? (
                      <div className="space-y-3 min-w-[280px] md:min-w-[400px]">
                        <textarea
                          value={editMsgText}
                          onChange={(e) => setEditMsgText(e.target.value)}
                          rows={3}
                          className="w-full bg-[#0a0a0a] text-white text-sm md:text-[15px] p-3 rounded-xl border border-primary focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingMsgId(null)}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setEditingMsgId(null)
                              handleQuestion(editMsgText)
                            }}
                            className="px-3 py-1 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 transition-colors shadow-md cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{followUpParam}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FridayLogo className="w-4 h-4" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Friday
                  </p>
                </div>
                <ResponseStream content={response} isLoading={isStreaming} />
                {!isStreaming && response && (
                  <FollowUpsList
                    followUps={followUps.length > 0 ? followUps : [
                      `Tell me more about ${followUpParam}`,
                      `What are the practical applications?`,
                      `How does this compare to alternatives?`,
                    ]}
                    onSelect={handleQuestion}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Compact scrollable sources panel like Perplexity */}
        {activeSources.length > 0 && (
          <div className="w-full lg:w-[310px] shrink-0 lg:sticky lg:top-24 lg:ml-auto lg:-translate-x-5 lg:-translate-y-2.5">
            <SourcesList sources={activeSources} isLoading={isStreaming} layout="sidebar" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sticky input */}
      <div className="sticky bottom-0 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-border px-6 md:px-12 py-4">
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
