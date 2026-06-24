'use client'
import React, { useState } from 'react'
import { Settings, Zap, TrendingDown, Clock, Euro, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { AcademicResearchWidget } from '@/components/dashboard/AcademicResearchWidget'

export default function SimulatorPage() {
  const [investmentEur, setInvestmentEur] = useState<number>(1000000)
  const [investmentType, setInvestmentType] = useState<string>("solar")
  const [apiKey, setApiKey] = useState("")

  // Mock Current State (from ERP ideally)
  const currentEmissions = 12500
  const currentTax = 887500 // CBAM tax @71 EUR

  // Simple Frontend ROI simulation math
  let emissionReduction = 0
  let energySavings = 0
  
  if (investmentType === 'solar') {
    emissionReduction = (investmentEur * 10) * 0.4166 / 1000 // tCO2e
    energySavings = (investmentEur * 10) * 0.10
  } else if (investmentType === 'ev_fleet') {
    emissionReduction = (investmentEur * 0.1) * 2.68 / 1000
    energySavings = (investmentEur * 0.1) * 1.30
  } else {
    emissionReduction = (investmentEur * 0.05) * 2.02 / 1000
    energySavings = (investmentEur * 0.05) * 0.40
  }

  const taxSavings = emissionReduction * 71.0
  const totalSavings = energySavings + taxSavings
  const paybackYears = totalSavings > 0 ? investmentEur / totalSavings : 0
  const newEmissions = Math.max(0, currentEmissions - emissionReduction)
  const newTax = Math.max(0, currentTax - taxSavings)

  const handleGenerateKey = () => {
    setApiKey(`sk_live_${Math.random().toString(36).substring(2, 15)}`)
    toast.success("ERP Entegrasyonu için yeni API Anahtarı üretildi.")
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <TrendingDown className="text-emerald-600" size={32} />
          Yeşil Yatırım Simülatörü & Kurumsal Entegrasyon
        </h1>
        <p className="text-slate-500">
          "What-If" Senaryoları: Yeşil yatırımlarınızın karbon ayak izinize ve SKDM sınır verginize olan anlık finansal etkisini görün.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Senaryo Parametreleri</h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Yatırım Tipi</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'solar', label: 'Güneş Paneli (GES)' },
                    { id: 'ev_fleet', label: 'Elektrikli Araç Filosu' },
                    { id: 'waste_heat', label: 'Atık Isı Geri Kazanımı' }
                  ].map(t => (
                    <button key={t.id} onClick={() => setInvestmentType(t.id)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
                        investmentType === t.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 hover:border-slate-200 text-slate-500'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-slate-700">Yatırım Bütçesi (Euro)</label>
                  <span className="text-lg font-black text-emerald-600">€ {investmentEur.toLocaleString('de-DE')}</span>
                </div>
                <input 
                  type="range" 
                  min="100000" 
                  max="10000000" 
                  step="100000"
                  value={investmentEur} 
                  onChange={(e) => setInvestmentEur(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>€ 100K</span>
                  <span>€ 10M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <RefreshCcw size={20} className="text-indigo-600" />
              ERP Adaptörü (Connective Hub)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Kurumsal ERP sistemlerinizdeki (SAP, Logo, Microsoft Dynamics) enerji tüketim verilerini otomatik senkronize etmek için aşağıdaki API anahtarını kullanın. Sistem otomatik olarak MWh, BTU birimlerini standardize edecektir.
            </p>
            <div className="flex gap-3">
              <input type="text" readOnly value={apiKey} placeholder="API Anahtarı Üretilmedi"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-4 font-mono text-sm outline-none" />
              <button onClick={handleGenerateKey} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <Settings size={16} /> Key Üret
              </button>
            </div>
          </div>
          
          <AcademicResearchWidget investmentType={investmentType} />
        </div>

        <div className="space-y-6">
          <React.Suspense fallback={<div className="animate-pulse bg-slate-800 rounded-3xl h-96 w-full"></div>}>
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] text-emerald-500/10">
                <Zap size={150} />
              </div>
              <h2 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Canlı Impact Chart</h2>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Amortisman Süresi (ROI)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-emerald-400">{paybackYears.toFixed(1)}</span>
                    <span className="text-slate-300">Yıl</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (10 - paybackYears) * 10))}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Yıllık CBAM Tasarrufu</p>
                    <p className="text-lg font-bold text-emerald-300">+€{taxSavings.toLocaleString('de-DE', {maximumFractionDigits: 0})}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Enerji Tasarrufu</p>
                    <p className="text-lg font-bold text-emerald-300">+€{energySavings.toLocaleString('de-DE', {maximumFractionDigits: 0})}</p>
                  </div>
                </div>

                  <div className="bg-slate-800 p-4 rounded-xl">
                    <p className="text-xs text-slate-400 mb-2">Karbon Azaltım Etkisi</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-red-400 line-through">{currentEmissions.toLocaleString('de-DE')} t</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-xl font-black text-emerald-400">{newEmissions.toLocaleString('de-DE', {maximumFractionDigits: 0})} t</span>
                    </div>
                  </div>
                </div>
              </div>
            </React.Suspense>
          </div>
        </div>
        
        {/* MACC (Marginal Abatement Cost Curve) Section */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">📊</span> Decarbonization Roadmap (MACC)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Marjinal Azaltım Maliyeti Eğrisi (MACC), şirketinizin karbon hedeflerine ulaşması için en uygun maliyetli projeleri sıralar. 0 çizgisinin altındaki projeler (yeşil) yatırımınızın kendini amorte ettiği ve net kâr sağladığı "Win-Win" projeleridir.
            </p>
          </div>
          
          <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px] h-[400px] relative mt-10 border-l-2 border-b-2 border-slate-300 ml-10 flex items-end">
              {/* Y-Axis Labels */}
              <div className="absolute left-[-40px] top-0 text-xs text-slate-500 font-bold">150 €</div>
              <div className="absolute left-[-40px] top-[100px] text-xs text-slate-500 font-bold">75 €</div>
              <div className="absolute left-[-40px] top-[200px] text-xs text-slate-500 font-bold">0 €</div>
              <div className="absolute left-[-40px] top-[300px] text-xs text-slate-500 font-bold">-75 €</div>
              <div className="absolute left-[-40px] bottom-0 text-xs text-slate-500 font-bold">-150 €</div>
              
              {/* 0 Line */}
              <div className="absolute left-0 right-0 top-[200px] border-t border-dashed border-slate-400 z-0"></div>
              
              {/* Y-Axis Title */}
              <div className="absolute left-[-70px] top-[150px] -rotate-90 text-xs font-bold text-slate-600 tracking-widest uppercase">
                Maliyet (€ / tCO₂e)
              </div>
              
              {/* X-Axis Title */}
              <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-xs font-bold text-slate-600 tracking-widest uppercase">
                Kümülatif Emisyon Azaltımı (tCO₂e / Yıl)
              </div>

              {/* MACC Bars (Mock Data) */}
              <div className="flex items-end h-full relative z-10 pl-2">
                {/* Project 1: LED */}
                <div className="relative group" style={{ width: '60px' }}>
                  <div className="absolute top-[200px] w-full bg-emerald-500 border border-emerald-600 opacity-90 transition-all hover:opacity-100 cursor-pointer" style={{ height: '60px' }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none z-50">
                      <p className="font-bold text-emerald-400">LED Aydınlatma</p>
                      <p>Maliyet: -45 €/t</p>
                      <p>Potansiyel: 150 tCO₂e</p>
                    </div>
                  </div>
                </div>
                
                {/* Project 2: Solar */}
                <div className="relative group" style={{ width: '200px' }}>
                  <div className="absolute top-[200px] w-full bg-emerald-400 border border-emerald-500 opacity-90 transition-all hover:opacity-100 cursor-pointer" style={{ height: '27px' }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none z-50">
                      <p className="font-bold text-emerald-400">Güneş Enerjisi (GES)</p>
                      <p>Maliyet: -20 €/t</p>
                      <p>Potansiyel: 850 tCO₂e</p>
                    </div>
                  </div>
                </div>

                {/* Project 3: Waste Heat */}
                <div className="relative group" style={{ width: '120px' }}>
                  <div className="absolute top-[200px] w-full bg-emerald-300 border border-emerald-400 opacity-90 transition-all hover:opacity-100 cursor-pointer" style={{ height: '7px' }}>
                     <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none z-50">
                      <p className="font-bold text-emerald-400">Atık Isı Kazanımı</p>
                      <p>Maliyet: -5 €/t</p>
                      <p>Potansiyel: 420 tCO₂e</p>
                    </div>
                  </div>
                </div>

                {/* Project 4: EV Fleet */}
                <div className="relative group" style={{ width: '100px' }}>
                  <div className="absolute bottom-[200px] w-full bg-blue-400 border border-blue-500 opacity-90 transition-all hover:opacity-100 cursor-pointer" style={{ height: '20px' }}>
                     <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none z-50">
                      <p className="font-bold text-blue-300">Elektrikli Araçlar</p>
                      <p>Maliyet: +15 €/t</p>
                      <p>Potansiyel: 310 tCO₂e</p>
                    </div>
                  </div>
                </div>

                {/* Project 5: Heat Pumps */}
                <div className="relative group" style={{ width: '150px' }}>
                  <div className="absolute bottom-[200px] w-full bg-amber-400 border border-amber-500 opacity-90 transition-all hover:opacity-100 cursor-pointer" style={{ height: '53px' }}>
                     <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none z-50">
                      <p className="font-bold text-amber-300">Isı Pompaları</p>
                      <p>Maliyet: +40 €/t</p>
                      <p>Potansiyel: 600 tCO₂e</p>
                    </div>
                  </div>
                </div>

                {/* Project 6: Green Hydrogen */}
                <div className="relative group" style={{ width: '220px' }}>
                  <div className="absolute bottom-[200px] w-full bg-red-400 border border-red-500 opacity-90 transition-all hover:opacity-100 cursor-pointer" style={{ height: '160px' }}>
                     <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none z-50">
                      <p className="font-bold text-red-300">Yeşil Hidrojen</p>
                      <p>Maliyet: +120 €/t</p>
                      <p>Potansiyel: 1200 tCO₂e</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
