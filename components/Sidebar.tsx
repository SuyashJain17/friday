'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  SquarePen, 
  Search, 
  Library, 
  LogOut, 
  User, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Check,
  X,
  Pencil,
  History
} from 'lucide-react'
import { fetchConversations, deleteConversation, renameConversation, invalidateConversationsCache } from '@/lib/api'
import { Conversation } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { FridayLogo } from '@/components/FridayLogo'

interface SidebarProps {
  onMobileClose?: () => void
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [user, setUser] = useState<any>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState<string>('')

  useEffect(() => {
    // Check local storage for collapse preference on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const saved = localStorage.getItem('sidebar_collapsed')
      if (saved === 'true') setIsCollapsed(true)
    }

    // Load user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsAuthChecking(false)
      if (currentUser && session?.access_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', session.access_token)
        }
        loadHistory()
      } else {
        invalidateConversationsCache()
        setConversations([])
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsAuthChecking(false)
      if (currentUser && session?.access_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', session.access_token)
        }
        loadHistory()
      } else {
        invalidateConversationsCache()
        setConversations([])
      }
    })

    // Interval to refresh history periodically or on path change
    const interval = setInterval(loadHistory, 30000)

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
      if (pathname === `/conversation/${id}` || pathname === `/search/${id}`) {
        router.push('/')
      }
    }
  }

  const startEditing = (e: React.MouseEvent, convo: { id: string; title: string }) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteConfirmId(null)
    setEditingId(convo.id)
    setEditTitle(convo.title || '')
  }

  const handleRenameConvo = async (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!editTitle.trim()) {
      setEditingId(null)
      return
    }
    const success = await renameConversation(id, editTitle.trim())
    if (success) {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c))
    }
    setEditingId(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    invalidateConversationsCache()
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
      className={`h-full flex flex-col justify-between bg-[#020202]/95 backdrop-blur-3xl border-r border-[#1a1a1a] shadow-[4px_0_24px_rgba(0,0,0,0.4)] transition-all duration-300 select-none z-50 ${
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-2 p-3 pb-0">
        {/* Logo & Toggle Row — No 'Friday' wordmark */}
        <div className="flex items-center justify-between px-1 pb-2">
          <Link 
            href="/" 
            onClick={onMobileClose}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-white/5 transition-colors"
            title="Friday Home"
          >
            <FridayLogo className="w-6 h-6 shrink-0" />
          </Link>

          {/* Desktop Collapse Toggle */}
          <button 
            onClick={toggleCollapse}
            aria-label="Toggle Sidebar"
            className="hidden lg:flex p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4.5 h-4.5" strokeWidth={3} /> : <ChevronLeft className="w-4.5 h-4.5" strokeWidth={3} />}
          </button>
        </div>

        {/* Enhanced New Search Button */}
        <button
          onClick={handleNewSearch}
          className={`w-full flex items-center justify-between gap-3 py-3 rounded-xl bg-gradient-to-b from-[#1c1c1c] to-[#121212] hover:from-[#2a2a2a] hover:to-[#1a1a1a] border border-[#2a2a2a] hover:border-primary/50 text-[#e0e0e0] hover:text-white hover:shadow-[0_0_12px_rgba(170,119,255,0.15)] transition-all duration-300 text-sm font-medium cursor-pointer group active:scale-[0.98] ${
            isCollapsed ? 'px-0 justify-center' : 'px-4'
          }`}
          title="New Search"
        >
          <div className="flex items-center gap-3">
            <SquarePen className="w-4.5 h-4.5 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" strokeWidth={2.5} />
            {!isCollapsed && <span className="tracking-wide">New search</span>}
          </div>
        </button>

        {/* Enhanced Navigation Links */}
        <nav className="flex flex-col">
          <Link
            href="/conversations"
            onClick={onMobileClose}
            className={`w-full flex items-center justify-between gap-3 py-3 rounded-xl border transition-all duration-300 text-sm font-medium cursor-pointer group active:scale-[0.98] ${
              pathname === '/conversations'
                ? 'bg-gradient-to-b from-[#1c1c1c] to-[#121212] border-primary/50 text-white shadow-[0_0_12px_rgba(170,119,255,0.15)]'
                : 'bg-gradient-to-b from-[#181818] to-[#0a0a0a] hover:from-[#2a2a2a] hover:to-[#1a1a1a] border-[#2a2a2a] hover:border-primary/30 text-[#e0e0e0] hover:text-white hover:shadow-[0_0_8px_rgba(170,119,255,0.1)]'
            } ${isCollapsed ? 'px-0 justify-center' : 'px-4'}`}
            title="Library"
          >
            <div className="flex items-center gap-3">
              <Library className={`w-4.5 h-4.5 text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 ${
                pathname === '/conversations' ? 'drop-shadow-[0_0_8px_rgba(170,119,255,0.5)]' : ''
              }`} strokeWidth={2.5} />
              {!isCollapsed && <span className="tracking-wide">Library</span>}
            </div>
          </Link>
        </nav>
      </div>

      {/* Chat History List — Enhanced Recents */}
      <div className="flex-1 overflow-y-auto px-2 py-0 custom-scrollbar mt-2">
        {!isCollapsed && (
          <div className="px-3 pb-2 pt-2 text-[10px] font-bold tracking-widest uppercase text-[#555]">
            Recents
          </div>
        )}

        {!isAuthChecking && conversations.length === 0 && !isCollapsed && (
          <div className="px-3 py-4 text-xs font-light text-[#666]">
            {user ? 'No recent searches' : 'Sign in to save searches'}
          </div>
        )}

        {isCollapsed && conversations.length > 0 && (
          <button
            onClick={toggleCollapse}
            className="w-full flex justify-center items-center py-3 rounded-xl bg-gradient-to-b from-[#181818] to-[#0a0a0a] hover:from-[#2a2a2a] hover:to-[#1a1a1a] border border-[#2a2a2a] hover:border-primary/30 text-primary hover:shadow-[0_0_8px_rgba(170,119,255,0.1)] transition-all duration-300 cursor-pointer group active:scale-[0.98]"
            title="Recent Searches"
          >
            <History className="w-4.5 h-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.5} />
          </button>
        )}

        {!isCollapsed && conversations.slice(0, 25).map((convo) => {
          const isActive = pathname === `/conversation/${convo.id}` || pathname === `/search/${convo.id}`
          const isEditing = editingId === convo.id
          return (
            <div
              key={convo.id}
              className={`group relative flex items-center transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-[#1a1a1a] text-white font-medium shadow-sm' 
                  : 'text-[#888] hover:bg-white/5 hover:text-white hover:translate-x-0.5'
              } ${isCollapsed ? 'rounded-xl mx-1 my-0.5' : 'rounded-lg mx-1'}`}
            >
              {isEditing && !isCollapsed ? (
                <form
                  onSubmit={(e) => handleRenameConvo(e, convo.id)}
                  className="flex-1 flex items-center gap-1.5 px-2 py-1.5 min-w-0 z-10 bg-[#181818] rounded-lg border border-primary/50 shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="flex-1 bg-transparent text-white text-xs px-1 py-0.5 rounded focus:outline-none min-w-0"
                  />
                  <button
                    type="submit"
                    className="p-1 rounded text-primary hover:bg-white/10 shrink-0 cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setEditingId(null)
                    }}
                    className="p-1 rounded text-[#aaa] hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" strokeWidth={3} />
                  </button>
                </form>
              ) : (
                <Link
                  href={`/search/${convo.id}`}
                  onClick={onMobileClose}
                  className={`flex-1 flex items-center gap-3 px-2 py-1.5 text-[13px] truncate ${
                    isCollapsed ? 'justify-center px-0 py-2.5' : 'pr-12'
                  }`}
                  title={convo.title}
                >
                  {!isCollapsed ? (
                    <span className="truncate font-normal tracking-wide">
                      {convo.title || 'Untitled Search'}
                    </span>
                  ) : (
                    <MessageSquare className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-[#555] group-hover:text-white'}`} strokeWidth={2.5} />
                  )}
                </Link>
              )}

              {/* Hover Actions — Rename & Delete */}
              {!isCollapsed && !isEditing && (
                <div className="absolute right-1.5 opacity-0 group-hover:opacity-100 flex items-center bg-gradient-to-l from-[#181818] via-[#181818] to-transparent pl-4 pr-1 py-1 transition-all duration-150">
                  {deleteConfirmId === convo.id ? (
                    <div className="flex items-center gap-1 bg-[#222] p-0.5 rounded-lg border border-white/10 shadow-md animate-in fade-in zoom-in-95 duration-150">
                      <button
                        onClick={(e) => handleDeleteConvo(e, convo.id)}
                        className="p-1 rounded bg-destructive text-white hover:bg-destructive/90 transition-colors cursor-pointer"
                        title="Confirm Delete"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeleteConfirmId(null)
                        }}
                        className="p-1 rounded text-[#aaa] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => startEditing(e, convo)}
                        className="p-1 text-[#666] hover:text-white hover:bg-white/5 transition-colors rounded-md cursor-pointer"
                        aria-label="Rename chat"
                        title="Rename chat"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeleteConfirmId(convo.id)
                        }}
                        className="p-1 text-[#666] hover:text-destructive hover:bg-white/5 transition-colors rounded-md cursor-pointer"
                        aria-label="Delete chat"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Profile & Sign Out — Enhanced */}
      <div className="p-4 border-t border-[#1a1a1a] bg-[#020202]">
        {isAuthChecking ? (
          <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
        ) : user ? (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between px-1'}`}>
            <div className="flex items-center gap-3 min-w-0 group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-[#333] flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 shadow-inner group-hover:border-primary/50 transition-colors">
                {user.email ? user.email[0] : <User className="w-4.5 h-4.5" strokeWidth={2.5} />}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex flex-col">
                  <span className="text-sm font-medium text-white truncate max-w-[130px] group-hover:text-primary transition-colors">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-[#666] font-bold tracking-widest truncate">
                    PRO MEMBER
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className={`p-2 rounded-xl text-[#666] hover:text-white hover:bg-white/10 hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer ${
                isCollapsed ? 'w-full flex justify-center' : ''
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            onClick={onMobileClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-black font-bold text-xs hover:opacity-90 hover:shadow-[0_0_15px_rgba(170,119,255,0.4)] active:scale-95 transition-all"
          >
            <User className="w-4 h-4 shrink-0" strokeWidth={3} />
            {!isCollapsed && <span className="tracking-widest uppercase">SIGN IN</span>}
          </Link>
        )}
      </div>
    </aside>
  )
}
