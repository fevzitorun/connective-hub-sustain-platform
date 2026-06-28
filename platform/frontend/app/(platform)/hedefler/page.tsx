'use client'
import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

const milestones = [
  { year: 2024, done: true,  text: 'TSRS 1 & 2 Uyumlu Rapor Yayınlandı' },
  { year: 2025, done: true,  text: 'SBTi Taahhüdü İmzalandı' },
  { year: 2026, done: false, text: 'Kapsam 3 Envanter Tamamlanacak' },
  { year: 2027, done: false, text: 'İlk Bağımsız Doğrulama (GDS 3000)' },
  { year: 2030, done: false, text: 'Kapsam 1 & 2 Ara Hedef: %42 Azaltım' },
  { year: 2050, done: false, text: 'Net Sıfır — Tüm Kapsamlar' },
]

const targets = [
  { id: 1, name: 'Net Sıfır Emisyon',   type: 'SBTi',       deadline: '2050', progress: 18, status: 'aktif',  detail: 'Kapsam 1 ve 2 için 2030\'a kadar %42 azaltım' },
  { id: 2, name: 'Kapsam 1 & 2 Azaltım', type: 'SBTi 1.5°C', deadline: '2030', progress: 34, status: 'aktif',  detail: '2030\'a kadar baz yıla göre %42 azaltım' },
  { id: 3, name: 'Yenilenebilir Enerji',  type: 'RE100',      deadline: '2030', progress: 22, status: 'aktif',  detail: 'Tüm operasyonlarda %100 yenilenebilir enerji' },
  { id: 4, name: 'Kapsam 3 Azaltım',     type: 'SBTi FLAG',  deadline: '2030', progress: 8,  status: 'taslak', detail: 'Finanse edilen emisyonlarda %25 azaltım' },
]

type TrendPoint = { year: number; total: number }

export default function HedeflerPage() {
  const router = useRouter()
  const [trendData, setTrendData] = useState<{ year: number; mevcut: number; sbti: number; netSıfır: number }[]>([])
  const [gap2030, setGap2030] = useState<number | null>(null)
  const [compliant, setCompliant] = useState<boolean | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // En son rapor ID'sini alıp hedef verilerini yükle
    api.reports.list()
      .then(async (reports) => {
        const list = reports as { id: string; status: string }[]
        const latest = list.find(r => r.status === 'completed' || r.status === 'approved')
        if (!latest) throw new Error('Tamamlanmış rapor yok')
        return api.targets.fromReport(latest.id)
      })
      .then((data) => {
        const d = data as {
          current_trend: TrendPoint[]
          sbti_target_path: TrendPoint[]
          net_zero_path: TrendPoint[]
          gap_2030: number
          sbti_compliant: boolean
          recommendations: string[]
        }
        const merged = d.current_trend.map((p, i) => ({
          year: p.year,
          mevcut: Math.round(p.total / 1000),          // bin ton
          sbti: Math.round(d.sbti_target_path[i]?.total / 1000) || 0,
          netSıfır: Math.round(d.net_zero_path[i]?.total / 1000) || 0,
        }))
        setTrendData(merged)
        setGap2030(d.gap_2030)
        setCompliant(d.sbti_compliant)
        setRecommendations(d.recommendations)
      })
      .catch(() => {
        // Fallback statik veri
        setTrendData([
          { year: 2026, mevcut: 200, sbti: 185, netSıfır: 185 },
          { year: 2028, mevcut: 208, sbti: 167, netSıfır: 162 },
          { year: 2030, mevcut: 216, sbti: 150, netSıfır: 140 },
          { year: 2032, mevcut: 224, sbti: 135, netSıfır: 118 },
          { year: 2035, mevcut: 236, sbti: 112, netSıfır: 88 },
          { year: 2040, mevcut: 252, sbti: 80,  netSıfır: 52 },
          { year: 2050, mevcut: 280, sbti: 40,  netSıfır: 20 },
        ])
        setGap2030(66000)
        setCompliant(false)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header title="🎯 Hedefler & Net Sıfır Yol Haritası" subtitle="SBTi · RE100 · Net Sıfır 2050" />
      <div className="p-6 flex-1 space-y-5">

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'SBTi Durumu',      value: 'Taahhüt Verildi', icon: '✅', sub: 'Şubat 2025' },
            { label: 'Azaltım Hedefi',   value: '%42',             icon: '📉', sub: 'Kapsam 1 & 2 · 2030' },
            { label: 'Yenilenebilir',     value: '%22 / %100',     icon: '☀️', sub: 'Mevcut / Hedef' },
            {
              label: '2030 Boşluğu',
              value: gap2030 !== null ? `${Math.round(gap2030 / 1000)}k ton` : '—',
              icon: compliant === true ? '✅' : '⚠️',
              sub: compliant === true ? 'SBTi Uyumlu' : 'Ek azaltım gerekiyor',
            },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* SBTi Trend Grafiği */}
        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>
                Emisyon Yolu: Mevcut Gidişat vs SBTi Hedef
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                bin ton CO₂e · SBTi 1.5°C uyumlu hedef yolu
              </p>
            </div>
            {loading && (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--green-300)', borderTopColor: 'transparent' }} />
            )}
          </div>
          <div className="p-4" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="k" />
                <Tooltip
                  formatter={(v, name) => [`${v ?? 0}k ton CO₂e`, name as string]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine x={2030} stroke="#F57F17" strokeDasharray="4 2" label={{ value: '2030 Hedefi', fontSize: 11, fill: '#F57F17' }} />
                <Line name="Mevcut Gidişat" dataKey="mevcut" stroke="#EF5350" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line name="SBTi 1.5°C Yolu" dataKey="sbti" stroke="#1565C0" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                <Line name="Net Sıfır Yolu" dataKey="netSıfır" stroke="#1B5E20" strokeWidth={1.5} strokeDasharray="3 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Önerileri */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>🤖 SBTi Hedef Önerileri</h2>
            </div>
            <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recommendations.map((rec, i) => (
                <li key={i} className="px-5 py-3 flex items-start gap-3 text-sm">
                  <span className="text-base mt-0.5">{i === 0 ? '🔴' : i === 1 ? '🟡' : '🟢'}</span>
                  <span style={{ color: 'var(--foreground)' }}>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hedefler listesi */}
        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>İklim Hedefleri</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>SBTi · RE100 · TSRS 2 Madde 33</p>
            </div>
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-white" style={{ background: 'var(--green-700)' }}>
              + Yeni Hedef
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {targets.map((t) => (
              <div key={t.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: t.type.includes('SBTi') ? '#dcfce7' : '#dbeafe', color: t.type.includes('SBTi') ? '#166534' : '#1e40af' }}>
                        {t.type}
                      </span>
                      {t.status === 'taslak' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Taslak</span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{t.detail}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--muted-foreground)' }}>İlerleme (2019 → {t.deadline})</span>
                          <span className="font-semibold" style={{ color: 'var(--green-700)' }}>%{t.progress}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${t.progress}%`, background: 'var(--green-500)' }} />
                        </div>
                      </div>
                      <div className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>
                        <div className="font-semibold" style={{ color: 'var(--green-800)' }}>Hedef: {t.deadline}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yol haritası */}
        <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>Net Sıfır Yol Haritası</h2>
          </div>
          <div className="px-5 py-4">
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: 'var(--green-200)' }} />
              <div className="space-y-4">
                {milestones.map((m) => (
                  <div key={m.year} className="flex items-start gap-4 pl-8 relative">
                    <div className="absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: m.done ? 'var(--green-600)' : 'white', color: m.done ? 'white' : 'var(--green-600)', border: '2px solid var(--green-600)' }}>
                      {m.done ? '✓' : '○'}
                    </div>
                    <div>
                      <span className="font-bold text-sm" style={{ color: 'var(--green-800)' }}>{m.year}</span>
                      <span className="text-sm ml-2">{m.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
