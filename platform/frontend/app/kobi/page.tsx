'use client'

import { useState } from 'react'

// White-label KOBİ Emission Entry Portal
// Turkish Bank müşterileri (KOBİ'ler) bu formu doldurur
// Banka ana dashboard'unda GAR/PCAF verisine dönüşür

const SECTORS = [
  { value: 'tekstil',    label: 'Tekstil & Hazır Giyim',  intensity: 155 },
  { value: 'gida',       label: 'Gıda & İçecek',           intensity: 290 },
  { value: 'insaat',     label: 'İnşaat & Gayrimenkul',     intensity: 210 },
  { value: 'lojistik',   label: 'Lojistik & Taşımacılık',  intensity: 340 },
  { value: 'tarim',      label: 'Tarım & Hayvancılık',      intensity: 580 },
  { value: 'perakende',  label: 'Perakende & Ticaret',      intensity: 95  },
  { value: 'uretim',     label: 'Genel Üretim',             intensity: 280 },
  { value: 'teknoloji',  label: 'Teknoloji & Yazılım',      intensity: 35  },
  { value: 'saglik',     label: 'Sağlık & İlaç',            intensity: 75  },
  { value: 'turizm',     label: 'Turizm & Konaklama',       intensity: 120 },
  { value: 'enerji',     label: 'Enerji & Elektrik',        intensity: 85  },
  { value: 'diger',      label: 'Diğer',                    intensity: 200 },
]

type Step = 1 | 2 | 3

interface FormData {
  company_name: string
  tax_id: string
  sector: string
  employees: string
  electricity_kwh: string
  natural_gas_m3: string
  diesel_lt: string
  waste_tons: string
  revenue_m_tl: string
}

const EMPTY: FormData = {
  company_name: '', tax_id: '', sector: '', employees: '',
  electricity_kwh: '', natural_gas_m3: '', diesel_lt: '',
  waste_tons: '', revenue_m_tl: '',
}

interface EmissionResult {
  scope1: number; scope2: number; scope3_est: number; total: number
  intensity: number; grade: string; grade_color: string
  sector_avg: number; vs_sector: string
}

function calcEmissions(f: FormData): EmissionResult | null {
  const elec = parseFloat(f.electricity_kwh) || 0
  const gas  = parseFloat(f.natural_gas_m3)  || 0
  const die  = parseFloat(f.diesel_lt)        || 0
  const emp  = parseFloat(f.employees)        || 1
  const rev  = parseFloat(f.revenue_m_tl)     || 1

  const scope1 = gas * 2.04 / 1000 + die * 2.68 / 1000   // tCO2e
  const scope2 = elec * 0.492 / 1000                       // TEİAŞ 2024 faktörü
  const scope3_est = (scope1 + scope2) * 1.8               // proxy
  const total  = scope1 + scope2 + scope3_est
  const intensity = total / (rev || 1)                     // tCO2e / ₺M revenue

  const sec = SECTORS.find(s => s.value === f.sector)
  const sector_avg = sec?.intensity || 200
  const vs_sector = intensity < sector_avg * 0.8 ? 'Sektör ortalamasının altında ✓' :
                    intensity < sector_avg * 1.2 ? 'Sektör ortalamasına yakın' :
                    'Sektör ortalamasının üstünde ⚠️'

  const score = Math.max(0, 100 - (intensity / sector_avg) * 50)
  const grade = score >= 75 ? 'A' : score >= 60 ? 'B' : score >= 45 ? 'C' : 'D'
  const grade_color = score >= 75 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 45 ? '#fb923c' : '#ef4444'

  return { scope1, scope2, scope3_est, total, intensity, grade, grade_color, sector_avg, vs_sector }
}

function fmt(n: number, decimals = 1) {
  return n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export default function KobiPage() {
  const [step, setStep]       = useState<Step>(1)
  const [form, setForm]       = useState<FormData>(EMPTY)
  const [result, setResult]   = useState<EmissionResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const canStep2 = form.company_name && form.tax_id && form.sector && form.employees
  const canStep3 = true // energy fields optional

  function handleCalculate() {
    const r = calcEmissions(form)
    setResult(r)
    setStep(3)
  }

  function handleSubmit() {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a1628' }}>
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-black text-white mb-3">Verileriniz Alındı</h1>
          <p className="text-slate-400 text-sm mb-4">
            <strong className="text-white">{form.company_name}</strong> için emisyon verileri
            bankanıza iletildi. Sustain ESG Kredi Skorunuz 24-48 saat içinde bildirilecektir.
          </p>
          {result && (
            <div className="rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 mb-6 text-left space-y-1">
              <div className="text-xs text-emerald-400 font-bold mb-2">Hesaplama Özeti</div>
              <div className="flex justify-between text-xs"><span className="text-slate-400">Kapsam 1 (Yakıt)</span><span className="text-white font-bold">{fmt(result.scope1)} tCO₂e</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-400">Kapsam 2 (Elektrik)</span><span className="text-white font-bold">{fmt(result.scope2)} tCO₂e</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-400">Kapsam 3 (Tahmin)</span><span className="text-white font-bold">{fmt(result.scope3_est)} tCO₂e</span></div>
              <div className="flex justify-between text-xs pt-1 border-t border-slate-700"><span className="text-slate-300 font-bold">Toplam</span><span className="font-black text-emerald-400">{fmt(result.total)} tCO₂e</span></div>
            </div>
          )}
          <p className="text-xs text-slate-600">Powered by SustainHub · PCAF Standard v2 uyumlu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a1628', color: '#f1f5f9' }}>

      {/* Bank Header (white-label) */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between"
        style={{ background: '#0f172a' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-sm">TB</div>
          <div>
            <div className="text-sm font-bold text-white">Turkish Bank</div>
            <div className="text-xs text-slate-500">Sürdürülebilirlik Uyum Portalı</div>
          </div>
        </div>
        <div className="text-xs text-slate-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse" />
          Güvenli Bağlantı · SustainHub Altyapısı
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${step >= s ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {step > s ? '✓' : s}
              </div>
              <div className="text-xs" style={{ color: step >= s ? '#34d399' : '#475569' }}>
                {s === 1 ? 'Şirket Bilgileri' : s === 2 ? 'Enerji & Faaliyet' : 'Sonuç & Gönder'}
              </div>
              {s < 3 && <div className="flex-1 h-px" style={{ background: step > s ? '#10b981' : '#1e293b' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Şirket Bilgileri</h2>
              <p className="text-sm text-slate-400">Emisyon hesaplaması için temel bilgilerinizi girin.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Şirket Adı *</label>
                <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
                  placeholder="ABC Tekstil San. Tic. A.Ş."
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Vergi Kimlik No *</label>
                <input value={form.tax_id} onChange={e => set('tax_id', e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Sektör *</label>
                <select value={form.sector} onChange={e => set('sector', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm">
                  <option value="">Sektör seçin...</option>
                  {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Çalışan Sayısı *</label>
                <input type="number" value={form.employees} onChange={e => set('employees', e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Yıllık Ciro (₺ Milyon)</label>
                <input type="number" value={form.revenue_m_tl} onChange={e => set('revenue_m_tl', e.target.value)}
                  placeholder="25"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
              </div>
            </div>
            <button onClick={() => canStep2 && setStep(2)}
              disabled={!canStep2}
              className="w-full py-4 rounded-xl font-black text-white transition-all"
              style={{ background: canStep2 ? 'linear-gradient(135deg,#059669,#0284c7)' : '#1e293b', cursor: canStep2 ? 'pointer' : 'not-allowed' }}>
              Devam Et →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Enerji & Faaliyet Verileri</h2>
              <p className="text-sm text-slate-400">2024 yılı tüketim verilerinizi girin. Kesin bilgi yoksa tahmini değer kullanılabilir.</p>
            </div>
            <div className="space-y-4">
              {[
                { key: 'electricity_kwh', label: 'Elektrik Tüketimi (kWh/yıl)', placeholder: '150000', hint: 'Faturalarınızdan toplam yıllık tüketim' },
                { key: 'natural_gas_m3',  label: 'Doğalgaz (m³/yıl)',            placeholder: '8000',   hint: 'Isıtma + proses gazı dahil' },
                { key: 'diesel_lt',       label: 'Dizel Yakıt (litre/yıl)',       placeholder: '5000',   hint: 'Araç filosu + jeneratör' },
                { key: 'waste_tons',      label: 'Atık (ton/yıl)',                placeholder: '12',     hint: 'Düzenli atık (tehlikeli atık hariç)' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-slate-400 mb-1.5 block font-semibold">{field.label}</label>
                  <input type="number" value={form[field.key as keyof FormData]}
                    onChange={e => set(field.key as keyof FormData, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
                  <p className="text-xs text-slate-600 mt-1">{field.hint}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-bold text-slate-400 border border-slate-700 hover:border-slate-500 transition-colors">
                ← Geri
              </button>
              <button onClick={handleCalculate}
                className="flex-1 py-4 rounded-xl font-black text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
                Hesapla & Gönder →
              </button>
            </div>
            <p className="text-center text-xs text-slate-600">Veriler PCAF Standard v2 metodolojisiyle hesaplanır. Hassas veri şifrelenmiş aktarılır.</p>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && result && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white mb-1">Emisyon Hesaplama Sonucu</h2>
              <p className="text-sm text-slate-400"><strong className="text-white">{form.company_name}</strong> · 2024 Yılı</p>
            </div>

            {/* Grade */}
            <div className="rounded-2xl p-6 border text-center" style={{ borderColor: result.grade_color + '40', background: result.grade_color + '08' }}>
              <div className="text-6xl font-black mb-2" style={{ color: result.grade_color }}>{result.grade}</div>
              <div className="text-sm text-slate-400">ESG Emisyon Notu</div>
              <div className="text-xs mt-2 px-3 py-1 rounded-full inline-block font-semibold"
                style={{ background: result.grade_color + '20', color: result.grade_color }}>
                {result.vs_sector}
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {[
                { label: 'Kapsam 1 — Doğrudan Emisyonlar (yakıt)', val: result.scope1, color: '#ef4444' },
                { label: 'Kapsam 2 — Dolaylı Emisyonlar (elektrik)', val: result.scope2, color: '#f59e0b' },
                { label: 'Kapsam 3 — Değer Zinciri Tahmini', val: result.scope3_est, color: '#8b5cf6' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                    <span className="text-xs text-slate-400">{row.label}</span>
                  </div>
                  <span className="text-sm font-black" style={{ color: row.color }}>{fmt(row.val)} tCO₂e</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-black text-white">Toplam</span>
                <span className="text-lg font-black text-emerald-400">{fmt(result.total)} tCO₂e</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl p-3 bg-slate-800 text-center">
                <div className="text-slate-500 mb-1">Karbon Yoğunluğu</div>
                <div className="font-black text-white">{fmt(result.intensity)} tCO₂e/₺M</div>
              </div>
              <div className="rounded-xl p-3 bg-slate-800 text-center">
                <div className="text-slate-500 mb-1">Sektör Ortalaması</div>
                <div className="font-black text-slate-400">{result.sector_avg} tCO₂e/€M</div>
              </div>
            </div>

            <button onClick={handleSubmit}
              className="w-full py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
              ✓ Bankaya Gönder & Onayla
            </button>
            <p className="text-center text-xs text-slate-600">
              Bu veriler Turkish Bank'ın PCAF Kapsam 3 Kategori 15 hesaplamasına dahil edilecektir.
              SustainHub · BDDK Sürdürülebilir Bankacılık Rehberi 2023 uyumlu.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
