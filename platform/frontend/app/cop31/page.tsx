'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Countdown ──────────────────────────────────────────────────────────
function Countdown() {
  const TARGET = new Date('2026-11-09T09:00:00Z')
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    const tick = () => setDiff(Math.max(0, TARGET.getTime() - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const days    = Math.floor(diff / 86_400_000)
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000)  / 60_000)
  const seconds = Math.floor((diff % 60_000)     / 1_000)

  return (
    <div className="flex gap-4 justify-center my-8">
      {[{ v: days, l: 'Gün' }, { v: hours, l: 'Saat' }, { v: minutes, l: 'Dakika' }, { v: seconds, l: 'Saniye' }].map(u => (
        <div key={u.l} className="text-center">
          <div className="text-4xl md:text-6xl font-black tabular-nums"
            style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {String(u.v).padStart(2, '0')}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">{u.l}</div>
        </div>
      ))}
    </div>
  )
}

// ── Data ────────────────────────────────────────────────────────────────
const DEADLINES = [
  { date: 'Ağustos 2026', label: 'BDDK TSRS Pilot Raporlama Son Tarihi', status: 'urgent', tag: 'BDDK' },
  { date: 'Eylül 2026',   label: 'KGK TSRS 1&2 Sınırlı Güvence Son Tarihi', status: 'urgent', tag: 'KGK' },
  { date: 'Ekim 2026',    label: 'BDDK GAR İlk Dönem Beyanı', status: 'soon', tag: 'GAR' },
  { date: 'Kasım 2026',   label: 'COP31 — Türkiye Ulusal Katkı Beyanı (NDC)', status: 'cop31', tag: 'COP31' },
  { date: 'Aralık 2026',  label: 'CBAM Tam Uygulama Başlangıcı', status: 'soon', tag: 'CBAM' },
  { date: 'Ocak 2027',    label: 'FCA UK SRS Zorunlu Uyum (Halka Açık Şirketler)', status: 'uk', tag: 'FCA' },
]

const FEATURES = [
  { icon: '🇹🇷', title: 'TSRS Uyum Motoru', desc: 'KGK\'nın TSRS 1&2 standartlarını (IFRS S1/S2 tabanlı) tam destekler. Sınırlı güvence rapor şablonları dahil.' },
  { icon: '🏦', title: 'BDDK GAR Portalı', desc: 'Yeşil Varlık Oranı hesaplama, PCAF finanse edilmiş emisyonlar ve AB Taksonomisi uyumu tek panoda.' },
  { icon: '🛰️', title: 'Uydu Doğrulama', desc: 'ESA Sentinel-2 ve NASA verileriyle varlık bazlı fiziksel iklim riski. "Sustain Verified" rozeti ile greenwashing önleme.' },
  { icon: '🤖', title: 'AI Copilot', desc: 'Claude destekli asistan — "COP31\'e nasıl hazırlanmalıyım?" sorularını anında yanıtlar, aksiyon planı üretir.' },
  { icon: '🌡️', title: 'TCFD Senaryo Analizi', desc: 'IEA Net Zero 2050 ve NGFS projeksiyonları ile CFO\'lar için CapEx/OpEx iklim finansal etki matrisi.' },
  { icon: '🌍', title: 'Üç Yargı Alanı', desc: 'Türkiye (BDDK+KGK) + İngiltere (FCA+UK SRS) + KKTC (Merkez Bankası) — tek lisansla üç bölge.' },
]

const NDC_TARGETS = [
  { sector: 'Enerji', target2030: '%21 azaltım', target2053: 'Net Sıfır', icon: '⚡', color: '#f59e0b' },
  { sector: 'Sanayi', target2030: '%18 azaltım', target2053: 'Net Sıfır', icon: '🏭', color: '#ef4444' },
  { sector: 'Ulaşım', target2030: '%15 azaltım', target2053: '%90 azaltım', icon: '🚛', color: '#3b82f6' },
  { sector: 'Bina', target2030: '%12 azaltım', target2053: '%85 azaltım', icon: '🏢', color: '#8b5cf6' },
  { sector: 'Tarım', target2030: '%8 azaltım', target2053: '%50 azaltım', icon: '🌾', color: '#22c55e' },
  { sector: 'Atık', target2030: '%25 azaltım', target2053: 'Net Sıfır', icon: '♻️', color: '#06b6d4' },
]

const CHECKLIST = [
  { step: 1, title: 'Veri Toplama', desc: 'Kapsam 1, 2 ve 3 emisyon verilerini toplayın. TEİAŞ 2024 grid faktörü: 0.4166 kgCO₂e/kWh', duration: '2-4 hafta', icon: '📊' },
  { step: 2, title: 'Materiality Değerlendirmesi', desc: 'ESRS uyumlu çift yönlü önemlilik analizi yapın. Paydaş katılımını belgeleyin.', duration: '2-3 hafta', icon: '🎯' },
  { step: 3, title: 'AI Rapor Üretimi', desc: 'SustainHub AI ile TSRS 1&2 uyumlu rapor taslağı oluşturun. 6 zorunlu bölüm otomatik.', duration: '1 gün', icon: '🤖' },
  { step: 4, title: 'Denetim & Güvence', desc: 'Bağımsız denetim firmasından sınırlı güvence alın. GDS 3000/3410 uyumlu.', duration: '3-4 hafta', icon: '✅' },
  { step: 5, title: 'Beyan & Yayın', desc: 'SARP platformuna yükleyin, KGK\'ya bildirin. COP31 sunumu için hazırlayın.', duration: '1 hafta', icon: '🚀' },
]

const FRAMEWORK_COMPARISON = [
  { framework: 'TSRS 1&2', region: '🇹🇷 Türkiye', regulator: 'KGK', mandatory: '400 şirket', deadline: 'Eylül 2026', status: 'Aktif' },
  { framework: 'CSRD/ESRS', region: '🇪🇺 AB', regulator: 'EFRAG', mandatory: '50.000+ şirket', deadline: '2025-2028', status: 'Aktif' },
  { framework: 'UK SRS', region: '🇬🇧 UK', regulator: 'FCA', mandatory: 'Halka açık', deadline: 'Ocak 2027', status: 'Hazırlanıyor' },
  { framework: 'ISSB S1/S2', region: '🌍 Global', regulator: 'IFRS', mandatory: 'Ülkelere göre', deadline: '2025+', status: 'Aktif' },
  { framework: 'CBAM', region: '🇪🇺 AB', regulator: 'AB Komisyonu', mandatory: '70K+ ihracatçı', deadline: 'Ocak 2026', status: 'Tam rejim' },
  { framework: 'BDDK GAR', region: '🇹🇷 Türkiye', regulator: 'BDDK', mandatory: '34 banka', deadline: 'Ekim 2026', status: 'Pilot' },
]

const SECTOR_IMPACTS = [
  { sector: 'Bankacılık', companies: 34, impact: 'Yüksek', actions: ['GAR hesaplama', 'PCAF metodolojisi', 'Finanse edilmiş emisyonlar'], icon: '🏦', gradient: 'linear-gradient(135deg,#1e40af,#3b82f6)' },
  { sector: 'Çimento', companies: 12, impact: 'Kritik', actions: ['CBAM beyannamesi', 'Scope 1 dominant (%89)', 'Dekarbonizasyon yol haritası'], icon: '🏗️', gradient: 'linear-gradient(135deg,#b45309,#f59e0b)' },
  { sector: 'Enerji/Rafineri', companies: 18, impact: 'Kritik', actions: ['AB Taksonomisi uyumu', 'Geçiş planı', 'Yenilenebilir dönüşüm'], icon: '⚡', gradient: 'linear-gradient(135deg,#dc2626,#f87171)' },
  { sector: 'Perakende', companies: 25, impact: 'Orta', actions: ['Scope 3 tedarik zinciri', 'EUDR uyumu', 'Çift yönlü önemlilik'], icon: '🛒', gradient: 'linear-gradient(135deg,#059669,#34d399)' },
]

// ── Color Maps ──────────────────────────────────────────────────────────
const COLOR_MAP = {
  urgent: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)', tag: '#ef4444', dot: '#ef4444' },
  soon:   { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', tag: '#f59e0b', dot: '#f59e0b' },
  cop31:  { bg: 'rgba(5,150,105,0.1)',  border: 'rgba(5,150,105,0.3)',  tag: '#34d399', dot: '#34d399' },
  uk:     { bg: 'rgba(29,78,216,0.08)', border: 'rgba(29,78,216,0.25)', tag: '#60a5fa', dot: '#60a5fa' },
} as const

export default function COP31Page() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
          <span className="text-xs text-emerald-400">× COP31</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Ürünler</Link>
          <Link href="/partners" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Ortaklar</Link>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Hakkımızda</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Giriş</Link>
          <Link href="/request-demo" className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Demo İste
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8 border"
          style={{ background: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.3)', color: '#fbbf24' }}>
          🇹🇷 COP31 Türkiye Özel Sayısı
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          COP31 Türkiye'de.
          <br />
          <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sürdürülebilirlik Platformunuz Hazır mı?
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          BDDK zorunlu TSRS raporlaması, GAR beyanları ve PCAF finanse edilmiş emisyonlar —
          hepsi COP31 öncesi yürürlüğe giriyor. SustainHub, 34 Türk bankası ve 200+ kurumsal şirket için hazır.
        </p>
        <Countdown />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/request-demo"
            className="px-8 py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Ücretsiz Demo → 60 Saniyede Başla
          </Link>
        </div>
      </section>

      {/* Deadlines */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-white text-center mb-8">
          COP31 Öncesi Kritik Son Tarihler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEADLINES.map(d => {
            const colors = COLOR_MAP[d.status as keyof typeof COLOR_MAP] ?? COLOR_MAP.soon
            return (
              <div key={d.label} className="rounded-xl p-4 border"
                style={{ background: colors.bg, borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: colors.dot + '20', color: colors.tag }}>
                    {d.tag}
                  </span>
                  <span className="text-xs font-bold" style={{ color: colors.dot }}>{d.date}</span>
                </div>
                <p className="text-sm text-slate-300 leading-snug">{d.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── YENİ: Türkiye NDC — 2053 Net Sıfır Hedefleri ─────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-4 border"
            style={{ background: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.3)', color: '#34d399' }}>
            📋 Türkiye Ulusal Katkı Beyanı (NDC)
          </div>
          <h2 className="text-3xl font-black text-white mb-3">
            2053 Net Sıfır Yol Haritası
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Türkiye'nin Uzun Vadeli İklim Stratejisi kapsamında sektörel azaltım hedefleri.
            SustainHub'ın SBTi motoru bu hedefleri şirket bazında hesaplar.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {NDC_TARGETS.map(t => (
            <div key={t.sector} className="rounded-2xl p-5 border border-white/5 text-center hover:border-emerald-500/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-3xl mb-3">{t.icon}</div>
              <div className="font-black text-white text-sm mb-2">{t.sector}</div>
              <div className="text-xs mb-1">
                <span className="text-slate-500">2030:</span>{' '}
                <span style={{ color: t.color }} className="font-bold">{t.target2030}</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-500">2053:</span>{' '}
                <span className="text-emerald-400 font-bold">{t.target2053}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">
          Kaynak: TÜRKİYE Updated 1st NDC (2023) · Türkiye Uzun Vadeli İklim Stratejisi
        </p>
      </section>

      {/* ── YENİ: COP31 Hazırlık Rehberi — 5 Adım ────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">
            COP31'e 5 Adımda Hazırlanın
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Veri toplamadan raporlamaya, denetimden beyana — eksiksiz hazırlık yol haritası.
          </p>
        </div>
        <div className="space-y-4">
          {CHECKLIST.map((c, i) => (
            <div key={c.step} className="flex gap-5 items-start rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all group"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
                {c.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/5 text-emerald-400">
                    Adım {c.step}
                  </span>
                  <span className="text-xs text-slate-500">{c.duration}</span>
                </div>
                <h3 className="font-black text-white text-lg group-hover:text-emerald-400 transition-colors">{c.title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
              </div>
              {i < CHECKLIST.length - 1 && (
                <div className="hidden md:block text-slate-600 text-xl self-center">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── YENİ: Sektörel Etki Analizi ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">
            Sektörel Etki Analizi
          </h2>
          <p className="text-slate-400 text-sm">Her sektör COP31'den farklı etkileniyor. İşte yapmanız gerekenler.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTOR_IMPACTS.map(s => (
            <div key={s.sector} className="rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: s.gradient }}>
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">{s.sector}</h3>
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-500">{s.companies} şirket</span>
                    <span className={`font-bold ${s.impact === 'Kritik' ? 'text-red-400' : s.impact === 'Yüksek' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      Etki: {s.impact}
                    </span>
                  </div>
                </div>
              </div>
              <ul className="space-y-2">
                {s.actions.map(a => (
                  <li key={a} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── YENİ: Uluslararası Çerçeve Karşılaştırma ─────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">
            Uluslararası Çerçeve Karşılaştırması
          </h2>
          <p className="text-slate-400 text-sm">SustainHub hepsini tek platformda destekler.</p>
        </div>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th className="text-left px-5 py-3 text-slate-400 font-bold text-xs uppercase tracking-wider">Çerçeve</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-bold text-xs uppercase tracking-wider">Bölge</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-bold text-xs uppercase tracking-wider">Düzenleyici</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-bold text-xs uppercase tracking-wider">Kapsam</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-bold text-xs uppercase tracking-wider">Son Tarih</th>
                  <th className="text-left px-5 py-3 text-slate-400 font-bold text-xs uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody>
                {FRAMEWORK_COMPARISON.map((f, i) => (
                  <tr key={f.framework} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                    style={i === 0 ? { background: 'rgba(5,150,105,0.05)' } : {}}>
                    <td className="px-5 py-3 font-bold text-white">{f.framework}</td>
                    <td className="px-5 py-3 text-slate-300">{f.region}</td>
                    <td className="px-5 py-3 text-slate-400">{f.regulator}</td>
                    <td className="px-5 py-3 text-slate-400">{f.mandatory}</td>
                    <td className="px-5 py-3 text-slate-300 font-mono text-xs">{f.deadline}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        f.status === 'Tam rejim' ? 'bg-red-500/10 text-red-400' :
                        f.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400' :
                        f.status === 'Pilot' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features (Mevcut) */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-white text-center mb-2">
          COP31 İçin İhtiyacınız Olan Her Şey
        </h2>
        <p className="text-slate-500 text-center text-sm mb-10">Tek platform, üç yargı alanı, sıfır danışman sürtünmesi.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all group"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Capture */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl p-8 border" style={{ background: 'rgba(5,150,105,0.05)', borderColor: 'rgba(5,150,105,0.2)' }}>
          <div className="text-3xl mb-4">📥</div>
          <h2 className="text-2xl font-black text-white mb-2">COP31 Hazırlık Rehberini İndirin</h2>
          <p className="text-slate-400 text-sm mb-6">
            TSRS uyum takvimi, GAR hesaplama rehberi ve PCAF metodoloji talimatlarını içeren ücretsiz PDF.
          </p>
          {!submitted ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="kurumsal@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm"
              />
              <button
                onClick={() => { if (email.includes('@')) setSubmitted(true) }}
                className="px-6 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-105 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
                Rehberi Gönder →
              </button>
            </div>
          ) : (
            <div className="py-4">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-emerald-400 font-bold">Teşekkürler! Rehber {email} adresine gönderildi.</p>
              <p className="text-slate-500 text-xs mt-1">Demo istemek ister misiniz?{' '}
                <Link href="/request-demo" className="text-emerald-400 hover:underline">Hemen başlayın →</Link>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '34', l: 'Türk Bankası', s: 'BDDK GAR Zorunluluğu' },
            { n: '400+', l: 'Şirket', s: 'TSRS Raporlama Zorunluluğu' },
            { n: '70K+', l: 'İhracatçı', s: 'CBAM Kapsamında' },
            { n: '2053', l: 'Net Sıfır', s: 'Türkiye Hedefi' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-3xl font-black" style={{ color: '#34d399' }}>{s.n}</div>
              <div className="text-sm font-bold text-white mt-1">{s.l}</div>
              <div className="text-xs text-slate-500">{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-600 px-6">
        <p>SustainHub.online — Connective Hub Dijital Teknolojiler Ltd. · İstanbul & Londra</p>
        <p className="mt-1">BDDK · KGK · FCA · KKTC Merkez Bankası · ISSB · PCAF · AB Taksonomisi Uyumlu</p>
      </footer>
    </div>
  )
}
