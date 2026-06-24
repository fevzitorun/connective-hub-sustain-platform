'use client'
import React, { useState } from 'react'
import { GraduationCap, MapPin, Zap, Droplets, Target, Award, ArrowUpRight, TrendingUp } from 'lucide-react'

export default function UniversityDashboard() {
  const [rankingTarget, setRankingTarget] = useState('GreenMetric') // THE or GreenMetric

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
            <GraduationCap className="text-blue-600" size={32} />
            Atlas Üniversitesi Kampüsü
          </h1>
          <p className="text-slate-500">
            SustainHub Dijital İşletim Sistemi. Global THE Impact ve UI GreenMetric sıralama tahmincisi.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setRankingTarget('GreenMetric')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${rankingTarget === 'GreenMetric' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
          >
            UI GreenMetric
          </button>
          <button 
            onClick={() => setRankingTarget('THE')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${rankingTarget === 'THE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
          >
            THE Impact
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Rankings & Gap Analysis */}
        <div className="col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Award size={100} />
            </div>
            <h3 className="font-bold text-slate-300 mb-2 uppercase tracking-wider text-xs">Canlı Sıralama Puanı</h3>
            <div className="text-5xl font-black mb-1">6,850 <span className="text-lg text-emerald-400 font-bold">+120</span></div>
            <p className="text-sm text-slate-400 mb-6">Tahmini Sıra: <strong>Global Top 300</strong></p>
            
            <div className="space-y-4">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <Target size={16} /> Yapay Zeka Gap Analizi
              </h4>
              <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 border border-slate-700 leading-relaxed">
                <span className="text-amber-400 font-bold">Ulaşım (Transportation):</span> Kampüs içi shuttle ringleri elektrikliye çevirirseniz, UI GreenMetric'te anında <strong className="text-white">+450 puan</strong> kazanacaksınız.
              </div>
              <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 border border-slate-700 leading-relaxed">
                <span className="text-amber-400 font-bold">Enerji (Energy):</span> Çatılardaki 250kW GES kurulumunu tamamlarsanız, <strong className="text-white">+600 puan</strong> artışla Top 200'e girebilirsiniz.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" /> SustainHub Academy Etkisi
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Sertifikalı Öğrenci (Junior Analyst)</div>
                  <div className="text-2xl font-black text-slate-700">1,240</div>
                </div>
                <div className="text-emerald-500 font-bold flex items-center text-sm"><ArrowUpRight size={16}/> %12</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Sanayi ile Eşleşen Proje</div>
                  <div className="text-2xl font-black text-slate-700">45</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2.5D Campus Map Mockup */}
        <div className="col-span-2">
          <div className="bg-slate-100 rounded-2xl border border-slate-300 h-full min-h-[500px] relative overflow-hidden flex items-center justify-center shadow-inner group">
            {/* CSS Isometric Grid Base */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(203, 213, 225, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(203, 213, 225, 0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              transform: 'rotateX(60deg) rotateZ(-45deg) scale(1.5)',
              transformOrigin: 'center center'
            }}></div>

            {/* Isometric Campus Buildings (CSS Art) */}
            <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: 'rotateX(60deg) rotateZ(-45deg)', transformStyle: 'preserve-3d' }}>
                
                {/* Main Building */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-100 border border-blue-300 shadow-[20px_20px_0px_rgba(0,0,0,0.1)] transition-all group-hover:-translate-y-2">
                  <div className="absolute -top-6 -left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap transform -rotate-z-[-45deg] rotate-x-[-60deg]">
                    <Zap size={12} className="inline mr-1 text-amber-400" />Rektörlük (Energy: B)
                  </div>
                </div>

                {/* Library Building */}
                <div className="absolute top-10 left-32 w-24 h-32 bg-emerald-100 border border-emerald-300 shadow-[20px_20px_0px_rgba(0,0,0,0.1)] transition-all group-hover:-translate-y-2">
                  <div className="absolute -top-6 -left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap transform -rotate-z-[-45deg] rotate-x-[-60deg]">
                    <Droplets size={12} className="inline mr-1 text-blue-400" />Kütüphane (Water: A+)
                  </div>
                </div>

                {/* Faculty Building */}
                <div className="absolute top-24 -left-32 w-32 h-20 bg-amber-100 border border-amber-300 shadow-[20px_20px_0px_rgba(0,0,0,0.1)] transition-all group-hover:-translate-y-2">
                   <div className="absolute -top-6 -left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap transform -rotate-z-[-45deg] rotate-x-[-60deg]">
                    Mühendislik Fakültesi
                  </div>
                </div>

              </div>
            </div>

            {/* UI Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <MapPin className="text-slate-400" size={24} />
                <div>
                  <div className="font-bold text-slate-800">Kampüs Canlı Veri Akışı</div>
                  <div className="text-xs text-slate-500">Sensörlerden anlık tüketim verileri toplanıyor (Smart IoT)</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-700">1.2 MW</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Solar Üretim</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-700">4,500 L</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Geri Kazanım</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  )
}
