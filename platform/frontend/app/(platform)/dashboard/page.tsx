'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { EmissionTrendChart } from '@/components/dashboard/EmissionTrendChart'
import { ScopeDonutChart } from '@/components/dashboard/ScopeDonutChart'
import { ComplianceGauge } from '@/components/dashboard/ComplianceGauge'
import { SatelliteWidget } from '@/components/dashboard/SatelliteWidget'
import { RecentReports } from '@/components/dashboard/RecentReports'
import { ComplianceCalendar } from '@/components/dashboard/ComplianceCalendar'
import { UKMarketAccessWidget } from '@/components/dashboard/UKMarketAccessWidget'

const BOARDROOM_METRICS = [
  {
    label: 'Sustain-Score',
    value: 'A+',
    sub: '94 / 100 puan',
    icon: '🏆',
    color: '#166534',
    bg: '#dcfce7',
    desc: "Sektörünüzde üst %5'te yer alıyorsunuz. Yatırım notu: AAA.",
  },
  {
    label: 'CBAM Vergi Tasarrufu',
    value: '€2.4M',
    sub: '2026 tahmini yıllık',
    icon: '🇪🇺',
    color: '#1e3a8a',
    bg: '#dbeafe',
    desc: 'AB karbon sınır mekanizmasına hazır olduğunuz için rakiplerinize kıyasla bu vergiyi ödemiyorsunuz.',
  },
  {
    label: 'Yeşil Yatırım ROI',
    value: '3.2 yıl',
    sub: 'Geri ödeme süresi',
    icon: '⚡',
    color: '#854d0e',
    bg: '#fef9c3',
    desc: 'Güneş paneli + EV filo geçişi toplam ₺28M yatırımın 3.2 yılda geri dönüşü. NPV: +₺64M.',
  },
  {
    label: 'Net Sıfır Yolu',
    value: '2047',
    sub: 'Mevcut gidişat',
    icon: '🌍',
    color: '#5b21b6',
    bg: '#ede9fe',
    desc: 'Şu anki hızla 2047\'de net sıfıra ulaşırsınız. MACC planını uygulamazsanız hedef 2058\'e kayar.',
  },
]

export default function DashboardPage() {
  const [boardroomMode, setBoardroomMode] = useState(false)

  return (
    <>
      <Header
        title={boardroomMode ? '👔 Yönetim Kurulu Modu' : '📊 Dashboard'}
        subtitle="Akbank T.A.Ş. · 2024 Raporlama Dönemi"
      />

      {/* Mode toggle */}
      <div className="px-6 pt-4 flex items-center justify-between">
        <div />
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
              Akbank T.A.Ş. — ESG Yönetim Özeti
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
              Akbank, sürdürülebilirlik performansında sektör liderliğini sürdürmektedir.
              2026 yılında MACC planının uygulamaya alınması, hem <strong className="text-emerald-400">CBAM yükümlülüğünü sıfıra indirecek</strong>,
              hem de yeşil tahvil ihracı için gerekli A+ ESG notunu koruyacaktır.
            </p>
            <div className="mt-6 flex gap-4 flex-wrap">
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#166534', color: '#fff' }}>
                ✓ TSRS 1 & 2 Uyumlu
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e3a8a', color: '#fff' }}>
                ✓ CBAM Hazır
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#5b21b6', color: '#fff' }}>
                ✓ SBTi 1.5°C Yolunda
              </span>
              <span className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#854d0e', color: '#fff' }}>
                ✓ Uydu Doğrulamalı
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
