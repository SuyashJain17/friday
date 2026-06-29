import React from 'react'

export function FridayLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer AI Nova Star */}
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
        fill="currentColor"
        className="text-white drop-shadow-[0_0_8px_var(--primary)] transition-all duration-300"
      />
      {/* Inner Theme Core */}
      <path
        d="M12 8C12 10.2091 10.2091 12 8 12C10.2091 12 12 13.7909 12 16C12 13.7909 13.7909 12 16 12C13.7909 12 12 10.2091 12 8Z"
        fill="var(--primary)"
        className="transition-all duration-300"
      />
    </svg>
  )
}
