'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Brain, 
  Plus, 
  Search, 
  History, 
  LogOut, 
  User, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { fetchConversations, deleteConversation } from '@/lib/api'
import { Conversation } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  onMobileClose?: () => void
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [user, setUser] = useState<any>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    // Check local storage for collapse preference on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const saved = localStorage.getItem('sidebar_collapsed')
      if (saved === 'true') setIsCollapsed(true)
    }

    // Load user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    loadHistory()

    // Interval to refresh history periodically or on path change
    const interval = setInterval(loadHistory, 10000)

    return () => {
      authListener.subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [pathname])

  const loadHistory = async () => {
    const data = await fetchConversations()
    if (Array.isArray(data)) {
      setConversations(data)
    }
    setIsLoadingHistory(false)
  }

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_collapsed', String(next))
    }
  }

  const handleDeleteConvo = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const success = await deleteConversation(id)
    if (success) {
      setConversations(prev => prev.filter(c => c.id !== id))
      setDeleteConfirmId(null)
      if (pathname === `/conversation/${id}`) {
        router.push('/')
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    router.push('/auth')
    onMobileClose?.()
  }

  const handleNewSearch = () => {
    router.push('/')
    onMobileClose?.()
  }

  return (
    <aside 
      className={`h-full flex flex-col justify-between bg-[#0C0C0C] border-r border-[#1E1E1E] transition-all duration-300 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 p-3">
        {/* Logo Row */}
        <div className="flex items-center justify-between px-2 py-1">
          <Link 
            href="/" 
            onClick={onMobileClose}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-base tracking-tight text-foreground truncate font-mono">
                Friday
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button 
            onClick={toggleCollapse}
            aria-label="Toggle Sidebar"
            className="hidden lg:flex p-1.5 rounded-md text-[#666] hover:text-foreground hover:bg-[#1A1A1A] transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Prominent + New Search Button */}
        <button
          onClick={handleNewSearch}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${
            isCollapsed 
              ? 'px-0 bg-[#181818] hover:bg-primary hover:text-primary-foreground text-foreground border border-[#2A2A2A]' 
              : 'px-4 bg-[#181818] hover:bg-[#222] text-foreground border border-[#2A2A2A] justify-start'
          }`}
          title="New Search"
        >
          <Plus className="w-4 h-4 text-primary shrink-0" />
          {!isCollapsed && <span className="truncate">New</span>}
        </button>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1 pt-1">
          <Link
            href="/"
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/' && !pathname.includes('/search')
                ? 'bg-[#1C1C1C] text-foreground font-medium'
                : 'text-[#888] hover:bg-[#141414] hover:text-foreground'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Home"
          >
            <Search className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Home</span>}
          </Link>

          <Link
            href="/conversations"
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/conversations'
                ? 'bg-[#1C1C1C] text-foreground font-medium'
                : 'text-[#888] hover:bg-[#141414] hover:text-foreground'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Library"
          >
            <History className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Library</span>}
          </Link>
        </nav>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-3 pb-2 pt-1 flex items-center justify-between border-t border-[#181818]">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#555]">
              History
            </span>
          </div>
        )}

        {isLoadingHistory && !isCollapsed && (
          <div className="px-3 py-4 text-xs font-mono text-[#555] animate-pulse">
            loading history...
          </div>
        )}

        {!isLoadingHistory && conversations.length === 0 && !isCollapsed && (
          <div className="px-3 py-4 text-xs font-light text-[#555]">
            No chats yet
          </div>
        )}

        {conversations.slice(0, 25).map((convo) => {
          const isActive = pathname === `/conversation/${convo.id}`
          return (
            <div
              key={convo.id}
              className={`group relative flex items-center rounded-lg transition-all duration-150 ${
                isActive ? 'bg-[#1E1E1E] text-foreground' : 'text-[#888] hover:bg-[#141414] hover:text-foreground'
              }`}
            >
              <Link
                href={`/conversation/${convo.id}`}
                onClick={onMobileClose}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 text-xs truncate ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title={convo.title}
              >
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-[#555]'}`} />
                {!isCollapsed && (
                  <span className="truncate font-light leading-normal">
                    {convo.title || 'Untitled Search'}
                  </span>
                )}
              </Link>

              {/* Hover Delete Action */}
              {!isCollapsed && (
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center bg-[#141414] group-hover:bg-[#141414] pl-1 rounded transition-opacity">
                  {deleteConfirmId === convo.id ? (
                    <button
                      onClick={(e) => handleDeleteConvo(e, convo.id)}
                      className="text-[10px] font-mono text-destructive px-1.5 py-0.5 hover:underline bg-destructive/10 rounded"
                      title="Confirm Delete"
                    >
                      del?
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteConfirmId(convo.id)
                      }}
                      className="p-1 text-[#666] hover:text-destructive transition-colors rounded"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Profile & Sign Out */}
      <div className="p-3 border-t border-[#1E1E1E] bg-[#0A0A0A]">
        {user ? (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between px-2 py-1'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-primary font-mono text-xs uppercase font-bold shrink-0">
                {user.email ? user.email[0] : <User className="w-3.5 h-3.5" />}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-[#555] truncate">
                    Free Plan
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className={`p-1.5 rounded-lg text-[#666] hover:text-destructive hover:bg-[#181818] transition-colors shrink-0 ${
                isCollapsed ? 'w-full flex justify-center' : ''
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            onClick={onMobileClose}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors"
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Sign In</span>}
          </Link>
        )}
      </div>
    </aside>
  )
}
