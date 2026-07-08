'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: authStateListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authStateListener.subscription.unsubscribe()
    }
  }, [])

  const handleAuthAction = async () => {
    if (user) {
      await supabase.auth.signOut()
      localStorage.removeItem('authToken')
      window.location.href = '/auth'
    } else {
      window.location.href = '/auth'
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">Friday</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/conversations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Conversations
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-muted-foreground uppercase hidden lg:inline-block">
                {user.email}
              </span>
              <button
                onClick={handleAuthAction}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs font-mono uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuthAction}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile nav */}
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border/50 md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/conversations"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                Conversations
              </Link>
              {user ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase px-2">
                    {user.email}
                  </span>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleAuthAction()
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleAuthAction()
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  )
}
