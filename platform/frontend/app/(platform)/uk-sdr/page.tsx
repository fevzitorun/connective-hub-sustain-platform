'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

// ── Types ────────────────────────────────────────────────────────────────────
interface PaiIndicator {
  id: number; category: string; name: string; unit: string; mandatory: boolean; eu_taxonomy: boolean
}
interface AssessmentResult {
  company: string
  overall_readiness_pct: number
  uk_revenue_pct: number
  eu_revenue_pct: number
  fca_sdr: {
    label: string; label_description: string; label_color: string; readiness_score: number
    total_co2e: number; tcfd_gaps: string[]; tcfd_pillars: Record<string, number>
    anti_greenwashing_flags: string[]; requirements: string[]
    next_label: { name: string; min_score: number; description: string } | null
    action_plan: { priority: string; action: string; deadline: string }[]
  }
  eu_sfdr: {
    article: number; article_name: string; article_description: string; article_color: string
    criteria: string[]; taxonomy_alignment_pct: number; meets_taxonomy_threshold: boolean
    taxonomy_threshold_required: number; sustainable_investment_pct: number
    pai_coverage_pct: number; pai_covered: number; pai_total: number
    has_dnsh_assessment: boolean; entity_type: string
    upgrade_path: { target_article: number; target_name: string; gaps: string[] } | null
    mandatory_disclosures: string[]
  }
  pai_indicators: PaiIndicator[]
  jurisdiction_summary: {
    uk: { framework: string; status: string; color: string; applicable: boolean }
    eu: { framework: string; status: string; color: string; applicable: boolean }
  }
}

// ── Default form state ────────────────────────────────────────────────────────
const DEFAULT_FORM = {
  company_name: 'Yıldız Tekstil A.Ş.',
  maturity_score: 58,
  scope1_co2e: 128.4,
  scope2_co2e: 73.8,
  scope3_co2e: 365.2,
  uk_revenue_pct: 22,
  eu_revenue_pct: 35,
  taxonomy_alignment_pct: 12,
  sustainable_investment_pct: 0,
  has_science_targets: false,
  has_verified_data: false,
  entity_type: 'corporate',
}

const PRIORITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  HIGH:   { bg: '#7f1d1d', text: '#fca5a5', label: 'Yüksek' },
  MEDIUM: { bg: '#78350f', text: '#fde68a', label: 'Orta' },
  LOW:    { bg: '#1e3a5f', text: '#93c5fd', label: 'Düşük' },
  INFO:   { bg: '#1e293b', text: '#94a3b8', label: 'Bilgi' },
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function UKSDRPage() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'fca' | 'sfdr' | 'pai' | 'plan'>('fca')

  const set = (k: string, v: string | number | boolean) => setForm(prev => ({ ...prev, [k]: v }))

  const loadDemo = async () => {
    setLoading(true)
    try {
      const data = await api.ukSdr.demo()
      setResult(data.result)
      toast.success('Demo verisi yüklendi — Yıldız Tekstil A.Ş.')
    } catch {
      toast.error('Demo yüklenemedi')
    } finally { setLoading(false) }
  }

  const runAssessment = async () => {
    setLoading(true)
    try {
      const data = await api.ukSdr.assess(form)
      setResult(data.result)
      toast.success('Değerlendirme tamamlandı')
    } catch {
      toast.error('Değerlendirme başarısız')
    } finally { setLoading(false) }
  }

  const tcfdRadarData = result ? Object.entries(result.fca_sdr.tcfd_pillars).map(([name, value]) => ({ name, value })) : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🇬🇧</span>
            <h1 className="text-2xl font-black text-white">FCA SDR + EU SFDR Uyum Modülü</h1>
          </div>
          <p className="text-slate-400 text-sm">
            UK Sustainability Disclosure Requirements (PS22/3) · EU Sustainable Finance Disclosure Regulation (2019/2088)
          </p>
        </div>
        <button onClick={loadDemo}
          className="text-xs px-5 py-2.5 rounded-lg border border-emerald-500/40 text-emerald-400 hover:border-emerald-400 font-bold transition-colors whitespace-nowrap">
          📊 Demo: Yıldız Tekstil
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Şirket Parametreleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="col-span-2">
            <label className="text-xs text-slate-500 mb-1 block">Şirket Adı</label>
            <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Kuruluş Türü</label>
            <select value={form.entity_type} onChange={e => set('entity_type', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500">
              <option value="corporate">Kurumsal Şirket</option>
              <option value="bank">Banka / Finansal Kurum</option>
              <option value="fund">Yatırım Fonu</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">ESG Olgunluk Skoru (0-100)</label>
            <input type="number" min={0} max={100} value={form.maturity_score}
              onChange={e => set('maturity_score', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { key: 'scope1_co2e', label: 'Kapsam 1 (tCO₂e)' },
            { key: 'scope2_co2e', label: 'Kapsam 2 (tCO₂e)' },
            { key: 'scope3_co2e', label: 'Kapsam 3 (tCO₂e)' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
              <input type="number" min={0} value={(form as Record<string, number | string | boolean>)[f.key] as number}
                onChange={e => set(f.key, Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
            </div>
          ))}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">AB Taksonomi Uyumu (%)</label>
            <input type="number" min={0} max={100} value={form.taxonomy_alignment_pct}
              onChange={e => set('taxonomy_alignment_pct', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">UK Ciro Payı (%)</label>
            <input type="number" min={0} max={100} value={form.uk_revenue_pct}
              onChange={e => set('uk_revenue_pct', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">AB Ciro Payı (%)</label>
            <input type="number" min={0} max={100} value={form.eu_revenue_pct}
              onChange={e => set('eu_revenue_pct', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-emerald-500" />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="targets" checked={form.has_science_targets}
              onChange={e => set('has_science_targets', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500" />
            <label htmlFor="targets" className="text-xs text-slate-400 cursor-pointer">SBTi Hedefleri Var</label>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="verified" checked={form.has_verified_data}
              onChange={e => set('has_verified_data', e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500" />
            <label htmlFor="verified" className="text-xs text-slate-400 cursor-pointer">Doğrulanmış Veri</label>
          </div>
        </div>

        <button onClick={runAssessment} disabled={loading}
          className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-colors disabled:opacity-50">
          {loading ? '⏳ Hesaplanıyor...' : '🔍 Uyum Değerlendirmesi Çalıştır'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Jurisdiction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
              <p className="text-xs text-slate-500 mb-1">Genel Hazırlık</p>
              <p className="text-5xl font-black" style={{ color: result.overall_readiness_pct >= 60 ? '#10b981' : result.overall_readiness_pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                {result.overall_readiness_pct}%
              </p>
              <p className="text-xs text-slate-500 mt-1">{result.company}</p>
            </div>
            {Object.entries(result.jurisdiction_summary).map(([key, j]) => (
              <div key={key} className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                style={{ borderColor: j.applicable ? j.color + '40' : undefined }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{key === 'uk' ? '🇬🇧' : '🇪🇺'}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">{j.framework}</span>
                  {!j.applicable && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">Uygulanmaz</span>}
                </div>
                <p className="text-sm font-black" style={{ color: j.color }}>{j.status}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 w-fit flex-wrap">
            {[
              { k: 'fca', l: '🇬🇧 FCA SDR' },
              { k: 'sfdr', l: '🇪🇺 EU SFDR' },
              { k: 'pai', l: '📋 PAI Göstergeleri' },
              { k: 'plan', l: '🗓️ Eylem Planı' },
            ].map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)}
                className="text-sm font-semibold px-5 py-2 rounded-lg transition-all"
                style={{
                  background: activeTab === t.k ? '#059669' : 'transparent',
                  color: activeTab === t.k ? '#fff' : '#94a3b8',
                }}>
                {t.l}
              </button>
            ))}
          </div>

          {/* FCA SDR Tab */}
          {activeTab === 'fca' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Label card */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                  style={{ borderColor: result.fca_sdr.label_color + '40' }}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">FCA SDR Etiketi</p>
                  <p className="text-lg font-black mb-2" style={{ color: result.fca_sdr.label_color }}>
                    {result.fca_sdr.label}
                  </p>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">{result.fca_sdr.label_description}</p>
                  <div className="h-1.5 bg-slate-800 rounded-full mb-4">
                    <div className="h-full rounded-full transition-all" style={{ width: `${result.fca_sdr.readiness_score}%`, background: result.fca_sdr.label_color }} />
                  </div>
                  <p className="text-3xl font-black text-center" style={{ color: result.fca_sdr.label_color }}>
                    {result.fca_sdr.readiness_score}<span className="text-sm text-slate-500">/100</span>
                  </p>
                </div>

                {result.fca_sdr.next_label && (
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 mb-2">Sonraki Seviye</p>
                    <p className="text-sm font-bold text-white">{result.fca_sdr.next_label.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Hedef puan: {result.fca_sdr.next_label.min_score}</p>
                  </div>
                )}

                {result.fca_sdr.anti_greenwashing_flags.length > 0 && (
                  <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-xs font-bold text-red-400 mb-2">⚠ Greenwashing Uyarısı</p>
                    {result.fca_sdr.anti_greenwashing_flags.map((f, i) => (
                      <p key={i} className="text-xs text-red-300">{f}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* TCFD Pillars Radar + gaps */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-white mb-4">TCFD Sütun Puanları</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={tcfdRadarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Radar name="TCFD" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10 }}
                          formatter={(v) => [`${Number(v ?? 0)}/100`, 'Puan']}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-white mb-3">TCFD Açıklama Boşlukları</p>
                  <div className="space-y-2">
                    {result.fca_sdr.tcfd_gaps.map((g, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-amber-400 mt-0.5 flex-shrink-0">⚠</span>
                        <span className="text-slate-400">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-white mb-3">Etiket Gereksinimleri</p>
                  <div className="space-y-2">
                    {result.fca_sdr.requirements.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span className="text-slate-400">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EU SFDR Tab */}
          {activeTab === 'sfdr' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Article card */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                  style={{ borderColor: result.eu_sfdr.article_color + '40' }}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">SFDR Sınıflandırması</p>
                  <p className="text-xl font-black mb-2" style={{ color: result.eu_sfdr.article_color }}>
                    {result.eu_sfdr.article_name}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.eu_sfdr.article_description}</p>
                </div>

                {/* Metrics */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  {[
                    { label: 'AB Taksonomi Uyumu', value: `${result.eu_sfdr.taxonomy_alignment_pct}%`, target: `Hedef: ${result.eu_sfdr.taxonomy_threshold_required}%`, ok: result.eu_sfdr.meets_taxonomy_threshold },
                    { label: 'Sürdürülebilir Yatırım', value: `${result.eu_sfdr.sustainable_investment_pct}%`, target: '', ok: result.eu_sfdr.sustainable_investment_pct > 0 },
                    { label: 'PAI Kapsama', value: `${result.eu_sfdr.pai_coverage_pct}%`, target: `${result.eu_sfdr.pai_covered}/${result.eu_sfdr.pai_total} gösterge`, ok: result.eu_sfdr.pai_coverage_pct >= 100 },
                    { label: 'DNSH Değerlendirmesi', value: result.eu_sfdr.has_dnsh_assessment ? 'Mevcut' : 'Eksik', target: '', ok: result.eu_sfdr.has_dnsh_assessment },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{m.label}</span>
                      <div className="text-right">
                        <span className="font-bold" style={{ color: m.ok ? '#10b981' : '#f59e0b' }}>{m.value}</span>
                        {m.target && <div className="text-slate-600">{m.target}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {result.eu_sfdr.upgrade_path && (
                  <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-5">
                    <p className="text-xs font-bold text-blue-400 mb-2">↑ Yükseltme Yolu: {result.eu_sfdr.upgrade_path.target_name}</p>
                    <div className="space-y-1">
                      {result.eu_sfdr.upgrade_path.gaps.map((g, i) => (
                        <p key={i} className="text-xs text-blue-300">• {g}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: criteria + mandatory disclosures */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-white mb-3">Sınıflandırma Kriterleri</p>
                  <div className="space-y-2">
                    {result.eu_sfdr.criteria.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">▸</span>
                        <span className="text-slate-400">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-bold text-white mb-3">Zorunlu Açıklamalar</p>
                  <div className="space-y-2">
                    {result.eu_sfdr.mandatory_disclosures.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-slate-600 mt-0.5 flex-shrink-0">□</span>
                        <span className="text-slate-400">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAI Indicators Tab */}
          {activeTab === 'pai' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <p className="text-sm font-bold text-white">14 Zorunlu PAI Göstergesi — SFDR RTS Ek I</p>
                <span className="text-xs text-slate-500">Principal Adverse Impact Indicators</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-500 border-b border-slate-800">
                    <th className="px-4 py-3 text-left w-8">#</th>
                    <th className="px-4 py-3 text-left">Kategori</th>
                    <th className="px-4 py-3 text-left">Gösterge</th>
                    <th className="px-4 py-3 text-center">Birim</th>
                    <th className="px-4 py-3 text-center">AB Taksonomi</th>
                  </tr>
                </thead>
                <tbody>
                  {result.pai_indicators.map(p => {
                    const catColor: Record<string, string> = {
                      Climate: '#ef4444', Energy: '#f59e0b', Biodiversity: '#10b981',
                      Water: '#3b82f6', Waste: '#8b5cf6', Social: '#ec4899', Governance: '#06b6d4',
                    }
                    return (
                      <tr key={p.id} className="border-b border-slate-800/50 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-slate-600 font-mono">{p.id}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: (catColor[p.category] ?? '#64748b') + '20', color: catColor[p.category] ?? '#64748b' }}>
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{p.name}</td>
                        <td className="px-4 py-3 text-center text-slate-500 font-mono">{p.unit}</td>
                        <td className="px-4 py-3 text-center">
                          {p.eu_taxonomy ? <span className="text-emerald-400">✓</span> : <span className="text-slate-700">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-slate-800">
                <p className="text-xs text-slate-600">Kaynak: SFDR Devredilmiş Yönetmelik (AB) 2022/1288 Ek I · Zorunlu göstergeler 30 Haziran SFDR Periyodik Raporu ile raporlanır</p>
              </div>
            </div>
          )}

          {/* Action Plan Tab */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                  <p className="text-sm font-bold text-white">Uyum Eylem Planı</p>
                  <p className="text-xs text-slate-500 mt-0.5">FCA SDR + EU SFDR kombinasyonlu öneri listesi</p>
                </div>
                <div className="divide-y divide-slate-800">
                  {result.fca_sdr.action_plan.map((item, i) => {
                    const s = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.INFO
                    return (
                      <div key={i} className="px-6 py-4 flex items-start gap-4">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0 mt-0.5"
                          style={{ background: s.bg, color: s.text }}>
                          {s.label}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-white">{item.action}</p>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0 font-mono">{item.deadline}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* UK Taxonomy Objectives */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-sm font-bold text-white mb-4">🇬🇧 UK Yeşil Taksonomi 6 Hedefi</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.pai_indicators && [
                    "İklim değişikliğinin hafifletilmesi",
                    "İklim değişikliğine uyum",
                    "Su ve deniz kaynaklarının sürdürülebilir kullanımı",
                    "Döngüsel ekonomiye geçiş",
                    "Kirliliğin önlenmesi ve kontrolü",
                    "Biyoçeşitlilik ve ekosistemlerin korunması",
                  ].map((obj, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-slate-800/40 rounded-xl px-4 py-3">
                      <span className="text-emerald-400 text-sm">🌿</span>
                      <span className="text-xs text-slate-300">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🇬🇧</div>
          <h3 className="text-lg font-bold text-white mb-2">FCA SDR + EU SFDR Hazırlık Değerlendirmesi</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            UK veya AB pazarında faaliyet gösteren şirketler için FCA Sustainability Disclosure
            Requirements (SDR) etiketi ve SFDR Madde 6/8/9 sınıflandırması.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={loadDemo}
              className="px-6 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 font-bold text-sm hover:border-emerald-400 transition-colors">
              📊 Demo Dene
            </button>
            <button onClick={runAssessment}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors">
              🔍 Değerlendirme Başlat
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-700 text-center">
        FCA SDR (PS22/3, effective Dec 2023) · EU SFDR Regulation 2019/2088 · SFDR RTS (EU) 2022/1288 · UK Green Taxonomy (GBS aligned)
      </p>
    </div>
  )
}
