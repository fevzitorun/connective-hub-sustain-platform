'use client'
import { useState } from 'react'

type Assignment = {
  id: string
  company: string
  flag: string
  sector: string
  reportingYear: number
  standard: string
  assignedDate: string
  dueDate: string
  status: 'pending' | 'in_review' | 'flagged' | 'approved'
  modules: Module[]
  auditorNotes: string
}

type Module = {
  name: string
  standard: string
  status: 'ok' | 'flagged' | 'pending' | 'na'
  note?: string
}

const ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    company: 'Arçelik A.Ş.',
    flag: '🇹🇷',
    sector: 'Üretim / Tüketici Elektroniği',
    reportingYear: 2023,
    standard: 'TSRS 1+2',
    assignedDate: '2026-06-15',
    dueDate: '2026-07-31',
    status: 'in_review',
    auditorNotes: '',
    modules: [
      { name: 'Kapsam 1 Emisyonları', standard: 'TSRS 1', status: 'ok' },
      { name: 'Kapsam 2 Emisyonları', standard: 'TSRS 1', status: 'ok' },
      { name: 'Kapsam 3 Kategori 1-15', standard: 'TSRS 1', status: 'flagged', note: 'Cat 11 kullanılan ürünler eksik veri' },
      { name: 'İklim Riski Yönetimi', standard: 'TSRS 2', status: 'pending' },
      { name: 'Senaryo Analizi (SSP)', standard: 'TSRS 2', status: 'pending' },
      { name: 'Hedefler ve Taahhütler', standard: 'TSRS 1', status: 'ok' },
    ],
  },
  {
    id: 'a2',
    company: 'Koç Holding A.Ş.',
    flag: '🇹🇷',
    sector: 'Konglomera / Holding',
    reportingYear: 2023,
    standard: 'TSRS 1+2 + GRI',
    assignedDate: '2026-06-20',
    dueDate: '2026-08-15',
    status: 'pending',
    auditorNotes: '',
    modules: [
      { name: 'Kapsam 1 Emisyonları', standard: 'TSRS 1', status: 'pending' },
      { name: 'Kapsam 2 Emisyonları', standard: 'TSRS 1', status: 'pending' },
      { name: 'Kapsam 3 Kategori 1-15', standard: 'TSRS 1', status: 'pending' },
      { name: 'Fiziksel İklim Riski', standard: 'TSRS 2', status: 'pending' },
      { name: 'Geçiş Riski Analizi', standard: 'TSRS 2', status: 'pending' },
      { name: 'GRI 305 Emisyon Açıklamaları', standard: 'GRI', status: 'pending' },
    ],
  },
]

const STATUS_CONFIG = {
  pending:   { label: 'Pending',    bg: '#fef3c7', text: '#92400e', icon: '⏳' },
  in_review: { label: 'In Review',  bg: '#dbeafe', text: '#1e40af', icon: '🔍' },
  flagged:   { label: 'Flagged',    bg: '#fee2e2', text: '#991b1b', icon: '🚩' },
  approved:  { label: 'Approved',   bg: '#dcfce7', text: '#166534', icon: '✅' },
}

const MODULE_STATUS = {
  ok:      { label: 'Verified',    bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
  flagged: { label: 'Flagged',     bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  pending: { label: 'To Review',   bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  na:      { label: 'N/A',         bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' },
}

const TSRS_CHECKLIST = [
  { article: 'Md.6', title: 'Yönetişim açıklamaları', required: true },
  { article: 'Md.10', title: 'Strateji — iklim riski entegrasyonu', required: true },
  { article: 'Md.16', title: 'Risk yönetimi süreci', required: true },
  { article: 'Md.29(a)', title: 'Fiziksel riskler (akut + kronik)', required: true },
  { article: 'Md.29(b)', title: 'Geçiş riskleri', required: true },
  { article: 'Md.33', title: 'Sera gazı emisyon ölçümleri', required: true },
  { article: 'Md.33(b)', title: 'Kapsam 1, 2, 3 ayrıştırması', required: true },
  { article: 'Md.34', title: 'İklim hedefleri ve ilerleme', required: true },
  { article: 'Md.B1-B5', title: 'Senaryo analizi (en az 2 senaryo)', required: false },
  { article: 'Md.B14', title: 'Finanse edilen emisyonlar (finans sektörü)', required: false },
]

export default function DenetciPage() {
  const [selected, setSelected] = useState<Assignment>(ASSIGNMENTS[0])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})

  const toggleCheck = (article: string) => {
    setChecklistState(prev => ({ ...prev, [article]: !prev[article] }))
  }

  const checkedCount = Object.values(checklistState).filter(Boolean).length
  const requiredCount = TSRS_CHECKLIST.filter(i => i.required).length

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">⚖️</span>
              <h1 className="text-2xl font-black text-white">KGK Bağımsız Denetçi Portalı</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                TSRS 1+2
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Sürdürülebilirlik raporlarını gözden geçirin · TSRS uyum kontrolü · KGK'ya hazır güvence mektubu
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
            <span className="text-blue-400 text-sm">🏛️</span>
            <div>
              <div className="text-xs font-bold text-blue-300">Sadece Okuma Yetkisi</div>
              <div className="text-xs text-slate-500">Read-only — veriler değiştirilemez</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 flex gap-6">

        {/* Left: Assignment list */}
        <div className="w-80 flex-shrink-0 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atanan Şirketler</h2>
          {ASSIGNMENTS.map(a => {
            const st = STATUS_CONFIG[a.status]
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected.id === a.id
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm text-white">{a.flag} {a.company}</div>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: st.bg, color: st.text }}>
                    {st.icon} {st.label}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{a.standard} · {a.reportingYear}</div>
                <div className="text-xs text-slate-500 mt-1">Due: {a.dueDate}</div>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(a.modules.filter(m => m.status === 'ok').length / a.modules.length) * 100}%`
                    }}
                  />
                </div>
              </button>
            )
          })}

          {/* TSRS compliance score */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
            <div className="text-xs font-bold text-slate-300 mb-2">TSRS Kontrol Listesi</div>
            <div className="text-3xl font-black text-emerald-400 mb-1">{checkedCount}/{requiredCount}</div>
            <div className="text-xs text-slate-500">zorunlu madde tamamlandı</div>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(checkedCount / requiredCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Review workspace */}
        <div className="flex-1 space-y-4">

          {/* Company header */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-black text-white mb-1">
                  {selected.flag} {selected.company}
                </div>
                <div className="text-sm text-slate-400">{selected.sector} · Raporlama yılı: {selected.reportingYear}</div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">
                    {selected.standard}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-400">
                    Atanma: {selected.assignedDate}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    Son tarih: {selected.dueDate}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                  📥 Raporu İndir
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                  ✅ Güvence Ver
                </button>
              </div>
            </div>
          </div>

          {/* Module review */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Modül İnceleme Durumu</h3>
            <div className="space-y-2">
              {selected.modules.map((mod, i) => {
                const ms = MODULE_STATUS[mod.status]
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: ms.dot }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{mod.name}</div>
                      {mod.note && <div className="text-xs text-red-400 mt-0.5">⚠ {mod.note}</div>}
                    </div>
                    <span className="text-xs text-slate-500">{mod.standard}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: ms.bg, color: ms.text }}
                    >
                      {ms.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TSRS checklist */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4">
              TSRS Uyum Kontrol Listesi
              <span className="ml-2 text-xs font-normal text-slate-500">(KGK TSRS 1 ve TSRS 2 maddelerine göre)</span>
            </h3>
            <div className="space-y-2">
              {TSRS_CHECKLIST.map(item => (
                <label
                  key={item.article}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={!!checklistState[item.article]}
                    onChange={() => toggleCheck(item.article)}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span className="text-xs font-mono text-emerald-400 w-16 flex-shrink-0">{item.article}</span>
                  <span className="text-sm text-slate-300 flex-1">{item.title}</span>
                  {item.required ? (
                    <span className="text-xs text-red-400 flex-shrink-0">zorunlu</span>
                  ) : (
                    <span className="text-xs text-slate-600 flex-shrink-0">opsiyonel</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Auditor notes */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Denetçi Notları</h3>
            <textarea
              value={notes[selected.id] ?? ''}
              onChange={e => setNotes(prev => ({ ...prev, [selected.id]: e.target.value }))}
              placeholder="Bu rapora ilişkin bulgularınızı ve açıklamalarınızı buraya ekleyin..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex gap-3 mt-3">
              <button className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                🚩 Bayrakla — Düzeltme Gerekli
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                ✅ Onayla — Güvence Mektubu Oluştur
              </button>
            </div>
          </div>

          {/* KGK submission */}
          <div className="bg-gradient-to-r from-blue-900/30 to-slate-900/30 rounded-xl p-5 border border-blue-500/20">
            <div className="flex items-start gap-4">
              <span className="text-2xl">🏛️</span>
              <div className="flex-1">
                <div className="font-bold text-blue-300 mb-1">KGK Sürdürülebilirlik Portalı</div>
                <div className="text-xs text-slate-400 mb-3">
                  Onaylanan rapor KGK'nın dijital platformuna doğrudan gönderilebilir.
                  Güvence mektubu otomatik oluşturulur ve XBRL formatında dışa aktarılır.
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    📋 XBRL Çıktısı
                  </button>
                  <button className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    📤 KGK'ya Gönder
                  </button>
                  <a
                    href="https://www.kgk.gov.tr/surdurulebilirlik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 text-slate-400 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    🔗 KGK.gov.tr →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
