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

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-black/40 backdrop-blur-md pointer-events-none" />
      <div className="flex-1 flex flex-col min-h-full bg-transparent p-6 md:p-12">
      {/* Content */}
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Library</h1>
          <p className="text-sm font-light text-[#888] mt-1">Manage your search history and threads</p>
          <hr className="rule mt-6" />
        </div>
        {(isLoading || isAuthLoading) && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-xl w-full" />
            ))}
          </div>
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
                  href={`/search/${convo.id}`}
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
                    <div className="flex items-center gap-1.5 bg-[#1f1f1f] px-2 py-1 rounded-lg border border-white/10 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeleteConfirm(null)
                        }}
                        className="text-xs font-normal text-[#aaa] hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(convo.id)
                        }}
                        className="text-xs font-medium text-white bg-destructive hover:bg-destructive/90 px-2.5 py-0.5 rounded transition-colors shadow-sm cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteConfirm(convo.id)
                      }}
                      className="p-1.5 text-[#666] hover:text-destructive hover:bg-white/5 transition-colors rounded-lg cursor-pointer"
                      aria-label="Delete conversation"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
