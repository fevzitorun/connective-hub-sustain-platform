'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type SatelliteData = {
  city: string
  earthquake_zone: number
  earthquake_risk: string
  pga_g: number
  flood_risk: string
  drought_risk: string
  drought_score: number
  temperature_c: number
  precipitation_mm: number
  solar_radiation_kwh_m2: number
  ndvi_proxy: number
  physical_risk_score: number
  data_source: string
}

const RISK_COLOR: Record<string, { bg: string; text: string; bar: string }> = {
  'Çok Yüksek': { bg: '#FFEBEE', text: '#B71C1C', bar: '#EF5350' },
  'Yüksek':     { bg: '#FFF3E0', text: '#E65100', bar: '#FF9800' },
  'Orta':       { bg: '#FFFDE7', text: '#F57F17', bar: '#FDD835' },
  'Düşük':      { bg: '#E8F5E9', text: '#1B5E20', bar: '#66BB6A' },
  'Orta-Yüksek': { bg: '#FFF3E0', text: '#E65100', bar: '#FFA726' },
}

function RiskBadge({ value }: { value: string }) {
  const c = RISK_COLOR[value] ?? RISK_COLOR['Orta']
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: c.bg, color: c.text }}>
      {value}
    </span>
  )
}

function RiskBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full rounded-full h-2 mt-2" style={{ background: '#f0f0f0' }}>
      <div className="h-2 rounded-full" style={{ width: `${score}%`, background: color }} />
    </div>
  )
}

export default function UyduPage() {
  const [data, setData] = useState<SatelliteData | null>(null)
  const [loading, setLoading] = useState(true)

  // Default: İstanbul koordinatları
  const lat = 41.015
  const lng = 28.979

  useEffect(() => {
    api.satellite.getByCoords(lat, lng, 'istanbul')
      .then(d => setData(d as SatelliteData))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const physScore = data?.physical_risk_score ?? 52
  const physColor = physScore >= 70 ? '#EF5350' : physScore >= 45 ? '#FF9800' : '#66BB6A'

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Uydu & İklim Riski</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          TCFD fiziksel risk analizi — NASA EARTHDATA Power API + AFAD veri tabanı
        </p>
        {data?.data_source && (
          <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--green-600)' }}>
            📡 Kaynak: {data.data_source}
          </p>
        )}
      </div>

      {/* Genel Fiziksel Risk Skoru */}
      <div className="bg-white rounded-2xl border p-5 mb-5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>TCFD Fiziksel Risk Skoru</h2>
          {loading && <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--green-300)', borderTopColor: 'transparent' }} />}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-black" style={{ color: physColor }}>{physScore.toFixed(0)}</div>
          <div className="flex-1">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>0 (az riskli) → 100 (çok riskli)</div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-3 rounded-full" style={{ width: `${physScore}%`, background: physColor }} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk kartları */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Deprem */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏔️</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Deprem Riski (AFAD)</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-lg font-black" style={{ color: 'var(--green-900)' }}>
                  {data ? `${data.earthquake_zone}. Bölge` : '—'}
                </p>
                {data && <RiskBadge value={data.earthquake_risk} />}
              </div>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            PGA: {data ? `${data.pga_g}g` : '—'} · TBDY 2018
          </div>
          <RiskBar score={(data?.pga_g ?? 0.25) * 200} color={RISK_COLOR[data?.earthquake_risk ?? 'Orta']?.bar ?? '#FF9800'} />
        </div>

        {/* Sel */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌊</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Sel Riski (DSİ)</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-lg font-black" style={{ color: 'var(--green-900)' }}>
                  {data?.flood_risk ?? '—'}
                </p>
                {data && <RiskBadge value={data.flood_risk} />}
              </div>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Yıllık yağış: {data ? `${(data.precipitation_mm * 12).toFixed(0)} mm` : '—'}
          </div>
          <RiskBar score={60} color={RISK_COLOR[data?.flood_risk ?? 'Orta']?.bar ?? '#FF9800'} />
        </div>

        {/* Kuraklık */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌵</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Kuraklık Riski (NASA)</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-lg font-black" style={{ color: 'var(--green-900)' }}>
                  {data?.drought_risk ?? '—'}
                </p>
                {data && <RiskBadge value={data.drought_risk} />}
              </div>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Ort. sıcaklık: {data ? `${data.temperature_c}°C` : '—'} · NASA Power 2024
          </div>
          <RiskBar score={data?.drought_score ?? 40} color={RISK_COLOR[data?.drought_risk ?? 'Orta']?.bar ?? '#FDD835'} />
        </div>

        {/* NDVI */}
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🌿</span>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Bitki Örtüsü (NDVI)</p>
              <p className="text-lg font-black" style={{ color: 'var(--green-900)' }}>
                {data ? data.ndvi_proxy.toFixed(2) : '—'}
              </p>
            </div>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Güneş radyasyonu: {data ? `${data.solar_radiation_kwh_m2} kWh/m²/gün` : '—'}
          </div>
          <RiskBar score={(data?.ndvi_proxy ?? 0.4) * 100} color="#66BB6A" />
        </div>
      </div>

      {/* Harita */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>Tesis Konumu</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--green-700)' }}>
              {lat}°N, {lng}°E
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
              OpenStreetMap
            </span>
          </div>
        </div>
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lng}`}
          style={{ width: '100%', height: 320, border: 'none' }}
          title="Tesis Konumu"
        />
      </div>

      {/* NASA iklim detayları */}
      <div className="mt-5 bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>NASA EARTHDATA İklim Metrikleri</p>
        </div>
        <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'var(--border)' }}>
          {[
            { label: 'Ortalama Sıcaklık', value: data ? `${data.temperature_c}°C` : '—', icon: '🌡️', sub: '2024 yıllık ort.' },
            { label: 'Yıllık Yağış',      value: data ? `${(data.precipitation_mm * 12).toFixed(0)} mm` : '—', icon: '🌧️', sub: 'Aylık × 12' },
            { label: 'Güneş Radyasyonu',  value: data ? `${data.solar_radiation_kwh_m2} kWh/m²` : '—', icon: '☀️', sub: 'Günlük ortalama' },
          ].map(m => (
            <div key={m.label} className="px-5 py-4 text-center">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-xl font-black" style={{ color: 'var(--green-800)' }}>{m.value}</div>
              <div className="text-xs font-medium mt-0.5">{m.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
