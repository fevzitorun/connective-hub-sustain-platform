'use client'

import Link from 'next/link'

const TEAM = [
  {
    name: 'Fevzi Torun',
    title: 'CEO & Co-Founder',
    location: 'İstanbul Teknokent',
    bio: 'Seri girişimci. Connective Hub ekosisteminin kurucusu. 35+ yıllık sektör deneyimi. Teknokent şirketi, UK-Türkiye köprüsü.',
    linkedin: '#',
    icon: '👨‍💼',
  },
  {
    name: 'Kemal Yıldırım',
    title: 'CTO & Technical Advisor',
    location: 'Londra',
    bio: 'Mimari, uydu entegrasyonu ve AI altyapısı. theconnective.uk teknik liderliği. UK-Türkiye teknik köprüsü.',
    linkedin: '#',
    icon: '👨‍💻',
  },
  {
    name: 'Erbil Büyükbay',
    title: 'Research Lead',
    location: 'Türkiye',
    bio: 'Sustain Research Institute yönetimi, pazar araştırması ve rekabetçi zeka.',
    linkedin: '#',
    icon: '📊',
  },
]

const ECOSYSTEM = [
  { name: 'SustainHub.online', desc: 'Sürdürülebilirlik İstihbarat Platformu (bu platform)', active: true },
  { name: 'Scanbook.uk', desc: 'Dijital içerik & kütüphane platformu', active: true },
  { name: '7fil.com', desc: 'Medya & içerik ekosistemi', active: true },
  { name: 'MedProtocol', desc: 'Sağlık protokol yönetim sistemi', active: false },
  { name: 'theconnective.uk', desc: 'UK merkezi — B2B dijital dönüşüm', active: true },
]

const STANDARDS = [
  'TSRS 1 & 2 (KGK)', 'CSRD / ESRS (AB)', 'UK SRS / ISSB S1&S2', 'GRI Universal 2021',
  'TCFD', 'ISO 14064-1:2018', 'ISO 14067 (PCF)', 'CBAM', 'EU Taxonomy', 'PCAF Standard v2',
  'BDDK Sürd. Bankacılık', 'FCA SDR 2024', 'SASB (77 sektör)', 'SFDR Art. 8/9',
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/urunler" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Ürünler</Link>
          <Link href="/cop31" className="text-sm text-amber-400 hover:text-amber-300 transition-colors hidden md:block">🇹🇷 COP31</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Giriş</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Demo →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Sürdürülebilirliği bir raporlama yükü olmaktan çıkarıyoruz.
          <br />
          <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Stratejik zekaya dönüştürüyoruz.
          </span>
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          İstanbul Teknokent'te doğduk. Londra'dan büyüyoruz. Türkiye'nin
          ilk <strong className="text-white">Sürdürülebilirlik İstihbarat İşletim Sistemi (SIOS)</strong>'ni
          inşa ediyoruz — karbon hesaplamadan uydu doğrulamaya, GAR raporlamasından COP31 hazırlığına.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🎯', title: 'Misyon', body: 'Türkiye\'deki her şirketin ve bankanın küresel sürdürülebilirlik standartlarına — TSRS, ISSB, TCFD, EU Taxonomy — uyum sağlamasını mümkün kılmak.' },
            { icon: '🔭', title: 'Vizyon', body: 'Sürdürülebilirlik verisi bir yük değil, rekabet avantajı olmalı. SustainHub, veriyi istihbaraya, istihbaratı aksiyona dönüştürür.' },
            { icon: '💎', title: 'Değerler', body: 'Bilimsel doğruluk. Regülatör güveni. Açık standartlar. Rakiplerden değil, standartlardan ilham alan ürün geliştirme.' },
          ].map(v => (
            <div key={v.title} className="rounded-2xl p-6 border border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-black text-white text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-white mb-8 text-center">Ekip</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TEAM.map(t => (
            <div key={t.name} className="rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-4xl mb-4">{t.icon}</div>
              <div className="font-black text-white text-base">{t.name}</div>
              <div className="text-xs text-emerald-400 mt-0.5 mb-1">{t.title}</div>
              <div className="text-xs text-slate-600 mb-3">📍 {t.location}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl p-5 border border-dashed border-slate-700 text-center">
          <div className="text-slate-500 text-sm mb-2">Ekibimizi büyütüyoruz</div>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            {['Lead Engineer (İstanbul)', 'AI/ML Engineer (Remote)', 'Product Designer (Remote)', 'BD & Sales (Londra)'].map(r => (
              <span key={r} className="px-3 py-1 rounded-full border border-slate-700 text-slate-400">{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="max-w-5xl mx-auto px-6 py-8 border-t border-white/5">
        <h2 className="text-xl font-black text-white mb-6">Connective Hub Ekosistemi</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl">
          SustainHub, Connective Hub Dijital Teknolojiler Ltd. bünyesinde geliştirilen 5 projeden biridir.
          35 yıllık sektör deneyimi ve İstanbul Teknokent + Londra çift merkezli yapıyla inşa edilmektedir.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {ECOSYSTEM.map(e => (
            <div key={e.name} className="rounded-xl p-4 border text-center"
              style={{
                borderColor: e.active ? 'rgba(5,150,105,0.3)' : 'rgba(100,116,139,0.2)',
                background: e.active ? 'rgba(5,150,105,0.05)' : 'rgba(100,116,139,0.03)',
              }}>
              <div className="font-bold text-sm" style={{ color: e.active ? '#34d399' : '#475569' }}>{e.name}</div>
              <div className="text-xs text-slate-500 mt-1 leading-snug">{e.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="max-w-5xl mx-auto px-6 py-8 border-t border-white/5">
        <h2 className="text-xl font-black text-white mb-4">Desteklenen Standartlar (14+)</h2>
        <div className="flex flex-wrap gap-2">
          {STANDARDS.map(s => (
            <span key={s} className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400/80 bg-emerald-500/5">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Seed */}
      <section className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5">
        <div className="rounded-2xl p-8 border border-blue-500/20" style={{ background: 'rgba(29,78,216,0.05)' }}>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Seed Turu Açık</h2>
              <p className="text-slate-400 text-sm max-w-lg">
                €1.5M Seed hedefi. CarbonSense + Earth Intelligence + Araştırma Enstitüsü odaklı.
                Türkiye'nin COP31 ev sahipliği, BDDK GAR zorunluluğu ve 34 banka pazarı.
              </p>
              <div className="flex gap-4 mt-4 text-sm">
                <div><span className="font-black text-white">€1.5M</span> <span className="text-slate-500">Seed Hedef</span></div>
                <div><span className="font-black text-white">$8-12M</span> <span className="text-slate-500">Series A (2027)</span></div>
                <div><span className="font-black text-white">€40M+</span> <span className="text-slate-500">5 Yıl ARR</span></div>
              </div>
            </div>
            <Link href="mailto:fevzi@theconnective.uk"
              className="flex-shrink-0 px-8 py-4 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}>
              Yatırımcı Sunumu İste →
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-slate-700 border-t border-white/5">
        <p>SustainHub.online · Connective Hub Dijital Teknolojiler Ltd.</p>
        <p className="mt-1">İstanbul Teknokent, Ankara · theconnective.uk, Londra</p>
      </footer>
    </div>
  )
}
