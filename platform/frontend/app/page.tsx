'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, Play, X } from 'lucide-react'
import { API_URL } from '@/lib/constants'

// ─────────────────────────────────────────────────────────────────────────────
// ESG Quick Check Widget
// ─────────────────────────────────────────────────────────────────────────────
const SECTORS = [
  { value: 'manufacturing', label: 'Manufacturing / Industry' },
  { value: 'banking',       label: 'Banking & Finance' },
  { value: 'retail',        label: 'Retail & Consumer Goods' },
  { value: 'energy',        label: 'Energy & Utilities' },
  { value: 'construction',  label: 'Construction & Real Estate' },
  { value: 'logistics',     label: 'Logistics & Transportation' },
  { value: 'textile',       label: 'Textile & Apparel' },
  { value: 'food',          label: 'Food & Beverage' },
  { value: 'tech',          label: 'Technology & Software' },
  { value: 'other',         label: 'Other' },
]

type HealthResult = {
  score: number; grade: string; grade_color: string; grade_bg: string
  percentile: number; total_tco2e: number; sector_label: string
  vs_sector: string; quick_wins: string[]; cta: string
}

function EsgWidget() {
  const [sector, setSector] = useState('manufacturing')
  const [employees, setEmployees] = useState('')
  const [kwh, setKwh] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HealthResult | null>(null)
  const [error, setError] = useState('')

  const run = async () => {
    if (!employees || parseInt(employees) <= 0) { setError('Enter employee count'); return }
    setError(''); setLoading(true)
    try {
      const r = await fetch(`${API_URL}/health-check/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          employees: parseInt(employees),
          kwh_per_year: kwh ? parseFloat(kwh) : parseInt(employees) * 8000,
        }),
      })
      if (!r.ok) throw new Error()
      setResult(await r.json() as HealthResult)
    } catch { setError('Connection error — please try again.') }
    finally { setLoading(false) }
  }

  if (result) return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center max-w-sm mx-auto">
      <div className="inline-flex w-20 h-20 rounded-full items-center justify-center text-3xl font-black mb-3"
        style={{ background: result.grade_bg, color: result.grade_color }}>
        {result.grade}
      </div>
      <div className="text-4xl font-black text-slate-900 mb-1">{result.score}<span className="text-lg text-slate-400">/100</span></div>
      <p className="text-slate-500 text-sm mb-5">{result.vs_sector}</p>
      <div className="grid grid-cols-2 gap-3 mb-5 text-left">
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <div className="text-xl font-black">{result.total_tco2e.toLocaleString()}</div>
          <div className="text-xs text-slate-400">tCO₂e / year</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <div className="text-xl font-black">Top {100 - result.percentile}%</div>
          <div className="text-xs text-slate-400">sector rank</div>
        </div>
      </div>
      <ul className="text-left space-y-1.5 mb-6">
        {result.quick_wins.map((w, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />{w}
          </li>
        ))}
      </ul>
      <Link href="/request-demo" className="block w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
        Get Full Report →
      </Link>
      <button onClick={() => setResult(null)} className="block w-full mt-2 text-xs text-slate-400 hover:text-slate-600 py-1.5">
        ← Check another
      </button>
    </div>
  )

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 max-w-sm mx-auto">
      <div className="text-center mb-6">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-3">Free · No signup</span>
        <h3 className="text-xl font-black text-slate-900">ESG Score in 10 seconds</h3>
        <p className="text-slate-400 text-sm mt-1">3 inputs. Instant benchmark.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Sector</label>
          <select value={sector} onChange={e => setSector(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Employees</label>
          <input type="number" placeholder="e.g. 500" value={employees} onChange={e => setEmployees(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
            Annual Energy <span className="normal-case font-normal text-slate-400">(kWh — optional)</span>
          </label>
          <input type="number" placeholder="e.g. 2,500,000" value={kwh} onChange={e => setKwh(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button onClick={run} disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-base transition-all disabled:opacity-60">
          {loading ? 'Calculating…' : 'Get My ESG Score →'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav dropdown
// ─────────────────────────────────────────────────────────────────────────────
type DropdownItem = { label: string; desc: string; href: string; icon: string }

function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2">
        {label} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
          {items.map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
              <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <div className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const PLATFORM_ITEMS: DropdownItem[] = [
  { label: 'CarbonSense', desc: 'Scope 1-2-3 emissions & TSRS reporting', href: '/dashboard', icon: '♻️' },
  { label: 'Bank GAR Suite', desc: 'Green Asset Ratio & PCAF financed emissions', href: '/gar', icon: '🏦' },
  { label: 'Earth Intelligence', desc: 'Satellite-based physical climate risk', href: '/uydu', icon: '🛰️' },
  { label: 'AI Report Builder', desc: 'Auto-generate TSRS/GRI/ISSB reports', href: '/report-builder', icon: '🤖' },
  { label: 'CBAM & EUDR', desc: 'EU border carbon & deforestation compliance', href: '/cbam', icon: '🇪🇺' },
  { label: 'KOBİ ESG Credit', desc: 'SME credit scoring — AAA to D', href: '/kobi-credit-score', icon: '🏅' },
]

const SOLUTIONS_ITEMS: DropdownItem[] = [
  { label: 'For Banks & Finance', desc: 'GAR, PCAF, green credit pipelines', href: '/gar', icon: '🏛️' },
  { label: 'For Corporations', desc: 'TSRS, GRI, CBAM, TCFD compliance', href: '/tsrs', icon: '🏭' },
  { label: 'For SMEs', desc: 'ESG scoring, Sorumlu® programme', href: '/kobi-credit-score', icon: '🏪' },
  { label: 'For Universities', desc: 'Research tools, GreenMetric automation', href: '/university', icon: '🎓' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Animated number
// ─────────────────────────────────────────────────────────────────────────────
function AnimNum({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let cur = 0
        const step = end / 60
        const t = setInterval(() => {
          cur = Math.min(cur + step, end)
          setVal(Math.floor(cur))
          if (cur >= end) clearInterval(t)
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* REGULATORY BANNER */}
      <div className="bg-slate-900 text-white text-xs text-center py-2.5 px-4 font-medium">
        🇹🇷 TSRS mandatory for BIST-100: Mar 2025 ·&nbsp;
        Banks (BDDK): Jun 2025 ·&nbsp;
        Large Corporates: Mar 2027 ·&nbsp;
        <Link href="/request-demo" className="underline hover:text-emerald-400">Check your readiness →</Link>
      </div>

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-emerald-50 shadow-md shadow-emerald-500/25">
              <img src="/logo.png" alt="SustainHub" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-black text-xl text-slate-900">SustainHub</span>
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            <NavDropdown label="Platform" items={PLATFORM_ITEMS} />
            <NavDropdown label="Solutions" items={SOLUTIONS_ITEMS} />
            <Link href="/investors" className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">Investors</Link>
            <Link href="/products" className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
              Sign In
            </Link>
            <Link href="/register" className="hidden md:block text-sm font-semibold text-white px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-all">
              Start Free →
            </Link>
            <Link href="/request-demo" className="text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              Book Demo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/6 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative">
          <div className="md:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sprint 50 · Pre-Launch · July 2026
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 mb-7">
              The Intelligence Layer<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                for Sustainable Finance.
              </span>
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10">
              43 modules. AI + satellite data. TSRS · ISSB · GRI · CBAM · EUDR · CDP.
              From Turkey's BIST-100 to London's green finance desks — one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/request-demo"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-base hover:bg-slate-800 transition-all shadow-xl">
                Book a Demo <ArrowRight size={20} />
              </Link>
              <Link href="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-base hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">
                Start Free →
              </Link>
              <button onClick={() => setVideoOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-all">
                <Play size={14} fill="currentColor" /> Watch 90-second demo
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4">No credit card · 14-day free trial · Cancel anytime</p>
          </div>
          <div className="md:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-white p-2">
              <img
                src="/images/hero-earth.jpg"
                alt="SustainHub — Sürdürülebilirlik Platformu"
                className="rounded-2xl w-full h-[350px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 text-white border border-white/10">
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Earth Intelligence</div>
                <div className="text-sm font-bold">Copernicus Sentinel-2 Live NDVI Vegetation Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6" onClick={() => setVideoOpen(false)}>
          <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white">
              <X size={24} />
            </button>
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-white font-black text-2xl mb-2">Product Demo</h3>
            <p className="text-slate-400 text-sm mb-6">90-second walkthrough coming soon. Book a live demo instead.</p>
            <Link href="/request-demo" onClick={() => setVideoOpen(false)}
              className="inline-block px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all">
              Book Live Demo →
            </Link>
          </div>
        </div>
      )}

      {/* STATS */}
      <section className="py-16 px-6 border-y border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: 43, s: '+', label: 'Modules & Pages' },
            { n: 15, s: '+', label: 'Frameworks (TSRS, ISSB, GRI…)' },
            { n: 50000, s: '+', label: 'tCO₂e Tracking Capacity' },
            { n: 3, s: '', label: 'Jurisdictions (TR · UK · KKTC)' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-4xl font-black text-slate-900 mb-1">
                <AnimNum end={stat.n} suffix={stat.s} />
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BAR — generic, no real client names */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Built for Turkey's regulatory landscape — banks, corporates, SMEs, universities
          </p>
          <div className="flex flex-wrap justify-center gap-10 opacity-40">
            {['A Leading Bank', 'A Major Holding', 'A Retail Chain', 'A Technical University', 'An Energy Company', 'A Logistics Group'].map(n => (
              <div key={n} className="text-slate-500 font-black text-sm">{n}</div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 italic">Client logos will appear here when NDAs allow · Currently in pilot program</p>
        </div>
      </section>

      {/* FOUR WORLDS */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black mb-4">One Platform. Four Worlds.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A single unified platform that adapts to your role — bank, corporate, SME, or university.
              The same data engine, four different experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: '🏭', title: 'Industrial Edge', color: '#10b981',
                image: '/images/hero-smart.jpg',
                desc: 'Automate CBAM declarations, track Scope 1-2-3 via Magic Import, and optimise decarbonisation ROI with AI-powered MACC curves.',
                features: ['TSRS 1+2 reporting', 'Scope 3 deep-dive', 'CBAM & EUDR filing', 'Supplier ESG audit'],
                cta: '/tsrs',
              },
              {
                icon: '🏛️', title: 'Green Finance', color: '#3b82f6',
                image: '/images/feature-forest.jpg',
                desc: "Automate BDDK Green Asset Ratio, calculate PCAF financed emissions, and run SME ESG credit scoring from AAA to D.",
                features: ['GAR calculation (BDDK/EBA)', 'PCAF financed emissions', 'KOBİ credit score AAA→D', 'Climate stress testing'],
                cta: '/gar',
              },
              {
                icon: '🚛', title: 'Supply Nexus', color: '#f59e0b',
                image: '/images/hero-lifestyle.jpg',
                desc: 'Orchestrate your vendor ecosystem. Full EUDR compliance with map-based traceability, RBA v9.0 audit, and automated red flags.',
                features: ['EUDR due diligence', 'RBA v9.0 supplier audit', 'Risk heat map', 'Knock-out veto engine'],
                cta: '/eudr',
              },
              {
                icon: '🎓', title: 'Academic Core', color: '#a855f7',
                image: '/images/feature-garden.jpg',
                desc: 'UI GreenMetric automation for campuses. Real-time simulators and satellite-verified sustainability metrics for research institutions.',
                features: ['GreenMetric automation', 'Research data portal', 'Student ESG simulator', 'Satellite verification'],
                cta: '/university',
              },
            ].map(w => (
              <div key={w.title} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all flex flex-col">
                <img src={w.image} alt={w.title} className="h-36 w-full object-cover opacity-60 hover:opacity-100 transition-opacity" />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{w.icon}</span>
                    <h3 className="font-black text-lg" style={{ color: w.color }}>{w.title}</h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-5 flex-1">{w.desc}</p>
                  <ul className="space-y-1.5 mb-6">
                    {w.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                        <span style={{ color: w.color }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={w.cta}
                    className="text-xs font-bold transition-colors flex items-center gap-1 mt-auto"
                    style={{ color: w.color }}>
                    Explore {w.title} <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">First Report in 10 Minutes</h2>
            <p className="text-slate-500">No consultant. No Excel. No weeks of setup.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-slate-100" />
            {[
              { n: '01', icon: '📂', title: 'Upload Your Data', body: 'Drag-drop any Excel, PDF, or invoice. Magic Import uses 8 AI rules to map it automatically — no template needed.' },
              { n: '02', icon: '🤖', title: 'AI Maps & Calculates', body: '"Monthly kWh" → Scope 2. "Fuel litres" → Scope 1. Errors highlighted in real time. Approved in one click.' },
              { n: '03', icon: '📄', title: 'Download Your Report', body: 'TSRS / GRI / ISSB / CDP draft ready. XBRL-tagged. KGK digital platform ready. Board-ready PDF.' },
            ].map(s => (
              <div key={s.n} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-3xl mx-auto mb-5 relative z-10 bg-white">
                  {s.icon}
                </div>
                <div className="text-xs font-black text-emerald-600 mb-2 tracking-widest">STEP {s.n}</div>
                <h3 className="font-black text-slate-900 text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESG WIDGET */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-5">
              Free · No signup required
            </span>
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              What's your<br />ESG score?
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-6">
              3 inputs. Instant benchmark against your sector.
              See where you stand before TSRS deadlines hit.
            </p>
            <ul className="space-y-3">
              {[
                'Instant tCO₂e estimate',
                'Sector percentile ranking',
                'Top 3 quick wins for your company',
                'Personalised demo offer',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Check size={15} className="text-emerald-500 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <EsgWidget />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-500">Annual subscription · All prices exclude VAT</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Starter',
                price_try: '₺30,000', price_eur: '€800',
                for: 'SMEs & early adopters',
                highlight: false,
                features: ['Carbon tracking', 'Basic reporting', '1 user', 'GRI Core'],
              },
              {
                name: 'Professional',
                price_try: '₺72,000', price_eur: '€2,000',
                for: 'Mid-size corporations',
                highlight: true,
                features: ['All frameworks', 'TSRS report', '5 users', 'AI Copilot', 'XBRL export'],
              },
              {
                name: 'Enterprise',
                price_try: '₺180,000+', price_eur: '€5,000+',
                for: 'Large corporates & holdings',
                highlight: false,
                features: ['Full platform', 'Bank GAR', 'API access', 'Unlimited users', 'SLA support'],
              },
              {
                name: 'KSRU Partner',
                price_try: '₺120,000', price_eur: '€3,300',
                for: 'Ministry Sorumlu® programme',
                highlight: false,
                features: ['Sorumlu® score', 'SME portal', 'Subsidy calculator', 'BDDK integration'],
              },
            ].map(p => (
              <div key={p.name}
                className={`rounded-2xl p-6 border relative flex flex-col ${p.highlight ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-black text-slate-900 text-lg">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.for}</p>
                </div>
                <div className="mb-5">
                  <div className="text-2xl font-black text-slate-900">{p.price_try}</div>
                  <div className="text-xs text-slate-400">{p.price_eur} / year</div>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check size={12} className="text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/request-demo"
                  className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
                    p.highlight ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border border-slate-300 hover:border-slate-400 text-slate-700'
                  }`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-xs mt-6">
            All plans include 14-day free trial ·{' '}
            <Link href="/abonelik" className="text-emerald-600 hover:underline">Full comparison →</Link>
          </p>
        </div>
      </section>

      {/* COMPLIANCE TIMELINE */}
      <section className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-3">Turkey's TSRS Compliance Clock</h2>
            <p className="text-slate-400 text-sm">Are you in scope? Are you ready?</p>
          </div>
          <div className="space-y-3">
            {[
              { date: 'Mar 2025', seg: 'BIST-100 companies', status: 'done', reg: 'SPK' },
              { date: 'Jun 2025', seg: 'Banks & insurers (BDDK)', status: 'now', reg: 'BDDK' },
              { date: 'Mar 2026', seg: 'All BIST companies', status: 'upcoming', reg: 'SPK' },
              { date: 'Mar 2027', seg: 'Large companies (500M TRY assets)', status: 'upcoming', reg: 'KGK' },
            ].map(r => (
              <div key={r.date} className={`flex items-center gap-5 p-4 rounded-2xl ${r.status === 'done' ? 'bg-emerald-900/40' : r.status === 'now' ? 'bg-amber-900/40 border border-amber-500/30' : 'bg-white/5'}`}>
                <div className={`w-3 h-3 rounded-full shrink-0 ${r.status === 'done' ? 'bg-emerald-500' : r.status === 'now' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-black w-20 shrink-0">{r.date}</span>
                <span className="flex-1 text-slate-300 text-sm">{r.seg}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">{r.reg}</span>
                {r.status === 'now' && (
                  <Link href="/request-demo" className="text-xs text-amber-400 font-bold hover:underline shrink-0">
                    Check readiness →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🔒', title: 'KGK Compliant', sub: 'TSRS 1+2 certified engine' },
            { icon: '🛰️', title: 'Satellite Verified', sub: 'Copernicus data integration' },
            { icon: '🌐', title: 'Multi-Jurisdiction', sub: 'TR · UK · KKTC · EU' },
            { icon: '📋', title: 'XBRL Ready', sub: 'KGK digital filing format' },
          ].map(t => (
            <div key={t.title} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl">
                {t.icon}
              </div>
              <div className="font-bold text-slate-900 text-sm">{t.title}</div>
              <div className="text-xs text-slate-500">{t.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-black mb-5 leading-tight">
            Ready to report<br />with confidence?
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Join Turkey's sustainability reporting revolution.<br />
            TSRS deadlines won't wait — neither should you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/request-demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg transition-all shadow-2xl shadow-emerald-500/25">
              Book a Demo <ArrowRight size={20} />
            </Link>
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg transition-all">
              Start Free →
            </Link>
          </div>
          <p className="text-slate-500 text-xs mt-6">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-base">🌿</div>
                <span className="font-black text-white text-lg">SustainHub<span className="text-emerald-400">.online</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-4 text-slate-500">
                Turkey's #1 AI + satellite-powered sustainability reporting platform.
                TSRS · ISSB · CSRD · UK SRS · GRI · CBAM · EUDR · CDP
              </p>
              <p className="text-xs text-slate-600">
                Barbaros Mah. Şebboy Sok. No:4 Dijitalpark Teknokent<br />
                Kat:1 D:8 Ataşehir / İstanbul · London<br />
                Connective Hub Digital Technologies Ltd.<br />
                © 2026 SustainHub. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {[['Dashboard', '/dashboard'], ['TSRS 1+2', '/tsrs'], ['Bank GAR', '/gar'], ['Earth Intelligence', '/uydu'], ['AI Report Builder', '/report-builder']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {[['About', '/about'], ['Products', '/products'], ['Investors', '/investors'], ['Careers', '/careers'], ['Contact', '/contact']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                {[['News & Insights', '/news-insights'], ['Data Library', '/data-library'], ['COP31 Special', '/cop31'], ['Book Demo', '/request-demo'], ['Pricing', '/abonelik']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <div className="flex gap-4">
              <span>🇹🇷 Turkey</span>
              <span>🇬🇧 United Kingdom</span>
              <span>🇨🇾 KKTC</span>
              <span>🇪🇺 EU</span>
            </div>
            <div className="flex gap-6">
              <Link href="/legal/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
              <Link href="/legal/cookies" className="hover:text-slate-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
