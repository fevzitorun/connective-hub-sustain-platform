'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const BANK_NAV = [
  { section: '🏦 Bank Workspace', items: [
    { href: '/bank', label: 'Intelligence Suite', icon: '🏦', badge: 'GAR' },
    { href: '/gar', label: 'GAR Calculator', icon: '🌿' },
    { href: '/gar/kobi-dashboard', label: 'SME Portfolio', icon: '🏪' },
    { href: '/eu-taxonomy', label: 'EU Taxonomy Art.8', icon: '🇪🇺' },
    { href: '/executive', label: 'Board Summary', icon: '🏛️' },
  ]},
]

// ENGLISH FIRST FOR DEMO
const navItems = [
  { section: 'General', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/executive', label: 'YK / CFO Özet', icon: '🏛️', badge: 'NEW' },
  ]},
  { section: 'Reporting', items: [
    { href: '/veri-girisi', label: 'Data Entry', icon: '📥' },
    { href: '/ai-rapor', label: 'AI Report Writer', icon: '🤖', badge: 'AI' },
    { href: '/raporlar', label: 'My Reports', icon: '📄' },
    { href: '/audit', label: 'Audit Trail', icon: '🔍' },
  ]},
  { section: 'Compliance', items: [
    { href: '/compliance', label: 'Global Tracker', icon: '🗓️', badge: 'NEW' },
    { href: '/cbam', label: 'CBAM Declaration', icon: '🏭' },
    { href: '/eudr', label: 'EUDR Supply', icon: '🌳' },
  ]},
  { section: 'Climate & ESG', items: [
    { href: '/health-check', label: 'ESG Health Check', icon: '🩺', badge: 'NEW' },
    { href: '/csrd', label: 'CSRD Çift Önemlilik', icon: '🇪🇺', badge: 'ESRS' },
    { href: '/tcfd', label: 'TCFD Scenarios', icon: '🌡️', badge: 'NEW' },
    { href: '/sroi', label: 'SROI Calculator', icon: '💹' },
    { href: '/tedarikciler', label: 'Supplier ESG Audit', icon: '🔗' },
    { href: '/benchmark', label: 'Benchmark', icon: '📈' },
    { href: '/hedefler', label: 'Targets (SBTi)', icon: '🎯' },
    { href: '/sbti', label: 'SBTi Target Calculator', icon: '🎯', badge: 'NEW' },
    { href: '/scope3', label: 'Scope 3 Value Chain', icon: '🔗', badge: 'NEW' },
    { href: '/issb', label: 'ISSB IFRS S1+S2', icon: '📋', badge: 'NEW' },
    { href: '/tsrs', label: 'TSRS 1+2 (KGK)', icon: '🇹🇷', badge: 'NEW' },
    { href: '/sasb-sdg', label: 'SASB + SDG', icon: '📊', badge: 'NEW' },
    { href: '/water-esrs', label: 'Water + ESRS E2-E5', icon: '💧', badge: 'NEW' },
    { href: '/esg-benchmark', label: 'ESG Benchmark', icon: '📈', badge: 'NEW' },
    { href: '/uydu', label: 'Earth Intelligence', icon: '🛰️', badge: 'NEW' },
    { href: '/risk-assets', label: 'Physical Asset Risk', icon: '🏭', badge: 'NEW' },
    { href: '/gar', label: 'Bank GAR Portal', icon: '🏦', badge: 'PCAF' },
    { href: '/gar/kobi-dashboard', label: 'KOBİ Portföy', icon: '🏪' },
    { href: '/kobi-credit-score', label: 'KOBİ ESG Credit Score', icon: '🏅', badge: 'NEW' },
    { href: '/iso14064', label: 'Karbon Ayak İzi', icon: '🌿', badge: 'ISO' },
    { href: '/pcf', label: 'Ürün PCF (ISO 14067)', icon: '📦', badge: 'NEW' },
    { href: '/uk-sdr', label: 'FCA SDR + SFDR', icon: '🇬🇧', badge: 'UK' },
    { href: '/nhs-ppn', label: 'NHS Net Zero (PPN 06/21)', icon: '🏥', badge: 'UK' },
    { href: '/grid-plus', label: 'Sustain Grid+', icon: '⚡', badge: 'NEW' },
    { href: '/cdp', label: 'CDP Questionnaire', icon: '🌍', badge: 'CDP' },
    { href: '/eu-taxonomy', label: 'EU Taxonomy', icon: '🇪🇺', badge: 'NEW' },
    { href: '/gri', label: 'GRI 2021 Tracker', icon: '📖', badge: 'GRI' },
    { href: '/tnfd', label: 'TNFD Doğa Riski', icon: '🌿', badge: 'NEW' },
  ]},
  { section: 'Intelligence', items: [
    { href: '/hub', label: 'Intelligence Hub', icon: '🌍', badge: 'NEW' },
    { href: '/tcsi', label: 'Turkey ESG Index', icon: '🏆', badge: 'COP31' },
    { href: '/scenarios', label: 'TCFD War-Room', icon: '🌊' },
    { href: '/simulator', label: 'ROI Simulator', icon: '⚡' },
    { href: '/university', label: 'University Portal', icon: '🏛️' },
    { href: '/academy', label: 'Academy', icon: '🎓' },
    { href: '/esg', label: 'Public ESG Page', icon: '🌟' },
  ]},
  { section: 'Support', items: [
    { href: '/report-builder', label: 'Report Builder', icon: '📄', badge: 'NEW' },
    { href: '/autopilot', label: 'Sustain Autopilot', icon: '🤖', badge: 'NEW' },
    { href: '/entegrasyon', label: 'Integrations', icon: '🔌' },
    { href: '/destekler', label: 'Subsidies', icon: '💰' },
  ]},
  { section: 'Agency & Audit', items: [
    { href: '/agency', label: 'Agency Portal', icon: '🏢', badge: 'NEW' },
    { href: '/denetci', label: 'KGK Denetçi', icon: '⚖️', badge: 'TSRS' },
  ]},
  { section: 'Account', items: [
    { href: '/abonelik', label: 'Subscription', icon: '💳', badge: 'NEW' },
    { href: '/pre-launch', label: 'Pre-Launch QA', icon: '🚀', badge: 'ADMIN' },
  ]},
]

// TRANSLATION HELPER FOR SIDEBAR
function getTranslatedLabel(label: string, pathname: string): string {
  if (!pathname.startsWith('/tr')) return label;

  const translations: Record<string, string> = {
    '🏦 Bank Workspace': '🏦 Banka Çalışma Alanı',
    'General': 'Genel',
    'Reporting': 'Raporlama',
    'Compliance': 'Uyumluluk',
    'Climate & ESG': 'İklim & ESG',
    'Intelligence': 'Akıllı Analizler',
    'Support': 'Destek',
    'Agency & Audit': 'Acente & Denetim',
    'Account': 'Hesap',
    'Dashboard': 'Kontrol Paneli',
    'YK / CFO Özet': 'YK / CFO Özeti',
    'Data Entry': 'Veri Girişi',
    'AI Report Writer': 'Yapay Zeka Rapor Yazarı',
    'My Reports': 'Raporlarım',
    'Audit Trail': 'Denetim İzleri',
    'Global Tracker': 'Global Takipçi',
    'CBAM Declaration': 'SKDM Beyanı',
    'EUDR Supply': 'AB Ormansızlaşma Uyumu',
    'ESG Health Check': 'ESG Durum Analizi',
    'CSRD Çift Önemlilik': 'CSRD Çift Önemlilik',
    'TCFD Scenarios': 'TCFD Senaryoları',
    'SROI Calculator': 'SROI Hesaplayıcı',
    'Supplier ESG Audit': 'Tedarikçi ESG Denetimi',
    'Benchmark': 'Kıyaslama (Benchmark)',
    'Targets (SBTi)': 'SBTi Hedefleri',
    'SBTi Target Calculator': 'SBTi Hedef Hesaplayıcı',
    'Scope 3 Value Chain': 'Kapsam 3 Değer Zinciri',
    'ISSB IFRS S1+S2': 'ISSB IFRS S1+S2',
    'TSRS 1+2 (KGK)': 'TSRS 1+2 (KGK)',
    'SASB + SDG': 'SASB + Sürdürülebilir Kalkınma Amaçları',
    'Water + ESRS E2-E5': 'Su + ESRS E2-E5',
    'ESG Benchmark': 'ESG Kıyaslama',
    'Earth Intelligence': 'Dünya ve Uydu Analizi',
    'Physical Asset Risk': 'Fiziksel Tesis Riski',
    'Bank GAR Portal': 'Banka GAR Portali',
    'KOBİ Portföy': 'KOBİ Portföyü',
    'KOBİ ESG Credit Score': 'KOBİ ESG Kredi Skoru',
    'Karbon Ayak İzi': 'Karbon Ayak İzi (ISO 14064)',
    'Ürün PCF (ISO 14067)': 'Ürün Karbon Ayak İzi (PCF)',
    'FCA SDR + SFDR': 'FCA SDR + SFDR',
    'NHS Net Zero (PPN 06/21)': 'NHS Net Zero (PPN 06/21)',
    'Sustain Grid+': 'Sustain Grid+',
    'CDP Questionnaire': 'CDP Anketi',
    'EU Taxonomy': 'AB Taksonomisi',
    'GRI 2021 Tracker': 'GRI 2021 Takipçi',
    'TNFD Doğa Riski': 'TNFD Doğa Riski',
    'Intelligence Hub': 'Bilgi Merkezi',
    'Turkey ESG Index': 'Türkiye ESG Endeksi',
    'TCFD War-Room': 'TCFD Savaş Odası',
    'ROI Simulator': 'ROI Simülatörü',
    'University Portal': 'Üniversite Portali',
    'Academy': 'Sürdürülebilirlik Akademisi',
    'Public ESG Page': 'Kamuya Açık ESG Sayfası',
    'Report Builder': 'Rapor Sihirbazı',
    'Sustain Autopilot': 'Sustain Otopilot',
    'Integrations': 'Entegrasyonlar',
    'Subsidies': 'Devlet Destekleri',
    'Agency Portal': 'Acente Portali',
    'KGK Denetçi': 'KGK Denetçi Portali',
    'Subscription': 'Abonelik',
    'Pre-Launch QA': 'Yayın Öncesi QA',
  };

  return translations[label] || label;
}

export function Sidebar() {
  const pathname = usePathname()
  const [companyType, setCompanyType] = useState<string>('')
  const [companyName, setCompanyName] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userTitle, setUserTitle] = useState<string>('')

  useEffect(() => {
    setCompanyType(localStorage.getItem('company_type') ?? '')
    setCompanyName(localStorage.getItem('company_name') ?? '')
    setUserName(localStorage.getItem('user_name') ?? '')
    setUserTitle(localStorage.getItem('user_title') ?? '')
  }, [])

  const isBank = companyType === 'bank'
  const activeNav = isBank ? [...BANK_NAV, ...navItems] : navItems

  const displayCompany = companyName || (isBank ? 'Bank Demo' : 'Your Company')
  const workspaceLabel = isBank ? (pathname.startsWith('/tr') ? 'Banka GAR Çalışma Alanı' : 'Bank GAR Workspace')
    : companyType === 'corporate' ? (pathname.startsWith('/tr') ? 'Kurumsal Çalışma Alanı' : 'Corporate Workspace')
    : companyType === 'sme' ? (pathname.startsWith('/tr') ? 'KOBİ Çalışma Alanı' : 'SME Workspace')
    : companyType === 'university' ? (pathname.startsWith('/tr') ? 'Üniversite Çalışma Alanı' : 'University Workspace')
    : (pathname.startsWith('/tr') ? 'SustainHub Platformu' : 'SustainHub Platform')
  const companyInitials = displayCompany.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')

  const displayUser = userName || 'SustainHub Team'
  const displayRole = userTitle || (pathname.startsWith('/tr') ? 'Sürdürülebilirlik Platformu' : 'Sustainability Platform')
  const userInitials = displayUser.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('')

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-50 bg-slate-900 text-white"
      style={{ width: 'var(--sidebar-width, 240px)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-emerald-500/20">
          <img src="/logo.png" alt="SustainHub" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">SustainHub</div>
          <div className="text-xs text-emerald-400">sustainhub.ai · v2.0</div>
        </div>
      </div>

      {/* Company switcher */}
      <div className="mx-3 mt-3 rounded-lg px-3 py-2.5 flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-emerald-500 text-white">
          {isBank ? '🏦' : (companyInitials || '🌿')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">{displayCompany}</div>
          <div className="text-xs text-emerald-400">{workspaceLabel}</div>
        </div>
        <span className="text-xs opacity-40">⌄</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {activeNav.map(({ section, items }) => (
          <div key={section}>
            <div
              className={cn(
                'px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest',
                section.startsWith('🏦') ? 'text-yellow-400/90' : 'text-emerald-400/80'
              )}
            >
              {getTranslatedLabel(section, pathname)}
            </div>
            {items.map(({ href, label, icon, badge }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-[3px]',
                    active
                      ? 'font-semibold border-emerald-400 bg-white/10 text-emerald-50'
                      : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="text-base w-5 text-center">{icon}</span>
                  <span className="flex-1">{getTranslatedLabel(label, pathname)}</span>
                  {badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      style={{ fontSize: '10px' }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-slate-800 border border-slate-700">
          {userInitials || '🌿'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-200">{displayUser}</div>
          <div className="text-xs truncate text-emerald-400/80">{displayRole}</div>
        </div>
      </div>
    </aside>
  )
}
