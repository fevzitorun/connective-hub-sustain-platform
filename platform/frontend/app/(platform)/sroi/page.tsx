'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type CatalogItem = { label: string; unit: string; proxy_eur: number; description: string; sdg: string }
type LineItem = { label: string; quantity: number; unit: string; proxy_eur: number; total_value_eur: number; sdg: string }
type SROIResult = {
  sroi_ratio: number; sroi_label: string
  total_investment_eur: number; total_social_value_eur: number
  summary: string; line_items: LineItem[]
  breakdown_pct: Record<string, number>; un_sdgs: string[]
}

const PRIORITY_COLORS: Record<string, string> = {
  'Olağanüstü Etki': '#10b981',
  'Yüksek Etki':     '#3b82f6',
  'İyi Etki':        '#8b5cf6',
  'Pozitif Etki':    '#f59e0b',
  'Sınırlı Etki':   '#ef4444',
}

export default function SROIPage() {
  const [catalog, setCatalog] = useState<Record<string, CatalogItem>>({})
  const [investment, setInvestment] = useState('')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<SROIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  useEffect(() => {
    api.sroi.catalog()
      .then(d => setCatalog((d as { catalog: Record<string, CatalogItem> }).catalog))
      .catch(() => toast.error('Katalog yüklenemedi'))
  }, [])

  function handleInput(key: string, val: string) {
    setInputs(prev => ({ ...prev, [key]: val }))
  }

  async function handleCalculate() {
    const numericInputs: Record<string, number> = {}
    for (const [k, v] of Object.entries(inputs)) {
      const n = parseFloat(v)
      if (!isNaN(n) && n > 0) numericInputs[k] = n
    }
    if (!investment || parseFloat(investment) <= 0) {
      toast.error('Toplam yatırım tutarını girin')
      return
    }
    setLoading(true)
    try {
      const res = await api.sroi.calculate({ investment_eur: parseFloat(investment), inputs: numericInputs })
      setResult(res)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Hesaplama hatası')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemo() {
    setDemoLoading(true)
    try {
      const res = await api.sroi.demo()
      setResult(res as SROIResult)
    } catch {
      toast.error('Demo yüklenemedi')
    } finally {
      setDemoLoading(false)
    }
  }

  const ratioColor = result ? (PRIORITY_COLORS[result.sroi_label] ?? '#64748b') : '#64748b'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>
            SROI Hesaplayıcı
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Social Return on Investment · UK Social Value Act · EU Taxonomy Social Pillar
          </p>
        </div>
        <button
          onClick={handleDemo} disabled={demoLoading}
          className="px-4 py-2 rounded-xl text-sm font-bold border"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          {demoLoading ? 'Yükleniyor…' : '🎯 Demo Verilerle Göster'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT PANEL */}
        <div className="rounded-2xl border p-6 space-y-5" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            Sosyal Yatırım Girdileri
          </h2>

          {/* Toplam yatırım */}
          <div>
            <label className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
              Toplam Sosyal Yatırım (€)
            </label>
            <input
              type="number" placeholder="örn: 850000"
              value={investment} onChange={e => setInvestment(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }} />
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Eğitim, toplum projeleri, çeşitlilik, yenilenebilir enerji yatırımları toplamı
            </p>
          </div>

          {/* Katalog girdileri */}
          <div className="space-y-3">
            {Object.entries(catalog).map(([key, item]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{item.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#dbeafe', color: '#1e40af' }}>
                      {item.sdg}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {item.description} · {item.proxy_eur.toLocaleString()}€/{item.unit}
                  </p>
                </div>
                <input
                  type="number" placeholder="0" min="0"
                  value={inputs[key] || ''}
                  onChange={e => handleInput(key, e.target.value)}
                  className="w-20 px-2 py-1.5 rounded-lg border text-sm text-right"
                  style={{ borderColor: 'var(--border)', background: 'var(--background)' }} />
              </div>
            ))}
          </div>

          <button
            onClick={handleCalculate} disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: 'var(--green-700)' }}>
            {loading ? 'Hesaplanıyor…' : 'SROI Hesapla'}
          </button>
        </div>

        {/* RESULT PANEL */}
        <div>
          {!result ? (
            <div className="rounded-2xl border p-8 flex flex-col items-center justify-center h-full text-center space-y-3"
              style={{ borderColor: 'var(--border)', borderStyle: 'dashed' }}>
              <div className="text-4xl">📊</div>
              <p className="font-bold" style={{ color: 'var(--green-900)' }}>Sonuç burada görünecek</p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Girdileri doldurun veya demo verilerle hızlı önizleme yapın
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SROI Ratio — Hero Card */}
              <div className="rounded-2xl p-6 text-white text-center" style={{ background: `linear-gradient(135deg, ${ratioColor}, ${ratioColor}cc)` }}>
                <div className="text-6xl font-black">{result.sroi_ratio.toFixed(1)}x</div>
                <div className="text-lg font-bold mt-1 opacity-90">{result.sroi_label}</div>
                <div className="text-sm opacity-75 mt-1">
                  Harcanan her <strong>1€</strong> için <strong>{result.sroi_ratio.toFixed(1)}€</strong> toplumsal değer
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 border text-center" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-xl font-black" style={{ color: 'var(--green-800)' }}>
                    €{result.total_investment_eur.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Toplam Yatırım</div>
                </div>
                <div className="rounded-xl p-4 border text-center" style={{ borderColor: 'var(--green-400)' }}>
                  <div className="text-xl font-black" style={{ color: 'var(--green-700)' }}>
                    €{result.total_social_value_eur.toLocaleString()}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Sosyal Değer Yaratıldı</div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl p-4 text-xs leading-relaxed"
                style={{ background: 'var(--green-50)', color: 'var(--green-900)' }}>
                {result.summary}
              </div>

              {/* Line Items */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'var(--green-50)', color: 'var(--green-900)' }}>
                  Etki Dökümü
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {result.line_items.map(li => (
                    <div key={li.label} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{li.label}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {li.quantity} {li.unit} × €{li.proxy_eur.toLocaleString()} · {li.sdg}
                        </div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: 'var(--green-700)' }}>
                        €{li.total_value_eur.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SDGs */}
              {result.un_sdgs.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>BM SDG'leri:</span>
                  {result.un_sdgs.map(sdg => (
                    <span key={sdg} className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#dbeafe', color: '#1e40af' }}>
                      {sdg}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
