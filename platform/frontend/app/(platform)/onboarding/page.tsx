'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Link from 'next/link'

type Step = 1 | 2 | 3 | 4

const SECTORS = [
  { value: 'Bankacılık & Finans',    icon: '🏦', segment: 'banking' },
  { value: 'İmalat & Üretim',        icon: '🏭', segment: 'manufacturing' },
  { value: 'Çimento & İnşaat',       icon: '🏗️', segment: 'construction' },
  { value: 'Enerji & Elektrik',      icon: '⚡', segment: 'energy' },
  { value: 'Perakende & Tüketim',    icon: '🛒', segment: 'retail' },
  { value: 'Rafine & Petrokimya',    icon: '🛢️', segment: 'energy' },
  { value: 'Gıda & Tarım',           icon: '🌾', segment: 'food' },
  { value: 'Tekstil & Hazır Giyim',  icon: '👔', segment: 'textile' },
  { value: 'Teknoloji & Yazılım',    icon: '💻', segment: 'tech' },
  { value: 'Diğer',                  icon: '🏢', segment: 'other' },
]

const STANDARDS = [
  { id: 'tsrs',  label: 'TSRS 1 & 2',         desc: 'Türkiye zorunlu (KGK 2024)', flag: '🇹🇷', badge: 'Zorunlu' },
  { id: 'gri',   label: 'GRI Universal',       desc: 'Küresel standart, en yaygın',  flag: '🌍', badge: null },
  { id: 'cbam',  label: 'CBAM Beyanı',         desc: 'AB Sınır Karbon, Oca 2026',   flag: '🇪🇺', badge: null },
  { id: 'csrd',  label: 'CSRD / ESRS',         desc: 'AB Kurumsal Sürdürülebilirlik',flag: '🇪🇺', badge: null },
  { id: 'issb',  label: 'ISSB S1+S2',          desc: 'Uluslararası yatırımcı odaklı',flag: '🌐', badge: null },
]

const STEP_META = [
  { n: 1, title: 'Şirket Profilinizi Tanımlayın', subtitle: 'AI modelimiz sektörünüze göre özelleştirilecek', time: '~1 dk' },
  { n: 2, title: 'Emisyon Verilerini Girin',        subtitle: 'Tahmin değerler de kullanabilirsiniz, sonradan düzeltilir', time: '~3 dk' },
  { n: 3, title: 'İlk Raporunuzu Oluşturun',        subtitle: 'Hangi standarda göre rapor oluşturmak istiyorsunuz?', time: '~1 dk' },
]

function ProgressBar({ step }: { step: Step }) {
  const pct = step === 4 ? 100 : Math.round(((step - 1) / 3) * 100)
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                s < step ? 'bg-green-700 text-white' :
                s === step ? 'bg-green-900 text-white ring-4 ring-green-100' :
                'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 transition-all ${s < step ? 'bg-green-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">{pct}% tamamlandı</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [sector, setSector] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [isExporter, setIsExporter] = useState(false)
  const [segment, setSegment] = useState('other')

  // Step 2
  const [scope1, setScope1] = useState('')
  const [scope2, setScope2] = useState('')
  const [scope3, setScope3] = useState('')
  const [electricityKwh, setElectricityKwh] = useState('')
  const [renewablePct, setRenewablePct] = useState('0')
  const [emissionId, setEmissionId] = useState<string | null>(null)

  // Step 3
  const [selectedStandard, setSelectedStandard] = useState('tsrs')
  const [reportId, setReportId] = useState<string | null>(null)

  function handleSectorSelect(s: typeof SECTORS[0]) {
    setSector(s.value)
    setSegment(s.segment)
  }

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
      setReportId((report as { id: string }).id)
      setStep(4)
    } catch {
      toast.error('Rapor başlatılamadı')
    } finally {
      setLoading(false)
    }
  }

  const meta = STEP_META[step - 1] || STEP_META[2]

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #f0f9ff 100%)' }}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl"
              style={{ background: '#15803d' }}>🌿</div>
            <span className="text-2xl font-black text-slate-900">SustainHub</span>
          </Link>
          <p className="text-sm text-slate-500">
            İlk sürdürülebilirlik raporunuzu 3 adımda oluşturun
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          <ProgressBar step={step} />

          {step < 4 && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{meta.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                  {meta.time}
                </span>
              </div>

              {/* STEP 1 — Sector grid */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Sektör *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SECTORS.map(s => (
                        <button key={s.value} type="button" onClick={() => handleSectorSelect(s)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                            sector === s.value
                              ? 'border-green-600 bg-green-50 text-green-900 font-semibold'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}>
                          <span className="text-base">{s.icon}</span>
                          <span className="text-xs leading-tight">{s.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Çalışan Sayısı</label>
                    <input type="number" value={employeeCount} onChange={e => setEmployeeCount(e.target.value)}
                      placeholder="örn. 250"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer py-2">
                    <input type="checkbox" checked={isExporter} onChange={e => setIsExporter(e.target.checked)}
                      className="w-4 h-4 rounded accent-green-700" />
                    <span className="text-sm text-slate-700">AB'ye mal ihraç ediyoruz (CBAM kapsamı)</span>
                  </label>
                </div>
              )}

              {/* STEP 2 — Emissions */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <strong>İpucu:</strong> Kesin değer bilmiyorsanız tahmini girebilirsiniz — sonradan düzeltilir. Veya{' '}
                    <Link href="/magic-import" className="font-bold underline">Magic Import</Link>
                    {' '}ile Excel/PDF yükleyin.
                  </div>
                  {[
                    { label: 'Kapsam 1 — Doğrudan Emisyon (tCO₂e) *', value: scope1, set: setScope1, ph: 'örn. 4.280' },
                    { label: 'Kapsam 2 — Elektrik Emisyonu (tCO₂e) *', value: scope2, set: setScope2, ph: 'örn. 12.640' },
                    { label: 'Kapsam 3 — Değer Zinciri (tCO₂e)', value: scope3, set: setScope3, ph: 'örn. 183.500 (isteğe bağlı)' },
                    { label: 'Elektrik Tüketimi (kWh/yıl)', value: electricityKwh, set: setElectricityKwh, ph: 'örn. 2.500.000' },
                  ].map(({ label, value, set, ph }) => (
                    <div key={label}>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
                      <input type="number" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                      Yenilenebilir Enerji Oranı — <span className="text-green-700">%{renewablePct}</span>
                    </label>
                    <input type="range" min="0" max="100" value={renewablePct}
                      onChange={e => setRenewablePct(e.target.value)} className="w-full accent-green-700" />
                    <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                      <span>%0</span><span>%50</span><span>%100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 — Standard */}
              {step === 3 && (
                <div className="space-y-2.5">
                  {STANDARDS.map(std => (
                    <label key={std.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedStandard === std.id
                          ? 'border-green-600 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      <input type="radio" name="standard" value={std.id} checked={selectedStandard === std.id}
                        onChange={() => setSelectedStandard(std.id)} className="accent-green-700" />
                      <span className="text-xl">{std.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{std.label}</p>
                          {std.badge && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">{std.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{std.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <button onClick={() => setStep(s => (s - 1) as Step)} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
                    ← Geri
                  </button>
                ) : (
                  <button onClick={() => router.push('/dashboard')} className="text-sm text-slate-400 hover:text-slate-600">
                    Atla, sonra yaparım
                  </button>
                )}
                <button
                  onClick={step === 1 ? handleStep1 : step === 2 ? handleStep2 : handleStep3}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg"
                  style={{ background: loading ? '#6b7280' : '#15803d', boxShadow: loading ? 'none' : '0 4px 14px rgba(21,128,61,0.3)' }}>
                  {loading ? (
                    <><span className="animate-spin">⏳</span> Kaydediliyor…</>
                  ) : step === 3 ? (
                    <>🤖 Raporu Oluştur</>
                  ) : (
                    <>Devam Et →</>
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 4 — Success */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="text-7xl animate-bounce">🎉</div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Raporunuz Oluşturuluyor!</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  {STANDARDS.find(s => s.id === selectedStandard)?.label} standardına göre
                  AI raporunuz hazırlanıyor. Tam TSRS raporu için tipik olarak 3-5 dakika sürer.
                </p>
              </div>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {reportId && (
                  <Link href={`/ai-rapor?id=${reportId}`}
                    className="w-full block text-center py-3.5 rounded-xl font-black text-white bg-green-700 hover:bg-green-600 transition-all shadow-lg">
                    Raporu Görüntüle →
                  </Link>
                )}
                <Link href="/dashboard"
                  className="w-full block text-center py-3 rounded-xl font-bold text-slate-700 border border-slate-200 hover:border-slate-300 transition-all">
                  Dashboard'a Git
                </Link>
                <Link href="/magic-import"
                  className="w-full block text-center py-2.5 rounded-xl text-sm font-medium text-emerald-700 hover:text-emerald-600 transition-all">
                  + Daha fazla veri yükle (Magic Import)
                </Link>
              </div>
              <div className="pt-4 grid grid-cols-3 gap-3">
                {[
                  { href: '/tsrs', label: 'TSRS Hazırlık', icon: '🇹🇷' },
                  { href: '/gar', label: 'Bank GAR', icon: '🏦' },
                  { href: '/esg-benchmark', label: 'ESG Kıyaslama', icon: '📊' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 hover:border-slate-300 text-xs text-slate-600 font-medium transition-all">
                    <span className="text-2xl">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          {step < 4 && (
            <button onClick={() => router.push('/dashboard')} className="hover:text-slate-600 underline">
              Atla, dashboard'dan başlayayım
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
