'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { Building2, Factory, Bus, Trash2, Leaf, Sprout, Calculator, Award, ArrowUpRight } from 'lucide-react'
import { API_URL } from '@/lib/constants'

type SectorKey = 'stationary_energy' | 'transportation' | 'waste' | 'ippu' | 'afolu'

const SECTORS: { key: SectorKey; label: string; icon: React.ReactNode; basicPlus?: boolean }[] = [
  { key: 'stationary_energy', label: 'Sabit Enerji', icon: <Factory size={16} /> },
  { key: 'transportation', label: 'Ulaşım', icon: <Bus size={16} /> },
  { key: 'waste', label: 'Atık', icon: <Trash2 size={16} /> },
  { key: 'ippu', label: 'Endüstriyel Süreçler (IPPU)', icon: <Leaf size={16} />, basicPlus: true },
  { key: 'afolu', label: 'Tarım/Orman/Arazi (AFOLU)', icon: <Sprout size={16} />, basicPlus: true },
]

const GRADE_COLORS: Record<string, string> = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' }

type SectorResult = { sector: string; label: string; tco2e: number; share_pct: number }
type CalcResult = {
  reporting_level_label: string
  total_tco2e: number
  sectors: SectorResult[]
}

export default function BelediyePage() {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<'basic' | 'basic_plus'>('basic')
  const [values, setValues] = useState<Record<SectorKey, string>>({
    stationary_energy: '', transportation: '', waste: '', ippu: '', afolu: '',
  })
  const [result, setResult] = useState<CalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleSectors = SECTORS.filter(s => level === 'basic_plus' || !s.basicPlus)

  async function handleCalculate() {
    setLoading(true); setError(null)
    try {
      const sectors_tco2e: Record<string, number> = {}
      for (const s of visibleSectors) sectors_tco2e[s.key] = parseFloat(values[s.key]) || 0
      const res = await fetch(`${API_URL}/municipality/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipality_name: name || 'Belediye',
          reporting_level: level,
          sectors_tco2e,
        }),
      })
      if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`)
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hesaplama başarısız')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <Building2 className="text-emerald-600" size={32} />
            Belediye Sürdürülebilirlik Merkezi
          </h1>
          <p className="text-slate-500 max-w-2xl">
            GPC (Global Protocol for Community-Scale) kent ölçeği sera gazı envanteri ve
            akademik kaynaklı Belediye Sürdürülebilirlik Endeksi. Büyükşehir ve ilçe belediyeleri için.
          </p>
        </div>
        <Link href="/request-demo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
          Pilot Belediye Başvurusu <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GPC Envanteri Formu */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-1 flex items-center gap-2">
            <Calculator size={18} className="text-emerald-600" /> GPC Kent Sera Gazı Envanteri
          </h3>
          <p className="text-xs text-slate-500 mb-5">Kocaeli İklim Eylem Planı formatı — sektör bazında ton CO₂e girin.</p>

          <label className="block text-xs font-semibold text-slate-600 mb-1">Belediye Adı</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="ör. Kocaeli Büyükşehir Belediyesi"
            className="w-full mb-4 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-emerald-500" />

          {/* Kapsam seviyesi */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 gap-1 mb-4 bg-slate-50">
            {(['basic', 'basic_plus'] as const).map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${level === l ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>
                {l === 'basic' ? 'BASIC' : 'BASIC+'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleSectors.map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">{s.icon}</div>
                <label className="flex-1 text-sm text-slate-700">{s.label}</label>
                <input type="number" min="0" value={values[s.key]}
                  onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                  placeholder="ton CO₂e"
                  className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-right focus:outline-none focus:border-emerald-500" />
              </div>
            ))}
          </div>

          <button onClick={handleCalculate} disabled={loading}
            className="w-full mt-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50"
            style={{ background: 'var(--green-700, #1b5e20)' }}>
            {loading ? 'Hesaplanıyor…' : 'Envanteri Hesapla'}
          </button>
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        </div>

        {/* Sonuç */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 size={100} /></div>
          <h3 className="font-bold text-slate-300 mb-2 uppercase tracking-wider text-xs">Toplam Kent Emisyonu</h3>
          {result ? (
            <>
              <div className="text-4xl font-black mb-1">{fmt(result.total_tco2e)}
                <span className="text-lg text-emerald-400 font-bold ml-2">ton CO₂e</span></div>
              <p className="text-sm text-slate-400 mb-6">GPC {result.reporting_level_label} kapsamı · sektör kırılımı</p>
              <div className="space-y-3">
                {result.sectors.map(s => (
                  <div key={s.sector}>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{s.label}</span>
                      <span className="font-bold">{fmt(s.tco2e)} <span className="text-slate-500">(%{s.share_pct})</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, s.share_pct)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              Sektör verilerini girip <strong className="text-slate-300">Envanteri Hesapla</strong>&apos;ya basın.
            </div>
          )}
        </div>
      </div>

      {/* Belediye Endeksi tanıtımı */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Award size={24} /></div>
          <div className="flex-1">
            <h3 className="font-black text-slate-800 mb-1">Belediye Sürdürülebilirlik Endeksi</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-3xl">
              Akan &amp; Şendurur (2016) akademik metodolojisi — 30 büyükşehir belediyesinin faaliyet
              raporları içerik analiziyle puanlandı. Ekonomik, Sosyal ve Çevresel boyutlarda SDG-eşleşmeli
              30 kriter, her biri 0-4 ölçekte → A–D harf notu.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map(g => (
                <div key={g} className="rounded-xl border border-slate-200 p-3 text-center">
                  <div className="text-2xl font-black" style={{ color: GRADE_COLORS[g] }}>{g}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {g === 'A' ? 'Lider' : g === 'B' ? 'İyi' : g === 'C' ? 'Gelişmekte' : 'Yetersiz'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Metodoloji: GPC (WRI/C40/ICLEI) · CDP-ICLEI Unified Reporting · Global Covenant of Mayors.
        Kaynak belgeler dahili referans kütüphanesinde saklanır.
      </p>
    </div>
  )
}
