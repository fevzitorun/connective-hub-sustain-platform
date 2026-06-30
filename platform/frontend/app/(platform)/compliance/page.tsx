'use client'
import { useState } from 'react'
import Link from 'next/link'

type Jurisdiction = 'all' | 'tr' | 'uk' | 'eu' | 'trnc'

const REGULATIONS = [
  {
    id: 'tsrs',
    flag: '🇹🇷', jurisdiction: 'tr',
    title: 'TSRS 1 & 2',
    full: 'Türkiye Sürdürülebilirlik Raporlama Standartları',
    authority: 'KGK (Kamu Gözetimi Kurumu)',
    status: 'ZORUNLU',
    statusColor: '#dc2626', statusBg: '#fee2e2',
    deadline: '2026-12-31',
    deadlineLabel: 'FY2025 raporları — Ara. 2026',
    progress: 65,
    urgency: 'high',
    tasks: [
      { name: 'Çift Önemlilik Analizi (ESRS uyumlu)', done: true },
      { name: 'Kapsam 1 & 2 Emisyon Envanter', done: true },
      { name: 'Kapsam 3 Değer Zinciri (Kategori 15)', done: false },
      { name: 'YK Onayı & İmzası', done: false },
      { name: 'Bağımsız Denetim — Sınırlı Güvence', done: false },
    ],
    links: [{ label: 'SustainHub AI Rapor', href: '/ai-rapor' }, { label: 'KGK Rehberi', href: '#' }],
  },
  {
    id: 'bddk-gar',
    flag: '🇹🇷', jurisdiction: 'tr',
    title: 'BDDK GAR',
    full: 'Yeşil Varlık Oranı — Bankacılık Sektörü',
    authority: 'BDDK (Bankacılık Düzenleme ve Denetleme Kurumu)',
    status: 'ZORUNLU',
    statusColor: '#dc2626', statusBg: '#fee2e2',
    deadline: '2026-09-30',
    deadlineLabel: 'Q3 2026 GAR raporlaması',
    progress: 42,
    urgency: 'critical',
    tasks: [
      { name: 'Portföy Taksonomi Sınıflandırması', done: true },
      { name: 'Yeşil Kredilerin GAR hesabına dahili', done: false },
      { name: 'PCAF Finanse Emisyonlar (Kapsam 3 Kat.15)', done: false },
      { name: 'BDDK formatında rapor çıktısı', done: false },
    ],
    links: [{ label: 'GAR Portalı', href: '/gar' }, { label: 'TCFD Analizi', href: '/tcfd' }],
  },
  {
    id: 'fca-sdr',
    flag: '🇬🇧', jurisdiction: 'uk',
    title: 'FCA SDR & UK SRS',
    full: 'Sustainable Disclosure Requirements & UK Sustainability Reporting Standards',
    authority: 'FCA (Financial Conduct Authority)',
    status: 'ZORUNLU',
    statusColor: '#1d4ed8', statusBg: '#dbeafe',
    deadline: '2026-12-31',
    deadlineLabel: 'Large firms — Dec 2026',
    progress: 30,
    urgency: 'high',
    tasks: [
      { name: 'TCFD-aligned climate risk disclosure', done: true },
      { name: 'UK Green Taxonomy portfolio mapping', done: false },
      { name: 'ISSB IFRS S2 climate scenario analysis', done: false },
      { name: 'Independent assurance (limited)', done: false },
    ],
    links: [{ label: 'TCFD Scenarios', href: '/tcfd' }, { label: 'GAR Portal (FCA)', href: '/gar' }],
  },
  {
    id: 'cbam',
    flag: '🇪🇺', jurisdiction: 'eu',
    title: 'CBAM',
    full: 'Carbon Border Adjustment Mechanism (AB Sınır Karbon Mekanizması)',
    authority: 'Avrupa Komisyonu — DG TAXUD',
    status: 'GEÇİŞ',
    statusColor: '#d97706', statusBg: '#fef3c7',
    deadline: '2027-01-01',
    deadlineLabel: 'Tam uygulama — Oca 2027',
    progress: 55,
    urgency: 'medium',
    tasks: [
      { name: 'Ürün Karbon Ayak İzi (PCF — ISO 14067)', done: true },
      { name: 'Gömülü Emisyon hesabı (Embedded CO₂)', done: true },
      { name: 'CBAM Deklarasyonu (XML format)', done: false },
      { name: 'AB alıcısına veri paylaşımı', done: false },
    ],
    links: [{ label: 'CBAM Modülü', href: '/cbam' }, { label: 'TCFD Analizi', href: '/tcfd' }],
  },
  {
    id: 'eudr',
    flag: '🇪🇺', jurisdiction: 'eu',
    title: 'EUDR',
    full: 'AB Ormansızlaşma Tüzüğü (EU Deforestation Regulation)',
    authority: 'Avrupa Komisyonu — DG ENV',
    status: 'GEÇİŞ',
    statusColor: '#d97706', statusBg: '#fef3c7',
    deadline: '2025-12-30',
    deadlineLabel: 'Büyük işletmeler — Ara. 2025',
    progress: 80,
    urgency: 'low',
    tasks: [
      { name: 'Ürün listesi ve coğrafi köken tespiti', done: true },
      { name: 'Tedarikçi beyanı & GPS koordinatları', done: true },
      { name: 'Bağımsız NDVI uydu doğrulaması', done: true },
      { name: 'AB portala yükleme & due diligence', done: false },
    ],
    links: [{ label: 'EUDR Modülü', href: '/eudr' }, { label: 'Tedarikçi Denetimi', href: '/tedarikciler' }],
  },
  {
    id: 'csrd',
    flag: '🇪🇺', jurisdiction: 'eu',
    title: 'CSRD / ESRS',
    full: 'Corporate Sustainability Reporting Directive',
    authority: 'Avrupa Komisyonu — DG FISMA',
    status: 'YAKLAŞIYOR',
    statusColor: '#7c3aed', statusBg: '#ede9fe',
    deadline: '2027-01-01',
    deadlineLabel: '2026 FY raporları — Oca 2027',
    progress: 20,
    urgency: 'medium',
    tasks: [
      { name: 'ESRS Çift Önemlilik Matrisi', done: true },
      { name: 'ESRS E1 İklim Değişikliği (430 veri noktası)', done: false },
      { name: 'ESRS E2-E5 Çevre standartları', done: false },
      { name: 'ESRS S1-S4 Sosyal standartlar', done: false },
      { name: 'Denetim (Sınırlı Güvence — ISAE 3000)', done: false },
    ],
    links: [{ label: 'CSRD Matrisi', href: '/compliance' }, { label: 'AI Rapor', href: '/ai-rapor' }],
  },
  {
    id: 'trnc-cb',
    flag: '🇨🇾', jurisdiction: 'trnc',
    title: 'KKTC MB',
    full: 'KKTC Merkez Bankası Sürdürülebilir Bankacılık Rehberi',
    authority: 'KKTC Merkez Bankası',
    status: 'GÖNÜLLü',
    statusColor: '#6b7280', statusBg: '#f3f4f6',
    deadline: '2027-06-30',
    deadlineLabel: 'AB Uyum Yol Haritası — 2027',
    progress: 15,
    urgency: 'low',
    tasks: [
      { name: 'AB Taxonomy uyum yol haritası', done: false },
      { name: 'Portföy fiziksel iklim risk taraması', done: false },
      { name: 'GAR hesap altyapısı', done: false },
    ],
    links: [{ label: 'GAR Portalı (KKTC)', href: '/gar' }],
  },
]

const JURISDICTIONS: { value: Jurisdiction; label: string; flag: string; color: string }[] = [
  { value: 'all',  label: 'Tümü',   flag: '🌍', color: '#64748b' },
  { value: 'tr',   label: 'Türkiye (BDDK)', flag: '🇹🇷', color: '#dc2626' },
  { value: 'uk',   label: 'UK (FCA)',       flag: '🇬🇧', color: '#1d4ed8' },
  { value: 'eu',   label: 'AB / EU',        flag: '🇪🇺', color: '#7c3aed' },
  { value: 'trnc', label: 'KKTC',           flag: '🇨🇾', color: '#059669' },
]

const URGENCY_SORT = { critical: 0, high: 1, medium: 2, low: 3 }

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function CompliancePage() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('all')

  const filtered = REGULATIONS
    .filter(r => jurisdiction === 'all' || r.jurisdiction === jurisdiction)
    .sort((a, b) => URGENCY_SORT[a.urgency as keyof typeof URGENCY_SORT] - URGENCY_SORT[b.urgency as keyof typeof URGENCY_SORT])

  const critical = REGULATIONS.filter(r => r.urgency === 'critical').length
  const overallProgress = Math.round(REGULATIONS.reduce((s, r) => s + r.progress, 0) / REGULATIONS.length)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">🗓️ Global Regulatory Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tri-Jurisdictional Compliance · Türkiye · UK · AB · KKTC · {new Date().getFullYear()}
          </p>
        </div>
        {/* Turkish Bank badge */}
        <div className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#065f46' }}>
          🏦 Turkish Bank Modu — 3 Yargı Bölgesi Aktif
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Aktif Düzenleme', value: REGULATIONS.length, color: '#0f172a', icon: '📋' },
          { label: 'Kritik Deadline', value: critical, color: '#dc2626', icon: '🚨' },
          { label: 'Ortalama Uyum', value: `${overallProgress}%`, color: '#059669', icon: '✅' },
          { label: 'Önümüzdeki 90 Gün', value: REGULATIONS.filter(r => daysUntil(r.deadline) <= 90 && daysUntil(r.deadline) > 0).length, color: '#d97706', icon: '⏰' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <span className="text-2xl">{k.icon}</span>
            <div>
              <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-slate-500 font-medium">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Jurisdiction filter */}
      <div className="flex flex-wrap gap-2">
        {JURISDICTIONS.map(j => (
          <button key={j.value} onClick={() => setJurisdiction(j.value)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
            style={{
              borderColor: jurisdiction === j.value ? j.color : '#e2e8f0',
              background: jurisdiction === j.value ? j.color + '10' : '#fff',
              color: jurisdiction === j.value ? j.color : '#64748b',
            }}>
            {j.flag} {j.label}
          </button>
        ))}
      </div>

      {/* Regulations list */}
      <div className="space-y-4">
        {filtered.map(reg => {
          const days = daysUntil(reg.deadline)
          const completed = reg.tasks.filter(t => t.done).length
          return (
            <div key={reg.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="p-5 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xl">{reg.flag}</span>
                    <h2 className="font-black text-slate-800">{reg.title}</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: reg.statusBg, color: reg.statusColor }}>
                      {reg.status}
                    </span>
                    {reg.urgency === 'critical' && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                        🚨 ACİL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{reg.full}</p>
                  <p className="text-xs text-slate-400 mt-0.5">📌 {reg.authority}</p>
                </div>

                {/* Deadline + Progress */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-black" style={{
                      color: days < 0 ? '#6b7280' : days <= 90 ? '#dc2626' : days <= 180 ? '#d97706' : '#059669'
                    }}>
                      {days < 0 ? 'Geçti' : `${days}g`}
                    </div>
                    <div className="text-xs text-slate-500">{reg.deadlineLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-800">{reg.progress}%</div>
                    <div className="text-xs text-slate-400">Uyum</div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-100">
                <div className="h-1.5 transition-all duration-700"
                  style={{
                    width: `${reg.progress}%`,
                    background: reg.progress >= 70 ? '#22c55e' : reg.progress >= 40 ? '#eab308' : '#ef4444',
                  }} />
              </div>

              {/* Tasks */}
              <div className="px-5 py-4 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {reg.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={task.done ? 'text-green-500' : 'text-slate-300'}>
                        {task.done ? '✅' : '○'}
                      </span>
                      <span className={task.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{completed}/{reg.tasks.length} görev tamamlandı</span>
                  <div className="flex gap-2">
                    {reg.links.map(l => (
                      <Link key={l.href} href={l.href}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                        style={{ background: '#059669' }}>
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Data Room CTA */}
      <div className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5"
        style={{ background: '#0f172a' }}>
        <div className="flex-1">
          <h3 className="font-black text-white text-lg">Audit-Ready Data Room</h3>
          <p className="text-sm text-slate-400 mt-1">
            KPMG, Deloitte, PwC ve BDDK denetimleri için tüm uyum belgelerini tek ZIP dosyasında hazırlayın.
            TSRS + FCA SDR + CBAM + EUDR beyanları otomatik paketlenir.
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link href="/ai-rapor"
            className="px-6 py-3 rounded-xl font-bold text-white text-sm text-center"
            style={{ background: '#059669' }}>
            🤖 Tüm Raporları Üret
          </Link>
          <Link href="/gar"
            className="px-6 py-3 rounded-xl font-bold text-sm text-center border border-slate-600 text-slate-300">
            🏦 GAR Portalına Git
          </Link>
        </div>
      </div>
    </div>
  )
}
