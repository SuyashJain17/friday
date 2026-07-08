'use client'

import { useState } from 'react'
import { ExternalLink, BookOpen, Globe, ChevronDown } from 'lucide-react'
import { Source } from '@/lib/types'

interface SourcesListProps {
  sources: Source[]
  isLoading?: boolean
  layout?: 'grid' | 'sidebar'
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function SourcesList({ sources, isLoading = false, layout = 'grid' }: SourcesListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (sources.length === 0 && !isLoading) return null

  // Perplexity Collapsible Right-Side Sidebar Layout
  if (layout === 'sidebar') {
    return (
      <div className="w-full rounded-xl border border-white/10 bg-[#111]/90 overflow-hidden">
        {/* Header */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none group border-b border-white/5"
        >
          <span className="font-sans text-[13px] font-semibold text-[#ccc] group-hover:text-white transition-colors">
            Sources
          </span>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#888]" />
            <span className="text-[11px] font-mono text-[#888]">Web</span>
            <span className="text-[11px] font-mono text-white font-semibold">{isLoading ? '...' : sources.length}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#666] transition-transform duration-200 ml-0.5 ${
                isCollapsed ? '-rotate-90' : ''
              }`}
            />
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && sources.length === 0 && !isCollapsed && (
          <div className="p-2 space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-2.5 py-2 rounded-lg bg-white/5 animate-pulse h-12 space-y-1.5">
                <div className="h-2 bg-white/10 rounded w-1/3" />
                <div className="h-2.5 bg-white/10 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Scrollable compact list — small fixed height like Perplexity */}
        {!isCollapsed && sources.length > 0 && (
          <div
            className="max-h-[360px] overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
          >
            {sources.map((source, idx) => (
              <a
                key={source.url || idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block px-3 py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Globe className="w-3 h-3 text-[#666] shrink-0" />
                  <span className="font-mono text-[10px] text-[#888] truncate">
                    {extractDomain(source.url)}
                  </span>
                </div>
                <p className="font-sans text-[13px] font-medium text-[#ddd] group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {source.title || extractDomain(source.url)}
                </p>
                {source.description && (
                  <p className="font-sans text-[11px] text-[#666] line-clamp-2 mt-0.5 leading-snug">
                    {source.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default Responsive Grid Layout
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3.5">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <h3 className="font-sans text-sm md:text-base font-semibold text-white tracking-normal flex items-center gap-2">
          <span>Sources</span>
          <span className="text-xs font-normal text-[#888] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            {isLoading ? '...' : sources.length}
          </span>
        </h3>
      </div>

      {isLoading && sources.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-[#141414]/80 border border-white/10 p-3.5 animate-pulse h-24 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10" />
                  <div className="h-3 bg-white/10 rounded w-20" />
                </div>
                <div className="w-3.5 h-3.5 bg-white/10 rounded" />
              </div>
              <div className="space-y-1.5 mt-2">
                <div className="h-2.5 bg-white/10 rounded w-full" />
                <div className="h-2.5 bg-white/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sources.map((source, idx) => (
          <a
            key={source.url || idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-[#141414]/90 hover:bg-[#1c1c1c] border border-white/10 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-primary/10 hover:-translate-y-0.5 cursor-pointer"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center font-mono text-[11px] font-medium text-[#aaa] group-hover:text-primary transition-colors shrink-0 border border-white/5 group-hover:border-primary/30">
                  {idx + 1}
                </span>
                <span className="font-sans text-xs font-medium text-[#ccc] group-hover:text-white truncate transition-colors">
                  {extractDomain(source.url)}
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#666] group-hover:text-primary transition-colors shrink-0" />
            </div>

            <p className="font-sans text-xs md:text-sm font-normal text-white/90 group-hover:text-white line-clamp-2 leading-relaxed transition-colors">
              {source.title || extractDomain(source.url)}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
