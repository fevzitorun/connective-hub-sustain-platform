'use client'
import { useEffect, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts'
import { api } from '@/lib/api'

type MatrixItem = {
  topic_id: string
  topic_name: string
  category: string
  impact_score: number
  financial_score: number
  is_material: boolean
  priority: string
}

const PRIORITY_COLOR: Record<string, string> = {
  Kritik: '#B71C1C',
  Yüksek: '#E65100',
  Orta:   '#F57F17',
  Düşük:  '#9E9E9E',
}

const CATEGORY_SHAPE: Record<string, string> = {
  'Çevre':   '🌿',
  'Sosyal':  '👥',
  'Yönetim': '🏛️',
}

const pillars = [
  {
    key: 'E', label: 'Çevre', icon: '🌿', score: 78,
    items: ['Karbon emisyonları: 16.920 ton CO₂e', 'Su tüketimi: 45.200 m³', 'Atık geri dönüşüm: %67', 'Yenilenebilir enerji: %34'],
  },
  {
    key: 'S', label: 'Sosyal', icon: '👥', score: 82,
    items: ['Toplam çalışan: 1.240', 'Kadın yönetici: %38', 'Eğitim saati/kişi: 42 saat', 'İş kazası sıklık hızı: 1.2'],
  },
  {
    key: 'G', label: 'Yönetim', icon: '🏛️', score: 71,
    items: ['Bağımsız üye: %45', 'Sürd. komitesi: Var', 'ESG hedefleri yönetici KPI\'sında: Hayır', 'TSRS denetimi: Sınırlı güvence'],
  },
]

function CustomDot(props: { cx?: number; cy?: number; payload?: MatrixItem }) {
  const { cx = 0, cy = 0, payload } = props
  if (!payload) return null
  const color = PRIORITY_COLOR[payload.priority] ?? '#9E9E9E'
  const r = payload.priority === 'Kritik' ? 14 : payload.priority === 'Yüksek' ? 11 : 9
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.85} stroke="white" strokeWidth={1.5} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="white" fontWeight="bold">
        {payload.topic_id}
      </text>
    </g>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: MatrixItem }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white rounded-xl border shadow-lg p-3 text-xs max-w-48" style={{ borderColor: 'var(--border)' }}>
      <p className="font-bold mb-1" style={{ color: PRIORITY_COLOR[d.priority] }}>{d.topic_id} — {d.topic_name}</p>
      <p style={{ color: 'var(--muted-foreground)' }}>Kategori: {CATEGORY_SHAPE[d.category]} {d.category}</p>
      <p style={{ color: 'var(--muted-foreground)' }}>Etki Önemliliği: {d.impact_score}/5</p>
      <p style={{ color: 'var(--muted-foreground)' }}>Finansal Önemlilik: {d.financial_score}/5</p>
      <p className="mt-1 font-semibold" style={{ color: PRIORITY_COLOR[d.priority] }}>Öncelik: {d.priority}</p>
    </div>
  )
}

export default function EsgPage() {
  const [tab, setTab] = useState<'esg' | 'materiality'>('esg')
  const [matrix, setMatrix] = useState<MatrixItem[]>([])
  const [topPriorities, setTopPriorities] = useState<string[]>([])
  const [matLoading, setMatLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'materiality') return
    setMatLoading(true)
    api.materiality.myMatrix()
      .then((d) => {
        const data = d as { items: MatrixItem[]; top_priorities: string[] }
        setMatrix(data.items)
        setTopPriorities(data.top_priorities)
      })
      .catch(() => {
        // Fallback statik veri
        setMatrix([
          { topic_id: 'E1', topic_name: 'İklim Değişikliği',      category: 'Çevre',   impact_score: 3.5, financial_score: 4.2, is_material: true,  priority: 'Kritik' },
          { topic_id: 'E2', topic_name: 'Hava Kirliliği',          category: 'Çevre',   impact_score: 1.5, financial_score: 2.0, is_material: false, priority: 'Düşük' },
          { topic_id: 'E3', topic_name: 'Su & Deniz Kaynakları',   category: 'Çevre',   impact_score: 1.8, financial_score: 2.5, is_material: false, priority: 'Düşük' },
          { topic_id: 'E4', topic_name: 'Biyoçeşitlilik',          category: 'Çevre',   impact_score: 2.0, financial_score: 3.0, is_material: true,  priority: 'Orta' },
          { topic_id: 'E5', topic_name: 'Döngüsel Ekonomi',        category: 'Çevre',   impact_score: 2.2, financial_score: 2.8, is_material: false, priority: 'Düşük' },
          { topic_id: 'S1', topic_name: 'Kendi İşgücü',            category: 'Sosyal',  impact_score: 3.0, financial_score: 3.2, is_material: true,  priority: 'Orta' },
          { topic_id: 'S2', topic_name: 'Değer Zinciri İşçileri',  category: 'Sosyal',  impact_score: 3.8, financial_score: 4.5, is_material: true,  priority: 'Kritik' },
          { topic_id: 'S3', topic_name: 'Etkilenen Topluluklar',   category: 'Sosyal',  impact_score: 2.5, financial_score: 3.0, is_material: true,  priority: 'Orta' },
          { topic_id: 'S4', topic_name: 'Tüketiciler',             category: 'Sosyal',  impact_score: 4.0, financial_score: 4.8, is_material: true,  priority: 'Kritik' },
          { topic_id: 'G1', topic_name: 'İş Yönetimi',             category: 'Yönetim', impact_score: 4.5, financial_score: 4.9, is_material: true,  priority: 'Kritik' },
        ])
      })
      .finally(() => setMatLoading(false))
  }, [tab])

  const scatterData = matrix.map(m => ({ ...m, x: m.impact_score, y: m.financial_score }))

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>ESG Performans Panosu</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Çevre · Sosyal · Yönetim — GRI Universal Standards 2021 · CSRD ESRS
        </p>
      </div>

      {/* Sekme seçici */}
      <div className="flex gap-1 mb-5 rounded-xl border p-1" style={{ borderColor: 'var(--border)', background: 'var(--green-50)', width: 'fit-content' }}>
        {[
          { key: 'esg',         label: '📊 ESG Paneli' },
          { key: 'materiality', label: '🎯 Çift Önemlilik (CSRD)' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as 'esg' | 'materiality')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={tab === t.key
              ? { background: 'var(--green-700)', color: 'white' }
              : { color: 'var(--muted-foreground)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ESG Paneli */}
      {tab === 'esg' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {pillars.map(p => (
              <div key={p.key} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <div className="px-5 py-4" style={{ background: 'var(--green-900)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-2xl font-black text-white">{p.score}</span>
                  </div>
                  <p className="text-white font-bold">{p.label}</p>
                  <div className="mt-2 w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <div className="h-1.5 rounded-full bg-white" style={{ width: `${p.score}%` }} />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {p.items.map(item => (
                    <p key={item} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>• {item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">👥 Sosyal (S) Derinlemesine Analiz</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-600">Çeşitlilik (Kadın Yönetici Oranı)</span>
                    <span className="font-bold text-slate-800">%38</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '38%' }}></div></div>
                  <p className="text-xs text-slate-500 mt-1">Sektör Ortalaması: %24</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-600">İş Güvenliği (LTI Rate)</span>
                    <span className="font-bold text-slate-800">1.2</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div></div>
                  <p className="text-xs text-slate-500 mt-1">1 Milyon saatte kaybedilen zaman. Hedef: &lt;1.0</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-600">Çalışan Eğitim Süresi</span>
                    <span className="font-bold text-slate-800">42 Saat/Yıl</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">🏛️ Yönetişim (G) Derinlemesine Analiz</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-600">Yönetim Kurulu Bağımsızlığı</span>
                    <span className="font-bold text-slate-800">%45</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div></div>
                  <p className="text-xs text-slate-500 mt-1">Önerilen minimum: %50</p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-600">Kurumsal Etik Eğitimi Katılımı</span>
                    <span className="font-bold text-slate-800">%98</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-600">ESG Yönetici Performans Kriteri</span>
                    <span className="font-bold text-red-500">Uygulanmıyor</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-slate-200 h-2 rounded-full" style={{ width: '10%' }}></div></div>
                  <p className="text-xs text-slate-500 mt-1">Yöneticilerin bonusları henüz ESG hedeflerine bağlı değil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSRD Çift Önemlilik */}
      {tab === 'materiality' && (
        <div className="space-y-5">
          {/* Başlık ve açıklama */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm mb-1" style={{ color: 'var(--green-900)' }}>
              CSRD Çift Önemlilik Matrisi
            </h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              X ekseni: Etki Önemliliği — şirketin toplum/çevre üzerindeki etkisi (1-5)
              <br />
              Y ekseni: Finansal Önemlilik — konunun şirketi finansal etkileme potansiyeli (1-5)
              <br />
              Kesişim noktası ≥3.0 olan konular <strong>önemli (material)</strong> kabul edilir.
            </p>
            {topPriorities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--green-900)' }}>En Yüksek Öncelik:</span>
                {topPriorities.map(id => (
                  <span key={id} className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#FFEBEE', color: '#B71C1C' }}>{id}</span>
                ))}
              </div>
            )}
          </div>

          {/* Scatter chart */}
          <div className="bg-white rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>Önemlilik Matrisi</h2>
              {matLoading && <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--green-300)', borderTopColor: 'transparent' }} />}
            </div>
            <div style={{ height: 360, padding: '16px 8px 8px 8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" dataKey="x" domain={[0, 5.5]} tick={{ fontSize: 11 }}>
                    <Label value="Etki Önemliliği →" position="bottom" offset={12} style={{ fontSize: 11, fill: '#6B7280' }} />
                  </XAxis>
                  <YAxis type="number" dataKey="y" domain={[0, 5.5]} tick={{ fontSize: 11 }}>
                    <Label value="Finansal Önemlilik →" angle={-90} position="left" offset={0} style={{ fontSize: 11, fill: '#6B7280' }} />
                  </YAxis>
                  <ReferenceLine x={3} stroke="#1B5E20" strokeDasharray="4 2" strokeWidth={1.5} />
                  <ReferenceLine y={3} stroke="#1B5E20" strokeDasharray="4 2" strokeWidth={1.5} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter
                    data={scatterData}
                    shape={(props: unknown) => <CustomDot {...(props as Parameters<typeof CustomDot>[0])} />}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Konu listesi */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>ESRS Konu Detayları</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {matrix.map(item => (
                <div key={item.topic_id} className="px-5 py-3 flex items-center gap-4">
                  <span className="w-8 text-center font-bold text-xs"
                    style={{ color: PRIORITY_COLOR[item.priority] }}>{item.topic_id}</span>
                  <span className="text-base">{CATEGORY_SHAPE[item.category]}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.topic_name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Etki: {item.impact_score} · Finansal: {item.financial_score}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: PRIORITY_COLOR[item.priority] + '20', color: PRIORITY_COLOR[item.priority] }}>
                      {item.priority}
                    </span>
                    {item.is_material && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: '#dcfce7', color: '#166534' }}>Önemli</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
