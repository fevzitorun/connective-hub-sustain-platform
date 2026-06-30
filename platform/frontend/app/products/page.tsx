'use client'

import Link from 'next/link'

const PRODUCTS = [
  {
    id: 'carbonsense',
    emoji: '♻️',
    name: 'CarbonSense',
    tagline: 'ESG & Carbon Management',
    status: 'live',
    color: '#10b981',
    desc: 'A comprehensive carbon calculation and ESG reporting engine supporting the GHG Protocol, TSRS 1&2, CSRD/ESRS, GRI, and ISSB S2.',
    features: ['Scope 1/2/3 calculation', 'AI Report Generator (PDF/Word)', 'Multi-framework (TSRS, GRI, ISSB)', 'Magic Import (Excel/OCR)', 'XBRL digital filings'],
    target: 'All sectors · 200+ Enterprises · 70,000+ SMEs',
    price: '₺30.000 / yıl · €800 / year',
    cta: '/register',
    ctaText: 'Start Demo',
  },
  {
    id: 'earth',
    emoji: '🛰️',
    name: 'Earth Intelligence',
    tagline: 'Satellite & Geospatial Intelligence',
    status: 'live',
    color: '#3b82f6',
    desc: 'Asset-level physical climate risk screening using ESA Sentinel-2, NASA, and Copernicus data. Verifies green claims with independent satellite observation, issuing the "Sustain Verified" badge.',
    features: ['Flood / drought / earthquake risk', 'NDVI green space analysis', 'IPCC AR6 2050 projections', 'TCFD physical risk module', '"Sustain Verified" badge'],
    target: 'Banks · Insurance · Real Estate · Utilities',
    price: '₺72.000 / yıl · €2.000 / year',
    cta: '/dashboard',
    ctaText: 'Earth Demo',
  },
  {
    id: 'finance',
    emoji: '🏦',
    name: 'Sustain Finance',
    tagline: 'GAR · PCAF · Green Financing',
    status: 'live',
    color: '#f59e0b',
    desc: 'Automated Green Asset Ratio (GAR) calculation portal matching BDDK/EBA guidelines. Scope 3 Category 15 financed emissions based on the PCAF Standard v2. EU Taxonomy classification.',
    features: ['GAR calculation (BDDK/EBA/FCA)', 'PCAF financed emissions', 'EU Taxonomy NACE mapping', 'SME ESG Credit Scoring (AAA→D)', 'Climate stress testing (IEA NZE/NGFS)'],
    target: '34 Turkish banks · Investment Funds · Insurance',
    price: '₺120.000 / yıl · €3.300 / year (KSRU)',
    cta: '/gar',
    ctaText: 'GAR Portal',
  },
  {
    id: 'climate',
    emoji: '🌡️',
    name: 'Climate Risk',
    tagline: 'TCFD · ISSB S2 · Scenario Analysis',
    status: 'live',
    color: '#8b5cf6',
    desc: 'Climate-adjusted financial impact matrices designed for CFOs. Calculate CapEx, OpEx, and climate-adjusted asset values. Model transition and physical risks under IEA and NGFS scenarios.',
    features: ['TCFD 4-pillar reporting', 'CFO Financial Impact Matrix', 'IEA NZE 2050 / NGFS scenarios', 'Scope 3 Cat. 15 bridge', 'IFRS S2 / UK SRS output'],
    target: 'CFOs · Boards of Directors · Auditors',
    price: 'Professional planına dahil',
    cta: '/tcfd',
    ctaText: 'TCFD Module',
  },
  {
    id: 'grid',
    emoji: '⚡',
    name: 'Grid+',
    tagline: 'Energy Intelligence Platform',
    status: 'coming',
    color: '#06b6d4',
    desc: 'Smart meter integration, solar generation tracking, and energy efficiency scoring. Grid+ data feeds directly into CarbonSense Scope 2, eliminating manual utility invoice entry.',
    features: ['Real-time consumption monitoring', 'Solar + battery storage', 'Automated grid factor calculation', 'EV fleet charge management', 'AI demand forecasting'],
    target: 'Industries · Hospitals · Municipalities · Energy Co',
    price: 'Q1 2027 — ön kayıt açık',
    cta: '/register',
    ctaText: 'Pre-register',
  },
  {
    id: 'remoteops',
    emoji: '📡',
    name: 'RemoteOps',
    tagline: 'IoT Infrastructure Monitoring',
    status: 'coming',
    color: '#ec4899',
    desc: '24/7 IoT sensor monitoring for hospitals, municipalities, and critical utility systems. Manage water networks, waste management, and smart building automation.',
    features: ['MQTT / Modbus / BACnet support', 'Incident management & escalation', 'Water leak detection', 'Predictive maintenance AI', 'Mobile field ops app'],
    target: 'UK NHS · Municipalities · Critical Infrastructure',
    price: 'Q1 2027 — pre-registration open',
    cta: '/register',
    ctaText: 'Pre-register',
  },
]

export default function ProductsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/cop31" className="text-sm text-amber-400 hover:text-amber-300 transition-colors hidden md:block font-bold">🇹🇷 COP31</Link>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">About Us</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Sign In</Link>
          <Link href="/request-demo" className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Demo →
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6 border"
          style={{ background: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.3)', color: '#34d399' }}>
          Sustainability Intelligence Operating System · v2.0
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          6 Products, 1 Ecosystem
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          From carbon footprint calculation to satellite risk modeling, GAR report builder to infrastructure IoT monitoring — all under one unified platform.
        </p>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-6">
        {PRODUCTS.map(p => (
          <div key={p.id}
            className="rounded-2xl border p-8 transition-all hover:border-opacity-50 group"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: p.color + '30' }}
          >
            <div className="flex flex-col md:flex-row gap-8">

              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{p.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{p.name}</h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: p.status === 'live' ? 'rgba(5,150,105,0.2)' : 'rgba(100,116,139,0.2)',
                          color:      p.status === 'live' ? '#34d399' : '#94a3b8',
                          border: `1px solid ${p.status === 'live' ? 'rgba(5,150,105,0.3)' : 'rgba(100,116,139,0.3)'}`,
                        }}>
                        {p.status === 'live' ? '✓ Live' : '⏳ Soon'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: p.color }}>{p.tagline}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.features.map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full border"
                      style={{ borderColor: p.color + '30', color: p.color + 'cc', background: p.color + '10' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="md:w-64 flex-shrink-0 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Target Segment</div>
                  <div className="text-xs text-slate-400">{p.target}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-wider mt-3">Pricing</div>
                  <div className="text-sm font-bold" style={{ color: p.color }}>{p.price}</div>
                </div>
                <Link
                  href={p.cta}
                  className="mt-6 w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{ background: p.color + '20', color: p.color, border: `1px solid ${p.color}40` }}
                >
                  {p.ctaText} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing CTA */}
      <section className="border-t border-white/5 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-black text-white mb-4">Hangi plan size uygun?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-sm">
            {[
              { plan: 'Starter', price: '₺30.000/yıl', for: 'KOBİ & Erken Adopter', color: '#64748b' },
              { plan: 'Professional', price: '₺72.000/yıl', for: 'Orta Ölçekli Şirket', color: '#10b981' },
              { plan: 'Enterprise', price: '₺180.000+/yıl', for: 'Büyük Şirket & Holding', color: '#3b82f6' },
              { plan: 'KSRU Partner', price: '₺120.000/yıl', for: 'Sorumlu® Tedarikçi', color: '#f59e0b' },
            ].map(t => (
              <div key={t.plan} className="rounded-xl p-4 border text-center"
                style={{ borderColor: t.color + '30', background: t.color + '08' }}>
                <div className="font-black text-white">{t.plan}</div>
                <div className="text-xs mt-1" style={{ color: t.color }}>{t.price}</div>
                <div className="text-xs text-slate-500 mt-1">{t.for}</div>
              </div>
            ))}
          </div>
          <Link href="/request-demo"
            className="inline-block px-10 py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Start Free Demo →
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-slate-700 border-t border-white/5">
        SustainHub.online · Connective Hub Digital Technologies Ltd. · Istanbul Teknokent & London
      </footer>
    </div>
  )
}
