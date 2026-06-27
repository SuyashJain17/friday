'use client'

import { motion } from 'framer-motion'
import { Conversation } from '@/lib/types'
import Link from 'next/link'
import { MessageCircle, Calendar, Trash2 } from 'lucide-react'

interface ConversationCardProps {
  conversation: Conversation
  onDelete?: (id: string) => void
  isDeleteConfirm?: boolean
  onDeleteConfirm?: (id: string) => void
  onCancelDelete?: () => void
}

export function ConversationCard({
  conversation,
  onDelete,
  isDeleteConfirm = false,
  onDeleteConfirm,
  onCancelDelete,
}: ConversationCardProps) {
  const messageCount = conversation.messages?.length || 0
  const lastMessage = conversation.messages?.[conversation.messages.length - 1]
  const dateCreated = new Date(conversation.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: conversation.createdAt !== new Date().toISOString().split('T')[0] ? 'numeric' : undefined,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
    >
      <Link
        href={`/conversation/${conversation.id}`}
        className="block p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all h-full"
      >
        <div className="space-y-3 pr-10">
          <div className="flex items-start gap-2">
            <MessageCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
              {conversation.title}
            </h3>
          </div>

          {lastMessage && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {lastMessage.content}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {messageCount}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {dateCreated}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete?.(conversation.id)
        }}
        className="absolute top-3 right-3 p-2 rounded-lg bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>

      {/* Delete confirmation */}
      {isDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center gap-2 z-50 p-2"
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCancelDelete?.()
            }}
            className="px-3 py-1 text-xs rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDeleteConfirm?.(conversation.id)
            }}
            className="px-3 py-1 text-xs rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
          >
            Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
