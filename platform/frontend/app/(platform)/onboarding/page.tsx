'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Step = 1 | 2 | 3

const SECTORS = [
  'Bankacılık & Finans', 'İmalat & Üretim', 'Çimento & İnşaat',
  'Enerji & Elektrik', 'Perakende & Tüketim', 'Sigorta',
  'Rafine & Petrokimya', 'Gıda & Tarım', 'Teknoloji & Yazılım', 'Diğer',
]

const STANDARDS = [
  { id: 'tsrs', label: 'TSRS 1 & 2', desc: 'Türkiye zorunlu (KGK, 2024)', flag: '🇹🇷' },
  { id: 'cbam', label: 'CBAM Beyanı', desc: 'AB Sınır Karbon, Jan 2026', flag: '🇪🇺' },
  { id: 'eudr', label: 'EUDR Durum Tespiti', desc: 'AB ormansızlaşma, Ara 2026', flag: '🇪🇺' },
  { id: 'csrd', label: 'CSRD / ESRS', desc: 'AB Kurumsal Sürdürülebilirlik', flag: '🇪🇺' },
  { id: 'gri', label: 'GRI Universal', desc: 'Küresel standart', flag: '🌍' },
]

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map(s => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={
              s < current
                ? { background: 'var(--green-700)', color: 'white' }
                : s === current
                ? { background: 'var(--green-900)', color: 'white', boxShadow: '0 0 0 4px var(--green-100)' }
                : { background: 'var(--green-50)', color: 'var(--muted-foreground)', border: '2px solid var(--border)' }
            }
          >
            {s < current ? '✓' : s}
          </div>
          {s < total && (
            <div className="h-0.5 w-12" style={{ background: s < current ? 'var(--green-700)' : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // Adım 1: Şirket bilgileri
  const [sector, setSector] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [isExporter, setIsExporter] = useState(false)

  // Adım 2: İlk emisyon verisi
  const [scope1, setScope1] = useState('')
  const [scope2, setScope2] = useState('')
  const [scope3, setScope3] = useState('')
  const [electricityKwh, setElectricityKwh] = useState('')
  const [renewablePct, setRenewablePct] = useState('0')
  const [emissionId, setEmissionId] = useState<string | null>(null)

  // Adım 3: Standart seçimi
  const [selectedStandard, setSelectedStandard] = useState('tsrs')

  const stepLabels = ['Şirket Profili', 'Emisyon Verisi', 'İlk Raporun']

  async function handleStep1() {
    if (!sector) { toast.error('Sektör seçin'); return }
    try {
      setLoading(true)
      const me = await api.auth.me()
      await api.companies.update(me.company_id, {
        sector,
        employee_count: employeeCount ? parseInt(employeeCount) : undefined,
      })
      setStep(2)
    } catch {
      toast.error('Şirket bilgileri kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleStep2() {
    if (!scope1 || !scope2) { toast.error('En az Kapsam 1 ve 2 girin'); return }
    try {
      setLoading(true)
      const saved = await api.emissions.save({
        scope1_direct: parseFloat(scope1),
        scope2_location: parseFloat(scope2),
        scope3_total: scope3 ? parseFloat(scope3) : 0,
        electricity_kwh: electricityKwh ? parseFloat(electricityKwh) : 0,
        renewable_energy_pct: parseFloat(renewablePct),
        reporting_year: new Date().getFullYear() - 1,
      })
      setEmissionId((saved as { id: string }).id)
      setStep(3)
    } catch {
      toast.error('Emisyon verisi kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleStep3() {
    if (!emissionId) { toast.error('Emisyon verisi bulunamadı'); return }
    try {
      setLoading(true)
      const report = await api.reports.generate({
        emission_id: emissionId,
        standard: selectedStandard,
        language: 'tr',
      })
      toast.success('Raporunuz oluşturuluyor!')
      router.push(`/ai-rapor?id=${(report as { id: string }).id}`)
    } catch {
      toast.error('Rapor başlatılamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, var(--green-50) 0%, white 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-black"
              style={{ background: 'var(--green-700)' }}>S</div>
            <span className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>SustainHub</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            3 adımda ilk sürdürülebilirlik raporunuzu oluşturun
          </p>
        </div>

        <div className="bg-white rounded-2xl border p-8" style={{ borderColor: 'var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <StepIndicator current={step} total={3} />

          <h2 className="text-lg font-black mb-1" style={{ color: 'var(--green-900)' }}>
            {step === 1 && 'Şirket Profilinizi Tanımlayın'}
            {step === 2 && 'Emisyon Verilerinizi Girin'}
            {step === 3 && 'İlk Raporunuzu Oluşturun'}
          </h2>
          <p className="text-xs mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {step === 1 && 'AI modelimiz sektörünüze göre özelleştirilmiş rapor oluşturur'}
            {step === 2 && 'Ton CO₂e cinsinden yıllık emisyon verilerinizi girin'}
            {step === 3 && 'Hangi standarda göre rapor oluşturmak istiyorsunuz?'}
          </p>

          {/* ADIM 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--green-900)' }}>
                  Sektör *
                </label>
                <select
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm"
                  style={{ borderColor: 'var(--border)' }}>
                  <option value="">Sektör seçin…</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--green-900)' }}>
                  Çalışan Sayısı
                </label>
                <input
                  type="number"
                  value={employeeCount}
                  onChange={e => setEmployeeCount(e.target.value)}
                  placeholder="örn. 250"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm"
                  style={{ borderColor: 'var(--border)' }} />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={isExporter} onChange={e => setIsExporter(e.target.checked)}
                  className="rounded" />
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                  AB'ye mal ihraç ediyoruz (CBAM kapsamı)
                </span>
              </label>
            </div>
          )}

          {/* ADIM 2 */}
          {step === 2 && (
            <div className="space-y-4">
              {[
                { label: 'Kapsam 1 — Doğrudan Emisyon *', value: scope1, set: setScope1, ph: 'örn. 4280' },
                { label: 'Kapsam 2 — Elektrik *', value: scope2, set: setScope2, ph: 'örn. 12640' },
                { label: 'Kapsam 3 — Değer Zinciri', value: scope3, set: setScope3, ph: 'örn. 183500' },
                { label: 'Elektrik Tüketimi (kWh)', value: electricityKwh, set: setElectricityKwh, ph: 'örn. 2500000' },
              ].map(({ label, value, set, ph }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--green-900)' }}>
                    {label}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={ph}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border)' }} />
                  {label.includes('Kapsam') && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>ton CO₂e</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--green-900)' }}>
                  Yenilenebilir Enerji Oranı (%)
                </label>
                <input
                  type="range" min="0" max="100" value={renewablePct}
                  onChange={e => setRenewablePct(e.target.value)}
                  className="w-full" />
                <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--green-700)' }}>%{renewablePct}</p>
              </div>
            </div>
          )}

          {/* ADIM 3 */}
          {step === 3 && (
            <div className="space-y-3">
              {STANDARDS.map(std => (
                <label
                  key={std.id}
                  className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                  style={{
                    borderColor: selectedStandard === std.id ? 'var(--green-700)' : 'var(--border)',
                    background: selectedStandard === std.id ? 'var(--green-50)' : 'white',
                  }}>
                  <input
                    type="radio"
                    name="standard"
                    value={std.id}
                    checked={selectedStandard === std.id}
                    onChange={() => setSelectedStandard(std.id)}
                    className="accent-green-700" />
                  <span className="text-xl">{std.flag}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>{std.label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{std.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(s => (s - 1) as Step)}
                className="text-sm font-medium"
                style={{ color: 'var(--muted-foreground)' }}>
                ← Geri
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-medium"
                style={{ color: 'var(--muted-foreground)' }}>
                Atla
              </button>
            )}

            <button
              onClick={step === 1 ? handleStep1 : step === 2 ? handleStep2 : handleStep3}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--green-700)' }}>
              {loading ? 'Kaydediliyor…' : step === 3 ? '🤖 Raporu Oluştur' : `${stepLabels[step]} →`}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
          İstediğiniz zaman <button onClick={() => router.push('/dashboard')} className="underline">dashboard'a dönebilirsiniz</button>
        </p>
      </div>
    </div>
  )
}
