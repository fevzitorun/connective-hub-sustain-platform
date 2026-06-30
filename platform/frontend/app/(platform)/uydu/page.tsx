'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { api } from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────
type Projection = {
  year: number; scenario: string
  temp_increase_c: number; drought_multiplier: number
  flood_multiplier: number; fire_multiplier: number
}
type EarthData = {
  lat: number; lng: number; city: string
  earthquake_zone: number; earthquake_risk: string; pga_g: number
  flood_risk: string; flood_score: number
  drought_risk: string; drought_score: number
  heat_stress_risk: string; heat_stress_score: number
  fire_risk: string; fire_score: number
  water_stress_risk: string; water_stress_score: number
  temperature_c: number; precipitation_mm: number; solar_radiation_kwh_m2: number
  ndvi_proxy: number; physical_risk_score: number
  data_source: string; projections: Projection[]
}

// ─── City list ───────────────────────────────────────────────────────────────
const CITIES: { label: string; value: string; flag: string; group: string }[] = [
  { group: 'Türkiye', flag: '🇹🇷', label: 'İstanbul',      value: 'istanbul' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'İzmir',         value: 'izmir' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Ankara',        value: 'ankara' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Bursa',         value: 'bursa' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Antalya',       value: 'antalya' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Adana',         value: 'adana' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Mersin',        value: 'mersin' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Kocaeli',       value: 'kocaeli' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Trabzon',       value: 'trabzon' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Gaziantep',     value: 'gaziantep' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Kahramanmaraş', value: 'kahramanmaras' },
  { group: 'Türkiye', flag: '🇹🇷', label: 'Hatay',         value: 'hatay' },
  { group: 'KKTC',    flag: '🇨🇾', label: 'Lefkoşa',       value: 'lefkosa' },
  { group: 'KKTC',    flag: '🇨🇾', label: 'Gazimağusa',    value: 'gazimağusa' },
  { group: 'KKTC',    flag: '🇨🇾', label: 'Girne',         value: 'girne' },
  { group: 'UK',      flag: '🇬🇧', label: 'London',        value: 'london' },
  { group: 'UK',      flag: '🇬🇧', label: 'Manchester',    value: 'manchester' },
  { group: 'UK',      flag: '🇬🇧', label: 'Birmingham',    value: 'birmingham' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const RISK_STYLE: Record<string, { bg: string; text: string; bar: string; dot: string }> = {
  'Çok Yüksek': { bg: '#fef2f2', text: '#991b1b', bar: '#ef4444', dot: '#dc2626' },
  'Yüksek':     { bg: '#fff7ed', text: '#9a3412', bar: '#f97316', dot: '#ea580c' },
  'Orta-Yüksek':{ bg: '#fffbeb', text: '#92400e', bar: '#f59e0b', dot: '#d97706' },
  'Orta':       { bg: '#fefce8', text: '#713f12', bar: '#eab308', dot: '#ca8a04' },
  'Düşük':      { bg: '#f0fdf4', text: '#14532d', bar: '#22c55e', dot: '#16a34a' },
  'Çok Düşük':  { bg: '#f0fdf4', text: '#14532d', bar: '#86efac', dot: '#4ade80' },
}

function RiskPill({ value }: { value: string }) {
  const s = RISK_STYLE[value] ?? RISK_STYLE['Orta']
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.text }}>{value}</span>
  )
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 mt-2">
      <div className="h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${score}%`, background: color }} />
    </div>
  )
}

function riskColor(score: number) {
  if (score >= 70) return '#ef4444'
  if (score >= 55) return '#f97316'
  if (score >= 38) return '#eab308'
  return '#22c55e'
}

export default function EarthPage() {
  const router = useRouter()
  const [city, setCity] = useState('istanbul')
  const [data, setData] = useState<EarthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState<'RCP 4.5' | 'RCP 8.5'>('RCP 4.5')

  async function analyse() {
    setLoading(true)
    try {
      const res = await api.satellite.demo(city)
      setData(res as EarthData)
    } catch {
      // silently ignore — demo doesn't need toast
    } finally {
      setLoading(false)
    }
  }

  // Radar chart verisi
  const radarData = data ? [
    { subject: 'Deprem',   A: Math.min(100, data.pga_g * 200) },
    { subject: 'Sel',      A: data.flood_score },
    { subject: 'Kuraklık', A: data.drought_score },
    { subject: 'Aşırı Sıcak', A: data.heat_stress_score },
    { subject: 'Yangın',   A: data.fire_score },
  ] : []

  // Projeksiyon grafik verisi
  const filteredProj = data?.projections.filter(p => p.scenario === scenario) ?? []
  const projChartData = filteredProj.map(p => ({
    year: p.year,
    'Sıcaklık Artışı (°C)': p.temp_increase_c,
    'Sel Çarpanı': +(p.flood_multiplier.toFixed(2)),
    'Yangın Çarpanı': +(p.fire_multiplier.toFixed(2)),
  }))

  const physScore = data?.physical_risk_score ?? 0
  const physColor = riskColor(physScore)

  // TCFD bağlantısı: /tcfd'ye physical_risk_score ile git
  function goToTCFD() {
    if (!data) return
    // Query param ile TCFD sayfasını pre-fill edebiliriz
    router.push(`/tcfd?physical_risk=${data.physical_risk_score}&city=${data.city}`)
  }

  const selectedCity = CITIES.find(c => c.value === city)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0f172a' }}>
            🛰️ Earth Intelligence
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            Fiziksel İklim Riski · NASA EARTHDATA · AFAD · IPCC AR6 Projeksiyonları
          </p>
        </div>
        {data && (
          <button onClick={goToTCFD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: '#065f46' }}>
            🌡️ TCFD Senaryosuna Aktar →
          </button>
        )}
      </div>

      {/* City Selector + Analyse Button */}
      <div className="flex flex-wrap items-end gap-3 p-5 rounded-2xl border border-slate-200 bg-white">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Tesis / Şehir Seçin
          </label>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
            {['Türkiye', 'KKTC', 'UK'].map(group => (
              <optgroup key={group} label={group}>
                {CITIES.filter(c => c.group === group).map(c => (
                  <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button onClick={analyse} disabled={loading}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2"
          style={{ background: '#0284c7' }}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analiz Ediliyor…</>
            : '📡 Risk Analizi Yap'}
        </button>
        {data && (
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {data.data_source}
          </div>
        )}
      </div>

      {/* Empty state */}
      {!data && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <p className="font-bold text-slate-700">Şehir seçin ve analiz başlatın</p>
          <p className="text-sm text-slate-400 mt-1">
            NASA + AFAD + IPCC AR6 verileri ile 5 fiziksel risk boyutu hesaplanır
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Overall Score + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Overall score card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-700 text-sm">TCFD Fiziksel Risk Skoru</h2>
                <span className="text-xs font-mono text-slate-400">
                  {selectedCity?.flag} {data.lat.toFixed(2)}°N, {Math.abs(data.lng).toFixed(2)}°{data.lng >= 0 ? 'E' : 'W'}
                </span>
              </div>

              {/* Big score */}
              <div className="flex items-center gap-5 mb-5">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={physColor} strokeWidth="3"
                      strokeDasharray={`${physScore} 100`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black" style={{ color: physColor }}>{physScore.toFixed(0)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">0 (az riskli) → 100 (çok riskli)</p>
                  <p className="text-sm font-bold" style={{ color: physColor }}>
                    {physScore >= 70 ? 'Yüksek Risk' : physScore >= 45 ? 'Orta Risk' : 'Düşük Risk'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">5 boyutlu ağırlıklı ortalama</p>
                </div>
              </div>

              {/* 5 dimension scores */}
              <div className="space-y-2.5">
                {[
                  { label: '🏔️ Deprem', score: Math.min(100, data.pga_g * 200), risk: data.earthquake_risk },
                  { label: '🌊 Sel', score: data.flood_score, risk: data.flood_risk },
                  { label: '🌵 Kuraklık', score: data.drought_score, risk: data.drought_risk },
                  { label: '🌡️ Aşırı Sıcak', score: data.heat_stress_score, risk: data.heat_stress_risk },
                  { label: '🔥 Yangın', score: data.fire_score, risk: data.fire_risk },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex justify-between items-center text-xs mb-0.5">
                      <span className="font-medium text-slate-700">{d.label}</span>
                      <RiskPill value={d.risk} />
                    </div>
                    <ScoreBar score={d.score} color={riskColor(d.score)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold text-slate-700 text-sm mb-4">Risk Radar — 5 Boyut</h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <Radar name="Risk Skoru" dataKey="A" stroke={physColor}
                    fill={physColor} fillOpacity={0.18} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Climate metrics + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* NASA metrics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <h2 className="font-bold text-slate-700 text-sm">🌐 NASA EARTHDATA Metrikleri</h2>
              {[
                { icon: '🌡️', label: 'Ortalama Sıcaklık', value: `${data.temperature_c}°C`, sub: '2024 yıllık' },
                { icon: '🌧️', label: 'Yıllık Yağış', value: `${(data.precipitation_mm * 12).toFixed(0)} mm`, sub: 'Aylık × 12' },
                { icon: '☀️', label: 'Güneş Radyasyonu', value: `${data.solar_radiation_kwh_m2} kWh/m²`, sub: 'Günlük ort.' },
                { icon: '🌿', label: 'NDVI Bitki Örtüsü', value: data.ndvi_proxy.toFixed(2), sub: '0=çıplak, 1=yoğun' },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xl">{m.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">{m.label}</div>
                    <div className="font-bold text-sm text-slate-800">{m.value}</div>
                  </div>
                  <div className="text-xs text-slate-400">{m.sub}</div>
                </div>
              ))}
              {/* Deprem detay */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-1">AFAD Deprem Verisi</div>
                <div className="flex gap-3 text-xs">
                  <span className="text-slate-600">Bölge: <b>{data.earthquake_zone}. Deprem Bölgesi</b></span>
                  <span className="text-slate-600">PGA: <b>{data.pga_g}g</b></span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-sm font-bold text-slate-700">
                  {selectedCity?.flag} {selectedCity?.label} — Tesis Konumu
                </span>
                <span className="text-xs text-slate-400 font-mono">OpenStreetMap</span>
              </div>
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.lng - 0.1},${data.lat - 0.08},${data.lng + 0.1},${data.lat + 0.08}&layer=mapnik&marker=${data.lat},${data.lng}`}
                style={{ width: '100%', height: 300, border: 'none' }}
                title="Tesis Konumu"
              />
            </div>
          </div>

          {/* IPCC 2030/2050 Projections */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
              <div>
                <h2 className="font-bold text-slate-700">📈 IPCC AR6 İklim Projeksiyonları</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  2030 ve 2050 için sıcaklık artışı ve çarpan etkileri · WG2 Akdeniz/Türkiye verisi
                </p>
              </div>
              {/* Scenario toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                {(['RCP 4.5', 'RCP 8.5'] as const).map(s => (
                  <button key={s} onClick={() => setScenario(s)}
                    className="px-4 py-1.5 text-xs font-bold transition-all"
                    style={{
                      background: scenario === s ? (s === 'RCP 4.5' ? '#0284c7' : '#dc2626') : '#f8fafc',
                      color: scenario === s ? '#fff' : '#64748b',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projection cards */}
              <div className="space-y-3">
                {filteredProj.map(p => (
                  <div key={`${p.year}-${p.scenario}`}
                    className="rounded-xl border p-4 flex items-center gap-4"
                    style={{ borderColor: p.year === 2030 ? '#bae6fd' : '#fca5a5',
                             background: p.year === 2030 ? '#f0f9ff' : '#fff1f2' }}>
                    <div className="text-center flex-shrink-0">
                      <div className="text-2xl font-black" style={{ color: p.year === 2030 ? '#0284c7' : '#dc2626' }}>
                        {p.year}
                      </div>
                      <div className="text-xs font-bold" style={{ color: p.year === 2030 ? '#0369a1' : '#b91c1c' }}>
                        {p.scenario}
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="font-black text-base" style={{ color: p.year === 2030 ? '#0284c7' : '#dc2626' }}>
                          +{p.temp_increase_c}°C
                        </div>
                        <div className="text-xs text-slate-500">Sıcaklık</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-base text-orange-600">
                          ×{p.flood_multiplier}
                        </div>
                        <div className="text-xs text-slate-500">Sel Riski</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-base text-red-600">
                          ×{p.fire_multiplier}
                        </div>
                        <div className="text-xs text-slate-500">Yangın</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Line chart */}
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={projChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="Sıcaklık Artışı (°C)"
                      stroke={scenario === 'RCP 4.5' ? '#0284c7' : '#dc2626'}
                      strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Sel Çarpanı" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Yangın Çarpanı" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sustain Verified Badge */}
          <div className="rounded-2xl border-2 p-6 flex flex-col md:flex-row items-center gap-6"
            style={{ borderColor: '#059669', background: '#f0fdf4' }}>
            <div className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: '#059669' }}>
              🛰️
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg" style={{ color: '#065f46' }}>Sustain Verified™ Rozeti</h3>
              <p className="text-sm mt-1" style={{ color: '#047857' }}>
                Bu analiz, <strong>{selectedCity?.label}</strong> tesisinin iklim fiziksel risk profilini
                NASA EARTHDATA, AFAD ve IPCC AR6 verileriyle doğrulamaktadır.
                Yatırımcı sunumlarında ve TCFD açıklamalarında kullanılabilir.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['NASA Power API', 'AFAD/TBDY 2018', 'IPCC AR6 WG2', 'TCFD Uyumlu'].map(tag => (
                  <span key={tag} className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#d1fae5', color: '#065f46' }}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={goToTCFD}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: '#065f46' }}>
                🌡️ TCFD Analizine Gönder
              </button>
              <button className="px-5 py-2.5 rounded-xl text-sm font-bold border border-emerald-300 text-emerald-700">
                📥 Rozet İndir (SVG)
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  )
}
