export interface Source {
  title: string
  url: string
  description?: string
}

export interface SearchResponse {
  answer: string
  sources: Source[]
  conversationId: string
  relatedQuestions?: string[]
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  followUps?: string[]
  timestamp: string
}

export interface StreamingChunk {
  type: 'text' | 'sources' | 'conversation_id' | 'follow_ups' | 'error'
  data: string
}

