'use client'

import { ExternalLink } from 'lucide-react'
import { Source } from '@/lib/types'

interface SourcesListProps {
  sources: Source[]
  isLoading?: boolean
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function SourcesList({ sources, isLoading = false }: SourcesListProps) {
  if (sources.length === 0 && !isLoading) return null

  return (
    <div className="w-full">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
        Sources ({isLoading ? '...' : sources.length})
      </p>

      {/* Loading skeleton */}
      {isLoading && sources.length === 0 && (
        <div className="space-y-px">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border px-3 py-2.5 animate-pulse">
              <div className="h-2.5 bg-muted rounded w-1/2 mb-1.5" />
              <div className="h-2 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Source list */}
      <div className="space-y-px">
        {sources.map((source, idx) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-3 border border-border px-3 py-2.5 hover:border-primary group transition-colors duration-150 animate-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex-1 min-w-0">
              {/* Index + domain */}
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-accent truncate">
                  {extractDomain(source.url)}
                </span>
              </div>
              {/* Title */}
              <p className="text-xs font-light text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 leading-relaxed">
                {source.title}
              </p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  )
}
