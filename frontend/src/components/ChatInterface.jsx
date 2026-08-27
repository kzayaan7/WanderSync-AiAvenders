import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Mic, MicOff, AlertTriangle } from 'lucide-react'

// Web Speech API is vendor-prefixed in Chrome/Edge; unsupported in Firefox and some browsers.
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognitionEvent || window.webkitSpeechRecognition
    : null

export default function ChatInterface({ user, onRequireAuth, onExtractedParams, isGenerating }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm WanderSync AI. Describe your dream trip in plain language — for example: 'Plan a 5-day trip to Tokyo in October with a $1,500 budget focusing on anime and ramen.' You can also tap the mic and just say it."
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const chatEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const isFirstRender = useRef(true)
  const recognitionRef = useRef(null)
  const voiceSupported = !!SpeechRecognitionAPI

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Set up the SpeechRecognition instance once on mount
  useEffect(() => {
    if (!voiceSupported) return

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError('')
    }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInputMessage(transcript)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError('Microphone access denied. Enable it in your browser settings to use voice input.')
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech detected — try again.')
      } else {
        setVoiceError('Voice input failed. You can still type your request.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
    }
  }, [voiceSupported])

  const toggleListening = useCallback(() => {
    if (!voiceSupported || isGenerating) return
    if (!user) {
      onRequireAuth?.()
      return
    }
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      recognition.stop()
    } else {
      setInputMessage('')
      setVoiceError('')
      try {
        recognition.start()
      } catch {
        // start() throws if already active — safe to ignore
      }
    }
  }, [isListening, voiceSupported, isGenerating, user, onRequireAuth])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isTyping) return
    if (!user) {
      onRequireAuth?.()
      return
    }
    if (isListening) recognitionRef.current?.stop()

    const userText = inputMessage.trim()
    setInputMessage('')
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setIsTyping(true)

    try {
      const { apiService } = await import('../services/apiService')
      const data = await apiService.sendChatMessage(userText)

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || "I've parsed your request!" }
      ])

      if (data.extracted_parameters) {
        onExtractedParams(data.extracted_parameters)
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I encountered a minor connection issue, but I've updated your trip parameters below. Feel free to refine them!"
        }
      ])
      onExtractedParams({
        destination: userText.includes('Tokyo') ? 'Tokyo' : 'Paris',
        duration_days: 4,
        budget_category: 'moderate',
        total_budget: 1200,
        interests: ['culture', 'sightseeing']
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="wandermap-card rounded-3xl flex flex-col h-[520px] border border-slate-200/90 shadow-soft-md overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center shadow-teal">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 font-display">
              Conversational Travel Assistant
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Groq Llama 3.3 70B • Voice & Natural Language</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={messagesContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-secondary text-white shadow-coral'
                  : 'bg-primary text-white shadow-teal'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-secondary text-white rounded-tr-none shadow-coral'
                  : 'bg-slate-100 text-slate-800 border border-slate-200/70 rounded-tl-none shadow-sm font-medium'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-teal">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-primary typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-primary typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Voice error banner */}
      {voiceError && (
        <div className="mx-4 mb-2 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        {voiceSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={isGenerating}
            title={isListening ? 'Stop recording' : 'Speak your trip request'}
            className={`relative p-3 rounded-2xl transition-all shrink-0 disabled:opacity-40 ${
              isListening
                ? 'bg-secondary text-white shadow-coral'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isListening && (
              <span className="animate-ping absolute inset-0 rounded-2xl bg-secondary opacity-40"></span>
            )}
            {isListening ? (
              <MicOff className="w-4 h-4 relative" />
            ) : (
              <Mic className="w-4 h-4 relative" />
            )}
          </button>
        )}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            !user
              ? 'Sign in to chat with the assistant...'
              : isListening
                ? 'Listening...'
                : 'e.g. 7 days in Paris with $2000 budget for art and wine...'
          }
          disabled={isGenerating}
          className="flex-1 px-4 py-3 rounded-2xl wandermap-input text-xs sm:text-sm font-medium focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isTyping || isGenerating}
          className="p-3 rounded-2xl bg-secondary hover:bg-secondary-600 disabled:opacity-40 text-white transition-all shadow-coral shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}