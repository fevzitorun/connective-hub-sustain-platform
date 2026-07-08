'use client'

import { useState } from 'react'
import Link from 'next/link'

// Banka tarafı görünümü — KOBİ müşterilerinin gönderdiği veriler
// Turkish Bank GAR/PCAF hesaplamasına beslenir

interface KobiEntry {
  id: string
  company: string
  tax_id: string
  sector: string
  submitted_at: string
  employees: number
  scope1: number
  scope2: number
  scope3_est: number
  total: number
  intensity: number
  esg_grade: 'A' | 'B' | 'C' | 'D'
  loan_m_tl: number
  nace: string
  taxonomy: 'green' | 'transition' | 'brown'
  status: 'verified' | 'pending' | 'flagged'
}

const DEMO_DATA: KobiEntry[] = [
  { id: 'k001', company: 'Yıldız Tekstil A.Ş.',     tax_id: '1234567890', sector: 'Tekstil',   submitted_at: '2026-06-28', employees: 145, scope1: 128.4, scope2: 73.8,  scope3_est: 365.2, total: 567.4,  intensity: 22.7, esg_grade: 'B', loan_m_tl: 8.5,  nace: 'C13', taxonomy: 'transition', status: 'verified' },
  { id: 'k002', company: 'Güneş Enerji Ltd.',        tax_id: '2345678901', sector: 'Enerji',    submitted_at: '2026-06-27', employees: 32,  scope1: 0.0,   scope2: 12.4,  scope3_est: 22.3,  total: 34.7,   intensity: 1.2,  esg_grade: 'A', loan_m_tl: 15.2, nace: 'D35', taxonomy: 'green',      status: 'verified' },
  { id: 'k003', company: 'Metro Lojistik San.',      tax_id: '3456789012', sector: 'Lojistik',  submitted_at: '2026-06-26', employees: 87,  scope1: 412.3, scope2: 28.1,  scope3_est: 792.7, total: 1233.1, intensity: 61.7, esg_grade: 'C', loan_m_tl: 6.2,  nace: 'H49', taxonomy: 'transition', status: 'pending'  },
  { id: 'k004', company: 'Anadolu Tarım Koop.',      tax_id: '4567890123', sector: 'Tarım',     submitted_at: '2026-06-25', employees: 210, scope1: 845.2, scope2: 134.7, scope3_est: 1764.2,total: 2744.1, intensity: 110.1,esg_grade: 'D', loan_m_tl: 4.8,  nace: 'A01', taxonomy: 'transition', status: 'flagged'  },
  { id: 'k005', company: 'SmartTech Yazılım A.Ş.',   tax_id: '5678901234', sector: 'Teknoloji', submitted_at: '2026-06-24', employees: 58,  scope1: 4.2,   scope2: 18.9,  scope3_est: 41.6,  total: 64.7,   intensity: 2.1,  esg_grade: 'A', loan_m_tl: 3.5,  nace: 'J62', taxonomy: 'green',      status: 'verified' },
  { id: 'k006', company: 'Özgün İnşaat Ltd. Şti.',   tax_id: '6789012345', sector: 'İnşaat',   submitted_at: '2026-06-23', employees: 130, scope1: 287.4, scope2: 96.3,  scope3_est: 688.0, total: 1071.7, intensity: 42.9, esg_grade: 'C', loan_m_tl: 12.0, nace: 'F41', taxonomy: 'green',      status: 'verified' },
  { id: 'k007', company: 'Gıda Pazarlama A.Ş.',      tax_id: '7890123456', sector: 'Gıda',     submitted_at: '2026-06-22', employees: 95,  scope1: 156.3, scope2: 89.4,  scope3_est: 441.1, total: 686.8,  intensity: 27.5, esg_grade: 'B', loan_m_tl: 9.0,  nace: 'C10', taxonomy: 'transition', status: 'pending'  },
]

const STATUS_CONFIG = {
  verified: { label: 'Doğrulandı', color: '#10b981', bg: '#065f46' },
  pending:  { label: 'Beklemede',  color: '#f59e0b', bg: '#78350f' },
  flagged:  { label: 'İnceleniyor',color: '#ef4444', bg: '#7f1d1d' },
}
const TAXONOMY_CONFIG = {
  green:      { label: '🟢 Yeşil',    color: '#10b981' },
  transition: { label: '🟡 Geçiş',   color: '#f59e0b' },
  brown:      { label: '🔴 Uyumsuz', color: '#ef4444' },
}
const GRADE_COLOR = { A: '#10b981', B: '#f59e0b', C: '#fb923c', D: '#ef4444' }

export default function KobiDashboardPage() {
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'flagged'>('all')
  const [selected, setSelected] = useState<KobiEntry | null>(null)

  const filtered = filter === 'all' ? DEMO_DATA : DEMO_DATA.filter(e => e.status === filter)

  const totalLoan       = DEMO_DATA.reduce((a, e) => a + e.loan_m_tl, 0)
  const totalEmissions  = DEMO_DATA.reduce((a, e) => a + e.total, 0)
  const greenLoan       = DEMO_DATA.filter(e => e.taxonomy === 'green').reduce((a, e) => a + e.loan_m_tl, 0)
  const garRatio        = (greenLoan / totalLoan * 100).toFixed(1)
  const pcafCat15       = DEMO_DATA.reduce((a, e) => a + e.total * (e.loan_m_tl / 100), 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">KOBİ Portföy İzleme</h1>
          <p className="text-slate-400 text-sm mt-1">
            Turkish Bank müşteri emisyon verileri · PCAF Kapsam 3 Kat. 15 · GAR katkısı
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/kobi" target="_blank"
            className="text-xs px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 hover:border-emerald-500 transition-colors font-bold">
            ↗ KOBİ Portalı Önizle
          </Link>
          <button className="text-xs px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors">
            ↓ BDDK Export
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam KOBİ Kredisi', value: `₺${totalLoan.toFixed(1)}M`, sub: `${DEMO_DATA.length} müşteri`, color: '#94a3b8' },
          { label: 'GAR Katkısı (KOBİ)', value: `%${garRatio}`, sub: 'Yeşil kredi payı', color: '#10b981' },
          { label: 'PCAF Cat. 15 (KOBİ)', value: `${(pcafCat15 / 1000).toFixed(1)}K tCO₂e`, sub: 'Finanse edilen emisyon', color: '#3b82f6' },
          { label: 'Veri Kalitesi', value: `${DEMO_DATA.filter(e => e.status === 'verified').length}/${DEMO_DATA.length}`, sub: 'Doğrulanmış giriş', color: '#8b5cf6' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">{k.label}</div>
            <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-slate-600 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { k: 'all', l: `Tümü (${DEMO_DATA.length})` },
          { k: 'verified', l: `✅ Doğrulandı (${DEMO_DATA.filter(e=>e.status==='verified').length})` },
          { k: 'pending',  l: `⏳ Beklemede (${DEMO_DATA.filter(e=>e.status==='pending').length})` },
          { k: 'flagged',  l: `⚠️ İnceleme (${DEMO_DATA.filter(e=>e.status==='flagged').length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k as typeof filter)}
            className="text-xs px-4 py-2 rounded-lg font-semibold transition-all border"
            style={{
              background: filter === t.k ? '#059669' : '#1e293b',
              color: filter === t.k ? '#fff' : '#94a3b8',
              borderColor: filter === t.k ? '#059669' : '#334155',
            }}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-800 bg-slate-800/50">
                <th className="px-4 py-3 text-left">Şirket</th>
                <th className="px-4 py-3 text-center">Not</th>
                <th className="px-4 py-3 text-right">Toplam CO₂</th>
                <th className="px-4 py-3 text-right">Kredi (₺M)</th>
                <th className="px-4 py-3 text-center">Taksonomi</th>
                <th className="px-4 py-3 text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const sc = STATUS_CONFIG[e.status]
                const tc = TAXONOMY_CONFIG[e.taxonomy]
                const isSelected = selected?.id === e.id
                return (
                  <tr key={e.id}
                    onClick={() => setSelected(isSelected ? null : e)}
                    className="border-b border-slate-800/60 transition-colors cursor-pointer hover:bg-white/[0.02]"
                    style={{ background: isSelected ? '#0f2a1e' : undefined }}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white text-sm">{e.company}</div>
                      <div className="text-xs text-slate-500">{e.sector} · {e.submitted_at}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-black text-base" style={{ color: GRADE_COLOR[e.esg_grade] }}>{e.esg_grade}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-blue-300">{e.total.toFixed(0)} tCO₂e</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">{e.loan_m_tl.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: tc.color }}>{tc.label}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: sc.bg + '80', color: sc.color }}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-800/50">
                <td colSpan={2} className="px-4 py-3 text-xs font-bold text-slate-500">TOPLAM</td>
                <td className="px-4 py-3 text-right font-black text-blue-300 text-xs">{totalEmissions.toFixed(0)} tCO₂e</td>
                <td className="px-4 py-3 text-right font-black text-white text-xs">{totalLoan.toFixed(1)}</td>
                <td colSpan={2} className="px-4 py-3 text-right text-xs text-emerald-400 font-bold">GAR: %{garRatio}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-64 flex-shrink-0 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="font-black text-white text-sm mb-0.5">{selected.company}</div>
              <div className="text-xs text-slate-500 mb-4">{selected.tax_id} · {selected.sector}</div>

              {[
                { l: 'Kapsam 1', v: selected.scope1, c: '#ef4444' },
                { l: 'Kapsam 2', v: selected.scope2, c: '#f59e0b' },
                { l: 'Kapsam 3 (est.)', v: selected.scope3_est, c: '#8b5cf6' },
              ].map(r => (
                <div key={r.l} className="flex justify-between py-1.5 border-b border-slate-800 text-xs">
                  <span className="text-slate-400">{r.l}</span>
                  <span className="font-bold" style={{ color: r.c }}>{r.v.toFixed(1)} tCO₂e</span>
                </div>
              ))}
              <div className="flex justify-between py-2 text-sm">
                <span className="font-black text-white">Toplam</span>
                <span className="font-black text-blue-300">{selected.total.toFixed(1)} tCO₂e</span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">ESG Notu</span><span className="font-black" style={{ color: GRADE_COLOR[selected.esg_grade] }}>{selected.esg_grade}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Kredi</span><span className="text-white font-bold">₺{selected.loan_m_tl}M</span></div>
                <div className="flex justify-between"><span className="text-slate-500">NACE</span><span className="text-white font-mono">{selected.nace}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Taksonomi</span><span style={{ color: TAXONOMY_CONFIG[selected.taxonomy].color }}>{TAXONOMY_CONFIG[selected.taxonomy].label}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-700 text-center">
        Veriler KOBİ Portalı aracılığıyla toplanmıştır. PCAF Standard v2 · BDDK Sürd. Bankacılık Rehberi 2023
      </p>
    </div>
  )
}
