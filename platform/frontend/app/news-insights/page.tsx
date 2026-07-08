'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NewsInsightsPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Products</Link>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">About Us</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Sign In</Link>
          <Link href="/request-demo" className="text-sm px-4 py-2 rounded-lg font-bold text-white" style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>Demo →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-32 pb-20 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
          📢 Sustainability Insights & corporate updates
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
          News & Insights <br />
          <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Coming Soon
          </span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-xl mb-10">
          Stay informed on changes in global ESG frameworks, UK SDR, Turkey TSRS updates, and new features shipping to SustainHub. Sign up to receive our monthly newsletter.
        </p>

        {/* Waitlist Form */}
        <div className="w-full max-w-md rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
          {!submitted ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="your.email@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
              />
              <button
                onClick={() => { if (email.includes('@')) setSubmitted(true) }}
                className="px-6 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-105 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
              >
                Subscribe Now →
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-emerald-400 font-bold text-sm">Successfully Subscribed!</p>
              <p className="text-slate-500 text-xs mt-1">We will send monthly newsletters to {email}.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-slate-700 border-t border-white/5">
        SustainHub.online · Connective Hub Digital Technologies Ltd.
      </footer>
    </div>
  )
}
