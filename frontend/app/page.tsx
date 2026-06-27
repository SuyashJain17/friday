'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/SearchBar'
import { useAuthCheck } from '@/lib/hooks'

export default function Home() {
  const router = useRouter()
  const { isLoading: isAuthLoading } = useAuthCheck()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsNavigating(true)
      router.push(`/search?q=${encodeURIComponent(query)}`)
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
    <div className="h-full w-full flex flex-col justify-between p-6 md:p-12">
      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        <div className="w-full max-w-2xl space-y-10 animate-in">
          {/* Wordmark */}
          <div className="space-y-3">
            <h1 className="text-[clamp(3.5rem,12vw,7rem)] font-bold leading-none tracking-tight text-foreground">
              Friday
            </h1>
            <p className="text-muted-foreground text-base font-light leading-relaxed max-w-sm">
              Ask anything. Get sourced, honest answers — no noise.
            </p>
          </div>

          {/* Divider */}
          <hr className="rule" />

          {/* Search input */}
          <SearchBar
            onSearch={handleSearch}
            isLoading={isNavigating}
            placeholder="What do you want to know?"
            showSuggestions={true}
          />

          {/* Hint row */}
          <div className="flex items-center gap-6 pt-2">
            {['Web search', 'Cited sources', 'Follow-ups'].map((tag) => (
              <span key={tag} className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-6">
        <hr className="rule mb-6" />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            Powered by AI
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  )
}

