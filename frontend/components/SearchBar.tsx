'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
  placeholder?: string
  showSuggestions?: boolean
  autoFocus?: boolean
}

const SUGGESTIONS = [
  'How does the nervous system work?',
  'Explain the Fermi paradox',
  'What caused the 2008 financial crisis?',
  'How do vaccines create immunity?',
  'What is dark matter?',
  'Explain transformer neural networks',
]

export function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = 'What do you want to know?',
  showSuggestions = true,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      setShowDrop(false)
      onSearch(query.trim())
      setQuery('')
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (showSuggestions && !query) setShowDrop(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (showSuggestions && !e.target.value) {
      setShowDrop(true)
    } else {
      setShowDrop(false)
    }
  }

  const handleSuggestion = (s: string) => {
    setShowDrop(false)
    onSearch(s)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        {/* Raw bottom-border input — brutalist */}
        <div
          className="flex items-center gap-3 pb-3 transition-colors duration-150"
          style={{
            borderBottom: `1px solid ${isFocused ? '#5EEAD4' : '#1F1F1F'}`,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg font-light leading-none disabled:opacity-40"
          />

          {/* Submit button — only when there is text */}
          {query.trim() && !isLoading && (
            <button
              type="submit"
              aria-label="Search"
              className="w-8 h-8 flex items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-150 flex-shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <span className="font-mono text-xs text-primary animate-pulse flex-shrink-0">
              thinking
            </span>
          )}
        </div>
      </form>

      {/* Suggestion dropdown */}
      {showDrop && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border z-50">
          <p className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Try asking
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onMouseDown={() => handleSuggestion(s)}
              className="w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-100 border-t border-border first-of-type:border-t-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
