import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Investors — SustainHub',
  description: "SustainHub's investor relations page. Turkey's #1 AI sustainability platform.",
}

const METRICS = [
  { label: 'Addressable Market (Turkey)', value: '₺2.4B', sub: 'TSRS compliance + ESG SaaS TAM' },
  { label: 'Modules Built', value: '43+', sub: 'Across 15 frameworks' },
  { label: 'Target ARR (2026)', value: '₺2.4M', sub: '8 enterprise + 20 SME clients' },
  { label: 'Jurisdictions', value: '3', sub: 'Turkey · UK · KKTC · EU pathway' },
]

const MILESTONES = [
  { date: 'Q1 2026', title: 'Platform launch', desc: 'SustainHub v2.0 live — 43 modules, AI + satellite', done: true },
  { date: 'Q2 2026', title: 'Pilot customers', desc: '3 enterprise pilots (bank + holding + SME group)', done: false },
  { date: 'Q3 2026', title: 'First ARR milestone', desc: '₺600K ARR — 2 bank licences + 10 corporate', done: false },
  { date: 'Q4 2026', title: 'UK market entry', desc: 'UK SRS reporting, FCA-aligned modules', done: false },
  { date: 'Q1 2027', title: 'Series A ready', desc: '₺2M ARR run-rate, 50+ enterprise clients', done: false },
]

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-950/90 backdrop-blur z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">🌿</div>
          <span className="font-black text-xl">SustainHub<span className="text-emerald-400">.online</span></span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/request-demo" className="text-sm font-bold px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all">
            Book Demo →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            Investor Relations
          </span>
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Building the Infrastructure<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              for a Net Zero Economy.
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            SustainHub is Turkey's first AI + satellite-powered sustainability reporting platform.
            We're capturing a mandatory compliance market at the perfect regulatory inflection point.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {METRICS.map(m => (
            <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-3xl font-black text-emerald-400 mb-1">{m.value}</div>
              <div className="font-bold text-white text-sm mb-1">{m.label}</div>
              <div className="text-xs text-slate-500">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Opportunity */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
          <h2 className="text-3xl font-black mb-6">The Opportunity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📋', title: 'Mandatory Compliance', body: 'TSRS is not optional. KGK mandated it in 2024. Every public company, bank, and large SME must report — or face regulatory action. We are the compliance infrastructure.' },
              { icon: '🤖', title: 'AI-First Architecture', body: '43 modules built with AI-native architecture. Magic Import, AI Report Builder, Sustain Copilot — we turn weeks of consulting work into 10-minute automated workflows.' },
              { icon: '🌍', title: 'Multi-Jurisdiction Moat', body: 'Turkey (TSRS/BDDK) + UK (UK SRS/FCA) + KKTC (consolidation) + EU pathway. Our tri-jurisdictional engine is a 18-month head start on any competitor.' },
            ].map(c => (
              <div key={c.title}>
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-black text-white mb-2">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ARR Roadmap */}
        <div>
          <h2 className="text-3xl font-black mb-8">Roadmap to ₺2M ARR</h2>
          <div className="space-y-4">
            {MILESTONES.map(m => (
              <div key={m.date} className={`flex gap-5 items-start p-5 rounded-2xl border ${m.done ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-white/3 border-white/10'}`}>
                <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${m.done ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-black text-white">{m.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-400">{m.date}</span>
                    {m.done && <span className="text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-400 font-bold">✓ Done</span>}
                  </div>
                  <p className="text-sm text-slate-400">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-black mb-4">Interested in Investing?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            We're building the sustainability operating system for a country with a 2053 Net Zero target and mandatory TSRS reporting. Let's talk.
          </p>
          <Link href="/contact"
            className="inline-block px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all">
            Contact Us →
          </Link>
          <p className="text-slate-600 text-xs mt-4">Pitch deck available under NDA</p>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600 px-6">
        SustainHub.online · Connective Hub Digital Technologies Ltd. · Istanbul Teknokent & London
      </footer>
    </div>
  )
}
