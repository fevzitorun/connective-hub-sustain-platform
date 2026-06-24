'use client'
import React from 'react'
import { Map, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export function UKMarketAccessWidget() {
  // Demo data reflecting the benchmark_engine logic
  const companyIntensity = 10.5
  const ukAvgIntensity = 12.0
  const diffPercent = ((companyIntensity - ukAvgIntensity) / ukAvgIntensity) * 100
  const score = 95
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Map className="text-red-600" size={18} />
          UK Market Access Score
        </h3>
        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
          Sector: Tekstil
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-black text-emerald-600">{score}/100</div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Excellent</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-700">{companyIntensity.toFixed(1)} tCO2e</div>
          <div className="text-xs text-slate-400">Company Intensity</div>
          <div className="text-sm font-bold text-slate-700 mt-1">{ukAvgIntensity.toFixed(1)} tCO2e</div>
          <div className="text-xs text-slate-400">UK Market Avg</div>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-lg p-3 flex gap-3 border border-emerald-100">
        <div className="mt-0.5"><CheckCircle className="text-emerald-500" size={16} /></div>
        <p className="text-xs font-medium text-emerald-800">
          Karbon yoğunluğunuz UK ortalamasından %{Math.abs(diffPercent).toFixed(0)} daha düşük! İhracat ve Yeşil Finansman avantajınız çok yüksek.
        </p>
      </div>
    </div>
  )
}
