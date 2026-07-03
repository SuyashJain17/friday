'use client'

import Markdown from 'react-markdown'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { Copy, Check } from 'lucide-react'

interface ResponseStreamProps {
  content: string
  isLoading?: boolean
}

export function ResponseStream({ content, isLoading = false }: ResponseStreamProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!content && !isLoading) return null

  return (
    <div className="w-full">
      {/* Loading state */}
      {isLoading && !content && (
        <div className="flex items-center gap-3 py-2">
          <span className="font-mono text-xs text-primary animate-pulse">thinking</span>
          <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
        </div>
      )}

      {/* Content */}
      {content && (
        <div className="relative group">
          {/* Copy button — appears on hover */}
          <button
            onClick={handleCopy}
            aria-label="Copy response"
            className="absolute top-0 right-0 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            {copied ? (
              <><Check className="w-3 h-3" /> Copied</>
            ) : (
              <><Copy className="w-3 h-3" /> Copy</>
            )}
          </button>

          {/* Prose */}
          <div className="text-white space-y-4 font-serif">
            <Markdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-white tracking-tight font-serif border-b border-white/15 pb-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg md:text-xl font-bold mt-6 mb-2 text-primary tracking-tight font-serif" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base md:text-lg font-semibold mt-5 mb-2 text-white font-serif" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-[15px] md:text-[16px] font-normal leading-7 text-white tracking-normal mb-5 font-serif" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-2.5 mb-5 pl-5 list-disc marker:text-primary font-serif" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="space-y-2.5 mb-5 pl-5 list-decimal marker:text-primary font-medium font-serif" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-[15px] md:text-[16px] font-normal leading-7 text-white tracking-normal pl-1 font-serif" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary bg-white/5 pl-4 py-2.5 my-5 rounded-r-xl text-[#ddd] italic font-normal text-[15px] md:text-[16px] font-serif"
                    {...props}
                  />
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const language = match ? match[1] : 'text'
                  return !inline ? (
                    <div className="my-4 border border-border">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {language}
                        </span>
                      </div>
                      <SyntaxHighlighter
                        language={language}
                        style={{
                          'code[class*="language-"]': { background: 'transparent', color: '#EBEBEB', fontSize: '13px', fontFamily: 'var(--font-mono)' },
                          'pre[class*="language-"]': { background: 'transparent', margin: 0, padding: '16px' },
                          '.token.comment': { color: '#555555' },
                          '.token.keyword': { color: 'var(--primary)' },
                          '.token.string': { color: '#F59E0B' },
                          '.token.number': { color: '#EBEBEB' },
                          '.token.operator': { color: '#EBEBEB' },
                          '.token.function': { color: '#EBEBEB' },
                          '.token.punctuation': { color: '#555555' },
                        }}
                        customStyle={{ background: 'transparent', margin: 0 }}
                        codeTagProps={{ style: { fontFamily: 'var(--font-mono)', fontSize: '13px' } }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="font-mono text-sm text-primary bg-muted px-1.5 py-0.5" {...props}>
                      {children}
                    </code>
                  )
                },
                a: ({ node, ...props }) => (
                  <a
                    className="text-primary underline underline-offset-2 hover:text-foreground transition-colors font-light"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                hr: () => <hr className="rule my-6" />,
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-foreground" {...props} />
                ),
              }}
            >
              {content}
            </Markdown>

            {/* Streaming cursor */}
            {isLoading && (
              <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
