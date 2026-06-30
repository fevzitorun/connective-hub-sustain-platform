'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/constants'

type CheckItem = {
  id: string
  category: string
  label: string
  detail: string
  link?: string
  auto?: boolean
}

const CHECKS: CheckItem[] = [
  // Frontend
  { id: 'f01', category: 'Frontend', label: 'Homepage conversion page', detail: 'TSRS urgency, pricing ₺/€, ESG widget, CTA', link: '/' },
  { id: 'f02', category: 'Frontend', label: 'Products page ₺/€ pricing', detail: 'Removed £ pricing, added 4 tiers', link: '/products' },
  { id: 'f03', category: 'Frontend', label: 'Request Demo form → backend', detail: 'POST /demo-request wired', link: '/request-demo' },
  { id: 'f04', category: 'Frontend', label: 'Onboarding wizard (3-step)', detail: 'Sector grid, emissions, standard selection', link: '/onboarding' },
  { id: 'f05', category: 'Frontend', label: 'Executive Dashboard', detail: 'CFO/CSO view — compliance, financial risk, Net Zero', link: '/executive' },
  { id: 'f06', category: 'Frontend', label: 'Abonelik page ₺ base currency', detail: 'TRY primary, EUR/USD derived' },
  { id: 'f07', category: 'Frontend', label: 'KOBİ ESG Credit Score UI', detail: '4 tabs, ScoreGauge, RBA knock-out', link: '/kobi-credit-score' },
  { id: 'f08', category: 'Frontend', label: 'Sidebar updated', detail: 'Executive + KOBİ links added' },
  // Backend
  { id: 'b01', category: 'Backend', label: 'Demo request route', detail: 'POST /demo-request → saves JSON + Resend email' },
  { id: 'b02', category: 'Backend', label: 'KOBİ ESG Credit Score API', detail: '/kobi-credit-score/* 8 endpoints' },
  { id: 'b03', category: 'Backend', label: 'Pricing TRY base', detail: 'PLANS updated to ₺ (30K/72K/180K)' },
  { id: 'b04', category: 'Backend', label: 'TSRS engine enriched', detail: 'Net Zero benchmarks, materiality thresholds' },
  { id: 'b05', category: 'Backend', label: 'PCAF DQS levels', detail: 'Akbank benchmark, DQS 1-5 data' },
  { id: 'b06', category: 'Backend', label: 'XBRL tag library', detail: '28 tags, KGK format' },
  // SEO
  { id: 's01', category: 'SEO', label: 'Root layout metadata', detail: 'OG tags, Twitter card, canonical, hreflang' },
  { id: 's02', category: 'SEO', label: 'sitemap.ts', detail: 'All public + platform pages, priority set' },
  { id: 's03', category: 'SEO', label: 'robots.ts', detail: 'allow /, disallow /api/, /admin/' },
  // Deploy
  { id: 'd01', category: 'Deploy', label: 'vercel.json created', detail: 'Headers, rewrites, redirects, fra1 region' },
  { id: 'd02', category: 'Deploy', label: 'next.config.ts optimized', detail: 'Image formats, security headers, package imports' },
  { id: 'd03', category: 'Deploy', label: '.env.example (frontend)', detail: 'API URL, Stripe, GA, PostHog keys documented' },
  { id: 'd04', category: 'Deploy', label: '.env.example (backend)', detail: 'DB, JWT, Stripe, Resend, OpenAI' },
  // Final QA
  { id: 'q01', category: 'QA', label: 'TypeScript 0 errors', detail: 'npx tsc --noEmit passes', auto: true },
  { id: 'q02', category: 'QA', label: 'ESG Health widget live test', detail: 'Free check on homepage — no email required' },
  { id: 'q03', category: 'QA', label: 'Backend health check', detail: 'GET /health → {"status": "ok"}', auto: true },
  { id: 'q04', category: 'QA', label: 'Demo form submit', detail: 'POST /demo-request returns ref code' },
  { id: 'q05', category: 'QA', label: 'Mobile responsive check', detail: 'Homepage on 375px (iPhone SE)' },
  { id: 'q06', category: 'QA', label: 'Dark sidebar navigation', detail: 'All 43+ pages accessible from sidebar' },
]

type StatusMap = Record<string, 'done' | 'fail' | 'skip'>

export default function PreLaunchPage() {
  const [statuses, setStatuses] = useState<StatusMap>(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('prelaunch_statuses') || '{}') }
    catch { return {} }
  })
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'fail'>('checking')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(() => {
        setApiStatus('ok')
        setStatuses(prev => ({ ...prev, q03: 'done' }))
      })
      .catch(() => setApiStatus('fail'))
  }, [])

  function toggle(id: string) {
    setStatuses(prev => {
      const next = { ...prev }
      if (next[id] === 'done') next[id] = 'fail'
      else if (next[id] === 'fail') delete next[id]
      else next[id] = 'done'
      localStorage.setItem('prelaunch_statuses', JSON.stringify(next))
      return next
    })
  }

  const categories = [...new Set(CHECKS.map(c => c.category))]
  const totalDone = CHECKS.filter(c => statuses[c.id] === 'done').length
  const totalFail = CHECKS.filter(c => statuses[c.id] === 'fail').length
  const pct = Math.round((totalDone / CHECKS.length) * 100)

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-slate-900">Pre-Launch Checklist</h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">Sprint 44–50</span>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Click to cycle: ⬜ pending → ✅ done → ❌ fail → ⬜ pending
        </p>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-6 text-sm">
              <span><span className="font-black text-emerald-600">{totalDone}</span> done</span>
              <span><span className="font-black text-red-500">{totalFail}</span> failed</span>
              <span><span className="font-black text-slate-400">{CHECKS.length - totalDone - totalFail}</span> pending</span>
            </div>
            <span className="text-2xl font-black text-slate-900">{pct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-2xl">🚀</span>
              <div className="font-black text-emerald-700 mt-1">Lansmana Hazır!</div>
            </div>
          )}
          {apiStatus === 'ok' && (
            <div className="mt-3 text-xs text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Backend API online
            </div>
          )}
          {apiStatus === 'fail' && (
            <div className="mt-3 text-xs text-red-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Backend API offline — check {API_URL}/health
            </div>
          )}
        </div>
      </div>

      {/* Checklist by category */}
      <div className="space-y-6">
        {categories.map(cat => {
          const items = CHECKS.filter(c => c.category === cat)
          const catDone = items.filter(c => statuses[c.id] === 'done').length
          return (
            <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-black text-slate-800">{cat}</h2>
                <span className="text-xs font-bold text-slate-500">{catDone}/{items.length}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {items.map(item => {
                  const st = statuses[item.id]
                  return (
                    <div key={item.id} className={`flex items-start gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors group ${st === 'fail' ? 'bg-red-50' : st === 'done' ? 'bg-emerald-50/50' : ''}`}
                      onClick={() => !item.auto && toggle(item.id)}>
                      <button className="mt-0.5 text-lg shrink-0">
                        {st === 'done' ? '✅' : st === 'fail' ? '❌' : '⬜'}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-sm ${st === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {item.label}
                          </span>
                          {item.auto && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">AUTO</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                      </div>
                      {item.link && (
                        <Link href={item.link} onClick={e => e.stopPropagation()}
                          className="text-xs text-emerald-600 font-bold hover:underline shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          Test →
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Launch CTA */}
      <div className="mt-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-center text-white">
        <h2 className="text-xl font-black mb-2">Lansmanı Başlat</h2>
        <p className="text-emerald-100 text-sm mb-4">Checklist tamamlandığında pilot müşterilere link gönderin.</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/request-demo" className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-50 transition-all">
            Demo Sayfasını Test Et
          </Link>
          <Link href="/" className="border border-white/50 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:border-white transition-all">
            Homepage'i Gör
          </Link>
        </div>
      </div>
    </div>
  )
}
