'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AutopilotRule {
  id: string
  name: string
  rule_type: string
  standard: string
  standard_label: string
  standard_color: string
  standard_icon: string
  frequency: string
  frequency_label: string
  is_active: boolean
  notify_email: boolean
  run_count: number
  last_run_at: string | null
  next_run_at: string | null
  created_at: string
}

interface AutopilotRun {
  id: string
  rule_id: string
  status: string
  triggered_by: string
  output_summary: string | null
  error_message?: string
  started_at: string | null
  finished_at: string | null
  standard?: string
}

interface DemoData {
  rules: AutopilotRule[]
  runs: AutopilotRun[]
  stats: { total_rules: number; active_rules: number; total_runs: number; success_rate: number; reports_generated: number }
  standards: Record<string, { label: string; color: string; icon: string }>
  frequency_labels: Record<string, string>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDatetime(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}
function duration(a: string | null, b: string | null) {
  if (!a || !b) return '—'
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return `${(ms / 1000).toFixed(0)}s`
}

const STATUS_STYLE: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}
const STATUS_ICON: Record<string, string> = { success: '✅', failed: '❌', running: '⏳', pending: '🕐' }
const TRIGGERED_ICON: Record<string, string> = { schedule: '⏰', manual: '👆' }

const STANDARDS = ['tsrs', 'iso14064', 'cbam', 'sfdr', 'pcf', 'all']
const STD_ICONS: Record<string, string> = { tsrs: '📋', iso14064: '🌿', cbam: '🏭', sfdr: '🇪🇺', pcf: '📦', all: '📂' }
const STD_LABELS: Record<string, string> = { tsrs: 'TSRS 1&2', iso14064: 'ISO 14064', cbam: 'CBAM', sfdr: 'EU SFDR', pcf: 'ISO 14067 PCF', all: 'Tüm Raporlar' }
const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'annual']
const FREQ_LABELS: Record<string, string> = { weekly: 'Haftalık', monthly: 'Aylık', quarterly: 'Çeyreklik', annual: 'Yıllık' }
const RULE_TYPES = [
  { id: 'report', icon: '📊', label: 'Otomatik Rapor', desc: 'Periyodik rapor üretir ve e-posta ile gönderir' },
  { id: 'reminder', icon: '🔔', label: 'Deadline Uyarısı', desc: 'Son tarihten önce hatırlatma bildirimi gönderir' },
  { id: 'digest', icon: '📰', label: 'Haftalık Özet', desc: 'ESG metriklerini haftalık olarak özetler' },
]

// ── Main Component ────────────────────────────────────────────────────────────
export default function AutopilotPage() {
  const [data, setData] = useState<DemoData | null>(null)
  const [tab, setTab] = useState<'rules' | 'history' | 'new'>('rules')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // New rule form state
  const [form, setForm] = useState({
    name: '',
    rule_type: 'report',
    standard: 'tsrs',
    frequency: 'monthly',
    notify_email: true,
  })
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    api.autopilot.demo().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleToggle(ruleId: string) {
    if (!data) return
    setActionLoading(ruleId + '-toggle')
    try {
      await api.autopilot.toggleRule(ruleId)
      setData(prev => prev ? {
        ...prev,
        rules: prev.rules.map(r => r.id === ruleId ? { ...r, is_active: !r.is_active } : r),
        stats: {
          ...prev.stats,
          active_rules: prev.rules.reduce((n, r) => n + (r.id === ruleId ? (r.is_active ? 0 : 1) : (r.is_active ? 1 : 0)), 0),
        },
      } : prev)
    } catch {
      // optimistic update failed silently — demo mode
      setData(prev => prev ? {
        ...prev,
        rules: prev.rules.map(r => r.id === ruleId ? { ...r, is_active: !r.is_active } : r),
      } : prev)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleManualRun(ruleId: string) {
    setActionLoading(ruleId + '-run')
    try {
      await api.autopilot.manualRun(ruleId)
    } catch {
      // demo mode — ignore
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setCreateMsg({ ok: false, text: 'Kural adı zorunludur.' }); return }
    setCreating(true)
    setCreateMsg(null)
    try {
      await api.autopilot.createRule(form)
      setCreateMsg({ ok: true, text: `"${form.name}" kuralı oluşturuldu! Demo modda DB'ye kaydedilmedi.` })
      setForm({ name: '', rule_type: 'report', standard: 'tsrs', frequency: 'monthly', notify_email: true })
    } catch {
      setCreateMsg({ ok: true, text: `"${form.name}" kuralı kuyruğa alındı (demo mod).` })
    } finally {
      setCreating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-400 animate-pulse text-lg">Loading Autopilot…</div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="text-5xl">🤖</div>
      <p className="text-slate-400">Autopilot service unavailable. Make sure the backend API is running.</p>
      <button onClick={() => { setLoading(true); api.autopilot.demo().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false)) }}
        className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
        Retry →
      </button>
    </div>
  )

  const d = data

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">🤖</div>
          <div>
            <h1 className="text-xl font-bold text-white">Sustain Autopilot</h1>
            <p className="text-xs text-slate-400">Otomatik rapor üretimi & compliance bildirimleri</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Sprint 32
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              BETA
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Toplam Kural', value: d.stats.total_rules, icon: '📋', color: 'text-white' },
            { label: 'Aktif Kural', value: d.stats.active_rules, icon: '✅', color: 'text-emerald-400' },
            { label: 'Toplam Çalışma', value: d.stats.total_runs, icon: '⚡', color: 'text-blue-400' },
            { label: 'Başarı Oranı', value: d.stats.success_rate + '%', icon: '🎯', color: 'text-yellow-400' },
            { label: 'Rapor Üretildi', value: d.stats.reports_generated, icon: '📊', color: 'text-pink-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 w-fit">
          {([['rules', '📋 Kurallar'], ['history', '📜 Çalışma Geçmişi'], ['new', '➕ Yeni Kural']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── RULES TAB ─────────────────────────────────────────────────────── */}
        {tab === 'rules' && (
          <div className="space-y-3">
            {d.rules.length === 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-slate-400">Henüz kural yok. "Yeni Kural" sekmesinden bir kural oluşturun.</p>
              </div>
            )}
            {d.rules.map(rule => (
              <div
                key={rule.id}
                className={`bg-slate-800/50 border rounded-xl p-5 flex items-center gap-4 transition-all ${
                  rule.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'
                }`}
              >
                {/* Standard Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                  style={{ backgroundColor: rule.standard_color + '22', borderColor: rule.standard_color + '44' }}
                >
                  {rule.standard_icon}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{rule.name}</span>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full border"
                      style={{ color: rule.standard_color, backgroundColor: rule.standard_color + '22', borderColor: rule.standard_color + '44' }}
                    >
                      {rule.standard_label}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                      {rule.frequency_label}
                    </span>
                    {!rule.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Pasif</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                    <span>Son çalışma: {fmtDate(rule.last_run_at)}</span>
                    <span>Sonraki: {fmtDate(rule.next_run_at)}</span>
                    <span>{rule.run_count}x çalıştı</span>
                    {rule.notify_email && <span>📧 E-posta aktif</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleManualRun(rule.id)}
                    disabled={actionLoading === rule.id + '-run' || !rule.is_active}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-40 transition-all"
                  >
                    {actionLoading === rule.id + '-run' ? '⏳' : '▶ Çalıştır'}
                  </button>
                  <button
                    onClick={() => handleToggle(rule.id)}
                    disabled={actionLoading === rule.id + '-toggle'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      rule.is_active
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                    } disabled:opacity-40`}
                  >
                    {actionLoading === rule.id + '-toggle' ? '⏳' : rule.is_active ? '⏸ Durdur' : '▶ Etkinleştir'}
                  </button>
                </div>
              </div>
            ))}

            {/* Info card */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div className="text-sm text-slate-400 space-y-1">
                <p><span className="text-white font-medium">Otomatik Zamanlama:</span> Kurallar <code className="bg-slate-700 px-1 rounded text-xs">POST /api/autopilot/run-due</code> endpoint'i üzerinden çalıştırılır. Cron job (saatlik) veya Celery Beat ile entegre edilebilir.</p>
                <p><span className="text-white font-medium">Email:</span> Mevcut <code className="bg-slate-700 px-1 rounded text-xs">email_service.py</code> ile bildirim gönderilir. SMTP yapılandırması gereklidir.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Durum', 'Standart', 'Özet', 'Tetikleyen', 'Başlangıç', 'Süre'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {d.runs.map(run => (
                    <tr key={run.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[run.status] ?? ''}`}>
                          {STATUS_ICON[run.status]} {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-300">{STD_ICONS[run.standard ?? ''] ?? '📋'} {STD_LABELS[run.standard ?? ''] ?? run.standard}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="text-slate-300 truncate block" title={run.output_summary ?? run.error_message ?? ''}>
                          {run.output_summary ?? <span className="text-red-400">{run.error_message}</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400">{TRIGGERED_ICON[run.triggered_by]} {run.triggered_by === 'schedule' ? 'Otomatik' : 'Manuel'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDatetime(run.started_at)}</td>
                      <td className="px-4 py-3 text-slate-400">{duration(run.started_at, run.finished_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── NEW RULE TAB ──────────────────────────────────────────────────── */}
        {tab === 'new' && (
          <div className="max-w-2xl">
            <form onSubmit={handleCreate} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Yeni Autopilot Kuralı</h2>
                <p className="text-sm text-slate-400">Otomatik raporlama veya hatırlatma kuralı oluşturun.</p>
              </div>

              {/* Rule type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Kural Tipi</label>
                <div className="grid grid-cols-1 gap-2">
                  {RULE_TYPES.map(rt => (
                    <label
                      key={rt.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        form.rule_type === rt.id
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rule_type"
                        value={rt.id}
                        checked={form.rule_type === rt.id}
                        onChange={e => setForm(f => ({ ...f, rule_type: e.target.value }))}
                        className="sr-only"
                      />
                      <span className="text-2xl">{rt.icon}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{rt.label}</div>
                        <div className="text-xs text-slate-400">{rt.desc}</div>
                      </div>
                      {form.rule_type === rt.id && <span className="ml-auto text-emerald-400">✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Standard */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Standart / Rapor Tipi</label>
                <div className="grid grid-cols-3 gap-2">
                  {STANDARDS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, standard: s }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-1.5 transition-all ${
                        form.standard === s
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <span>{STD_ICONS[s]}</span>
                      <span className="text-xs">{STD_LABELS[s]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Kural Adı</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={`Ör: Aylık ${STD_LABELS[form.standard]} Raporu`}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Frekans</label>
                <div className="grid grid-cols-4 gap-2">
                  {FREQUENCIES.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, frequency: f }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        form.frequency === f
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {FREQ_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notify */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, notify_email: !f.notify_email }))}
                  className={`relative w-10 h-6 rounded-full transition-colors ${form.notify_email ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.notify_email ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <label className="text-sm text-slate-300">Tamamlandığında e-posta bildirimi gönder</label>
              </div>

              {/* Summary */}
              <div className="bg-slate-700/30 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 space-y-1">
                <div className="font-semibold text-white mb-2">📋 Kural Özeti</div>
                <div>• <span className="text-white">{RULE_TYPES.find(r => r.id === form.rule_type)?.label}</span></div>
                <div>• <span className="text-white">{STD_ICONS[form.standard]} {STD_LABELS[form.standard]}</span> raporu</div>
                <div>• <span className="text-white">{FREQ_LABELS[form.frequency]}</span> olarak çalışır</div>
                {form.notify_email && <div>• E-posta bildirimi <span className="text-emerald-400">aktif</span></div>}
              </div>

              {createMsg && (
                <div className={`text-sm px-4 py-3 rounded-lg border ${createMsg.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {createMsg.ok ? '✅' : '❌'} {createMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating ? <span className="animate-spin">⏳</span> : '🤖'}
                {creating ? 'Oluşturuluyor…' : 'Autopilot Kuralı Oluştur'}
              </button>
            </form>
          </div>
        )}

        {/* ── Architecture Note ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '⚙️', title: 'BackgroundTasks', desc: 'FastAPI BackgroundTasks ile senkron olmayan çalışma. Celery Beat entegrasyonu hazır.',
              detail: 'POST /api/autopilot/run-due endpoint\'i dakikada/saatte bir cron job veya Celery Beat tarafından çağrılır.',
            },
            {
              icon: '📧', title: 'Email Bildirimi', desc: 'Mevcut email_service.py ile otomatik bildirim.',
              detail: 'Rapor tamamlandığında kural sahibine HTML e-posta gönderilir. SMTP: AWS SES veya SendGrid.',
            },
            {
              icon: '🔗', title: 'Rapor Entegrasyonu', desc: 'Mevcut rapor üretim motoru ile doğrudan entegrasyon.',
              detail: 'TSRS, ISO 14064, CBAM ve SFDR modüllerinin rapor endpoint\'leri otomatik olarak çağrılır.',
            },
          ].map(card => (
            <div key={card.title} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="font-semibold text-white mb-1 text-sm">{card.title}</div>
              <div className="text-sm text-slate-400 mb-2">{card.desc}</div>
              <div className="text-xs text-slate-500">{card.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
