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
  Pencil
} from 'lucide-react'
import { fetchConversations, deleteConversation, renameConversation } from '@/lib/api'
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
      if (currentUser) {
        loadHistory()
      } else {
        setConversations([])
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsAuthChecking(false)
      if (currentUser) {
        loadHistory()
      } else {
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
      className={`h-full flex flex-col justify-between bg-[#090909]/95 backdrop-blur-2xl border-r border-[#1a1a1a] transition-all duration-300 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-3 p-3">
        {/* Logo & Toggle Row — No 'Friday' wordmark */}
        <div className="flex items-center justify-between px-1 py-1">
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
            className="hidden lg:flex p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Minimalist ChatGPT-style New Search Button */}
        <button
          onClick={handleNewSearch}
          className={`w-full flex items-center justify-between gap-3 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#262626] hover:border-[#333333] text-[#e0e0e0] hover:text-white transition-all text-sm font-normal cursor-pointer group ${
            isCollapsed ? 'px-0 justify-center' : 'px-3.5'
          }`}
          title="New Search"
        >
          <div className="flex items-center gap-2.5">
            <SquarePen className="w-4 h-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span>New search</span>}
          </div>
        </button>

        {/* Minimalist Navigation Links */}
        <nav className="flex flex-col gap-1 pt-1">
          <Link
            href="/"
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/' && !pathname.includes('/search')
                ? 'bg-[#181818] text-white font-medium'
                : 'text-[#a0a0a0] hover:bg-[#141414] hover:text-white'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Home"
          >
            <Search className={`w-4 h-4 shrink-0 ${pathname === '/' && !pathname.includes('/search') ? 'text-primary' : ''}`} />
            {!isCollapsed && <span>Home</span>}
          </Link>

          <Link
            href="/conversations"
            onClick={onMobileClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/conversations'
                ? 'bg-[#181818] text-white font-medium'
                : 'text-[#a0a0a0] hover:bg-[#141414] hover:text-white'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
            title="Library"
          >
            <Library className={`w-4 h-4 shrink-0 ${pathname === '/conversations' ? 'text-primary' : ''}`} />
            {!isCollapsed && <span>Library</span>}
          </Link>
        </nav>
      </div>

      {/* Chat History List — Minimalist Recents */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-3 pb-2 pt-3 text-xs font-semibold text-[#666]">
            Recents
          </div>
        )}

        {!isAuthChecking && conversations.length === 0 && !isCollapsed && (
          <div className="px-3 py-4 text-xs font-light text-[#666]">
            {user ? 'No recent searches' : 'Sign in to save searches'}
          </div>
        )}

        {conversations.slice(0, 25).map((convo) => {
          const isActive = pathname === `/conversation/${convo.id}` || pathname === `/search/${convo.id}`
          const isEditing = editingId === convo.id
          return (
            <div
              key={convo.id}
              className={`group relative flex items-center rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#181818] text-white font-medium' 
                  : 'text-[#aaa] hover:bg-[#141414] hover:text-white'
              }`}
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
                    <Check className="w-3.5 h-3.5" />
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
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <Link
                  href={`/search/${convo.id}`}
                  onClick={onMobileClose}
                  className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm truncate ${
                    isCollapsed ? 'justify-center px-0' : 'pr-16'
                  }`}
                  title={convo.title}
                >
                  {!isCollapsed ? (
                    <span className="truncate font-normal">
                      {convo.title || 'Untitled Search'}
                    </span>
                  ) : (
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-[#666]'}`} />
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

      {/* Bottom Profile & Sign Out — Minimalist ChatGPT Style */}
      <div className="p-3 border-t border-[#1a1a1a]">
        {isAuthChecking ? (
          <div className="h-9 w-full rounded-lg bg-transparent" />
        ) : user ? (
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between px-1 py-1'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#333] flex items-center justify-center text-white font-medium text-xs uppercase shrink-0">
                {user.email ? user.email[0] : <User className="w-4 h-4" />}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex flex-col">
                  <span className="text-sm font-normal text-white truncate max-w-[130px]">
                    {user.email?.split('@')[0]}
                  </span>
                  <span className="text-[11px] text-[#888] truncate">
                    Pro Member
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className={`p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-white/5 transition-colors shrink-0 cursor-pointer ${
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary text-black font-semibold text-xs hover:bg-primary/90 transition-colors"
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Sign In</span>}
          </Link>
        )}
      </div>
    </aside>
  )
}
