'use client'

import { CornerDownRight } from 'lucide-react'

interface FollowUpsListProps {
  followUps: string[]
  onSelect: (question: string) => void
}

export function FollowUpsList({ followUps, onSelect }: FollowUpsListProps) {
  if (!followUps || followUps.length === 0) return null

  return (
    <div className="w-full mt-8 animate-in">
      {/* Title matching Perplexity Image 1 */}
      <h3 className="font-sans text-base md:text-lg font-semibold text-white tracking-normal mb-3">
        Follow-ups
      </h3>

      {/* Vertical list with CornerDownRight arrows and bottom dividers */}
      <div className="flex flex-col border-t border-white/10">
        {followUps.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="w-full text-left py-3.5 px-2 border-b border-white/10 hover:border-primary/50 flex items-start gap-3 group cursor-pointer transition-all duration-150 bg-transparent hover:bg-white/[0.02] rounded-lg"
          >
            <CornerDownRight className="w-4 h-4 text-muted-foreground/70 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
            <span className="font-sans text-sm md:text-[15px] text-[#ccc] group-hover:text-white transition-colors leading-relaxed">
              {q}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
