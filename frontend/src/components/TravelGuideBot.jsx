import React, { useState, useRef, useEffect } from 'react'
import { Compass, Send, X, Luggage, Bot, User } from 'lucide-react'
import { apiService } from '../services/apiService'

const STARTER_PROMPTS = [
  'What should I pack for a 7-day trip?',
  "What's my luggage weight limit usually like?",
  'Do I need a visa if I have a US passport?',
  'Any tips for staying safe as a solo traveler?'
]

export default function TravelGuideBot({ user, onRequireAuth }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi, I'm your Travel Guide! Ask me anything about packing, luggage rules, visas, local customs, safety, or general destination tips."
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesContainerRef = useRef(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  const handleOpen = () => {
    if (!user) {
      onRequireAuth?.()
      return
    }
    setIsOpen(true)
  }

  const sendMessage = async (text) => {
    const question = text.trim()
    if (!question || isTyping) return

    setMessages((prev) => [...prev, { sender: 'user', text: question }])
    setInputMessage('')
    setIsTyping(true)

    try {
      const history = messages.slice(-6)
      const data = await apiService.sendGuideMessage(question, history)
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || "I'm here to help with travel questions!" }
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I couldn't reach the guide service just now — please try again in a moment."
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = (e) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-secondary bg-[#F97316] hover:bg-[#EA580C] text-white shadow-coral transition-all hover:scale-105"
          title="Ask the Travel Guide"
        >
          <Compass className="w-5 h-5 text-white" />
          <span className="text-xs font-extrabold text-white hidden sm:inline">Travel Guide</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[92vw] max-w-sm h-[520px] wandermap-card rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary bg-[#0F766E] text-white flex items-center justify-center shadow-teal">
                <Luggage className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-display">Travel Guide Assistant</h3>
                <p className="text-[11px] text-slate-500 font-medium">Packing • Luggage • Visas • Safety</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-secondary bg-[#F97316] text-white shadow-coral'
                      : 'bg-primary bg-[#0F766E] text-white shadow-teal'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                </div>
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-secondary bg-[#F97316] text-white rounded-tr-none shadow-coral font-medium'
                      : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-none font-medium'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary bg-[#0F766E] text-white flex items-center justify-center shadow-teal">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary bg-[#0F766E] typing-dot"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary bg-[#0F766E] typing-dot"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary bg-[#0F766E] typing-dot"></span>
                </div>
              </div>
            )}

            {messages.length === 1 && !isTyping && (
              <div className="flex flex-col gap-2 pt-1">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-[11px] font-medium px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary transition-colors shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about packing, visas, safety..."
              className="flex-1 px-3.5 py-2.5 rounded-xl wandermap-input text-xs font-medium focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-primary bg-[#0F766E] hover:bg-[#0D6760] disabled:opacity-40 text-white transition-all shadow-teal shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
