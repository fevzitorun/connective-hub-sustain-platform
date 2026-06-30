'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function Countdown() {
  // COP31 — estimated November 2026 (Baku/Turkey handover)
  const TARGET = new Date('2026-11-09T09:00:00Z')
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    const tick = () => setDiff(Math.max(0, TARGET.getTime() - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const days    = Math.floor(diff / 86_400_000)
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000)  / 60_000)
  const seconds = Math.floor((diff % 60_000)     / 1_000)

  return (
    <div className="flex gap-4 justify-center my-8">
      {[{ v: days, l: 'Days' }, { v: hours, l: 'Hours' }, { v: minutes, l: 'Minutes' }, { v: seconds, l: 'Seconds' }].map(u => (
        <div key={u.l} className="text-center">
          <div className="text-4xl md:text-6xl font-black tabular-nums"
            style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {String(u.v).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">{u.l}</div>
        </div>
      ))}
    </div>
  )
}

const DEADLINES = [
  { date: 'August 2026', label: 'BDDK TSRS Pilot Reporting Deadline', status: 'urgent', tag: 'BDDK' },
  { date: 'September 2026',   label: 'KGK TSRS 1&2 Limited Assurance Deadline', status: 'urgent', tag: 'KGK' },
  { date: 'October 2026',    label: 'BDDK GAR First Period Declaration', status: 'soon', tag: 'GAR' },
  { date: 'November 2026',   label: 'COP31 — Turkey National Contribution Declaration (NDC)', status: 'cop31', tag: 'COP31' },
  { date: 'December 2026',  label: 'CBAM Full Implementation Start', status: 'soon', tag: 'CBAM' },
  { date: 'January 2027',    label: 'FCA UK SRS Mandatory Compliance (Listed Companies)', status: 'uk', tag: 'FCA' },
]

const FEATURES = [
  { icon: '🇹🇷', title: 'TSRS Compliance Engine', desc: 'Fully supports KGK\'s TSRS 1&2 standards (based on IFRS S1/S2), including limited assurance reporting templates.' },
  { icon: '🏦', title: 'BDDK GAR Portal', desc: 'Green Asset Ratio calculations, PCAF financed emissions, and EU Taxonomy alignment in a single dashboard.' },
  { icon: '🛰️', title: 'Satellite Verification', desc: 'Asset-level physical climate risk via ESA Sentinel-2 and NASA data. Avoid greenwashing with "Sustain Verified" badges.' },
  { icon: '🤖', title: 'AI Copilot', desc: 'Claude-powered assistant — instantly answers "How should I prepare for COP31?" and generates action plans.' },
  { icon: '🌡️', title: 'TCFD Scenario Analysis', desc: 'CapEx/OpEx climate financial impact matrix for CFOs using IEA Net Zero 2050 and NGFS projections.' },
  { icon: '🌍', title: 'Tri-Jurisdictional Scope', desc: 'Turkey (BDDK+KGK) + UK (FCA+UK SRS) + KKTC (Central Bank) — three jurisdictions under a single license.' },
]

export default function COP31Page() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
          <span className="text-xs text-emerald-400">× COP31</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Products</Link>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">About Us</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Sign In</Link>
          <Link href="/request-demo" className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Request Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8 border"
          style={{ background: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.3)', color: '#fbbf24' }}>
          🇹🇷 COP31 Turkey Special Edition
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          COP31 is in Turkey.
          <br />
          <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Is Your Sustainability Platform Ready?
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          BDDK mandatory TSRS reporting, GAR declarations, and PCAF financed emissions — 
          all going live ahead of COP31. SustainHub is ready for 34 Turkish banks and 200+ enterprise corporations.
        </p>
        <Countdown />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/request-demo"
            className="px-8 py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Free Demo → Start in 60 Seconds
          </Link>
        </div>
      </section>

      {/* Deadlines */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-white text-center mb-8">
          Critical Deadlines Pre-COP31
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEADLINES.map(d => {
            const COLOR_MAP = {
              urgent: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)', tag: '#ef4444', dot: '#ef4444' },
              soon:   { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', tag: '#f59e0b', dot: '#f59e0b' },
              cop31:  { bg: 'rgba(5,150,105,0.1)',  border: 'rgba(5,150,105,0.3)',  tag: '#34d399', dot: '#34d399' },
              uk:     { bg: 'rgba(29,78,216,0.08)', border: 'rgba(29,78,216,0.25)', tag: '#60a5fa', dot: '#60a5fa' },
            } as const
            const colors = COLOR_MAP[d.status as keyof typeof COLOR_MAP] ?? COLOR_MAP.soon
            return (
              <div key={d.label} className="rounded-xl p-4 border"
                style={{ background: colors.bg, borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: colors.dot + '20', color: colors.tag }}>
                    {d.tag}
                  </span>
                  <span className="text-xs font-bold" style={{ color: colors.dot }}>{d.date}</span>
                </div>
                <p className="text-sm text-slate-300 leading-snug">{d.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-white text-center mb-2">
          Everything You Need for COP31
        </h2>
        <p className="text-slate-500 text-center text-sm mb-10">One platform, three jurisdictions, zero advisor friction.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all group"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Capture */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl p-8 border" style={{ background: 'rgba(5,150,105,0.05)', borderColor: 'rgba(5,150,105,0.2)' }}>
          <div className="text-3xl mb-4">📥</div>
          <h2 className="text-2xl font-black text-white mb-2">Download COP31 Readiness Guide</h2>
          <p className="text-slate-400 text-sm mb-6">
            Get your free PDF including TSRS compliance timelines, GAR calculation guides, and PCAF methodology instructions.
          </p>
          {!submitted ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="corporate@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
              />
              <button
                onClick={() => { if (email.includes('@')) setSubmitted(true) }}
                className="px-6 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-105 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
              >
                Send Guide →
              </button>
            </div>
          ) : (
            <div className="py-4">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-emerald-400 font-bold">Thank you! The guide has been sent to {email}.</p>
              <p className="text-slate-500 text-xs mt-1">Would you like to request a demo?{' '}
                <Link href="/request-demo" className="text-emerald-400 hover:underline">Get started now →</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '34', l: 'Turkish Banks', s: 'BDDK GAR Mandate' },
            { n: '200+', l: 'Enterprises', s: 'TSRS Reporting Mandate' },
            { n: '3', l: 'Jurisdictions', s: 'TR + UK + KKTC' },
            { n: '60s', l: 'Demo Launch', s: 'From sign-up to first report' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-3xl font-black" style={{ color: '#34d399' }}>{s.n}</div>
              <div className="text-sm font-bold text-white mt-1">{s.l}</div>
              <div className="text-xs text-slate-500">{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer mini */}
      <footer className="text-center py-8 text-xs text-slate-600 px-6">
        <p>SustainHub.online — Connective Hub Digital Technologies Ltd. · Istanbul & London</p>
        <p className="mt-1">BDDK · KGK · FCA · KKTC Central Bank · ISSB · PCAF · EU Taxonomy Compliant</p>
      </footer>
    </div>
  )
}
