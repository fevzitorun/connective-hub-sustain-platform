'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { api } from '@/lib/api'

interface Disclosure { id: string; ref: string; title: string; desc: string }
interface ESRSStd { standard: string; title: string; icon: string; color: string; disclosures: Disclosure[] }
interface WaterType { id: string; label: string; label_tr: string; icon: string; color: string; desc: string; examples: string[] }
interface WaterResult {
  company_name: string; sector: string
  water: { withdrawal_m3: number; consumed_m3: number; high_stress: boolean; footprint_types: WaterType[] }
  circular: { waste_tonnes: number; recycled_pct: number }
  esrs_env: ESRSStd[]
  completed_disclosures: string[]
  completeness_pct: number; done: number; total: number
  recommendations: Array<{ priority: string; ref: string; action: string }>
}

const TABS = ['Overview', 'ESRS E2–E5', 'Water Footprint', 'Assess'] as const
type Tab = typeof TABS[number]

function PrioBadge({ p }: { p: string }) {
  const m: Record<string, string> = { High: 'bg-red-500/20 text-red-400 border-red-500/30', Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30', Low: 'bg-slate-600 text-slate-400 border-slate-500' }
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${m[p] ?? m.Low}`}>{p}</span>
}

export default function WaterESRSPage() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [data, setData] = useState<WaterResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [localDone, setLocalDone] = useState<string[]>([])
  const [form, setForm] = useState({ company_name: '', sector: '', withdrawal: '', consumed: '', high_stress: false, waste: '', recycled: '' })
  const [assessing, setAssessing] = useState(false)

  useEffect(() => {
    api.waterEsrs.demo().then(d => {
      const r = d as WaterResult; setData(r); setLocalDone(r.completed_disclosures)
    }).finally(() => setLoading(false))
  }, [])

  function toggleDisc(id: string) {
    setLocalDone(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  async function handleAssess() {
    setAssessing(true)
    try {
      const res = await api.waterEsrs.assess({
        company_name: form.company_name || 'My Company',
        sector: form.sector || 'General',
        water_withdrawal_m3: parseFloat(form.withdrawal) || 0,
        water_consumed_m3: parseFloat(form.consumed) || 0,
        operates_in_high_stress: form.high_stress,
        completed_disclosures: localDone,
        waste_generated_tonnes: parseFloat(form.waste) || 0,
        recycled_pct: parseFloat(form.recycled) || 0,
      })
      setData(res as WaterResult); setTab('Overview')
    } finally { setAssessing(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="text-center"><div className="text-4xl mb-4">💧</div><div className="text-slate-400">Water & ESRS yükleniyor…</div></div>
    </div>
  )
  if (!data) return null

  const completeness = Math.round(localDone.length / data.total * 100)
  const complianceBar = data.esrs_env.map(e => ({
    name: e.standard,
    done: e.disclosures.filter(d => localDone.includes(d.id)).length,
    total: e.disclosures.length,
    color: e.color,
  }))
  const waterPie = [
    { name: 'Consumed', value: data.water.consumed_m3, color: '#0891b2' },
    { name: 'Returned', value: Math.max(0, data.water.withdrawal_m3 - data.water.consumed_m3), color: '#334155' },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💧</span>
          <div>
            <h1 className="text-2xl font-black">Water + ESRS E2–E5</h1>
            <p className="text-slate-400 text-sm">ISO 14046 Su Ayak İzi · ESRS E2 Kirlilik · E3 Su · E4 Biyoçeşitlilik · E5 Döngüsel Ekonomi</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ISO 14046', 'ESRS E2', 'ESRS E3', 'ESRS E4', 'ESRS E5'].map(b => (
            <span key={b} className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">{b}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-800 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Su Çekimi</div>
              <div className="text-2xl font-black text-blue-400">{(data.water.withdrawal_m3 / 1000).toFixed(0)}<span className="text-base text-slate-400"> k m³</span></div>
              {data.water.high_stress && <div className="text-xs text-red-400 font-medium mt-1">⚠ Yüksek stres bölgesi</div>}
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Su Tüketimi</div>
              <div className="text-2xl font-black text-cyan-400">{(data.water.consumed_m3 / 1000).toFixed(0)}<span className="text-base text-slate-400"> k m³</span></div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Geri Dönüşüm</div>
              <div className="text-2xl font-black text-emerald-400">{data.circular.recycled_pct}<span className="text-base text-slate-400">%</span></div>
              <div className="text-xs text-slate-400 mt-1">Hedef: 30%+</div>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">ESRS Tamamlama</div>
              <div className="text-2xl font-black text-white">{completeness}<span className="text-base text-slate-400">%</span></div>
              <div className="text-xs text-slate-400 mt-1">{localDone.length}/{data.total} açıklama</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">ESRS E2–E5 Tamamlama</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={complianceBar}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 'dataMax']} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} formatter={(v) => [Number(v ?? 0) + ' disclosure', '']} />
                  <Bar dataKey="done" name="Completed" radius={[4, 4, 0, 0]}>
                    {complianceBar.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                  <Bar dataKey="total" name="Total" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Su Kullanımı</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={waterPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {waterPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v) => [Number(v ?? 0).toLocaleString('tr-TR') + ' m³', '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.recommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">Öncelikli Aksiyonlar</h3>
              <div className="space-y-3">
                {data.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/40">
                    <PrioBadge p={r.priority} />
                    <div><div className="text-sm text-slate-200">{r.action}</div><div className="text-xs text-slate-500 mt-0.5">{r.ref}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ESRS E2-E5 ── */}
      {tab === 'ESRS E2–E5' && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completeness}%` }} />
            </div>
            <div className="text-sm font-bold text-emerald-400">{completeness}% tamamlandı</div>
          </div>
          {data.esrs_env.map(esrs => (
            <div key={esrs.standard} className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{esrs.icon}</span>
                <div>
                  <div className="font-black text-white">{esrs.standard} — {esrs.title}</div>
                  <div className="text-xs text-slate-400">{esrs.disclosures.filter(d => localDone.includes(d.id)).length}/{esrs.disclosures.length} tamamlandı</div>
                </div>
                <div className="ml-auto w-24 h-2 rounded-full bg-slate-700">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(esrs.disclosures.filter(d => localDone.includes(d.id)).length / esrs.disclosures.length * 100)}%`, background: esrs.color }} />
                </div>
              </div>
              <div className="space-y-2">
                {esrs.disclosures.map(d => {
                  const done = localDone.includes(d.id)
                  return (
                    <button key={d.id} onClick={() => toggleDisc(d.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${done ? 'border-opacity-40 bg-opacity-5' : 'border-slate-700 bg-slate-700/20 hover:bg-slate-700/40'}`}
                      style={done ? { borderColor: esrs.color, background: esrs.color + '08' } : {}}>
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${done ? 'text-white' : 'bg-slate-700 text-slate-400'}`}
                        style={done ? { background: esrs.color } : {}}>
                        {done ? '✓' : '○'}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${done ? 'line-through opacity-60' : 'text-white'}`}>{d.ref} — {d.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{d.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Water Footprint ── */}
      {tab === 'Water Footprint' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="text-slate-400 text-sm"><strong className="text-blue-300">ISO 14046:2014</strong> — Water Footprint: Su tüketimini kaynak tipine (mavi/yeşil/gri) ve stres bölgesine göre niceliğe dönüştürür.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.water.footprint_types.map(wt => (
              <div key={wt.id} className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                <div className="text-3xl mb-3">{wt.icon}</div>
                <div className="font-bold text-white mb-1">{wt.label}</div>
                <div className="text-xs font-semibold mb-2" style={{ color: wt.color }}>{wt.label_tr}</div>
                <div className="text-sm text-slate-400 mb-3">{wt.desc}</div>
                <div className="flex flex-wrap gap-1">
                  {wt.examples.map(e => (
                    <span key={e} className="px-2 py-0.5 rounded-lg text-xs bg-slate-700 text-slate-300">{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Assess ── */}
      {tab === 'Assess' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Şirket Adı</label>
              <input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="örn. Ereğli Demir Çelik"
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sektör</label>
              <input value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} placeholder="örn. Çelik Üretimi"
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Su Çekimi (m³/yıl)</label>
              <input type="number" value={form.withdrawal} onChange={e => setForm(f => ({ ...f, withdrawal: e.target.value }))} placeholder="e.g. 2800000"
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Su Tüketimi (m³/yıl)</label>
              <input type="number" value={form.consumed} onChange={e => setForm(f => ({ ...f, consumed: e.target.value }))} placeholder="e.g. 1100000"
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atık (ton/yıl)</label>
              <input type="number" value={form.waste} onChange={e => setForm(f => ({ ...f, waste: e.target.value }))} placeholder="e.g. 45000"
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Geri Dönüşüm Oranı (%)</label>
              <input type="number" value={form.recycled} onChange={e => setForm(f => ({ ...f, recycled: e.target.value }))} placeholder="e.g. 38"
                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.high_stress} onChange={e => setForm(f => ({ ...f, high_stress: e.target.checked }))} className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-sm text-slate-300">Yüksek su stresi olan bölgede faaliyet gösteriyorum</span>
          </label>
          <button onClick={handleAssess} disabled={assessing}
            className="w-full py-3.5 rounded-2xl text-white font-black text-base bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all">
            {assessing ? 'Değerlendiriliyor…' : 'Water + ESRS E2-E5 Değerlendirmesini Başlat →'}
          </button>
        </div>
      )}
    </div>
  )
}
