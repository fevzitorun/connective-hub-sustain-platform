'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      setSubmitted(true)
    }
  }

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

      {/* Main Container */}
      <section className="px-6 pt-24 pb-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[80vh]">
        {/* Left Side: Contact Info */}
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            📬 Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Let's build a <br/>
            <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sustainable Future
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Have questions about our multi-jurisdiction compliance features, custom API integrations, or GAR calculations? Contact our solutions engineering team.
          </p>
          <div className="space-y-3 text-sm text-slate-300">
            <p>📍 <strong>London Hub:</strong> theconnective.uk, 85 Great Portland St, London</p>
            <p>📍 <strong>Istanbul Hub:</strong> Connective Hub Ltd, Istanbul Teknokent, Ataşehir</p>
            <p>✉️ <strong>Email:</strong> <a href="mailto:info@sustainhub.online" className="text-emerald-400 hover:underline">info@sustainhub.online</a></p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your sustainability reporting requirements..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
              >
                Send Message →
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">✉️</div>
              <h3 className="text-xl font-bold text-white">Message Sent!</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Thank you for reaching out, <strong>{formData.name}</strong>. Our corporate solutions team will review your request and contact you at <strong>{formData.email}</strong> shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                Send another message
              </button>
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
