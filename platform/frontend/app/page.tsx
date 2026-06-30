'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Factory, Landmark, Truck, GraduationCap, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react'
import { API_URL } from '@/lib/constants'

const SECTORS = [
  { value: 'manufacturing', label: 'Manufacturing / Industry' },
  { value: 'banking',       label: 'Banking / Finance' },
  { value: 'retail',        label: 'Retail / Trade' },
  { value: 'energy',        label: 'Energy' },
  { value: 'construction',  label: 'Construction / Real Estate' },
  { value: 'logistics',     label: 'Logistics / Transportation' },
  { value: 'textile',       label: 'Textile / Apparel' },
  { value: 'food',          label: 'Food & Beverage' },
  { value: 'tech',          label: 'Technology / Software' },
  { value: 'other',         label: 'Other' },
]

type HealthResult = {
  score: number; grade: string; grade_color: string; grade_bg: string
  percentile: number; total_tco2e: number; sector_label: string
  vs_sector: string; quick_wins: string[]; cta: string
}

function EsgHealthWidget() {
  const [sector, setSector] = useState('manufacturing')
  const [employees, setEmployees] = useState('')
  const [kwh, setKwh] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HealthResult | null>(null)
  const [error, setError] = useState('')

  async function handleCheck() {
    if (!employees || parseInt(employees) <= 0) { setError('Please enter employee count'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await fetch(`${API_URL}/health-check/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          employee_count: parseInt(employees),
          electricity_kwh: kwh ? parseFloat(kwh) : undefined,
        }),
      })
      if (!res.ok) throw new Error('Calculation error')
      setResult(await res.json())
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!result ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-3">
              ⚡ Free in 10 Seconds
            </div>
            <h3 className="text-2xl font-black text-slate-900">ESG Health Check</h3>
            <p className="text-slate-500 text-sm mt-1">3 inputs, instant Sustain-Score</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sector</label>
              <select
                value={sector} onChange={e => setSector(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Count</label>
              <input
                type="number" placeholder="e.g. 500" value={employees}
                onChange={e => setEmployees(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Annual Electricity Usage (kWh) <span className="font-normal text-slate-400">— optional</span>
              </label>
              <input
                type="number" placeholder="e.g. 1500000 (leave blank if unknown)"
                value={kwh} onChange={e => setKwh(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              onClick={handleCheck} disabled={loading}
              className="w-full py-3.5 rounded-2xl text-white font-black text-base transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
              {loading ? 'Calculating…' : 'See My Sustain Score →'}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">No sign-up required · Data not stored</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          {/* Score */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-black mb-3"
              style={{ background: result.grade_bg, color: result.grade_color, border: `3px solid ${result.grade_color}` }}>
              {result.grade}
            </div>
            <div className="text-3xl font-black text-slate-900">{result.score}<span className="text-lg text-slate-400">/100</span></div>
            <p className="text-sm font-semibold mt-1" style={{ color: result.grade_color }}>
              Top {100 - result.percentile}% in {result.sector_label}
            </p>
            <p className="text-xs text-slate-500 mt-1">{result.vs_sector}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl p-3 text-center bg-slate-50">
              <div className="text-xl font-black text-slate-800">{result.total_tco2e.toLocaleString('en-GB')}</div>
              <div className="text-xs text-slate-500">tCO₂e / year (estimate)</div>
            </div>
            <div className="rounded-xl p-3 text-center bg-slate-50">
              <div className="text-xl font-black text-slate-800">{result.percentile}%</div>
              <div className="text-xs text-slate-500">sector percentile</div>
            </div>
          </div>

          {/* Quick Wins */}
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Wins</p>
            <ul className="space-y-1.5">
              {result.quick_wins.map(w => (
                <li key={w} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500 font-bold mt-0.5">→</span>{w}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/register"
            className="block w-full py-3 rounded-2xl text-center text-white font-bold text-sm"
            style={{ background: '#0f172a' }}>
            Start Free — Official Report + Detailed Analysis →
          </Link>
          <button onClick={() => setResult(null)} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-600">
            Recalculate
          </button>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">🌿</div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900">SustainHub</span>
              <span className="text-emerald-600 font-bold ml-1">.online</span>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-6 font-semibold text-sm text-slate-600">
            <Link href="/products" className="hover:text-emerald-600 transition-colors">Products</Link>
            <Link href="/about" className="hover:text-emerald-600 transition-colors">About Us</Link>
            <Link href="/cop31" className="hover:text-emerald-600 transition-colors font-bold text-amber-600">COP31 Special</Link>
            <Link href="/data-library" className="hover:text-emerald-600 transition-colors">AI Data Library</Link>
            <Link href="/news-insights" className="hover:text-emerald-600 transition-colors">News & Insights</Link>
            <Link href="/careers" className="hover:text-emerald-600 transition-colors">Careers</Link>
            <Link href="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link href="/request-demo" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
              Request a Demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SustainHub 2.0 is Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1]">
            The Operating System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">for Green Transition.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Zurich Trust. London Finance. Istanbul Production. <br/>
            Powered by AI & Satellites.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
            <Link href="/request-demo" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3">
              Enter The Ecosystem
            </Link>
            <Link href="/pitch-deck.html" className="w-full sm:w-auto bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3">
              View Investor Deck
            </Link>
          </div>
        </div>
      </section>

      {/* One Platform, Four Worlds Section */}
      <section id="platform" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">One Platform, Four Worlds.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              SustainHub bridges the gap between industrial production, high-tier finance, global supply chains, and academic innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* World 1: SME */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Factory size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Industrial Edge</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automate CBAM declarations, track Scope 1-2-3 emissions via IoT, and optimize Decarbonization ROI using AI.
              </p>
            </div>

            {/* World 2: Bank */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Landmark size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Green Finance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock London's green credit lines. Automated GAR reporting, climate risk stress testing (TCFD), and Swiss-grade audit trails.
              </p>
            </div>

            {/* World 3: Supply Chain */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Supply Nexus</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Orchestrate your vendors. Full EUDR compliance with map-based traceability, vendor maturity scoring, and automated audits.
              </p>
            </div>

            {/* World 4: Academy */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Academic Core</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                UI GreenMetric automation for campuses. Real-time simulators for students to earn blockchain-verified ESG Analyst certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ESG Health Check */}
      <section id="health-check" className="py-24 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-900 text-emerald-400 mb-4 uppercase tracking-widest">
            NO EMAIL GATES. GET INSTANT RESULTS IN SECONDS.
          </div>
          <h2 className="text-4xl font-black text-white mb-4">
            Check Your Company's ESG Score<br />
            <span className="text-emerald-400">For Free Instantly</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Enter your sector, employee count, and energy consumption — our AI engine will generate your estimated Sustain-Score and quick-win suggestions immediately.
          </p>
        </div>
        <EsgHealthWidget />
      </section>

      {/* Trust & Proof */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-12">The Ultimate Trust Layer</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                <ShieldCheck className="text-emerald-600" size={32} />
              </div>
              <div className="font-bold text-slate-600">ISO 27001 Certified</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                <Globe className="text-blue-600" size={32} />
              </div>
              <div className="font-bold text-slate-600">GDPR Compliant</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                <Zap className="text-amber-500" size={32} />
              </div>
              <div className="font-bold text-slate-600">Satellite Verified</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 text-center text-slate-500 text-sm font-medium">
        <p>© 2026 SustainHub.online - Zurich · London · Istanbul</p>
      </footer>
    </div>
  )
}
