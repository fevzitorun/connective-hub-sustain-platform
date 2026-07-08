import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Investors — SustainHub',
  description: "SustainHub investor relations. Turkey's first AI + satellite ESG SaaS platform.",
}

const METRICS = [
  { label: 'Serviceable Market (Turkey + UK)', value: '$480M', sub: 'TSRS / UK SRS compliance SaaS TAM · 2026–2030' },
  { label: 'Modules Built', value: '43+', sub: 'Across 15 global frameworks · production-ready' },
  { label: 'ARR Target — 2027', value: '$2M', sub: '30 enterprise + 150 SME clients' },
  { label: 'Jurisdictions Active', value: '3+', sub: 'Turkey · UK · KKTC · EU pathway' },
]

const MILESTONES = [
  {
    date: 'Q1 2026',
    title: 'Platform launch',
    desc: 'SustainHub v2.0 live — 43 modules, AI report builder, satellite risk, GAR Suite',
    done: true,
  },
  {
    date: 'Q2–Q3 2026',
    title: 'First revenue — $300K ARR',
    desc: '3 enterprise pilots (bank + holding + SME group) · avg deal $50K/year · 30 SME on Starter',
    done: false,
  },
  {
    date: 'Q4 2026',
    title: '$600K ARR + UK entry',
    desc: '2 bank licences ($80K each) · 10 corporate ($30K each) · UK SRS module live for FCA-regulated firms',
    done: false,
  },
  {
    date: 'Q1 2027',
    title: 'Series A — $2M ARR run-rate',
    desc: '30+ enterprise clients · 150 SME · avg ACV $40K · NRR > 120% · raise $5–8M at $25M pre-money',
    done: false,
  },
  {
    date: 'Q3 2027',
    title: '$5M ARR — MENA expansion',
    desc: 'UAE / Saudi market entry · COP31 host country momentum · 100+ enterprise · platform IPO pathway',
    done: false,
  },
]

const PRICING = [
  { tier: 'SME Starter', acv: '$2,000', volume: '150 clients', arr: '$300K', color: '#64748b', note: 'Self-serve' },
  { tier: 'Corporate Pro', acv: '$15,000', volume: '40 clients', arr: '$600K', color: '#10b981', note: 'AE-led' },
  { tier: 'Enterprise', acv: '$40,000', volume: '20 clients', arr: '$800K', color: '#3b82f6', note: 'Consultative' },
  { tier: 'Bank / KSRU', acv: '$80,000', volume: '6 clients', arr: '$480K', color: '#f59e0b', note: 'Strategic' },
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
        <Link href="/request-demo" className="text-sm font-bold px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all">
          Book Demo →
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-20">

        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
            Investor Relations · Confidential
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

        {/* Key metrics */}
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
              { icon: '📋', title: 'Mandatory Compliance', body: 'TSRS is not optional. KGK mandated it in 2024. Every public company, bank, and large SME must report — or face regulatory action. We are the compliance infrastructure, not a nice-to-have.' },
              { icon: '🤖', title: 'AI-First Architecture', body: '43 modules built with AI-native architecture. Magic Import, AI Report Builder, Sustain Copilot — we turn weeks of consulting work into 10-minute automated workflows. No competitor has this depth.' },
              { icon: '🌍', title: 'Multi-Jurisdiction Moat', body: 'Turkey (TSRS/BDDK) + UK (UK SRS/FCA) + KKTC + EU pathway. Our tri-jurisdictional engine is an 18-month head start. COP31 in Istanbul 2026 creates a unique visibility catalyst.' },
            ].map(c => (
              <div key={c.title}>
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-black text-white mb-2">{c.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue model */}
        <div>
          <h2 className="text-3xl font-black mb-3">Revenue Model — Path to $2M ARR</h2>
          <p className="text-slate-500 text-sm mb-6">
            Four tiers · land-and-expand motion · NRR target 120%+
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-white/10">
                  <th className="py-3 text-left font-bold">Tier</th>
                  <th className="py-3 text-right font-bold">ACV</th>
                  <th className="py-3 text-right font-bold">Target Clients</th>
                  <th className="py-3 text-right font-bold">ARR Contribution</th>
                  <th className="py-3 text-left pl-4 font-bold">Motion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {PRICING.map(p => (
                  <tr key={p.tier} className="text-sm">
                    <td className="py-4">
                      <span className="font-black text-white">{p.tier}</span>
                    </td>
                    <td className="py-4 text-right font-black text-2xl" style={{ color: p.color }}>{p.acv}</td>
                    <td className="py-4 text-right text-slate-400">{p.volume}</td>
                    <td className="py-4 text-right font-bold text-emerald-400">{p.arr}</td>
                    <td className="py-4 pl-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-400">{p.note}</span>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/20 text-sm">
                  <td className="py-4 font-black text-white" colSpan={2}>Total at scale</td>
                  <td className="py-4 text-right text-slate-400">216 clients</td>
                  <td className="py-4 text-right font-black text-2xl text-emerald-400">$2.18M</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-3">
            * ACV in USD · ₺ equivalents at prevailing rate · UK clients billed in GBP at parity
          </p>
        </div>

        {/* ARR Roadmap */}
        <div>
          <h2 className="text-3xl font-black mb-8">Milestone Roadmap</h2>
          <div className="space-y-4">
            {MILESTONES.map(m => (
              <div key={m.date} className={`flex gap-5 items-start p-5 rounded-2xl border transition-all ${m.done ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-white/3 border-white/10'}`}>
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

        {/* Why now */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🏛️', label: '2024', title: 'KGK mandates TSRS', body: 'All public companies + banks in Turkey must report under TSRS 1+2 starting 2025. No grace period.' },
            { icon: '🇹🇷', label: '2026', title: 'COP31 Istanbul', body: 'Turkey hosts the global climate summit. National ESG credibility on the line. Government is pushing hard on green finance.' },
            { icon: '🇪🇺', label: '2026+', title: 'CBAM & EUDR enforcement', body: 'Turkish exporters face €4B+ in annual carbon border adjustments. Every exporter needs our platform.' },
          ].map(c => (
            <div key={c.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{c.label}</span>
              </div>
              <h3 className="font-black text-white mb-2">{c.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-black mb-4">Interested in Investing?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            We're building the sustainability operating system for a country with a 2053 Net Zero target, mandatory TSRS reporting, and a COP31 spotlight in 2026. The window to lead this market is now.
          </p>
          <Link href="/contact"
            className="inline-block px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all">
            Request Pitch Deck →
          </Link>
          <p className="text-slate-600 text-xs mt-4">Full financials and cap table available under NDA</p>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600 px-6">
        SustainHub.online · Connective Hub Digital Technologies Ltd. · Istanbul Teknokent & London
      </footer>
    </div>
  )
}
