'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/SearchBar'
import { useAuthCheck } from '@/lib/hooks'
import { Globe, FileText, Layers, Lightbulb } from 'lucide-react'
import { FridayLogo } from '@/components/FridayLogo'

export default function Home() {
  const router = useRouter()
  const { isLoading: isAuthLoading } = useAuthCheck()
  const [isNavigating, setIsNavigating] = useState(false)
  const [selectedMode, setSelectedMode] = useState('pro')

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsNavigating(true)
      router.push(`/search?q=${encodeURIComponent(query)}&mode=${selectedMode}`)
    }
  }


  return (
    <div className="h-full w-full flex flex-col justify-between p-6 md:p-12 relative">
      {/* Top Left Logo Header */}
      <header className="absolute top-6 left-6 md:left-10 z-20 flex items-center gap-2.5 select-none">
        <FridayLogo className="w-6 h-6" />
        <span className="font-sans text-xl font-normal tracking-wide text-white">
          Friday
        </span>
      </header>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        <div className="w-full max-w-3xl space-y-6 animate-in">
          {/* Headline */}
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-[clamp(3.5rem,8vw,6rem)] font-normal leading-tight tracking-tight text-white font-sans drop-shadow-lg">
              Ask anything.
            </h1>
          </div>

          {/* Search input */}
          <div className="w-full">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isNavigating}
              placeholder="Ask a question or search anything..."
              showSuggestions={true}
              autoFocus={true}
            />
          </div>

          {/* Search modes row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 pt-2">
            {[
              { id: 'pro', label: 'Pro Search', icon: Globe },
              { id: 'research', label: 'Research', icon: FileText },
              { id: 'deep', label: 'Deep Research', icon: Layers },
              { id: 'reasoning', label: 'Reasoning', icon: Lightbulb },
            ].map((mode) => {
              const Icon = mode.icon
              const isSelected = selectedMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/20 border border-primary/60 text-primary shadow-primary/30 scale-[1.03]'
                      : 'bg-[#161616]/80 hover:bg-[#222]/90 border border-[#2a2a2a] hover:border-[#404040] text-[#ccc] hover:text-white shadow-sm'
                  } backdrop-blur-md`}
                >
                  <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isSelected ? 'text-primary' : 'text-[#888]'}`} />
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer matching screenshot */}
      <footer className="w-full pb-8 z-10 flex flex-col items-center justify-center select-none">
        <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-white/20 to-white/40 mb-3" />
        <span className="font-sans text-sm md:text-base font-light text-[#999] tracking-normal mb-3">
          The knowledge to answer anything
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] animate-pulse" />
      </footer>
    </div>
  )
}


