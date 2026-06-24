'use client'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts'
import { api } from '@/lib/api'

const benchmarkData = [
  { metric: 'Karbon Yoğunluğu', unit: 'ton CO₂e/çalışan', company: 2.1, sectorAvg: 3.4, best: 0.8, status: 'iyi' },
  { metric: 'Enerji Verimliliği', unit: 'kWh/m²', company: 145, sectorAvg: 210, best: 95, status: 'iyi' },
  { metric: 'Yenilenebilir Enerji', unit: '%', company: 22, sectorAvg: 18, best: 85, status: 'orta' },
  { metric: 'Su Tüketimi', unit: 'm³/çalışan', company: 12.4, sectorAvg: 9.8, best: 4.2, status: 'kötü' },
  { metric: 'Atık Geri Dönüşüm', unit: '%', company: 68, sectorAvg: 55, best: 92, status: 'iyi' },
  { metric: 'Kapsam 3 Oranı', unit: '%', company: 71, sectorAvg: 65, best: 45, status: 'orta' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  iyi:  { bg: '#dcfce7', color: '#166534', label: 'Sektör Ortalaması Üstü' },
  orta: { bg: '#fef9c3', color: '#854d0e', label: 'Sektör Ortalamasında' },
  kötü: { bg: '#fee2e2', color: '#991b1b', label: 'Sektör Ortalaması Altı' },
}

const eea = [
  { name: 'Döngüsel Materyal Kullanımı', value: '11.8%', trend: '+0.3%', src: 'EEA 2023' },
  { name: 'Organik Tarım Alanı',         value: '9.1%',  trend: '0%',    src: 'EEA 2022' },
  { name: 'Çevre Harcamaları',           value: '2.1%',  trend: '0%',    src: 'EEA 2023' },
  { name: 'Eko-İnovasyon Endeksi',       value: '127.5', trend: '+3.8',  src: 'EEA 2024' },
]

type RadarPoint = { axis: string; company: number; sectorAvg: number; bestInClass: number }

export default function BenchmarkPage() {
  const [radarData, setRadarData] = useState<RadarPoint[]>([])
  const [radarLoading, setRadarLoading] = useState(true)

  useEffect(() => {
    api.benchmark.radar('me')
      .then((res) => {
        const r = res as { axes: string[]; company: number[]; sector_avg: number[]; global_avg: number[] }
        const points: RadarPoint[] = r.axes.map((axis: string, i: number) => ({
          axis,
          company: r.company[i],
          sectorAvg: r.sector_avg[i],
          bestInClass: r.global_avg[i],
        }))
        setRadarData(points)
      })
      .catch(() => {
        // Fallback statik veri
        setRadarData([
          { axis: 'Karbon',       company: 72, sectorAvg: 68, bestInClass: 95 },
          { axis: 'Enerji',       company: 80, sectorAvg: 65, bestInClass: 90 },
          { axis: 'Su',           company: 55, sectorAvg: 78, bestInClass: 88 },
          { axis: 'Atık',         company: 68, sectorAvg: 72, bestInClass: 92 },
          { axis: 'Arazi',        company: 90, sectorAvg: 88, bestInClass: 95 },
          { axis: 'Havacılık',    company: 88, sectorAvg: 85, bestInClass: 92 },
          { axis: 'Kimyasallar',  company: 92, sectorAvg: 90, bestInClass: 98 },
          { axis: 'Biyoçeşitlilik', company: 75, sectorAvg: 80, bestInClass: 90 },
        ])
      })
      .finally(() => setRadarLoading(false))
  }, [])

  return (
    <>
      <Header title="📈 Sektör Benchmark" subtitle="EEA Verileri · Bankacılık Sektörü · 2024" />
      <div className="p-6 flex-1 space-y-5">

        {/* KPI kartlar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sektör Sıralaması', value: '#12 / 47', sub: 'Bankacılık sektörü', icon: '🏆' },
            { label: 'Genel Performans',  value: '73/100',   sub: 'Sektör ort: 61',    icon: '📊' },
            { label: 'Sürdürülebilirlik', value: 'B+',       sub: 'Geçen yıl: B',      icon: '⭐' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Radar Grafiği */}
        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>
                Çok Boyutlu Performans Radarı
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Şirket (mavi) · Sektör ortalaması (turuncu) · En iyi uygulama (yeşil) · 0–100 ölçeği
              </p>
            </div>
            {radarLoading && (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--green-300)', borderTopColor: 'transparent' }} />
            )}
          </div>
          <div className="p-4" style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickCount={5}
                />
                <Radar
                  name="Şirketiniz"
                  dataKey="company"
                  stroke="#1565C0"
                  fill="#1565C0"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#1565C0' }}
                />
                <Radar
                  name="Sektör Ortalaması"
                  dataKey="sectorAvg"
                  stroke="#F57F17"
                  fill="#F57F17"
                  fillOpacity={0.10}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                />
                <Radar
                  name="En İyi Uygulama"
                  dataKey="bestInClass"
                  stroke="#1B5E20"
                  fill="#1B5E20"
                  fillOpacity={0.08}
                  strokeWidth={2}
                  strokeDasharray="2 4"
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                />
                <Tooltip
                  formatter={(value: number) => [`${value}/100`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrik tablosu */}
        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>Metrik Karşılaştırması</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Kaynak: EEA 2024 · SASB Cilt 16 (Bankacılık)
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {benchmarkData.map((row) => {
              const s = statusStyle[row.status]
              const pct = Math.min(100, Math.round((row.company / row.sectorAvg) * 50))
              return (
                <div key={row.metric} className="px-5 py-3 grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3">
                    <div className="text-sm font-medium">{row.metric}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.unit}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-sm font-bold" style={{ color: 'var(--green-800)' }}>{row.company}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Şirketiniz</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-sm">{row.sectorAvg}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Sektör Ort.</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="text-sm" style={{ color: 'var(--green-600)' }}>{row.best}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>En İyi</div>
                  </div>
                  <div className="col-span-3">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--green-500)' }} />
                    </div>
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* EEA Göstergeler */}
        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>
              EEA Çevre Göstergeleri (EEA-25 Veri Seti)
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Avrupa Çevre Ajansı · AB-38 Ülke Ortalaması
            </p>
          </div>
          <div className="grid grid-cols-4 gap-0 divide-x" style={{ borderColor: 'var(--border)' }}>
            {eea.map((e) => (
              <div key={e.name} className="px-5 py-4 text-center">
                <div className="text-xl font-black" style={{ color: 'var(--green-800)' }}>{e.value}</div>
                <div className="text-xs font-medium mt-0.5">{e.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--green-600)' }}>
                  {e.trend.startsWith('+') ? '▲' : e.trend === '0%' ? '→' : '▼'} {e.trend}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{e.src}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
