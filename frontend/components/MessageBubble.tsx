'use client'

import { motion } from 'framer-motion'
import Markdown from 'react-markdown'
import { Message } from '@/lib/types'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageBubbleProps {
  message: Message
  isFirst?: boolean
}

export function MessageBubble({ message, isFirst = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-2xl px-4 py-3 rounded-xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-foreground border border-border rounded-bl-none'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-sm">
            <Markdown
              components={{
                h1: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mt-3 mb-2 text-foreground" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h3 className="text-base font-bold mt-2 mb-1 text-foreground" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-sm leading-relaxed mb-2 text-foreground" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1 mb-2 text-foreground" {...props} />
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : 'text'

                  return !inline ? (
                    <SyntaxHighlighter
                      language={language}
                      style={atomDark}
                      className="rounded my-2 !text-xs"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="inline px-1.5 py-0.5 rounded bg-muted text-accent text-xs font-mono" {...props}>
                      {children}
                    </code>
                  )
                },
                a: ({ node, ...props }) => (
                  <a className="text-accent hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {message.content}
            </Markdown>
          </div>
        )}
      </div>
    </motion.div>
  )
}
