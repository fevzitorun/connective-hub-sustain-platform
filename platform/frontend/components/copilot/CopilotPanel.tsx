'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  { label: '🏦 GAR oranım', text: 'GAR oranım şu an nedir ve %65 hedefine nasıl ulaşabilirim?' },
  { label: '🔬 Finanse edilen emisyon', text: 'Bu çeyrekte finanse edilen emisyonlarım (Kapsam 3 Kat. 15) ne kadar?' },
  { label: '📅 Son tarihler', text: 'Yaklaşan regülasyon son tarihlerim nelerdir?' },
  { label: '🇹🇷 COP31 hazırlık', text: 'COP31 için ne hazırlamalıyım? TSRS uyum durumum nasıl?' },
  { label: '🌡️ TCFD', text: 'TCFD senaryolarımı BDDK\'ya nasıl sunabilirim?' },
]

const WELCOME_MSG: Message = {
  role: 'assistant',
  content: 'Merhaba Kemal Bey 👋 Ben **Sustain Copilot** — GAR oranından COP31 hazırlığına, PCAF hesaplamalarından TCFD senaryolarına kadar her konuda size destek olmak için buradayım.\n\nNasıl yardımcı olabilirim?',
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-700 px-1 rounded text-emerald-300 text-xs">$1</code>')
    .replace(/\n/g, '<br/>')
}

export function CopilotPanel() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await api.copilot.chat(nextMessages)
      const assistantMsg: Message = { role: 'assistant', content: res.content }
      setMessages(prev => [...prev, assistantMsg])
      if (!open) setUnread(n => n + 1)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Üzgünüm, şu an bağlanamıyorum. Lütfen bir dakika sonra tekrar deneyin.',
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading, open])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #0284c7 100%)' }}
        aria-label="Sustain Copilot"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="1" fill="white"/>
            <circle cx="12" cy="10" r="1" fill="white"/>
            <circle cx="15" cy="10" r="1" fill="white"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-700"
        style={{
          width: '380px',
          height: open ? '560px' : '0px',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          background: '#0f172a',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #1e3a5f 100%)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #059669, #0284c7)' }}>
            🤖
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Sustain Copilot</div>
            <div className="text-xs text-emerald-400/80">claude-sonnet-5 · Akbank bağlamı aktif</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #059669, #0284c7)' }}>
                  🤖
                </div>
              )}
              <div
                className="max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed"
                style={{
                  background: msg.role === 'user' ? '#059669' : '#1e293b',
                  color: msg.role === 'user' ? '#fff' : '#cbd5e1',
                  borderTopRightRadius: msg.role === 'user' ? '4px' : undefined,
                  borderTopLeftRadius: msg.role === 'assistant' ? '4px' : undefined,
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
              />
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #059669, #0284c7)' }}>
                🤖
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-slate-800">
                <span className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts (only shown when only welcome message visible) */}
        {messages.length === 1 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.text)}
                className="text-xs px-2.5 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors bg-slate-800/50"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-end gap-2 bg-slate-800 rounded-xl px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir soru sorun... (Enter ile gönder)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none max-h-24 overflow-y-auto"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() && !loading ? '#059669' : '#334155',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-1.5">Sustain Copilot · Akbank T.A.Ş. bağlamı</p>
        </div>
      </div>
    </>
  )
}
