// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Timeout values (in ms)
export const STREAMING_TIMEOUT = 60000 // 60 seconds
export const API_TIMEOUT = 10000 // 10 seconds

// Pagination
export const CONVERSATIONS_PER_PAGE = 12

// UI Constants
export const SEARCH_SUGGESTIONS = [
  'Explain quantum computing',
  'Latest advances in AI',
  'How does photosynthesis work?',
  'Best practices for web development',
  'Explain machine learning',
  'History of the internet',
]

// Animation durations (in seconds)
export const ANIMATION_DURATION = 0.3
export const TRANSITION_DURATION = 0.4

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  INVALID_RESPONSE: 'Invalid response from server.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
}

// Success messages
export const SUCCESS_MESSAGES = {
  COPIED: 'Copied to clipboard',
  DELETED: 'Conversation deleted',
  SHARED: 'Conversation shared',
}
