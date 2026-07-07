'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────
interface NHSPPNResult {
  company_name: string
  compliant: boolean
  overall_score: number
  baseline_year: number
  reporting_year: number
  net_zero_target_year: number
  emissions: {
    scope1: { baseline: number; current: number }
    scope2: { baseline: number; current: number }
    scope3_upstream: { baseline: number; current: number }
    scope3_waste: { baseline: number; current: number }
    scope3_travel: { baseline: number; current: number }
    scope3_commute: { baseline: number; current: number }
    scope3_downstream: { baseline: number; current: number }
    total: { baseline: number; current: number }
  }
  projections: { year: number; co2e: number; label: string }[]
  gaps: string[]
  warnings: string[]
}

const REDUCTION_INITIATIVES = [
  "Upgrade facilities to 100% energy-efficient LED lighting systems.",
  "Implement a hybrid/remote work policy to reduce employee commute emissions by 30%.",
  "Procure 100% renewable electricity through UK green tariffs (REGO backed).",
  "Transition 60% of company vehicle fleet to fully electric vehicles (EV).",
  "Install on-site solar photovoltaic (PV) arrays on warehouse rooftops.",
  "Optimize upstream supply chain logistics to reduce freight transport emissions.",
  "Implement zero-waste-to-landfill policy and upgrade recycling infrastructure."
]

export default function NHSPPNPage() {
  const [tab, setTab] = useState<'assess' | 'actions' | 'preview'>('assess')
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<NHSPPNResult | null>(null)
  const [selectedActions, setSelectedActions] = useState<string[]>([
    REDUCTION_INITIATIVES[0],
    REDUCTION_INITIATIVES[1],
    REDUCTION_INITIATIVES[2]
  ])
  const [crpHtml, setCrpHtml] = useState<string>('')
  const [generating, setGenerating] = useState(false)

  const fetchAssessment = () => {
    setLoading(true)
    const companyId = localStorage.getItem('company_id')
    if (!companyId) {
      toast.error('Şirket kimliği bulunamadı.')
      setLoading(false)
      return
    }

    api.nhs.assess(companyId)
      .then((res: any) => {
        setResult(res.result)
      })
      .catch(() => {
        toast.error('NHS PPN 06/21 analizi yüklenemedi.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAssessment()
  }, [])

  const generateCRP = () => {
    setGenerating(true)
    const companyId = localStorage.getItem('company_id')
    if (!companyId) {
      setGenerating(false)
      return
    }

    api.nhs.generateCRP(companyId, selectedActions)
      .then((res) => {
        setCrpHtml(res.html)
        setTab('preview')
        toast.success('Official UK Carbon Reduction Plan belgesi oluşturuldu!')
      })
      .catch(() => {
        toast.error('Plan belgesi oluşturulurken hata oluştu.')
      })
      .finally(() => {
        setGenerating(false)
      })
  }

  const toggleAction = (action: string) => {
    setSelectedActions(prev =>
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    )
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="h-96 bg-slate-800 rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-20">
        <span className="text-4xl block mb-3">🇬🇧</span>
        <h2 className="text-xl font-bold text-white">UK NHS Net Zero Modülü</h2>
        <p className="text-slate-400 text-sm mt-1">Bu modülü kullanabilmek için lütfen geçerli emisyon verileri giriniz.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">NHS Net Zero & PPN 06/21 Compliance</h1>
          <p className="text-slate-400 text-sm mt-1">
            UK Crown Commercial Service PPN 06/21 · Net Zero Carbon Reduction Plan (CRP) Generator
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
          <span className="text-emerald-400 font-bold">PPN 06/21</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">GHG Protocol</span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-bold">NHS Ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-850 p-1 rounded-xl border border-slate-700">
        {[
          { id: 'assess', label: '🔍 PPN 06/21 Uyum Denetimi' },
          { id: 'actions', label: '📋 Karbon Azaltım Projeleri' },
          { id: 'preview', label: '📄 CRP Belge Önizleme & İhraç' },
        ].map(t => (
          <button key={t.id}
            onClick={() => {
              if (t.id === 'preview' && !crpHtml) {
                generateCRP()
              } else {
                setTab(t.id as any)
              }
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ASSESSMENT */}
      {tab === 'assess' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compliance Status Gauge */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Uyum Durumu</h3>
            <div className="relative flex items-center justify-center h-40">
              <div className="text-5xl font-black text-white">{result.overall_score}%</div>
              <div className="absolute inset-0 border-8 border-slate-700 rounded-full" />
              <div className="absolute inset-0 border-8 rounded-full transition-all duration-1000"
                style={{ 
                  borderColor: result.compliant ? '#10b981' : '#f59e0b', 
                  clipPath: `polygon(50% 50%, -50% -50%, ${result.overall_score}% -50%, ${result.overall_score}% 150%, -50% 150%)`
                }} 
              />
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                result.compliant ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {result.compliant ? '✓ PPN 06/21 UYUMLU' : '⚠ VERİ EKSİKLİĞİ VAR'}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Birleşik Krallık NHS ve devlet ihalelerine katılabilmek için 5 adet Scope 3 kategorisinin beyanı zorunludur.
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">PPN 06/21 Zorunlu Beyan Kontrolü</h3>
            
            <div className="space-y-3">
              {[
                { label: 'Scope 1 (Doğrudan Emisyonlar)', ok: result.emissions.scope1.current > 0, val: `${result.emissions.scope1.current} tCO₂e` },
                { label: 'Scope 2 (Dolaylı Emisyonlar)', ok: result.emissions.scope2.current > 0, val: `${result.emissions.scope2.current} tCO₂e` },
                { label: 'Kategori 4: Tedarik Zinciri Nakliyesi (Upstream)', ok: result.emissions.scope3_upstream.current > 0, val: `${result.emissions.scope3_upstream.current} tCO₂e` },
                { label: 'Kategori 5: Operasyonel Atıklar (Waste Generated)', ok: result.emissions.scope3_waste.current > 0, val: `${result.emissions.scope3_waste.current} tCO₂e` },
                { label: 'Kategori 6: İş Seyahatleri (Business Travel)', ok: result.emissions.scope3_travel.current > 0, val: `${result.emissions.scope3_travel.current} tCO₂e` },
                { label: 'Kategori 7: Çalışan Ulaşımı (Employee Commuting)', ok: result.emissions.scope3_commute.current > 0, val: `${result.emissions.scope3_commute.current} tCO₂e` },
                { label: 'Kategori 9: Dağıtım Nakliyesi (Downstream)', ok: result.emissions.scope3_downstream.current > 0, val: `${result.emissions.scope3_downstream.current} tCO₂e` },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className={item.ok ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
                      {item.ok ? '✓' : '⚠'}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{item.val}</span>
                </div>
              ))}
            </div>

            {/* Gap warning boxes */}
            {(result.gaps.length > 0 || result.warnings.length > 0) && (
              <div className="mt-4 p-4 rounded-xl border bg-amber-950/20 border-amber-500/30 text-xs text-amber-300 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⚠️</span> Eksik ve İyileştirilmesi Gereken Alanlar
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {result.gaps.map((g, i) => <li key={i}>{g}</li>)}
                  {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIONS */}
      {tab === 'actions' && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
              Sürdürülebilirlik İnisiyatifleri ve Karbon Azaltım Projeleri
            </h3>
            <p className="text-xs text-slate-400">
              Resmi CRP belgenize eklenmek üzere KOBİ'nizde gerçekleştirdiğiniz veya planladığınız çevresel azaltım projelerini seçiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {REDUCTION_INITIATIVES.map((action, idx) => {
              const isSelected = selectedActions.includes(action)
              return (
                <div key={idx} 
                  onClick={() => toggleAction(action)}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-slate-900 border-sky-500/50 text-white' 
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-500'
                  }`}>
                    {isSelected && '✓'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{action}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <button 
            onClick={generateCRP}
            disabled={generating}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-sky-600/10">
            {generating ? 'Belge Oluşturuluyor…' : '💾 Seçimleri Kaydet ve CRP Raporunu Oluştur'}
          </button>
        </div>
      )}

      {/* TAB 3: CRP PREVIEW */}
      {tab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">UK Carbon Reduction Plan (PPN 06/21)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Resmi ihalelerde ibraz edilmeye hazır imzalı format.</p>
            </div>
            <button 
              onClick={() => {
                const win = window.open()
                if (win) {
                  win.document.write(crpHtml)
                  win.document.close()
                  win.print()
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all">
              🖨️ PDF Olarak Yazdır / Kaydet
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-300 overflow-hidden shadow-xl">
            <iframe 
              srcDoc={crpHtml} 
              className="w-full h-[600px] border-none"
              title="Official PPN 06/21 Carbon Reduction Plan Preview"
            />
          </div>
        </div>
      )}
    </div>
  )
}
