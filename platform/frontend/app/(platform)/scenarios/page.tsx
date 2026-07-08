'use client'
import React, { useState } from 'react'
import { Map, AlertTriangle, Download, ThermometerSun, Waves, TrendingUp } from 'lucide-react'

export default function ScenariosPage() {
  const [year, setYear] = useState(2025)
  const [scenario, setScenario] = useState('1.5') // 1.5C or 4.0C

  // Simulated risk logic based on year and scenario
  const getRiskLevel = (type: string) => {
    let base = year === 2025 ? 10 : year === 2030 ? 25 : 60
    if (scenario === '4.0') base *= 1.5
    
    if (type === 'seaLevel') return Math.min(base, 100)
    if (type === 'heat') return Math.min(base * 1.2, 100)
    return base
  }

  const seaLevelRisk = getRiskLevel('seaLevel')
  const heatRisk = getRiskLevel('heat')

  // Map visuals
  const mapOverlayColor = scenario === '1.5' 
    ? `rgba(239, 68, 68, ${heatRisk / 200})` 
    : `rgba(185, 28, 28, ${heatRisk / 100})`

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <Map className="text-blue-600" size={32} />
            TCFD Scenario War-Room
          </h1>
          <p className="text-slate-500 max-w-2xl">
            İklim değişikliği senaryolarının tesisleriniz üzerindeki fiziksel ve geçiş risklerini (Sea Level Rise, Extreme Heat) simüle edin.
          </p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
          <Download size={18} />
          ESRS E1 / TCFD Raporu İndir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Controls Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Simülasyon Parametreleri</h3>
            
            <div className="space-y-6">
              {/* Scenario Toggle */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-2">İklim Senaryosu</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setScenario('1.5')}
                    className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${
                      scenario === '1.5' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    1.5°C (Net-Zero)
                  </button>
                  <button 
                    onClick={() => setScenario('4.0')}
                    className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${
                      scenario === '4.0' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    4.0°C (Business as Usual)
                  </button>
                </div>
              </div>

              {/* Time Travel Slider */}
              <div>
                <label className="text-sm font-semibold text-slate-600 flex justify-between mb-2">
                  <span>Zaman Yolculuğu</span>
                  <span className="text-blue-600 font-black">{year}</span>
                </label>
                <input 
                  type="range" 
                  min="2025" 
                  max="2050" 
                  step="5"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1 font-bold">
                  <span>2025</span>
                  <span>2030</span>
                  <span>2050</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
            <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Finansal Etki Özeti
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-400 mb-1">Beklenen Varlık Değer Kaybı</div>
                <div className="text-2xl font-black">€{(heatRisk * 0.4).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Sigorta Primi Artış Riski</div>
                <div className="text-xl font-bold text-red-400">+{(heatRisk * 0.8).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map & Visuals Area */}
        <div className="col-span-3 space-y-6">
          {/* Map Mockup */}
          <div className="bg-slate-100 rounded-2xl border border-slate-300 h-[500px] relative overflow-hidden flex items-center justify-center">
            {/* Base Map Graphic (CSS simulated) */}
            <div className="absolute inset-0 bg-[#e5e7eb]" style={{
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* Heat/Risk Overlay */}
            <div 
              className="absolute inset-0 transition-colors duration-1000 ease-in-out mix-blend-multiply"
              style={{ backgroundColor: mapOverlayColor }}
            ></div>

            {/* Sea Level Rise Overlay */}
            {seaLevelRisk > 30 && (
              <div 
                className="absolute bottom-0 left-0 w-full bg-blue-500/40 transition-all duration-1000 ease-in-out"
                style={{ height: `${seaLevelRisk}%` }}
              >
                <div className="w-full h-2 bg-blue-400/50 absolute top-0 backdrop-blur-sm"></div>
              </div>
            )}

            {/* Factory Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-lg z-10">
                Ana Tesis (İzmir)
              </div>
              <div className="w-6 h-6 bg-slate-800 rounded-sm border-2 border-white shadow-xl relative z-10 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full animate-ping ${seaLevelRisk > 50 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              </div>
              
              {/* Danger Tooltip */}
              {seaLevelRisk > 50 && (
                <div className="absolute top-full mt-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-20">
                  ⚠️ Kritik Su Baskını Riski
                </div>
              )}
            </div>
            
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1">
                <AlertTriangle size={16} className={heatRisk > 50 ? 'text-red-500' : 'text-amber-500'} />
                {year} Fiziksel Risk Profili
              </div>
              <p className="text-xs text-slate-500">Senaryo: {scenario}°C Pathway</p>
            </div>
          </div>

          {/* Risk Metrics Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Waves className="text-blue-500" size={20} />
                Deniz Seviyesi Yükselmesi (Sea Level Rise)
              </h4>
              <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-slate-800">{seaLevelRisk > 50 ? '+1.2m' : seaLevelRisk > 20 ? '+0.4m' : '0m'}</span>
                <span className="text-sm text-slate-500 mb-1">kıyı bandı değişimi</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${seaLevelRisk > 50 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${seaLevelRisk}%` }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <ThermometerSun className="text-red-500" size={20} />
                Aşırı Sıcaklık Günleri (Extreme Heat)
              </h4>
              <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-slate-800">{(heatRisk / 1.5).toFixed(0)}</span>
                <span className="text-sm text-slate-500 mb-1">gün/yıl &gt; 35°C</span>
              </div>
              <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${heatRisk > 70 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${heatRisk}%` }}></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
