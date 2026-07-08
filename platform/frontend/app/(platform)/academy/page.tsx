'use client'
import React, { useState } from 'react'
import { BookOpen, Award, CheckCircle, Calculator, Zap, PlayCircle } from 'lucide-react'

export default function AcademyPage() {
  const [solarPanels, setSolarPanels] = useState(100) // kW
  const [evFleet, setEvFleet] = useState(10) // %
  const [certified, setCertified] = useState(false)

  const baselineCarbon = 5000 // tCO2e/year
  
  // Calculate simulated reductions
  const solarReduction = solarPanels * 1.5 // 1.5 tCO2e per kW per year
  const evReduction = (evFleet / 100) * 800 // 800 tCO2e is total fleet emissions
  const newCarbon = baselineCarbon - solarReduction - evReduction

  const handleSimulate = () => {
    // If they manage to reduce below 3000, they earn the certificate
    if (newCarbon <= 3000) {
      setCertified(true)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 mb-4 flex justify-center items-center gap-3">
          <BookOpen className="text-blue-600" size={32} />
          SustainHub Academy
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Kampüs verilerini canlı bir laboratuvar olarak kullanın. What-If simülasyonunu tamamlayın ve blockchain tabanlı "ESG Junior Analyst" sertifikanızı alın.
        </p>
      </div>

      {!certified ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calculator className="text-blue-500" />
              Sanal Kampüs Simülatörü
            </h2>
            
            <div className="space-y-8">
              <div>
                <label className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                  <span>Güneş Enerjisi Kurulumu (GES)</span>
                  <span className="text-amber-600">{solarPanels} kW</span>
                </label>
                <input 
                  type="range" min="0" max="2000" step="50"
                  value={solarPanels} onChange={(e) => setSolarPanels(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                  <span>Elektrikli Araç Filosu Geçişi</span>
                  <span className="text-emerald-600">%{evFleet}</span>
                </label>
                <input 
                  type="range" min="0" max="100" step="10"
                  value={evFleet} onChange={(e) => setEvFleet(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Görev (Assignment)</div>
                <p className="text-sm text-slate-700">
                  Kampüs emisyonlarını <strong className="text-emerald-600">3,000 tCO2e</strong> seviyesinin altına düşürecek yatırım senaryosunu oluşturun.
                </p>
              </div>

              <button 
                onClick={handleSimulate}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <PlayCircle size={20} />
                Senaryoyu Çalıştır
              </button>
            </div>
          </div>

          {/* Results Live */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <Zap size={150} />
            </div>
            <h3 className="font-bold text-slate-400 mb-2 uppercase tracking-wider text-xs">Simüle Edilen Kampüs Emisyonu</h3>
            <div className={`text-6xl font-black mb-4 transition-colors ${newCarbon <= 3000 ? 'text-emerald-400' : 'text-white'}`}>
              {newCarbon.toLocaleString()} <span className="text-2xl opacity-50">tCO2e</span>
            </div>
            
            <div className="space-y-4 mt-8">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400">Başlangıç Emisyonu (Baseline)</span>
                 <span className="font-bold">5,000 tCO2e</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400">GES Azaltımı</span>
                 <span className="font-bold text-amber-400">-{solarReduction.toLocaleString()} tCO2e</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-4">
                 <span className="text-slate-400">EV Dönüşümü Azaltımı</span>
                 <span className="font-bold text-emerald-400">-{evReduction.toLocaleString()} tCO2e</span>
               </div>
               <div className="flex justify-between items-center text-sm pt-2">
                 <span className="text-slate-300 font-bold">Toplam Azaltım</span>
                 <span className="font-black text-white">-{(solarReduction + evReduction).toLocaleString()} tCO2e</span>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-10 text-center text-white shadow-2xl animate-in fade-in zoom-in duration-500">
          <Award size={100} className="mx-auto mb-6 text-emerald-100" />
          <h2 className="text-4xl font-black mb-4">Sertifikaya Hak Kazandınız!</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Kampüs emisyonlarını başarıyla yönettiniz. Bu başarı, Blockchain ağına yazıldı. Artık İSO 500 şirketleri için yetkin bir "ESG Junior Analyst"siniz.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 inline-block mb-8">
             <div className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">Sertifika ID</div>
             <div className="font-mono text-xl tracking-widest">SH-0x7F4A...B92C</div>
          </div>

          <div className="flex justify-center gap-4">
            <button className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-50 transition-colors flex items-center gap-2">
              <CheckCircle size={20} />
              LinkedIn'e Ekle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
