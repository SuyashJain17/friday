'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Brain, Menu, Plus, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Don't render sidebar shell on auth page
  if (pathname === '/auth') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-full bg-[#090909] text-foreground overflow-hidden font-sans">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block h-full shrink-0 z-30 relative">
        <Sidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] bg-[#0C0C0C] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg text-[#888] hover:text-foreground hover:bg-[#181818] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold text-base text-foreground">Friday</span>
            </Link>
          </div>

          <button
            onClick={() => router.push('/')}
            className="p-1.5 rounded-full bg-[#181818] border border-[#2A2A2A] text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            aria-label="New Search"
          >
            <Plus className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile Slide-over Drawer Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Drawer Content */}
            <div className="relative w-[260px] h-full z-10 bg-[#0C0C0C] shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-3.5 right-3 p-1.5 rounded-lg text-[#888] hover:text-foreground z-50"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              <Sidebar onMobileClose={() => setIsMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Application Viewport */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto relative flex flex-col bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}
