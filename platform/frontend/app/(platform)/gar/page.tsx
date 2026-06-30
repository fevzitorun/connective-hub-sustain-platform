"use client";

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BankGradeCard from '@/components/dashboard/BankGradeCard';

type Jurisdiction = 'bddk' | 'fca' | 'trnc'

const JURISDICTION_CONFIG = {
  bddk: {
    label: 'Türkiye (BDDK)',
    flag: '🇹🇷',
    standard: 'BDDK Sürdürülebilir Bankacılık · TSRS',
    currency: '₺',
    currencyCode: 'TRY',
    reportTitle: 'Yeşil Varlık Oranı (GAR) Raporu',
    reportSubtitle: 'BDDK Sürdürülebilir Bankacılık Uyum Raporu · TSRS/TFRS S2 Uyumlu',
    debtLabel: 'Toplam Finansal Borç',
    greenLabel: 'Yeşil Finansman Payı',
    ratioLabel: 'GAR (Green Asset Ratio)',
    badgeColor: '#dc2626',
    badgeBg: '#fee2e2',
    framework: 'AB Taksonomisi + BDDK Sürdürülebilirlik Rehberi 2023',
    auditNote: 'BDDK denetimine tabi. 34 banka zorunlu raporlama kapsamında.',
  },
  fca: {
    label: 'UK (FCA)',
    flag: '🇬🇧',
    standard: 'FCA SDR · UK Green Taxonomy · UK SRS',
    currency: '£',
    currencyCode: 'GBP',
    reportTitle: 'Green Asset Ratio (GAR) Report',
    reportSubtitle: 'FCA Sustainable Disclosure Requirements · UK SRS / TCFD Aligned',
    debtLabel: 'Total Financial Debt',
    greenLabel: 'Green Finance Share',
    ratioLabel: 'GAR (Green Asset Ratio)',
    badgeColor: '#1d4ed8',
    badgeBg: '#dbeafe',
    framework: 'UK Green Taxonomy · FCA SDR 2024 · TCFD / ISSB IFRS S2',
    auditNote: 'Subject to FCA supervisory review. TCFD mandatory for premium-listed companies.',
  },
  trnc: {
    label: 'KKTC (Merkez Bankası)',
    flag: '🇨🇾',
    standard: 'KKTC Merkez Bankası · AB Uyum Yol Haritası',
    currency: '€',
    currencyCode: 'EUR',
    reportTitle: 'Yeşil Varlık Oranı (GAR) Raporu — KKTC',
    reportSubtitle: 'KKTC Merkez Bankası · AB Taxonomy Uyum Yol Haritası',
    debtLabel: 'Toplam Finansal Borç',
    greenLabel: 'Yeşil Finansman Payı',
    ratioLabel: 'GAR (Green Asset Ratio)',
    badgeColor: '#7c3aed',
    badgeBg: '#ede9fe',
    framework: 'AB Taksonomisi (2023) · KKTC Bankacılık Yasası Ek Protokol',
    auditNote: 'KKTC Merkez Bankası denetimine tabi. AB uyum hedefleri 2025-2028.',
  },
}

// Portfolio data per jurisdiction (scaled to currency)
const PORTFOLIO_DATA: Record<Jurisdiction, { name: string; klasik: number; yesil: number }[]> = {
  bddk: [
    { name: 'Ticari Kredi 1', klasik: 400_000_000, yesil: 600_000_000 },
    { name: 'Ticari Kredi 2', klasik: 2_100_000_000, yesil: 400_000_000 },
    { name: 'Proje Finansmanı', klasik: 500_000_000, yesil: 4_500_000_000 },
    { name: 'Leasing', klasik: 600_000_000, yesil: 200_000_000 },
  ],
  fca: [
    { name: 'Corporate Loan 1', klasik: 18_000_000, yesil: 27_000_000 },
    { name: 'Corporate Loan 2', klasik: 95_000_000, yesil: 18_000_000 },
    { name: 'Project Finance', klasik: 22_000_000, yesil: 200_000_000 },
    { name: 'Trade Finance', klasik: 27_000_000, yesil: 9_000_000 },
  ],
  trnc: [
    { name: 'Ticari Kredi 1', klasik: 8_000_000, yesil: 12_000_000 },
    { name: 'Ticari Kredi 2', klasik: 42_000_000, yesil: 8_000_000 },
    { name: 'Proje Finansmanı', klasik: 10_000_000, yesil: 90_000_000 },
    { name: 'Kiralama', klasik: 12_000_000, yesil: 4_000_000 },
  ],
}

function fmt(val: number, currency: string) {
  if (val >= 1_000_000_000) return `${currency}${(val / 1_000_000_000).toFixed(1)}Bn`
  if (val >= 1_000_000) return `${currency}${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${currency}${(val / 1_000).toFixed(0)}K`
  return `${currency}${val.toFixed(0)}`
}

export default function GARPage() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('bddk')
  const [score] = useState(76)
  const [grade] = useState('A')

  const cfg = JURISDICTION_CONFIG[jurisdiction]
  const garData = PORTFOLIO_DATA[jurisdiction]

  const toplamKlasik = garData.reduce((acc, curr) => acc + curr.klasik, 0)
  const toplamYesil = garData.reduce((acc, curr) => acc + curr.yesil, 0)
  const toplamBorc = toplamKlasik + toplamYesil
  const garOrani = ((toplamYesil / toplamBorc) * 100).toFixed(1)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{cfg.reportTitle}</h1>
          <p className="text-slate-400 text-sm">{cfg.reportSubtitle}</p>
        </div>

        {/* Multi-Jurisdiction Switcher */}
        <div className="flex-shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Yargı Bölgesi / Jurisdiction</div>
          <div className="flex rounded-xl overflow-hidden border border-slate-700">
            {(Object.keys(JURISDICTION_CONFIG) as Jurisdiction[]).map(jk => {
              const j = JURISDICTION_CONFIG[jk]
              const isActive = jurisdiction === jk
              return (
                <button
                  key={jk}
                  onClick={() => setJurisdiction(jk)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all"
                  style={{
                    background: isActive ? j.badgeColor : '#1e293b',
                    color: isActive ? '#fff' : '#94a3b8',
                    borderRight: jk !== 'trnc' ? '1px solid #334155' : 'none',
                  }}
                >
                  <span>{j.flag}</span>
                  <span className="text-xs">{jk === 'bddk' ? 'BDDK' : jk === 'fca' ? 'FCA' : 'KKTC'}</span>
                </button>
              )
            })}
          </div>
          {/* Active standard badge */}
          <div className="mt-2 text-xs px-3 py-1.5 rounded-lg text-center font-semibold"
            style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
            {cfg.standard}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <BankGradeCard score={score} grade={grade} />
        </div>

        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-around">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">{cfg.debtLabel}</p>
            <p className="text-3xl font-bold text-white">{fmt(toplamBorc, cfg.currency)}</p>
          </div>
          <div className="w-px h-16 bg-slate-800"></div>
          <div className="text-center">
            <p className="text-green-400/80 text-sm mb-1">{cfg.greenLabel}</p>
            <p className="text-3xl font-bold text-green-400">{fmt(toplamYesil, cfg.currency)}</p>
          </div>
          <div className="w-px h-16 bg-slate-800"></div>
          <div className="text-center">
            <p className="text-blue-400/80 text-sm mb-1">{cfg.ratioLabel}</p>
            <p className="text-4xl font-bold text-blue-400">%{garOrani}</p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-[420px]">
        <h3 className="text-lg font-semibold text-white mb-6">
          Finansman Kalemleri Yeşil Pay Analizi
          <span className="ml-3 text-xs font-normal px-2 py-1 rounded" style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
            {cfg.flag} {cfg.label}
          </span>
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={garData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tickFormatter={(v) => fmt(v, cfg.currency)} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [fmt(value as number, cfg.currency), undefined]}
            />
            <Legend />
            <Bar name="Klasik Finansman" dataKey="klasik" stackId="a" fill="#475569" radius={[0, 0, 4, 4]} />
            <Bar name="Yeşil Finansman (Taxonomy Aligned)" dataKey="yesil" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Framework Footer */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="text-sm text-slate-400">
          <span className="font-bold text-white">Yasal Çerçeve: </span>
          {cfg.framework}
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0"
          style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
          {cfg.auditNote}
        </div>
      </div>
    </div>
  )
}
