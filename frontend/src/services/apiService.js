import axios from 'axios'
import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Supabase Auth Bearer JWT token if available
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session && session.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (err) {
    console.warn('[API Client Warning] Supabase session fetch error:', err)
  }
  return config
})

export const apiService = {
  sendChatMessage: async (message, sessionId = null) => {
    const res = await apiClient.post('/chat/message', { message, session_id: sessionId })
    return res.data
  },

  sendGuideMessage: async (message, chatHistory = [], sessionId = null) => {
    const res = await apiClient.post('/chat/guide', {
      message,
      chat_history: chatHistory,
      session_id: sessionId
    })
    return res.data
  },

  generateItinerary: async (tripParams) => {
    const res = await apiClient.post('/itinerary/generate', tripParams)
    return res.data
  },

  editItinerary: async (itineraryId, editData) => {
    const res = await apiClient.put(`/itinerary/${itineraryId}/edit`, editData)
    return res.data
  },

  getSharedItinerary: async (shareToken) => {
    const res = await apiClient.get(`/itinerary/share/${shareToken}`)
    return res.data
  },

  getItineraryHistory: async () => {
    const res = await apiClient.get('/itinerary/history')
    return res.data
  },

  getItineraryDetail: async (itineraryId) => {
    const res = await apiClient.get(`/itinerary/${itineraryId}`)
    return res.data
  },

  getRecommendations: async () => {
    const res = await apiClient.get('/itinerary/recommendations')
    return res.data
  },

  // Admin — all require an is_admin profile row; backend enforces this regardless
  checkAdminStatus: async () => {
    const res = await apiClient.get('/admin/me')
    return res.data
  },

  getAdminStats: async () => {
    const res = await apiClient.get('/admin/stats')
    return res.data
  },

  getAdminUsers: async () => {
    const res = await apiClient.get('/admin/users')
    return res.data
  },

  getAdminItineraries: async () => {
    const res = await apiClient.get('/admin/itineraries')
    return res.data
  },

  getAdminMessages: async () => {
    const res = await apiClient.get('/admin/messages')
    return res.data
  },

  // Destination photo lookup (Wikipedia-backed, no API key) — replaces the
  // old hardcoded Unsplash URL map for any destination not in that list.
  getDestinationImage: async (query) => {
    const res = await apiClient.get('/media/destination-image', { params: { query } })
    return res.data
  },

  submitContactMessage: async (payload) => {
    const res = await apiClient.post('/contact', payload)
    return res.data
  }
}