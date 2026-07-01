"use client";

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import BankGradeCard from '@/components/dashboard/BankGradeCard';

type Jurisdiction = 'bddk' | 'fca' | 'trnc'

const JURISDICTION_CONFIG = {
  bddk: {
    label: 'Türkiye (BDDK)',
    flag: '🇹🇷',
    standard: 'BDDK Sustainable Banking · TSRS',
    currency: '₺',
    currencyCode: 'TRY',
    reportTitle: 'Green Asset Ratio (GAR) Report — Yeşil Varlık Oranı',
    reportSubtitle: 'BDDK Sustainable Banking Compliance · TSRS / IFRS S2 Aligned',
    debtLabel: 'Total Financial Debt / Toplam Finansal Borç',
    greenLabel: 'Green Finance Share / Yeşil Finansman Payı',
    ratioLabel: 'GAR (Green Asset Ratio / Yeşil Varlık Oranı)',
    badgeColor: '#dc2626',
    badgeBg: '#fee2e2',
    framework: 'EU Taxonomy + BDDK Sustainability Guidelines 2023 (AB Taksonomisi + BDDK Sürdürülebilirlik Rehberi)',
    auditNote: 'Subject to BDDK supervision · 34 Turkish banks — mandatory reporting (BDDK denetimine tabi)',
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
    auditNote: 'Subject to FCA supervisory review · TCFD mandatory for premium-listed companies',
  },
  trnc: {
    label: 'TRNC (Central Bank)',
    flag: '🇨🇾',
    standard: 'TRNC Central Bank · EU Alignment Roadmap',
    currency: '€',
    currencyCode: 'EUR',
    reportTitle: 'Green Asset Ratio (GAR) Report — TRNC / KKTC',
    reportSubtitle: 'TRNC Central Bank · EU Taxonomy Alignment · TSRS Consolidated',
    debtLabel: 'Total Financial Debt / Toplam Finansal Borç',
    greenLabel: 'Green Finance Share / Yeşil Finansman Payı',
    ratioLabel: 'GAR (Green Asset Ratio)',
    badgeColor: '#7c3aed',
    badgeBg: '#ede9fe',
    framework: 'EU Taxonomy (2023) · TRNC Banking Law Protocol (AB Taksonomisi · KKTC Bankacılık Yasası)',
    auditNote: 'Subject to TRNC Central Bank supervision · consolidated into TSRS main reporting',
  },
}

const PORTFOLIO_DATA: Record<Jurisdiction, { name: string; klasik: number; yesil: number }[]> = {
  bddk: [
    { name: 'Akenerji A.Ş.', klasik: 0, yesil: 85_000_000 },
    { name: 'Şişecam A.Ş.', klasik: 120_000_000, yesil: 0 },
    { name: 'Limak İnşaat', klasik: 0, yesil: 65_000_000 },
    { name: 'Çalık Denim', klasik: 0, yesil: 28_000_000 },
    { name: 'Rönesans Enj.', klasik: 0, yesil: 42_000_000 },
    { name: 'Metro Lojistik', klasik: 35_000_000, yesil: 0 },
    { name: 'Yeşil Tarım', klasik: 0, yesil: 18_000_000 },
  ],
  fca: [
    { name: 'GreenTech UK', klasik: 0, yesil: 18_000_000 },
    { name: 'Steel Corp Ltd', klasik: 27_000_000, yesil: 0 },
    { name: 'Solar Parks UK', klasik: 0, yesil: 45_000_000 },
    { name: 'Retail Grp', klasik: 12_000_000, yesil: 0 },
  ],
  trnc: [
    { name: 'Kıbrıs Solar', klasik: 0, yesil: 12_000_000 },
    { name: 'Lefkoşa AVM', klasik: 8_500_000, yesil: 0 },
    { name: 'Girne Turizm', klasik: 15_000_000, yesil: 0 },
  ],
}

// PCAF Financed Emissions per jurisdiction
const PCAF_DATA: Record<Jurisdiction, {
  total_tco2e: number;
  data_quality: number;
  borrowers: {
    name: string; nace: string; taxonomy: 'green' | 'transition' | 'brown';
    outstanding_m: number; financed_tco2e: number; esg_grade: string; esg_score: number;
  }[]
}> = {
  bddk: {
    total_tco2e: 62_480,
    data_quality: 3.1,
    borrowers: [
      { name: 'Akenerji A.Ş.', nace: 'D35', taxonomy: 'green', outstanding_m: 85, financed_tco2e: 463, esg_grade: 'AA', esg_score: 88 },
      { name: 'Şişecam A.Ş.', nace: 'C23', taxonomy: 'brown', outstanding_m: 120, financed_tco2e: 26_533, esg_grade: 'BB', esg_score: 52 },
      { name: 'Limak İnşaat', nace: 'F41', taxonomy: 'green', outstanding_m: 65, financed_tco2e: 3_510, esg_grade: 'BBB', esg_score: 61 },
      { name: 'Çalık Denim', nace: 'C13', taxonomy: 'transition', outstanding_m: 28, financed_tco2e: 1_720, esg_grade: 'B', esg_score: 48 },
      { name: 'Rönesans Enj.', nace: 'D35', taxonomy: 'green', outstanding_m: 42, financed_tco2e: 1_512, esg_grade: 'A', esg_score: 72 },
      { name: 'Metro Lojistik', nace: 'H49', taxonomy: 'transition', outstanding_m: 35, financed_tco2e: 8_925, esg_grade: 'B', esg_score: 44 },
      { name: 'Yeşil Tarım', nace: 'A01', taxonomy: 'transition', outstanding_m: 18, financed_tco2e: 19_817, esg_grade: 'CCC', esg_score: 31 },
    ],
  },
  fca: {
    total_tco2e: 8_940,
    data_quality: 2.8,
    borrowers: [
      { name: 'GreenTech UK', nace: 'D35', taxonomy: 'green', outstanding_m: 18, financed_tco2e: 216, esg_grade: 'AAA', esg_score: 94 },
      { name: 'Steel Corp Ltd', nace: 'C24', taxonomy: 'brown', outstanding_m: 27, financed_tco2e: 6_498, esg_grade: 'BB', esg_score: 50 },
      { name: 'Solar Parks UK', nace: 'D35', taxonomy: 'green', outstanding_m: 45, financed_tco2e: 540, esg_grade: 'AA', esg_score: 85 },
      { name: 'Retail Grp', nace: 'G47', taxonomy: 'transition', outstanding_m: 12, financed_tco2e: 1_140, esg_grade: 'BBB', esg_score: 60 },
    ],
  },
  trnc: {
    total_tco2e: 5_290,
    data_quality: 3.8,
    borrowers: [
      { name: 'Kıbrıs Solar', nace: 'D35', taxonomy: 'green', outstanding_m: 12, financed_tco2e: 70, esg_grade: 'A', esg_score: 78 },
      { name: 'Lefkoşa AVM', nace: 'G47', taxonomy: 'transition', outstanding_m: 8.5, financed_tco2e: 808, esg_grade: 'BBB', esg_score: 58 },
      { name: 'Girne Turizm', nace: 'I55', taxonomy: 'transition', outstanding_m: 15, financed_tco2e: 4_412, esg_grade: 'B', esg_score: 43 },
    ],
  },
}

const TAXONOMY_COLORS = {
  green: { bg: '#065f46', text: '#34d399', border: '#10b981', label: 'Green (Taxonomy Aligned)' },
  transition: { bg: '#78350f', text: '#fbbf24', border: '#f59e0b', label: 'Transition Finance' },
  brown: { bg: '#7f1d1d', text: '#f87171', border: '#ef4444', label: 'Non-Aligned (Brown)' },
}

const ESG_GRADE_COLOR: Record<string, string> = {
  AAA: '#059669', AA: '#10b981', A: '#34d399',
  BBB: '#f59e0b', BB: '#fb923c', B: '#f87171',
  CCC: '#ef4444', D: '#991b1b',
}

function fmt(val: number, currency: string) {
  if (val >= 1_000_000_000) return `${currency}${(val / 1_000_000_000).toFixed(1)}Bn`
  if (val >= 1_000_000) return `${currency}${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${currency}${(val / 1_000).toFixed(0)}K`
  return `${currency}${val.toFixed(0)}`
}

function fmtTco2e(val: number) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M tCO₂e`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K tCO₂e`
  return `${val.toFixed(0)} tCO₂e`
}

export default function GARPage() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('bddk')
  const [activeTab, setActiveTab] = useState<'overview' | 'pcaf' | 'stress'>('overview')

  const cfg = JURISDICTION_CONFIG[jurisdiction]
  const garData = PORTFOLIO_DATA[jurisdiction]
  const pcafData = PCAF_DATA[jurisdiction]

  const toplamKlasik = garData.reduce((acc, curr) => acc + curr.klasik, 0)
  const toplamYesil = garData.reduce((acc, curr) => acc + curr.yesil, 0)
  const toplamBorc = toplamKlasik + toplamYesil
  const garOrani = ((toplamYesil / toplamBorc) * 100).toFixed(1)

  const greenTotal = pcafData.borrowers.filter(b => b.taxonomy === 'green').reduce((a, b) => a + b.outstanding_m, 0)
  const transitionTotal = pcafData.borrowers.filter(b => b.taxonomy === 'transition').reduce((a, b) => a + b.outstanding_m, 0)
  const brownTotal = pcafData.borrowers.filter(b => b.taxonomy === 'brown').reduce((a, b) => a + b.outstanding_m, 0)
  const totalPortfolio = greenTotal + transitionTotal + brownTotal

  const taxonomyPieData = [
    { name: 'Green', value: greenTotal, color: '#10b981' },
    { name: 'Transition', value: transitionTotal, color: '#f59e0b' },
    { name: 'Non-Aligned', value: brownTotal, color: '#ef4444' },
  ]

  const stressData = {
    iea_nz: {
      label: 'IEA Net Zero 2050',
      atRisk: brownTotal * 0.35,
      transitionCost: transitionTotal * 0.12,
      totalImpact: brownTotal * 0.35 + transitionTotal * 0.12,
    },
    ngfs_delayed: {
      label: 'NGFS Delayed Transition',
      atRisk: brownTotal * 0.55,
      transitionCost: transitionTotal * 0.22,
      totalImpact: brownTotal * 0.55 + transitionTotal * 0.22,
    },
  }

  const garScore = Math.min(100, Math.round(parseFloat(garOrani) * 1.2))

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
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Jurisdiction / Yargı Bölgesi</div>
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
          <div className="mt-2 text-xs px-3 py-1.5 rounded-lg text-center font-semibold"
            style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
            {cfg.standard}
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="col-span-1">
          <BankGradeCard score={garScore} grade={parseFloat(garOrani) >= 60 ? 'A' : parseFloat(garOrani) >= 40 ? 'B' : 'C'} />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-center">
          <p className="text-slate-400 text-xs mb-1">{cfg.debtLabel}</p>
          <p className="text-2xl font-bold text-white">{fmt(toplamBorc * 1_000_000, cfg.currency)}</p>
          <p className="text-xs text-slate-500 mt-1">Total portfolio / Toplam portföy</p>
        </div>
        <div className="bg-slate-900 border border-emerald-800/40 rounded-xl p-5 flex flex-col justify-center">
          <p className="text-emerald-400/80 text-xs mb-1">{cfg.greenLabel}</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(toplamYesil * 1_000_000, cfg.currency)}</p>
          <p className="text-4xl font-black text-emerald-300 mt-1">{garOrani}%</p>
          <p className="text-xs text-emerald-600">GAR Ratio / GAR Oranı</p>
        </div>
        <div className="bg-slate-900 border border-blue-800/40 rounded-xl p-5 flex flex-col justify-center">
          <p className="text-blue-400/80 text-xs mb-1">Financed Emissions (Scope 3 Cat.15)</p>
          <p className="text-2xl font-bold text-blue-300">{fmtTco2e(pcafData.total_tco2e)}</p>
          <p className="text-xs text-slate-500 mt-1">PCAF Standard v2 · Data Quality: {pcafData.data_quality}/5</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800">
        {[
          { key: 'overview', label: '📊 Portfolio Overview' },
          { key: 'pcaf', label: '🔬 PCAF Borrower Analysis' },
          { key: 'stress', label: '🌡️ Climate Stress Test' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className="px-5 py-3 text-sm font-semibold transition-all border-b-2"
            style={{
              borderColor: activeTab === tab.key ? cfg.badgeColor : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#64748b',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Bar chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-[380px]">
            <h3 className="text-lg font-semibold text-white mb-4">
              Green vs. Conventional Financing by Borrower
              <span className="ml-3 text-xs font-normal px-2 py-1 rounded" style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
                {cfg.flag} {cfg.label}
              </span>
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={garData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => fmt(v, cfg.currency)} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [fmt(value as number, cfg.currency), undefined]}
                />
                <Legend />
                <Bar name="Conventional Finance" dataKey="klasik" stackId="a" fill="#475569" radius={[0, 0, 4, 4]} />
                <Bar name="Green (Taxonomy Aligned)" dataKey="yesil" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Taxonomy pie + breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[300px]">
              <h3 className="text-sm font-semibold text-white mb-4">EU Taxonomy Classification</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={taxonomyPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                    {taxonomyPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}M EUR`, undefined]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">Taxonomy Summary</h3>
              {[
                { key: 'green', label: 'Green — EU Taxonomy Aligned', val: greenTotal, color: '#10b981' },
                { key: 'transition', label: 'Transition Finance', val: transitionTotal, color: '#f59e0b' },
                { key: 'brown', label: 'Non-Aligned (Brown)', val: brownTotal, color: '#ef4444' },
              ].map(item => (
                <div key={item.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: item.color }}>{item.label}</span>
                    <span className="text-slate-300 font-bold">{cfg.currency}{item.val.toFixed(0)}M · {(item.val / totalPortfolio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.val / totalPortfolio * 100}%`, background: item.color }} />
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-700 text-xs text-slate-500">
                <span className="font-bold text-slate-300">Legal Framework: </span>
                {cfg.framework}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: PCAF Borrower Analysis */}
      {activeTab === 'pcaf' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Borrower ESG & PCAF Analysis</h3>
                <p className="text-xs text-slate-500 mt-0.5">Scope 3 Category 15 — Financed Emissions · PCAF Standard v2 (2022)</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Total Financed Emissions</div>
                <div className="text-xl font-black text-blue-300">{fmtTco2e(pcafData.total_tco2e)}</div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-800">
                  <th className="px-4 py-3 text-left">Borrower</th>
                  <th className="px-4 py-3 text-left">NACE</th>
                  <th className="px-4 py-3 text-left">Taxonomy</th>
                  <th className="px-4 py-3 text-right">Outstanding ({cfg.currency}M)</th>
                  <th className="px-4 py-3 text-right">Financed Emissions</th>
                  <th className="px-4 py-3 text-center">ESG Grade</th>
                </tr>
              </thead>
              <tbody>
                {pcafData.borrowers.map((b, i) => {
                  const tc = TAXONOMY_COLORS[b.taxonomy]
                  return (
                    <tr key={i} className="border-b border-slate-800/60 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-semibold text-white">{b.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{b.nace}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full border"
                          style={{ background: tc.bg + '80', color: tc.text, borderColor: tc.border }}>
                          {b.taxonomy === 'green' ? '🟢 Green' : b.taxonomy === 'transition' ? '🟡 Transition' : '🔴 Non-Aligned'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 font-mono">{b.outstanding_m.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-300">{fmtTco2e(b.financed_tco2e)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-black px-2 py-1 rounded"
                          style={{ color: ESG_GRADE_COLOR[b.esg_grade] || '#94a3b8' }}>
                          {b.esg_grade}
                        </span>
                        <div className="text-xs text-slate-600">{b.esg_score}/100</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800/50">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Portfolio Total</td>
                  <td className="px-4 py-3 text-right font-black text-white">{totalPortfolio.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-black text-blue-300">{fmtTco2e(pcafData.total_tco2e)}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500">DQ: {pcafData.data_quality}/5</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-emerald-800/30 rounded-xl p-4">
              <div className="text-xs text-emerald-400 mb-1">Methodology</div>
              <div className="text-sm font-bold text-white">Attribution Factor</div>
              <div className="text-xs text-slate-400 mt-2">= Outstanding Loan / EVIC</div>
              <div className="text-xs text-slate-500 mt-1">(EVIC: Enterprise Value Incl. Cash)</div>
            </div>
            <div className="bg-slate-900 border border-blue-800/30 rounded-xl p-4">
              <div className="text-xs text-blue-400 mb-1">Data Quality / Veri Kalitesi</div>
              <div className="text-2xl font-black text-white">{pcafData.data_quality}<span className="text-sm font-normal text-slate-500">/5</span></div>
              <div className="text-xs text-slate-500 mt-1">1=Company Report · 5=Proxy Estimate</div>
            </div>
            <div className="bg-slate-900 border border-amber-800/30 rounded-xl p-4">
              <div className="text-xs text-amber-400 mb-1">Integration</div>
              <div className="text-sm font-bold text-white">TCFD Strategic Planning</div>
              <div className="text-xs text-slate-400 mt-1">This data feeds directly into TCFD / ISSB S2 disclosures</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stress Test */}
      {activeTab === 'stress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'iea_nz', config: stressData.iea_nz, accent: '#10b981', badge: 'IEA Net Zero 2050', icon: '🌿',
                desc: 'Net zero by 2050 pathway. Carbon-intensive assets lose 35% of value. (Net sıfır hedefi — karbon yoğun varlıklar %35 değer kaybeder.)' },
              { key: 'ngfs_delayed', config: stressData.ngfs_delayed, accent: '#f59e0b', badge: 'NGFS Delayed Transition', icon: '⚡',
                desc: 'Policy delay triggers abrupt transition shock. Carbon-intensive assets lose 55%. (Politika gecikmesi — karbon yoğun varlıklar %55 değer kaybeder.)' },
            ].map(scenario => (
              <div key={scenario.key} className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div>
                    <div className="text-xs font-bold px-2 py-0.5 rounded mb-1"
                      style={{ background: scenario.accent + '20', color: scenario.accent }}>
                      {scenario.badge}
                    </div>
                    <p className="text-xs text-slate-500">{scenario.desc}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Value-at-Risk — Brown Assets', val: scenario.config.atRisk, color: '#ef4444' },
                    { label: 'Transition Cost — Transition Assets', val: scenario.config.transitionCost, color: '#f59e0b' },
                    { label: 'Total Portfolio Impact', val: scenario.config.totalImpact, color: '#64748b' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400">{row.label}</span>
                      <span className="text-sm font-bold" style={{ color: row.color }}>
                        -{cfg.currency}{row.val.toFixed(1)}M
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 text-right">
                    <span className="text-xs text-slate-500">
                      Portfolio Risk:{' '}
                      <span className="font-bold" style={{ color: scenario.accent }}>
                        {(scenario.config.totalImpact / totalPortfolio * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Stress Test — Regulatory Basis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                { title: 'BDDK', color: '#dc2626', items: ['BDDK Sustainable Banking Guidelines 2023', 'Climate Risk Stress Test Manual', 'TSRS / IFRS S2 Scenarios'] },
                { title: 'FCA / UK', color: '#1d4ed8', items: ['FCA SS3/19 Climate Risk Guidelines', 'Bank of England CBES 2022', 'UK SRS / TCFD Mandatory'] },
                { title: 'ECB / NGFS', color: '#7c3aed', items: ['ECB Climate Stress Test 2022', 'NGFS Phase IV Scenarios', 'EBA Taxonomy KPI Guidance'] },
              ].map(col => (
                <div key={col.title} className="space-y-1">
                  <div className="font-bold text-xs px-2 py-0.5 rounded w-fit" style={{ background: col.color + '20', color: col.color }}>{col.title}</div>
                  {col.items.map(item => <div key={item} className="text-slate-500 pl-2">· {item}</div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="text-sm text-slate-400">
          <span className="font-bold text-white">Legal Framework: </span>
          {cfg.framework}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">PCAF Standard v2 · ISSB IFRS S2 · EBA GAR KPI</span>
          <div className="text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0"
            style={{ background: cfg.badgeBg, color: cfg.badgeColor }}>
            {cfg.auditNote}
          </div>
        </div>
      </div>
    </div>
  )
}
