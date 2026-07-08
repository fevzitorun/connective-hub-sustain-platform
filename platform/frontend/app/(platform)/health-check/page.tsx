'use client'
import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

const SECTORS = [
  { value: 'manufacturing', label: '🏭 Üretim / İmalat' },
  { value: 'banking',       label: '🏦 Bankacılık / Finans' },
  { value: 'retail',        label: '🛒 Perakende / FMCG' },
  { value: 'energy',        label: '⚡ Enerji / Yenilenebilir' },
  { value: 'construction',  label: '🏗️ İnşaat / GYO' },
  { value: 'logistics',     label: '🚛 Lojistik / Taşımacılık' },
  { value: 'textile',       label: '👕 Tekstil / Hazır Giyim' },
  { value: 'food',          label: '🌾 Gıda / Tarım' },
  { value: 'tech',          label: '💻 Teknoloji / Yazılım' },
  { value: 'other',         label: '🏢 Diğer / Hizmet' },
]

type Result = {
  score: number; grade: string; grade_color: string; grade_bg: string
  percentile: number; total_tco2e: number; intensity_per_employee: number
  sector_avg_intensity: number; sector_label: string; vs_sector: string
  quick_wins: string[]; cta: string
}

const GRADE_RING: Record<string, string> = {
  'A+': '#16a34a', 'A': '#22c55e', 'B+': '#eab308',
  'B': '#f59e0b', 'C+': '#ef4444', 'C': '#dc2626',
}

export default function HealthCheckPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [sector, setSector] = useState('')
  const [employees, setEmployees] = useState('')
  const [electricity, setElectricity] = useState('')
  const [gas, setGas] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  async function runEstimate() {
    if (!sector || !employees) return
    setLoading(true)
    try {
      const res = await api.healthCheck.estimate({
        sector,
        employee_count: parseInt(employees),
        electricity_kwh: electricity ? parseFloat(electricity) : undefined,
        natural_gas_m3: gas ? parseFloat(gas) : undefined,
      })
      setResult(res as Result)
      setStep(3)
    } catch {
      // fallback: göster ama hata verme
    } finally {
      setLoading(false)
    }
  }

  const ringColor = result ? (GRADE_RING[result.grade] ?? '#64748b') : '#64748b'

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">ESG Sağlık Kontrolü</h1>
        <p className="text-sm text-slate-500 mt-1">
          3 adımda şirketinizin sürdürülebilirlik puanını öğrenin · Ücretsiz · 60 saniye
        </p>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: step >= s ? '#059669' : '#e2e8f0',
                  color: step >= s ? '#fff' : '#94a3b8',
                }}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className="w-12 h-0.5 rounded"
                style={{ background: step > s ? '#059669' : '#e2e8f0' }} />}
            </div>
          ))}
          <span className="ml-2 text-xs text-slate-400">
            {step === 1 ? 'Sektör & Boyut' : step === 2 ? 'Enerji Verisi' : 'Sonuç'}
          </span>
        </div>
      </div>

      {/* ─── Step 1 ──────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Sektör Seçin
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map(s => (
                <button key={s.value} onClick={() => setSector(s.value)}
                  className="px-4 py-3 rounded-xl text-sm text-left font-medium border-2 transition-all"
                  style={{
                    borderColor: sector === s.value ? '#059669' : '#e2e8f0',
                    background: sector === s.value ? '#f0fdf4' : '#fff',
                    color: sector === s.value ? '#065f46' : '#374151',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Çalışan Sayısı
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['10', '50', '250', '1000', '5000', '10000', '25000', '50000'].map(n => (
                <button key={n} onClick={() => setEmployees(n)}
                  className="py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                  style={{
                    borderColor: employees === n ? '#059669' : '#e2e8f0',
                    background: employees === n ? '#f0fdf4' : '#fff',
                    color: employees === n ? '#065f46' : '#374151',
                  }}>
                  {parseInt(n) >= 1000 ? `${parseInt(n)/1000}K` : n}
                </button>
              ))}
            </div>
            <input type="number" placeholder="veya tam sayı girin…"
              value={!['10','50','250','1000','5000','10000','25000','50000'].includes(employees) ? employees : ''}
              onChange={e => setEmployees(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
          </div>

          <button onClick={() => setStep(2)} disabled={!sector || !employees}
            className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40 transition-all"
            style={{ background: '#059669' }}>
            Devam →
          </button>
        </div>
      )}

      {/* ─── Step 2 ──────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="p-3 rounded-xl text-xs" style={{ background: '#f0fdf4', color: '#065f46' }}>
            💡 Enerji verisi girilmezse sektör ortalamalarıyla tahmin yapılır. İstediğiniz kadar detaylı girebilirsiniz.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Yıllık Elektrik Tüketimi (kWh)
            </label>
            <input type="number" placeholder="örn. 2500000 kWh/yıl"
              value={electricity} onChange={e => setElectricity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <p className="text-xs text-slate-400 mt-1">Faturanızdan veya enerji izleme sisteminizden alabilirsiniz</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Yıllık Doğalgaz Tüketimi (m³)
            </label>
            <input type="number" placeholder="örn. 180000 m³/yıl"
              value={gas} onChange={e => setGas(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
          </div>

          <div className="text-xs text-slate-400 p-3 border border-slate-100 rounded-xl">
            <strong>Hesaplama yöntemi:</strong> Kapsam 1 (Doğalgaz: 2.04 kg CO₂e/m³) +
            Kapsam 2 (Elektrik: 0.42 kg CO₂e/kWh · TEİAŞ 2024 grid faktörü)
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl font-bold text-slate-600 text-sm border border-slate-200">
              ← Geri
            </button>
            <button onClick={runEstimate} disabled={loading || !employees || !sector}
              className="flex-[2] py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
              style={{ background: '#059669' }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Hesaplanıyor…
                  </span>
                : '🔬 ESG Skoru Hesapla'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3 — Result ─────────────────────────────────────── */}
      {step === 3 && result && (
        <div className="space-y-5">

          {/* Main score card */}
          <div className="rounded-2xl border-2 bg-white p-6"
            style={{ borderColor: ringColor }}>
            <div className="flex items-center gap-6">
              {/* Score ring */}
              <div className="relative flex-shrink-0 w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={ringColor} strokeWidth="3"
                    strokeDasharray={`${result.score} 100`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: ringColor }}>{result.score}</span>
                  <span className="text-xs font-bold" style={{ color: ringColor }}>/100</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-black" style={{ color: ringColor }}>{result.grade}</span>
                  <span className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ background: result.grade_bg, color: result.grade_color }}>
                    Sektörün %{result.percentile}'inden iyi
                  </span>
                </div>
                <p className="text-sm text-slate-600">{result.vs_sector}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Sektör: <strong>{result.sector_label}</strong> ·
                  Tahmini emisyon: <strong>{result.total_tco2e.toFixed(0)} tCO₂e/yıl</strong>
                </p>
              </div>
            </div>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🏭', label: 'Toplam Emisyon', value: `${result.total_tco2e.toFixed(0)} tCO₂e` },
              { icon: '👤', label: 'Çalışan Başı', value: `${(result.intensity_per_employee * 1000).toFixed(0)} kg` },
              { icon: '📊', label: 'Sektör Ort.', value: `${(result.sector_avg_intensity * 1000).toFixed(0)} kg` },
            ].map(k => (
              <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <div className="text-2xl mb-1">{k.icon}</div>
                <div className="font-black text-base text-slate-800">{k.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Quick wins */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-700 text-sm mb-3">⚡ Hızlı Kazanımlar</h3>
            <ul className="space-y-2">
              {result.quick_wins.map(w => (
                <li key={w} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4"
            style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: '#065f46' }}>Tam Rapor İçin</p>
              <p className="text-xs text-slate-600 mt-0.5">{result.cta}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link href="/ai-rapor"
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white text-center"
                style={{ background: '#059669' }}>
                🤖 AI Rapor Yaz
              </Link>
              <Link href="/tcfd"
                className="px-5 py-2.5 rounded-xl text-sm font-bold border border-emerald-300 text-emerald-700 text-center">
                🌡️ TCFD Analizi
              </Link>
            </div>
          </div>

          <button onClick={() => { setStep(1); setResult(null); setSector(''); setEmployees('') }}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-500 border border-slate-200">
            ← Yeniden Başla
          </button>
        </div>
      )}
    </div>
  )
}
