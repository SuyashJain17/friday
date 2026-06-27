'use client'

import { useEffect, useState } from 'react'
import { fetchConversations, deleteConversation } from '@/lib/api'
import { Conversation } from '@/lib/types'
import { useAuthCheck } from '@/lib/hooks'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function ConversationsPage() {
  const { isLoading: isAuthLoading } = useAuthCheck()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading) {
      loadConversations()
    }
  }, [isAuthLoading])

  const loadConversations = async () => {
    const data = await fetchConversations()
    if (Array.isArray(data)) setConversations(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteConversation(id)
    if (success) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
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
    <div className="flex-1 flex flex-col min-h-full bg-[#0A0A0A] p-6 md:p-12">
      {/* Content */}
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Library</h1>
          <p className="text-sm font-light text-[#888] mt-1">Manage your search history and threads</p>
          <hr className="rule mt-6" />
        </div>
        {isLoading && (
          <p className="font-mono text-xs text-muted-foreground animate-pulse">loading...</p>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className="space-y-4 animate-in">
            <p className="text-sm font-light text-muted-foreground">
              No conversations yet.
            </p>
            <Link
              href="/"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Start a search &rarr;
            </Link>
          </div>
        )}

        {!isLoading && conversations.length > 0 && (
          <div className="space-y-px animate-in">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              {conversations.length} conversations
            </p>

            {conversations.map((convo, idx) => (
              <div
                key={convo.id}
                className="group relative flex items-center border border-border hover:border-primary transition-colors duration-150 animate-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <Link
                  href={`/conversation/${convo.id}`}
                  className="flex-1 flex items-start justify-between px-4 py-4 gap-4"
                >
                  {/* Index */}
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Title & meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-foreground group-hover:text-foreground leading-relaxed line-clamp-1">
                      {convo.title}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">
                      {convo.messages?.length ?? 0} msg &nbsp;&middot;&nbsp;{' '}
                      {new Date(convo.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>

                {/* Delete */}
                <div className="pr-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {deleteConfirm === convo.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(convo.id)}
                        className="font-mono text-[10px] uppercase text-destructive hover:underline"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(convo.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
