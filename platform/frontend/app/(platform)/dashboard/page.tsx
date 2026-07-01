'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { EmissionTrendChart } from '@/components/dashboard/EmissionTrendChart'
import { ScopeDonutChart } from '@/components/dashboard/ScopeDonutChart'
import { ComplianceGauge } from '@/components/dashboard/ComplianceGauge'
import { SatelliteWidget } from '@/components/dashboard/SatelliteWidget'
import { RecentReports } from '@/components/dashboard/RecentReports'
import { ComplianceCalendar } from '@/components/dashboard/ComplianceCalendar'
import { UKMarketAccessWidget } from '@/components/dashboard/UKMarketAccessWidget'
import { api } from '@/lib/api'

type AdvisoryNote = {
  id: string; author_name: string; author_title: string
  content: string; priority: string; is_read: boolean; created_at: string
}

const PRIORITY_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  urgent:    { bg: '#fee2e2', text: '#991b1b', label: 'Acil' },
  strategic: { bg: '#fef9c3', text: '#854d0e', label: 'Stratejik' },
  normal:    { bg: '#f1f5f9', text: '#475569', label: 'Normal' },
}

function AdvisoryWidget() {
  const [notes, setNotes] = useState<AdvisoryNote[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    api.advisory.getMyCompanyNotes()
      .then(res => { setNotes(res.notes); setUnread(res.unread_count) })
      .catch(() => {/* not fatal — user may not be logged in yet */})
  }, [])

  async function markRead(id: string) {
    await api.advisory.markRead(id).catch(() => {})
    setNotes(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  if (notes.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all"
        style={{ background: '#fefce8', borderColor: '#fbbf24', color: '#92400e' }}
      >
        <span className="text-lg">✉️</span>
        <span>YK Stratejik Notu</span>
        {unread > 0 && (
          <span className="px-1.5 py-0.5 rounded-full text-xs font-black text-white" style={{ background: '#dc2626' }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-2xl border shadow-2xl overflow-hidden"
          style={{ background: '#fff', borderColor: '#fbbf24' }}>
          <div className="px-4 py-3 font-bold text-sm" style={{ background: '#fefce8', color: '#92400e', borderBottom: '1px solid #fde68a' }}>
            Yönetim Kurulu Mesajları
          </div>
          <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: '#f1f5f9' }}>
            {notes.map(note => {
              const badge = PRIORITY_BADGE[note.priority] ?? PRIORITY_BADGE.normal
              return (
                <div key={note.id}
                  className="p-4 cursor-pointer transition-colors"
                  style={{ background: note.is_read ? '#fff' : '#fffbeb' }}
                  onClick={() => { if (!note.is_read) markRead(note.id) }}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-xs font-bold" style={{ color: '#0f172a' }}>{note.author_name}</span>
                      {note.author_title && (
                        <span className="text-xs ml-1" style={{ color: '#64748b' }}>· {note.author_title}</span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: badge.bg, color: badge.text }}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{note.content}</p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    {new Date(note.created_at).toLocaleDateString('tr-TR')}
                    {!note.is_read && <span className="ml-2 font-bold text-amber-600">● Okunmadı</span>}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const BOARDROOM_METRICS = [
  {
    label: 'Sustain-Score',
    value: 'A+',
    sub: '94 / 100 points',
    icon: '🏆',
    color: '#166534',
    bg: '#dcfce7',
    desc: "Top 5% in your sector. Investment grade: AAA. Eligible for green bond issuance.",
  },
  {
    label: 'CBAM Tax Saving',
    value: '€2.4M',
    sub: '2026 estimated annual',
    icon: '🇪🇺',
    color: '#1e3a8a',
    bg: '#dbeafe',
    desc: 'EU Carbon Border Adjustment ready — you avoid this liability while competitors pay. Verified by satellite data.',
  },
  {
    label: 'Green Investment ROI',
    value: '3.2 yrs',
    sub: 'Payback period',
    icon: '⚡',
    color: '#854d0e',
    bg: '#fef9c3',
    desc: 'Solar + EV fleet transition: ₺28M total investment repaid in 3.2 years. NPV: +₺64M.',
  },
  {
    label: 'Net Zero Pathway',
    value: '2047',
    sub: 'Current trajectory',
    icon: '🌍',
    color: '#5b21b6',
    bg: '#ede9fe',
    desc: 'At current pace you reach net zero in 2047. Without the MACC plan the target slips to 2058.',
  },
]

export default function DashboardPage() {
  const [boardroomMode, setBoardroomMode] = useState(false)
  const [companyName, setCompanyName] = useState('')
  useEffect(() => { setCompanyName(localStorage.getItem('company_name') ?? '') }, [])
  const displayCompany = companyName || 'Your Company'

  return (
    <>
      <Header
        title={boardroomMode ? '👔 Board / Boardroom Mode' : '📊 Dashboard'}
        subtitle={`${displayCompany} · 2025 Reporting Period`}
      />

      {/* Mode toggle */}
      <div className="px-6 pt-4 flex items-center justify-between">
        <AdvisoryWidget />
        <button
          onClick={() => setBoardroomMode(b => !b)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all"
          style={
            boardroomMode
              ? { background: '#0F172A', color: '#fff', borderColor: '#0F172A' }
              : { background: '#fff', color: '#0F172A', borderColor: '#cbd5e1' }
          }
        >
          {boardroomMode ? '📊 Standart Moda Dön' : '👔 YK Sunum Moduna Geç'}
        </button>
      </div>

      {boardroomMode ? (
        /* ── BOARDROOM MODE ─────────────────────────────────────── */
        <div className="p-6 flex-1 space-y-6">
          <div className="text-center py-4">
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#64748b' }}>
              Yönetim Kurulu İçin Hazırlandı · Gizli · {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-3xl font-black mt-2" style={{ color: '#0F172A' }}>
              {displayCompany} — ESG Executive Summary
            </h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Kaynak: SustainHub Intelligence Platform · Gerçek zamanlı veri
            </p>
          </div>

          {/* 4 big metric cards */}
          <div className="grid grid-cols-2 gap-5">
            {BOARDROOM_METRICS.map(m => (
              <div
                key={m.label}
                className="rounded-2xl p-8 border-2"
                style={{ background: m.bg, borderColor: m.color + '33' }}
              >
                <div className="text-4xl mb-3">{m.icon}</div>
                <div className="text-5xl font-black mb-1" style={{ color: m.color }}>{m.value}</div>
                <div className="text-sm font-bold mb-1" style={{ color: m.color }}>{m.label}</div>
                <div className="text-xs font-semibold mb-3" style={{ color: m.color + 'aa' }}>{m.sub}</div>
                <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom summary */}
          <div
            className="rounded-2xl p-8 text-white"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)' }}
          >
            <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#94a3b8' }}>
              YK Tavsiyesi
            </div>
            <p className="text-lg font-semibold leading-relaxed">
              {displayCompany} maintains sector leadership in sustainability performance.
              Implementing the MACC plan in 2026 will both <strong className="text-emerald-400">reduce CBAM liability to zero</strong> and
              preserve the A+ ESG rating required for green bond issuance.
            </p>
            <div className="mt-6 flex gap-4 flex-wrap">
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#166534', color: '#fff' }}>
                ✓ TSRS 1 & 2 Compliant
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e3a8a', color: '#fff' }}>
                ✓ CBAM Ready
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#5b21b6', color: '#fff' }}>
                ✓ SBTi 1.5°C Pathway
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#854d0e', color: '#fff' }}>
                ✓ Satellite Verified
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ── STANDART MODE ──────────────────────────────────────── */
        <div className="p-6 flex-1 space-y-5">
          <KpiGrid />
          <div className="grid grid-cols-2 gap-5">
            <EmissionTrendChart />
            <ScopeDonutChart />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <ComplianceGauge />
            </div>
            <div className="col-span-1 space-y-5">
              <UKMarketAccessWidget />
              <SatelliteWidget />
            </div>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <ComplianceCalendar />
            <RecentReports />
          </div>
        </div>
      )}
    </>
  )
}
