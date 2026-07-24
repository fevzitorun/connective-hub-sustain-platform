'use client'

import Link from 'next/link'

const PRODUCTS = [
  {
    id: 'carbonsense',
    emoji: '♻️',
    name: 'CarbonSense',
    tagline: 'ESG & Karbon Yönetimi',
    status: 'live',
    color: '#10b981',
    desc: 'GHG Protokolü, TSRS 1&2, CSRD/ESRS, GRI ve ISSB S2\'yi destekleyen tam teşekküllü karbon hesaplama ve ESG raporlama motoru.',
    features: ['Kapsam 1/2/3 hesaplama', 'AI Rapor Üretici (PDF/Word)', 'Çoklu çerçeve (TSRS, GRI, ISSB)', 'Magic Import (Excel/OCR)', 'XBRL dijital beyan'],
    target: 'Tüm sektörler · 200+ büyük şirket · 70.000+ KOBİ',
    price: 'Teklife göre',
    cta: '/register',
    ctaText: 'Demo Başlat',
  },
  {
    id: 'earth',
    emoji: '🛰️',
    name: 'Earth Intelligence',
    tagline: 'Uydu & Coğrafi Zeka',
    status: 'live',
    color: '#3b82f6',
    desc: 'ESA Sentinel-2, NASA ve Copernicus verileriyle varlık bazında fiziksel iklim riski. Yeşil iddiaları bağımsız uydu gözlemiyle doğrulayan "Sustain Verified" rozeti.',
    features: ['Sel / kuraklık / deprem riski', 'NDVI yeşil alan analizi', 'IPCC AR6 2050 projeksiyonları', 'TCFD fiziksel risk modülü', '"Sustain Verified" rozeti'],
    target: 'Bankalar · Sigorta · Gayrimenkul · Enerji',
    price: 'Teklife göre',
    cta: '/dashboard',
    ctaText: 'Earth Demo',
  },
  {
    id: 'finance',
    emoji: '🏦',
    name: 'Sustain Finance',
    tagline: 'GAR · PCAF · Yeşil Finansman',
    status: 'live',
    color: '#f59e0b',
    desc: 'BDDK zorunlu Yeşil Varlık Oranı (GAR) hesaplama portalı. PCAF Standard v2 ile Kapsam 3 Kategori 15 finanse edilen emisyonlar. EU Taxonomy sınıflandırması.',
    features: ['GAR hesaplama (BDDK/EBA/FCA)', 'PCAF finanse edilen emisyonlar', 'EU Taxonomy NACE eşleştirme', 'KOBİ ESG Kredi Skoru (AAA→D)', 'İklim stres testi (IEA NZE/NGFS)'],
    target: '34 Türk bankası · Yatırım fonları · Sigorta',
    price: 'Teklife göre',
    cta: '/gar',
    ctaText: 'GAR Portalı',
  },
  {
    id: 'climate',
    emoji: '🌡️',
    name: 'Climate Risk',
    tagline: 'TCFD · ISSB S2 · Senaryo Analizi',
    status: 'live',
    color: '#8b5cf6',
    desc: 'CFO\'ya yönelik iklim finansal etki matrisi. CapEx, OpEx ve iklim-ayarlı varlık değeri hesaplama. IEA ve NGFS senaryolarıyla geçiş ve fiziksel risk modelleme.',
    features: ['TCFD 4 sütun raporlaması', 'CFO Finansal Etki Matrisi', 'IEA NZE 2050 / NGFS senaryolar', 'Kapsam 3 Kat. 15 köprüsü', 'IFRS S2 / UK SRS uyumlu çıktı'],
    target: 'CFO\'lar · Yönetim Kurulları · Denetçiler',
    price: 'Platforma dahil',
    cta: '/tcfd',
    ctaText: 'TCFD Modülü',
  },
  {
    id: 'grid',
    emoji: '⚡',
    name: 'Grid+',
    tagline: 'Enerji İstihbarat Platformu',
    status: 'coming',
    color: '#06b6d4',
    desc: 'Akıllı sayaç entegrasyonu, güneş üretim takibi ve enerji verimliliği skoru. Grid+ verisi doğrudan CarbonSense Kapsam 2\'ye beslenir — manuel fatura girişi tarihe karışır.',
    features: ['Gerçek zamanlı tüketim izleme', 'Solar + batarya depolama', 'TEİAŞ şebeke faktörü otomatik', 'EV şarj yönetimi', 'Talep tahmin AI'],
    target: 'Sanayi · Hastane · Belediye · Enerji şirketleri',
    price: 'Teklife göre',
    cta: '/register',
    ctaText: 'Ön Kayıt',
  },
  {
    id: 'remoteops',
    emoji: '📡',
    name: 'RemoteOps',
    tagline: 'IoT Altyapı İzleme',
    status: 'coming',
    color: '#ec4899',
    desc: 'Hastaneler, belediyeler ve kritik altyapı için 7/24 IoT sensör izleme. Su sistemleri, atık yönetimi, akıllı bina otomasyonu. UK NHS + yerel yönetim fırsatı.',
    features: ['MQTT / Modbus / BACnet desteği', 'Alarm yönetimi & eskalasyon', 'Su kaçak tespiti', 'Tahmine dayalı bakım', 'Mobil alan operasyonları'],
    target: 'UK NHS · Belediyeler · Enerji altyapısı',
    price: 'Q1 2027 — ön kayıt açık',
    cta: '/register',
    ctaText: 'Ön Kayıt',
  },
]

export default function UrunlerPage() {
  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/cop31" className="text-sm text-amber-400 hover:text-amber-300 transition-colors hidden md:block font-bold">🇹🇷 COP31</Link>
          <Link href="/tcsi" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">TCSI 2026</Link>
          <Link href="/hakkimizda" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Hakkımızda</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Giriş</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Demo →
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="text-center px-6 pt-16 pb-12 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-6 border"
          style={{ background: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.3)', color: '#34d399' }}>
          Sustainability Intelligence Operating System · v2.0
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          6 Ürün, Tek Ekosistem
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Karbon hesaplamadan uydu doğrulamaya, GAR raporlamasından IoT izlemeye —
          sürdürülebilirlik yönetiminin her katmanı tek platform altında.
        </p>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 pb-16 space-y-6">
        {PRODUCTS.map(p => (
          <div key={p.id}
            className="rounded-2xl border p-8 transition-all hover:border-opacity-50 group"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: p.color + '30' }}
          >
            <div className="flex flex-col md:flex-row gap-8">

              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{p.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{p.name}</h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: p.status === 'live' ? 'rgba(5,150,105,0.2)' : 'rgba(100,116,139,0.2)',
                          color:      p.status === 'live' ? '#34d399' : '#94a3b8',
                          border: `1px solid ${p.status === 'live' ? 'rgba(5,150,105,0.3)' : 'rgba(100,116,139,0.3)'}`,
                        }}>
                        {p.status === 'live' ? '✓ Canlı' : '⏳ Yakında'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: p.color }}>{p.tagline}</div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.features.map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded-full border"
                      style={{ borderColor: p.color + '30', color: p.color + 'cc', background: p.color + '10' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div className="md:w-64 flex-shrink-0 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Hedef Kitle</div>
                  <div className="text-xs text-slate-400">{p.target}</div>
                  <div className="text-xs text-slate-600 uppercase tracking-wider mt-3">Fiyatlandırma</div>
                  <div className="text-sm font-bold" style={{ color: p.color }}>{p.price}</div>
                </div>
                <Link
                  href={p.cta}
                  className="mt-6 w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{ background: p.color + '20', color: p.color, border: `1px solid ${p.color}40` }}
                >
                  {p.ctaText} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Pricing CTA */}
      <section className="border-t border-white/5 py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-black text-white mb-4">Hangi plan size uygun?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-sm">
            {[
              { plan: 'Starter', price: 'Teklife göre', for: 'KOBİ & İhracatçılar', color: '#64748b' },
              { plan: 'Professional', price: 'Teklife göre', for: 'Orta ölçekli', color: '#10b981' },
              { plan: 'Enterprise', price: 'İletişime geçin', for: 'Büyük kurumlar', color: '#3b82f6' },
              { plan: 'Bank GAR', price: 'İletişime geçin', for: '34 BDDK bankası', color: '#f59e0b' },
            ].map(t => (
              <div key={t.plan} className="rounded-xl p-4 border text-center"
                style={{ borderColor: t.color + '30', background: t.color + '08' }}>
                <div className="font-black text-white">{t.plan}</div>
                <div className="text-xs mt-1" style={{ color: t.color }}>{t.price}</div>
                <div className="text-xs text-slate-500 mt-1">{t.for}</div>
              </div>
            ))}
          </div>
          <Link href="/register"
            className="inline-block px-10 py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Ücretsiz Demo Başlat →
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-slate-700 border-t border-white/5">
        SustainHub.online · Connective Hub Dijital Teknolojiler Ltd. · İstanbul Teknokent + Londra
      </footer>
    </div>
  )
}
