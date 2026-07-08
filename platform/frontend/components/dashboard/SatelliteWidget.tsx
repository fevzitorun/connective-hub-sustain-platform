'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type WidgetRiskData = {
  lat: number
  lng: number
  city: string
  company_name: string
  earthquake_risk: string
  earthquake_zone: number
  pga_g: number
  flood_risk: string
  flood_score: number
  drought_risk: string
  drought_score: number
  heat_stress_risk: string
  fire_risk: string
  ndvi_proxy: number
  physical_risk_score: number
}

const RISK_COLORS: Record<string, string> = {
  'Çok Yüksek': '#dc2626',
  'Yüksek': '#ea580c',
  'Orta-Yüksek': '#d97706',
  'Orta': '#ca8a04',
  'Düşük': '#16a34a',
  'Çok Düşük': '#15803d',
}

export function SatelliteWidget() {
  const [data, setData] = useState<WidgetRiskData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const companyId = localStorage.getItem('company_id')
    if (!companyId) {
      setLoading(false)
      return
    }

    api.satellite.getByCompany(companyId)
      .then((res: any) => {
        setData(res)
      })
      .catch((err) => {
        console.error("Failed to load satellite widget data", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-5 shadow-sm animate-pulse space-y-3" style={{ borderColor: 'var(--border)' }}>
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-36 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border p-5 shadow-sm text-center py-8" style={{ borderColor: 'var(--border)' }}>
        <span className="text-2xl block mb-2">📡</span>
        <div className="text-xs text-slate-500 font-bold">Uydu verisi yüklenemedi</div>
        <p className="text-[10px] text-slate-400 mt-1">Lütfen şirket koordinatlarını kontrol edin.</p>
      </div>
    )
  }

  const dotColor = data.physical_risk_score >= 60 ? '#ef4444' 
    : data.physical_risk_score >= 40 ? '#f97316' 
    : '#22c55e'

  const gradient = data.physical_risk_score >= 50 
    ? 'linear-gradient(135deg, #2a1a1a 0%, #4a2d2d 40%, #3d1f1f 100%)' 
    : 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 40%, #1f3d2f 100%)'

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Uydu Fiziksel Risk
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">CANLI</span>
      </div>
      <div className="text-xs mb-3 font-semibold text-slate-500 truncate">
        {data.company_name} · {data.city.toUpperCase()}
      </div>
      
      <div
        className="relative rounded-lg overflow-hidden flex items-center justify-center h-36 mb-3 transition-all"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,100,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="w-4 h-4 rounded-full border-2 border-white z-10 relative transition-colors"
          style={{ background: dotColor, boxShadow: `0 0 0 8px ${dotColor}40` }} />
        <div className="absolute bottom-2 left-3 text-[10px] rounded px-2 py-0.5"
          style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.8)' }}>
          NASA POWER + AFAD
        </div>
        <div className="absolute top-2 right-3 text-[10px] font-mono text-right"
          style={{ color: 'rgba(100,255,150,0.8)' }}>
          {data.lat.toFixed(3)}° N<br />{data.lng.toFixed(3)}° E
        </div>
        <div className="absolute top-2 left-3 text-[10px] font-bold text-slate-300">
          NDVI: {data.ndvi_proxy.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: '🏔️', name: 'DEPREM', level: `${data.earthquake_zone}. Bölge`, color: RISK_COLORS[data.earthquake_risk] || '#388E3C' },
          { icon: '🌊', name: 'SEL RİSKİ', level: data.flood_risk, color: RISK_COLORS[data.flood_risk] || '#388E3C' },
          { icon: '🔥', name: 'YANGIN', level: data.fire_risk, color: RISK_COLORS[data.fire_risk] || '#388E3C' },
        ].map(({ icon, name, level, color }) => (
          <div key={name} className="rounded-lg p-2 text-center"
            style={{ background: 'var(--muted)' }}>
            <div className="text-lg mb-0.5">{icon}</div>
            <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
              {name}
            </div>
            <div className="text-xs font-bold mt-0.5" style={{ color }}>{level}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
