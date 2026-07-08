'use client'

import { motion } from 'framer-motion'

export function LoadingSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="space-y-4"
    >
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-20 bg-muted rounded mt-6" />
    </motion.div>
  )
}

export function ResponseSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          className="h-3 bg-muted rounded"
          style={{ width: `${90 - i * 10}%` }}
        />
      ))}
    </div>
  )
}

export function ConversationsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          className="h-32 bg-muted rounded-xl"
        />
      ))}
    </div>
  )
}
