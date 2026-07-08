'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, ArrowRight } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  placeholder?: string
  showSuggestions?: boolean
  autoFocus?: boolean
}

export const SearchBar = React.memo(function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = 'Ask a question or search anything...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
      setQuery('')
    } else if (!query.trim()) {
      inputRef.current?.focus()
    }
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        {/* Pill-shaped elevated glassmorphic search bar */}
        <div
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300 shadow-2xl border ${
            isFocused
              ? 'bg-[#161616]/95 border-primary/60 shadow-primary/20 scale-[1.01]'
              : 'bg-[#121212]/85 border-[#2a2a2a] hover:border-[#404040]'
          } backdrop-blur-xl`}
        >
          {/* Search Icon on left */}
          <Search className="w-5 h-5 text-[#888] shrink-0" />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-white placeholder:text-[#777] text-base md:text-lg font-light leading-normal disabled:opacity-40 py-1"
          />

          {/* Submit button — Circular button matching theme color! Always enabled! */}
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Search"
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-200 shrink-0 bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
})
