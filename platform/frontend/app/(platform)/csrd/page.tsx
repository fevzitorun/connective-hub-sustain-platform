'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────────────────
interface MatItem {
  topic_id: string; topic_name: string; category: string
  impact_score: number; financial_score: number; is_material: boolean; priority: string
}
interface Matrix {
  company_id: string; sector: string
  material_topics: string[]; top_priorities: string[]; items: MatItem[]
}

// ── ESRS Disclosure Requirements (per topic) ─────────────────────────────────
const ESRS_DISCLOSURES: Record<string, { standards: string[]; key_metrics: string[]; deadline: string }> = {
  E1: {
    standards: ['ESRS E1 — İklim Değişikliği', 'TCFD uyumlu', 'GHG Protocol'],
    key_metrics: ['Kapsam 1/2/3 emisyonları (tCO₂e)', 'Karbon yoğunluğu', 'Net sıfır yol haritası', 'Karbon fiyatı senaryoları'],
    deadline: 'Ocak 2025 (Büyük şirketler) · Ocak 2026 (Orta ölçekli)',
  },
  E2: {
    standards: ['ESRS E2 — Hava Kirliliği'],
    key_metrics: ['NOx, SOx, PM emisyonları', 'Kirletici madde envanteri', 'İzleme prosedürleri'],
    deadline: 'Ocak 2026',
  },
  E3: {
    standards: ['ESRS E3 — Su & Deniz Kaynakları'],
    key_metrics: ['Su çekimi (m³)', 'Su tüketimi yoğunluğu', 'Su stresi bölge açıklaması'],
    deadline: 'Ocak 2026',
  },
  E4: {
    standards: ['ESRS E4 — Biyoçeşitlilik & Ekosistem', 'TNFD uyumlu'],
    key_metrics: ['Hassas ekosistem yakınlığı', 'Arazi kullanım değişikliği', 'Doğa etkisi senaryoları'],
    deadline: 'Ocak 2026',
  },
  E5: {
    standards: ['ESRS E5 — Kaynak Kullanımı & Döngüsel Ekonomi'],
    key_metrics: ['Malzeme tüketimi (ton)', 'Geri dönüştürülmüş içerik oranı', 'Atık üretimi (ton)'],
    deadline: 'Ocak 2026',
  },
  S1: {
    standards: ['ESRS S1 — Kendi İşgücü', 'ILO çekirdek konvansiyonları'],
    key_metrics: ['Cinsiyet ücret farkı (%)', 'İSG olay oranı', 'Eğitim saatleri/çalışan'],
    deadline: 'Ocak 2025',
  },
  S2: {
    standards: ['ESRS S2 — Değer Zinciri İşçileri'],
    key_metrics: ['Tedarikçi insan hakları denetimi', 'Yüksek riskli tedarikçi oranı (%)'],
    deadline: 'Ocak 2026',
  },
  S3: {
    standards: ['ESRS S3 — Etkilenen Topluluklar'],
    key_metrics: ['Topluluk katılım mekanizmaları', 'Şikayet sayısı & çözüm oranı'],
    deadline: 'Ocak 2026',
  },
  S4: {
    standards: ['ESRS S4 — Tüketiciler & Müşteriler', 'GDPR / KVKK uyumu'],
    key_metrics: ['Ürün güvenliği ihlalleri', 'Veri ihlali sayısı', 'Müşteri memnuniyet skoru'],
    deadline: 'Ocak 2026',
  },
  G1: {
    standards: ['ESRS G1 — İş Yönetimi', 'OECD Anti-Bribery'],
    key_metrics: ['Yolsuzluk vakası sayısı', 'Etik eğitim kapsamı (%)', 'Kurumsal vergi oran açıklaması'],
    deadline: 'Ocak 2025',
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = { Çevre: '#10b981', Sosyal: '#3b82f6', Yönetim: '#8b5cf6' }
const PRIORITY_COLOR: Record<string, string> = { Kritik: '#ef4444', Yüksek: '#f59e0b', Orta: '#3b82f6', Düşük: '#64748b' }

const SECTORS = ['bankacılık','imalat','çimento','enerji','default']
const SECTOR_LABELS: Record<string, string> = {
  bankacılık: 'Bankacılık / Finans', imalat: 'İmalat / Sanayi', çimento: 'Çimento / İnşaat Malz.',
  enerji: 'Enerji / Yenilenebilir', default: 'Genel / Diğer',
}

// Custom scatter dot
const MatDot = (props: { cx?: number; cy?: number; payload?: MatItem; r?: number }) => {
  const { cx = 0, cy = 0, payload } = props
  if (!payload) return null
  const color = CAT_COLOR[payload.category] ?? '#94a3b8'
  const r = payload.priority === 'Kritik' ? 14 : payload.priority === 'Yüksek' ? 11 : 8
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={payload.is_material ? 0.85 : 0.2}
        stroke={color} strokeWidth={payload.is_material ? 2 : 1} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={700} fill="#fff">
        {payload.topic_id}
      </text>
    </g>
  )
}

// Custom tooltip
const MatTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: MatItem }[] }) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="font-black text-white mb-1">{d.topic_id} — {d.topic_name}</p>
      <p style={{ color: CAT_COLOR[d.category] }}>{d.category}</p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-slate-400">Etki Önemliliği: <span className="text-white font-bold">{d.impact_score}/5</span></p>
        <p className="text-slate-400">Finansal Önemlilik: <span className="text-white font-bold">{d.financial_score}/5</span></p>
        <p style={{ color: PRIORITY_COLOR[d.priority] ?? '#94a3b8' }} className="font-bold mt-1">{d.priority}</p>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CSRDPage() {
  const [matrix, setMatrix] = useState<Matrix | null>(null)
  const [loading, setLoading] = useState(false)
  const [sector, setSector] = useState('imalat')
  const [activeTab, setActiveTab] = useState<'matrix' | 'topics' | 'timeline' | 'gaps'>('matrix')
  const [selected, setSelected] = useState<MatItem | null>(null)

  // Custom score overrides per topic
  const [customScores, setCustomScores] = useState<Record<string, { impact: number; financial: number }>>({})
  const [editMode, setEditMode] = useState(false)

  const loadMatrix = useCallback(async (sec: string, scores?: typeof customScores) => {
    setLoading(true)
    try {
      const data = await (api.materiality.assess as (d: { sector: string; custom_scores?: unknown }) => Promise<Matrix>)({
        sector: sec,
        custom_scores: scores && Object.keys(scores).length > 0 ? scores : undefined,
      })
      setMatrix(data)
    } catch {
      toast.error('Matris yüklenemedi')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadMatrix(sector) }, [sector, loadMatrix])

  const handleScoreChange = (topicId: string, dim: 'impact' | 'financial', val: number) => {
    setCustomScores(prev => ({
      ...prev,
      [topicId]: { ...(prev[topicId] ?? { impact: 3, financial: 3 }), [dim]: val },
    }))
  }

  const applyCustomScores = () => {
    loadMatrix(sector, customScores)
    setEditMode(false)
    toast.success('Özelleştirilmiş matris oluşturuldu')
  }

  const materialItems = matrix?.items.filter(i => i.is_material) ?? []
  const criticalItems = matrix?.items.filter(i => i.priority === 'Kritik') ?? []
  const coverageGaps = materialItems.filter(i => !ESRS_DISCLOSURES[i.topic_id])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">CSRD Çift Önemlilik Matrisi</h1>
          <p className="text-slate-400 text-sm mt-1">
            ESRS Standartları · AB Kurumsal Sürdürülebilirlik Raporlama Direktifi (2022/2464) · Çift Önemlilik Analizi
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={sector} onChange={e => setSector(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500">
            {SECTORS.map(s => <option key={s} value={s}>{SECTOR_LABELS[s]}</option>)}
          </select>
          <button onClick={() => setEditMode(m => !m)}
            className="text-xs px-4 py-2.5 rounded-lg border font-bold transition-colors"
            style={{
              background: editMode ? '#059669' : 'transparent',
              borderColor: editMode ? '#059669' : '#334155',
              color: editMode ? '#fff' : '#94a3b8',
            }}>
            ✏️ Özelleştir
          </button>
        </div>
      </div>

      {/* Custom score edit panel */}
      {editMode && matrix && (
        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6">
          <p className="text-sm font-bold text-white mb-4">Paydaş Puanlaması — Her ESRS Konusu için Önemlilik Skoru (1-5)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            {matrix.items.map(item => {
              const cur = customScores[item.topic_id] ?? { impact: item.impact_score, financial: item.financial_score }
              return (
                <div key={item.topic_id} className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black px-2 py-0.5 rounded"
                      style={{ background: (CAT_COLOR[item.category] ?? '#64748b') + '25', color: CAT_COLOR[item.category] ?? '#64748b' }}>
                      {item.topic_id}
                    </span>
                    <span className="text-xs text-white font-semibold">{item.topic_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Etki Önemliliği</label>
                      <input type="range" min={1} max={5} step={0.5}
                        value={cur.impact}
                        onChange={e => handleScoreChange(item.topic_id, 'impact', Number(e.target.value))}
                        className="w-full accent-emerald-500" />
                      <span className="text-xs text-emerald-400 font-bold">{cur.impact}</span>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Finansal Önemlilik</label>
                      <input type="range" min={1} max={5} step={0.5}
                        value={cur.financial}
                        onChange={e => handleScoreChange(item.topic_id, 'financial', Number(e.target.value))}
                        className="w-full accent-blue-500" />
                      <span className="text-xs text-blue-400 font-bold">{cur.financial}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <button onClick={applyCustomScores}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-colors">
            ✓ Matrisi Güncelle
          </button>
        </div>
      )}

      {/* KPI strip */}
      {matrix && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Önemli Konu', value: `${materialItems.length}/10`, sub: 'ESRS kapsamında', color: '#10b981' },
            { label: 'Kritik Konu', value: criticalItems.length, sub: 'Acil açıklama', color: '#ef4444' },
            { label: 'CSRD Uyum', value: `%${Math.round(materialItems.length / 10 * 100)}`, sub: 'Kapsama oranı', color: '#3b82f6' },
            { label: 'Top Öncelik', value: matrix.top_priorities.join(' · '), sub: 'Öncelikli 3 konu', color: '#f59e0b' },
          ].map(k => (
            <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-500 mb-1">{k.label}</div>
              <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-600 mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 w-fit flex-wrap">
        {[
          { k: 'matrix',   l: '🎯 Matris' },
          { k: 'topics',   l: '📋 ESRS Konuları' },
          { k: 'timeline', l: '🗓️ CSRD Takvimi' },
          { k: 'gaps',     l: '⚠️ Açıklama Boşlukları' },
        ].map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k as typeof activeTab)}
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-all"
            style={{
              background: activeTab === t.k ? '#059669' : 'transparent',
              color: activeTab === t.k ? '#fff' : '#94a3b8',
            }}>
            {t.l}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400 animate-pulse">Matris hesaplanıyor...</p>
        </div>
      )}

      {/* ── Matrix Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'matrix' && matrix && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scatter plot */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-white">Çift Önemlilik Matrisi</p>
                <p className="text-xs text-slate-500 mt-0.5">X: Finansal Önemlilik · Y: Etki Önemliliği · Sektör: {SECTOR_LABELS[sector]}</p>
              </div>
              <div className="flex gap-3 text-xs">
                {Object.entries(CAT_COLOR).map(([cat, color]) => (
                  <span key={cat} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-slate-400">{cat}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="h-[420px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="financial_score" domain={[0, 5.5]}
                    label={{ value: 'Finansal Önemlilik →', position: 'bottom', fill: '#64748b', fontSize: 11 }}
                    tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="number" dataKey="impact_score" domain={[0, 5.5]}
                    label={{ value: '← Etki Önemliliği', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                    tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  {/* Threshold lines */}
                  <ReferenceLine x={3} stroke="#334155" strokeDasharray="6 3" label={{ value: 'Eşik', fill: '#475569', fontSize: 9, position: 'top' }} />
                  <ReferenceLine y={3} stroke="#334155" strokeDasharray="6 3" />
                  {/* Quadrant labels */}
                  <Tooltip content={<MatTooltip />} />
                  <Scatter data={matrix.items} shape={<MatDot />}
                    onClick={(d) => setSelected(d as unknown as MatItem)}>
                    {matrix.items.map(item => (
                      <Cell key={item.topic_id} fill={CAT_COLOR[item.category] ?? '#94a3b8'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Quadrant legend */}
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              {[
                { label: 'Öncelikli Materyal', desc: 'Yüksek Etki + Yüksek Finansal', color: '#ef4444', q: 'top-right' },
                { label: 'Etki Materyali', desc: 'Yüksek Etki, Düşük Finansal', color: '#10b981', q: 'top-left' },
                { label: 'Finansal Materyal', desc: 'Düşük Etki, Yüksek Finansal', color: '#3b82f6', q: 'bottom-right' },
                { label: 'Materyal Değil', desc: 'Düşük Etki + Düşük Finansal', color: '#475569', q: 'bottom-left' },
              ].map(q => (
                <div key={q.q} className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: q.color }} />
                  <div>
                    <span className="font-semibold text-white">{q.label}</span>
                    <span className="text-slate-500 block">{q.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel: selected or top priorities */}
          <div className="space-y-4">
            {selected ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black" style={{ color: CAT_COLOR[selected.category] }}>{selected.topic_id}</span>
                    <span className="text-sm font-bold text-white">{selected.topic_name}</span>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-white text-xs">✕</button>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold mb-3 inline-block"
                  style={{ background: (PRIORITY_COLOR[selected.priority] ?? '#64748b') + '20', color: PRIORITY_COLOR[selected.priority] ?? '#64748b' }}>
                  {selected.priority}
                </span>
                <div className="space-y-2 text-xs mt-3">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-500">Etki Önemliliği</span>
                    <span className="font-bold text-emerald-400">{selected.impact_score}/5</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-500">Finansal Önemlilik</span>
                    <span className="font-bold text-blue-400">{selected.financial_score}/5</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Materyal mi?</span>
                    <span className={selected.is_material ? 'font-bold text-emerald-400' : 'text-slate-500'}>{selected.is_material ? 'Evet' : 'Hayır'}</span>
                  </div>
                </div>
                {ESRS_DISCLOSURES[selected.topic_id] && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs font-bold text-slate-400 mb-2">Zorunlu Metrikler</p>
                    <div className="space-y-1">
                      {ESRS_DISCLOSURES[selected.topic_id].key_metrics.map((m, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs">
                          <span className="text-slate-600 mt-0.5">□</span>
                          <span className="text-slate-400">{m}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-amber-400 mt-3">📅 {ESRS_DISCLOSURES[selected.topic_id].deadline}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Top 3 Öncelikli Konu</p>
                {matrix.top_priorities.map((tid, i) => {
                  const item = matrix.items.find(x => x.topic_id === tid)
                  if (!item) return null
                  return (
                    <button key={tid} onClick={() => setSelected(item)}
                      className="w-full flex items-center gap-3 py-2.5 border-b border-slate-800 last:border-0 hover:bg-white/[0.02] rounded transition-colors text-left">
                      <span className="text-lg font-black" style={{ color: CAT_COLOR[item.category] }}>#{i + 1}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{item.topic_id} — {item.topic_name}</p>
                        <p className="text-xs" style={{ color: PRIORITY_COLOR[item.priority] }}>{item.priority}</p>
                      </div>
                    </button>
                  )
                })}
                <p className="text-xs text-slate-600 mt-4">Bir noktaya tıklayarak detay görün</p>
              </div>
            )}

            {/* Material count by category */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kategori Özeti</p>
              {Object.entries(CAT_COLOR).map(([cat, color]) => {
                const catItems = matrix.items.filter(i => i.category === cat)
                const matCnt = catItems.filter(i => i.is_material).length
                return (
                  <div key={cat} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-xs text-slate-400">{cat}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color }}>
                      {matCnt}/{catItems.length} materyal
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Topics Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'topics' && matrix && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <p className="text-sm font-bold text-white">ESRS Konu Detayları</p>
            <p className="text-xs text-slate-500 mt-0.5">10 konu (E1-E5, S1-S4, G1) · Sektör: {SECTOR_LABELS[sector]}</p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 border-b border-slate-800">
                <th className="px-4 py-3 text-left">Konu</th>
                <th className="px-4 py-3 text-center">Kategori</th>
                <th className="px-4 py-3 text-center">Etki</th>
                <th className="px-4 py-3 text-center">Finansal</th>
                <th className="px-4 py-3 text-center">Öncelik</th>
                <th className="px-4 py-3 text-center">Materyal</th>
                <th className="px-4 py-3 text-left">Anahtar Metrikler</th>
              </tr>
            </thead>
            <tbody>
              {matrix.items.map(item => {
                const disc = ESRS_DISCLOSURES[item.topic_id]
                return (
                  <tr key={item.topic_id} className="border-b border-slate-800/60 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="font-black" style={{ color: CAT_COLOR[item.category] }}>{item.topic_id}</span>
                      <span className="text-slate-300 ml-2">{item.topic_name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold"
                        style={{ background: (CAT_COLOR[item.category] ?? '#64748b') + '20', color: CAT_COLOR[item.category] ?? '#64748b' }}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-400">{item.impact_score}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-400">{item.financial_score}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold" style={{ color: PRIORITY_COLOR[item.priority] ?? '#64748b' }}>{item.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.is_material ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {disc?.key_metrics.slice(0, 2).join(' · ') ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Timeline Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm font-bold text-white mb-5">CSRD Uygulama Takvimi</p>
            <div className="space-y-4">
              {[
                { date: 'Ocak 2025', label: 'Büyük Şirketler (>500 çalışan)', topics: ['E1 İklim','S1 İşgücü','G1 Yönetim'], color: '#ef4444', done: true },
                { date: 'Ocak 2026', label: 'Büyük Şirketler (tam kapsam)', topics: ['Tüm ESRS (E1-E5, S1-S4, G1)'], color: '#f59e0b', done: false },
                { date: 'Ocak 2027', label: 'Orta Ölçekli Şirketler', topics: ['Basitleştirilmiş LSME ESRS'], color: '#3b82f6', done: false },
                { date: '2026-2029', label: 'CBAM Sertifika Sistemi Devreye Giriyor', topics: ['CBAM ücretlendirmesi başlar'], color: '#8b5cf6', done: false },
                { date: 'Ocak 2028', label: 'Küçük Borsaya Kayıtlı Şirketler', topics: ['Küçük borsaya kayıtlı + isteğe bağlı'], color: '#10b981', done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-28 text-xs font-bold text-right" style={{ color: item.color }}>
                    {item.date}
                  </div>
                  <div className="flex-shrink-0 w-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 mt-0.5" style={{ background: item.done ? item.color : 'transparent', borderColor: item.color }} />
                    {i < 4 && <div className="w-px flex-1 mt-1" style={{ background: '#1e293b', minHeight: 32 }} />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.topics.map((t, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: item.color + '20', color: item.color }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6">
            <p className="text-sm font-bold text-amber-400 mb-3">🇹🇷 Türk Şirketler için CSRD Kapsamı</p>
            <div className="space-y-2 text-xs">
              {[
                'AB\'de kurulu büyük şirketler → Doğrudan CSRD yükümlüsü (Ocak 2025/2026)',
                'AB\'ye ihracat yapan Türk şirketler → Tedarik zinciri açıklaması talebi alacak (S2 ESRS)',
                'AB bankasından kredi kullananlar → SFDR Article 8/9 için ESRS veri talebi',
                'CBAM kapsamı ürünler → E1 emisyon açıklaması zorunlu',
                'TSE / KAP raporlaması → Gönüllü CSRD uyumu Türk sermaye piyasaları için avantaj',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">▸</span>
                  <span className="text-amber-200/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Gaps Tab ────────────────────────────────────────────────────────── */}
      {activeTab === 'gaps' && matrix && !loading && (
        <div className="space-y-4">
          {materialItems.map(item => {
            const disc = ESRS_DISCLOSURES[item.topic_id]
            if (!disc) return null
            return (
              <div key={item.topic_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black" style={{ color: CAT_COLOR[item.category] }}>{item.topic_id}</span>
                    <span className="text-sm font-bold text-white">{item.topic_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: (PRIORITY_COLOR[item.priority] ?? '#64748b') + '20', color: PRIORITY_COLOR[item.priority] ?? '#64748b' }}>
                      {item.priority}
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 font-mono">📅 {disc.deadline}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Uygulanan Standartlar</p>
                    <div className="space-y-1">
                      {disc.standards.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <span className="text-emerald-400">▸</span><span className="text-slate-400">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">Zorunlu Açıklama Metrikleri</p>
                    <div className="space-y-1">
                      {disc.key_metrics.map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-600">□</span><span className="text-slate-400">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {materialItems.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-slate-400">Matris sekmesinden sektör seçin ve analizi çalıştırın.</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-700 text-center">
        CSRD — AB Direktifi 2022/2464 · ESRS 1 & 2 + Tematik Standartlar · Çift Önemlilik: EFRAG Rehberi 2023
      </p>
    </div>
  )
}
