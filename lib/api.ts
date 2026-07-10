import axios from 'axios'
import { SearchResponse, StreamingChunk } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface StreamTextOptions {
  query: string
  conversationId?: string
}

/**
 * Clean raw LLM XML tags from stored messages
 */
export function cleanMessageContent(content: string): string {
  if (!content) return ''
  let text = content
  text = text.replace(/<SOURCES>[\s\S]*?(?:<SOURCES>|$)/g, '')
  text = text.replace(/<CONVERSATION_ID>[\s\S]*?(?:<CONVERSATION_ID>|$)/g, '')
  text = text.replace(/<FOLLOW_UPS>[\s\S]*?(?:<\/FOLLOW_UPS>|$)/g, '')
  
  const start = text.indexOf('<ANSWER>')
  if (start !== -1) text = text.slice(start + '<ANSWER>'.length)
  
  const end = text.indexOf('</ANSWER>')
  if (end !== -1) text = text.slice(0, end)
  
  return text.trim()
}

/**
 * Stream a search query and process the response
 */
export async function* streamSearch({
  query,
  conversationId,
}: StreamTextOptions): AsyncGenerator<StreamingChunk, void, unknown> {
  try {
    const url = conversationId ? '/api/followups' : '/api/ask'
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query,
        conversationId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || `HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let lastYieldedText = ''
    let yieldedSources = false
    let yieldedConvoId = false
    let yieldedFollowUps = false

    while (true) {
      const { done, value } = await reader.read()
      if (value) {
        buffer += decoder.decode(value, { stream: true })
      }
      if (done) {
        buffer += decoder.decode()
      }

      // 1. Check Sources
      if (!yieldedSources) {
        const sourcesMatch = buffer.match(/<SOURCES>\s*([\s\S]*?)\s*<SOURCES>/)
        if (sourcesMatch) {
          yield { type: 'sources', data: sourcesMatch[1].trim() }
          yieldedSources = true
        }
      }

      // 2. Check Conversation ID
      if (!yieldedConvoId) {
        const convoMatch = buffer.match(/<CONVERSATION_ID>\s*([\s\S]*?)\s*<CONVERSATION_ID>/)
        if (convoMatch) {
          yield { type: 'conversation_id', data: convoMatch[1].trim() }
          yieldedConvoId = true
        }
      }

      // 3. Check Follow Ups
      if (!yieldedFollowUps && (buffer.includes('</FOLLOW_UPS>') || done)) {
        const followUpsMatch = buffer.match(/<FOLLOW_UPS>([\s\S]*?)(?:<\/FOLLOW_UPS>|$)/)
        if (followUpsMatch) {
          const qMatches = [...followUpsMatch[1].matchAll(/<question>\s*([\s\S]*?)\s*<\/question>/g)]
            .map(m => m[1].trim())
            .filter(Boolean)
          if (qMatches.length > 0) {
            yield { type: 'follow_ups', data: JSON.stringify(qMatches) }
            yieldedFollowUps = true
          }
        }
      }

      // 4. Extract Answer Text
      let rawAnswer = buffer
      rawAnswer = rawAnswer.replace(/<SOURCES>[\s\S]*?(?:<SOURCES>|$)/g, '')
      rawAnswer = rawAnswer.replace(/<CONVERSATION_ID>[\s\S]*?(?:<CONVERSATION_ID>|$)/g, '')
      rawAnswer = rawAnswer.replace(/<FOLLOW_UPS>[\s\S]*?(?:<\/FOLLOW_UPS>|$)/g, '')

      const answerStart = rawAnswer.indexOf('<ANSWER>')
      if (answerStart !== -1) {
        rawAnswer = rawAnswer.slice(answerStart + '<ANSWER>'.length)
      }

      const answerEnd = rawAnswer.indexOf('</ANSWER>')
      if (answerEnd !== -1) {
        rawAnswer = rawAnswer.slice(0, answerEnd)
      } else if (!done) {
        rawAnswer = rawAnswer.replace(/<[\/A-Z_]*$/i, '')
      }

      const currentText = rawAnswer.trimStart()
      if (currentText.length > lastYieldedText.length) {
        const delta = currentText.slice(lastYieldedText.length)
        lastYieldedText = currentText
        yield { type: 'text', data: delta }
      }

      if (done) break
    }
  } catch (error) {
    console.error('Stream error:', error)
    yield {
      type: 'error',
      data: error instanceof Error ? error.message : 'Failed to fetch response',
    }
  }
}

/**
 * Helper to extract sources and follow-ups from raw stored content
 */
function parseMessageMetadata(m: any) {
  let sources = []
  let followUps: string[] = []
  if (m.content) {
    const sourcesMatch = m.content.match(/<SOURCES>\s*([\s\S]*?)\s*<SOURCES>/)
    if (sourcesMatch) {
      try { sources = JSON.parse(sourcesMatch[1].trim()) } catch (e) {}
    }
    const followUpsMatch = m.content.match(/<FOLLOW_UPS>([\s\S]*?)(?:<\/FOLLOW_UPS>|$)/)
    if (followUpsMatch) {
      followUps = [...followUpsMatch[1].matchAll(/<question>\s*([\s\S]*?)\s*<\/question>/g)]
        .map(match => match[1].trim())
        .filter(Boolean)
    }
  }
  return {
    ...m,
    role: m.role?.toLowerCase() === 'assistance' ? 'assistant' : 'user',
    content: m.role?.toLowerCase() === 'assistance' ? cleanMessageContent(m.content) : m.content,
    sources: sources.length > 0 ? sources : undefined,
    followUps: followUps.length > 0 ? followUps : undefined,
  }
}

// In-memory caching & request deduplication for fetchConversations
let cachedConversations: any = null
let cacheTimestamp: number = 0
let conversationsInFlight: Promise<any> | null = null
const CONVERSATION_CACHE_TTL = 5000 // 5 seconds

export function invalidateConversationsCache() {
  cachedConversations = null
  cacheTimestamp = 0
}

/**
 * Fetch all conversations for the current user
 */
export async function fetchConversations(forceRefresh = false) {
  const now = Date.now()
  if (!forceRefresh && cachedConversations && now - cacheTimestamp < CONVERSATION_CACHE_TTL) {
    return cachedConversations
  }

  if (!forceRefresh && conversationsInFlight) {
    return conversationsInFlight
  }

  conversationsInFlight = (async () => {
    try {
      const response = await apiClient.get('/api/conversations', { baseURL: '' })
      const conversations = response.data?.conversations
      if (Array.isArray(conversations)) {
        const processed = conversations.map((convo: any) => {
          if (Array.isArray(convo.messages)) {
            convo.messages = convo.messages.map(parseMessageMetadata)
          }
          return convo
        })
        cachedConversations = processed
        cacheTimestamp = Date.now()
        return processed
      }
      return []
    } catch (error: any) {
      if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
        console.error('Failed to fetch conversations:', error)
      }
      return cachedConversations || []
    } finally {
      conversationsInFlight = null
    }
  })()

  return conversationsInFlight
}

/**
 * Fetch details of a single conversation
 */
export async function fetchConversation(id: string, forceRefresh = false) {
  try {
    const url = forceRefresh ? `/api/conversations/${id}?_t=${Date.now()}` : `/api/conversations/${id}`
    const response = await apiClient.get(url, { baseURL: '' })
    const conversation = response.data?.conversation
    if (conversation && Array.isArray(conversation.messages)) {
      conversation.messages = conversation.messages.map(parseMessageMetadata)
    }
    return conversation || null
  } catch (error: any) {
    if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
      console.error('Failed to fetch conversation:', error)
    }
    return null
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string) {
  try {
    await apiClient.delete(`/api/conversations/${id}`, { baseURL: '' })
    invalidateConversationsCache()
    return true
  } catch (error: any) {
    if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
      console.error('Failed to delete conversation:', error)
    }
    return false
  }
}

/**
 * Rename a conversation title
 */
export async function renameConversation(id: string, title: string) {
  try {
    const response = await apiClient.patch(`/api/conversations/${id}`, { title }, { baseURL: '' })
    invalidateConversationsCache()
    return response.data?.conversation || true
  } catch (error: any) {
    if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
      console.error('Failed to rename conversation:', error)
    }
    return false
  }
}

/**
 * Export conversation as text
 */
export async function exportConversation(id: string) {
  try {
    const response = await apiClient.get(`/api/conversations/${id}/export`, {
      baseURL: '',
      responseType: 'blob',
    })
    return response.data
  } catch (error: any) {
    if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
      console.error('Failed to export conversation:', error)
    }
    return null
  }
}
