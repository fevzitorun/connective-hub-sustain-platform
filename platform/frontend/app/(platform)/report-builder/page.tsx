'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Framework {
  id: string; label: string; label_full: string; icon: string; color: string
  regulator: string; sections: string[]; markets: string[]; mandatory: boolean
}
interface Template {
  id: string; label: string; label_tr: string; icon: string
  frameworks: string[]; pages_est: number | null; desc: string
}
interface Section { id: string; label: string; category: string; pages: number }
interface Outline {
  company_name: string; report_year: number; language: string
  frameworks: Framework[]; sections: Section[]
  total_pages: number; estimated_hours: number; status: string; generated_at: string
}
interface RBData {
  frameworks: Framework[]; templates: Template[]
  section_library: Section[]; demo_outline: Outline
}

const CATEGORY_COLORS: Record<string, string> = {
  Structure: '#64748b', ESG: '#6366f1', Climate: '#ef4444',
  Environment: '#10b981', Social: '#f59e0b', Data: '#0891b2',
  Index: '#8b5cf6', Assurance: '#ec4899',
}

const TABS = ['Templates', 'Build Report', 'Preview'] as const
type Tab = typeof TABS[number]

export default function ReportBuilderPage() {
  const [tab, setTab] = useState<Tab>('Templates')
  const [data, setData] = useState<RBData | null>(null)
  const [loading, setLoading] = useState(true)
  const [outline, setOutline] = useState<Outline | null>(null)
  const [building, setBuilding] = useState(false)

  const [form, setForm] = useState({
    company_name: '',
    report_year: 2024,
    frameworks: [] as string[],
    language: 'tr',
  })

  useEffect(() => {
    api.reportBuilder.demo().then(d => {
      const rb = d as RBData
      setData(rb)
      setOutline(rb.demo_outline)
    }).finally(() => setLoading(false))
  }, [])

  function toggleFramework(id: string) {
    setForm(f => ({
      ...f,
      frameworks: f.frameworks.includes(id) ? f.frameworks.filter(x => x !== id) : [...f.frameworks, id],
    }))
  }

  function loadTemplate(t: Template) {
    setForm(f => ({ ...f, frameworks: t.frameworks }))
    setTab('Build Report')
  }

  async function handleBuild() {
    if (!form.frameworks.length) return
    setBuilding(true)
    try {
      const res = await api.reportBuilder.build({
        company_name: form.company_name || 'My Company',
        report_year: form.report_year,
        frameworks: form.frameworks,
        language: form.language,
      })
      setOutline(res as Outline)
      setTab('Preview')
    } finally {
      setBuilding(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center"><div className="text-4xl mb-4">📄</div><div className="text-slate-400">Report Builder yükleniyor…</div></div>
    </div>
  )
  if (!data) return null

  const sectionsByCategory = outline?.sections.reduce<Record<string, Section[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {}) ?? {}

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📄</span>
          <div>
            <h1 className="text-2xl font-black">Sustain Report Builder</h1>
            <p className="text-slate-400 text-sm">Multi-framework ESG rapor üreticisi — TSRS · CSRD · GRI · ISSB · CDP</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">6 Framework</span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">20 Bölüm</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Templates ── */}
      {tab === 'Templates' && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Hazır şablon seçin veya Build Report'ta özelleştirin.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.templates.map(t => (
              <div key={t.id} className="rounded-2xl border border-slate-700 bg-slate-800 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.icon}</span>
                  <div>
                    <div className="font-bold text-white">{t.label}</div>
                    <div className="text-xs text-slate-400">{t.label_tr}</div>
                  </div>
                  {t.pages_est && (
                    <div className="ml-auto text-right">
                      <div className="text-lg font-black text-slate-300">{t.pages_est}</div>
                      <div className="text-xs text-slate-500">sayfa</div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-400">{t.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {t.frameworks.map(fid => {
                    const fw = data.frameworks.find(f => f.id === fid)
                    return fw ? (
                      <span key={fid} className="text-xs font-bold px-2 py-0.5 rounded-full border"
                        style={{ background: fw.color + '20', color: fw.color, borderColor: fw.color + '40' }}>
                        {fw.icon} {fw.label}
                      </span>
                    ) : null
                  })}
                </div>
                <button onClick={() => loadTemplate(t)}
                  className="mt-auto w-full py-2 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all">
                  Bu Şablonu Kullan →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Build Report ── */}
      {tab === 'Build Report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Şirket Adı</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="örn. Arçelik A.Ş."
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rapor Yılı</label>
              <input type="number" value={form.report_year} onChange={e => setForm(f => ({ ...f, report_year: parseInt(e.target.value) }))}
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Çerçeveler Seçin</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.frameworks.map(fw => {
                const selected = form.frameworks.includes(fw.id)
                return (
                  <button key={fw.id} onClick={() => toggleFramework(fw.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${selected ? 'border-opacity-100' : 'border-slate-700 bg-slate-800 opacity-60 hover:opacity-90'}`}
                    style={selected ? { borderColor: fw.color, background: fw.color + '15' } : {}}>
                    <div className="text-xl mb-2">{fw.icon}</div>
                    <div className="font-bold text-sm text-white">{fw.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{fw.regulator}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {fw.markets.map(m => (
                        <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{m}</span>
                      ))}
                    </div>
                    {selected && <div className="mt-2 text-xs font-bold" style={{ color: fw.color }}>✓ Seçildi</div>}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Rapor Dili</label>
            <div className="flex gap-3">
              {[['tr', '🇹🇷 Türkçe'], ['en', '🇬🇧 English']].map(([val, lbl]) => (
                <button key={val} onClick={() => setForm(f => ({ ...f, language: val }))}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${form.language === val ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleBuild} disabled={!form.frameworks.length || building}
            className="w-full py-3.5 rounded-2xl text-white font-black text-base bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all">
            {building ? 'Rapor Oluşturuluyor…' : `Rapor Oluştur (${form.frameworks.length} çerçeve seçili) →`}
          </button>
        </div>
      )}

      {/* ── Preview ── */}
      {tab === 'Preview' && outline && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Şirket</div>
              <div className="text-lg font-black text-white">{outline.company_name}</div>
              <div className="text-sm text-slate-400">{outline.report_year} Raporu</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tahmini Sayfa</div>
              <div className="text-3xl font-black text-white">{outline.total_pages}</div>
              <div className="text-xs text-slate-400">sayfa</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bölüm Sayısı</div>
              <div className="text-3xl font-black text-white">{outline.sections.length}</div>
              <div className="text-xs text-slate-400">bölüm</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Süre Tahmini</div>
              <div className="text-3xl font-black text-white">{outline.estimated_hours}<span className="text-lg text-slate-400"> sa</span></div>
              <div className="text-xs text-slate-400">hazırlık süresi</div>
            </div>
          </div>

          {/* Framework badges */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Seçilen Çerçeveler</div>
            <div className="flex flex-wrap gap-2">
              {outline.frameworks.map(fw => (
                <span key={fw.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border"
                  style={{ background: fw.color + '20', color: fw.color, borderColor: fw.color + '40' }}>
                  {fw.icon} {fw.label}
                </span>
              ))}
            </div>
          </div>

          {/* Section outline by category */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rapor İçeriği</div>
            <div className="space-y-4">
              {Object.entries(sectionsByCategory).map(([cat, sections]) => (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat] ?? '#64748b' }} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{cat}</span>
                  </div>
                  <div className="space-y-1">
                    {sections.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800 border border-slate-700/50">
                        <span className="text-xs text-slate-500 w-6 text-right">{i + 1}</span>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[cat] ?? '#64748b' }} />
                        <span className="flex-1 text-sm text-slate-300">{s.label}</span>
                        <span className="text-xs text-slate-500">{s.pages} sayfa</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download placeholder */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-emerald-300">Rapor Hazır</div>
              <div className="text-sm text-slate-400 mt-1">Veriler platform modüllerinden otomatik çekildi. AI ile tamamlayın veya Word/PDF olarak indirin.</div>
            </div>
            <div className="flex gap-2 flex-shrink-0 ml-4">
              <button className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-700 text-white hover:bg-slate-600 transition-all">
                📝 Word
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all">
                📄 PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
