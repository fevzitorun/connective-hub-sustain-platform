'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RequestDemoPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', employees: '1-50', sector: 'manufacturing' })
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
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg font-bold text-white" style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>Register Free →</Link>
        </div>
      </nav>

      {/* Main Container */}
      <section className="px-6 pt-24 pb-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[80vh]">
        {/* Left Side: Info */}
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            📊 Request a Custom Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            See SustainHub <br/>
            <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in Action
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Schedule a personalized walkthrough with our ESG engineers. Learn how to automate TSRS reporting, build a compliant GAR dashboard, and conduct satellite-verified climate risk assessments.
          </p>
          <div className="space-y-2 text-xs text-slate-500">
            <p>✓ 1-on-1 walkthrough of the calculation engine</p>
            <p>✓ Custom integration readiness scoping (SAP, Logo, Netsis)</p>
            <p>✓ Sample TSRS reports and audit trails</p>
          </div>
        </div>

        {/* Right Side: Request Demo Form */}
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
                  required
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Employees</label>
                  <select
                    value={formData.employees}
                    onChange={e => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="1-50">1-50</option>
                    <option value="51-250">51-250</option>
                    <option value="251-1000">251-1,000</option>
                    <option value="1000+">1,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sector</label>
                  <select
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="manufacturing">Manufacturing</option>
                    <option value="banking">Banking / Finance</option>
                    <option value="retail">Retail</option>
                    <option value="energy">Energy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
              >
                Request Custom Demo →
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="text-5xl">🗓️</div>
              <h3 className="text-xl font-bold text-white">Demo Request Received!</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. We have saved your request for <strong>{formData.company}</strong>. Our solutions engineering team will reach out to <strong>{formData.email}</strong> to schedule your demo.
              </p>
              <div className="pt-4">
                <Link
                  href="/register"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
                >
                  Create Instant Free Account instead →
                </Link>
              </div>
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
