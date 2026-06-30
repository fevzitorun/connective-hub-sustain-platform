'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, ShieldCheck, Globe, Zap, Landmark,
  Truck, GraduationCap, Check, ChevronRight, BarChart3,
  FileText, Satellite, Brain, Building2, Leaf,
} from 'lucide-react'
import { API_URL } from '@/lib/constants'

// ── ESG Health Widget ────────────────────────────────────────────────────────
const SECTORS = [
  { value: 'manufacturing', label: 'Manufacturing / Industry' },
  { value: 'banking',       label: 'Banking / Finance' },
  { value: 'retail',        label: 'Retail / Trade' },
  { value: 'energy',        label: 'Energy' },
  { value: 'construction',  label: 'Construction / Real Estate' },
  { value: 'logistics',     label: 'Logistics / Transportation' },
  { value: 'textile',       label: 'Textile / Apparel' },
  { value: 'food',          label: 'Food & Beverage' },
  { value: 'tech',          label: 'Technology / Software' },
  { value: 'other',         label: 'Other' },
]

type HealthResult = {
  score: number; grade: string; grade_color: string; grade_bg: string
  percentile: number; total_tco2e: number; sector_label: string
  vs_sector: string; quick_wins: string[]; cta: string
}

function EsgHealthWidget() {
  const [sector, setSector] = useState('manufacturing')
  const [employees, setEmployees] = useState('')
  const [kwh, setKwh] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HealthResult | null>(null)
  const [error, setError] = useState('')

  const handleCheck = async () => {
    if (!employees || parseInt(employees) <= 0) { setError('Please enter employee count'); return }
    if (!kwh || parseFloat(kwh) <= 0) { setError('Please enter energy consumption'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API_URL}/health-check/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, employees: parseInt(employees), kwh_per_year: parseFloat(kwh) }),
      })
      if (!res.ok) throw new Error('Check failed')
      const data = await res.json()
      setResult(data as HealthResult)
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!result ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mb-3">
              FREE — No email required
            </div>
            <h3 className="text-2xl font-black text-slate-900">Check Your ESG Score</h3>
            <p className="text-slate-500 text-sm mt-1">Get instant results in seconds</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Sector</label>
              <select value={sector} onChange={e => setSector(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none">
                {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Employees</label>
              <input type="number" placeholder="e.g. 250" value={employees} onChange={e => setEmployees(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Annual Energy (kWh/year)</label>
              <input type="number" placeholder="e.g. 500000" value={kwh} onChange={e => setKwh(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleCheck} disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg">
              {loading ? 'Calculating...' : 'Get My ESG Score →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-black mb-3"
              style={{ background: result.grade_bg, color: result.grade_color }}>
              {result.grade}
            </div>
            <div className="text-3xl font-black text-slate-900">{result.score}<span className="text-lg text-slate-400">/100</span></div>
            <p className="text-slate-500 text-sm">{result.vs_sector}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl p-3 text-center bg-slate-50">
              <div className="text-xl font-black text-slate-800">{result.total_tco2e.toLocaleString('en-GB')}</div>
              <div className="text-xs text-slate-500">tCO₂e / year</div>
            </div>
            <div className="rounded-xl p-3 text-center bg-slate-50">
              <div className="text-xl font-black text-slate-800">{result.percentile}%</div>
              <div className="text-xs text-slate-500">sector percentile</div>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            {result.quick_wins.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="text-emerald-500 mt-0.5 shrink-0" size={14} />
                <span>{w}</span>
              </div>
            ))}
          </div>
          <Link href="/request-demo"
            className="w-full block text-center bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all">
            {result.cta}
          </Link>
          <button onClick={() => setResult(null)} className="w-full mt-2 text-sm text-slate-400 hover:text-slate-600 py-2">
            ← Check another company
          </button>
        </div>
      )}
    </div>
  )
}

// ── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <>{count.toLocaleString()}{suffix}</>
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">

      {/* TSRS Urgency Ticker */}
      <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center">
        🚨 TSRS 2024 ZORUNLU — BİST-100: 31 Mar 2025 ✅&nbsp;&nbsp;|&nbsp;&nbsp;
        Bankalar (BDDK): 30 Haz 2025 ⚠️&nbsp;&nbsp;|&nbsp;&nbsp;
        Büyük Şirketler: 31 Mar 2027&nbsp;&nbsp;|&nbsp;&nbsp;
        <Link href="/tsrs" className="underline hover:text-emerald-100">Hazırlık skoru al →</Link>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20">🌿</div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900">SustainHub</span>
              <span className="text-emerald-600 font-bold">.online</span>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-6 font-semibold text-sm text-slate-600">
            <Link href="/products" className="hover:text-emerald-600 transition-colors">Ürünler</Link>
            <Link href="/about" className="hover:text-emerald-600 transition-colors">Hakkımızda</Link>
            <Link href="/cop31" className="hover:text-amber-600 transition-colors font-bold text-amber-600">COP31</Link>
            <Link href="/data-library" className="hover:text-emerald-600 transition-colors">Veri Kütüphanesi</Link>
            <Link href="/news-insights" className="hover:text-emerald-600 transition-colors">Haberler</Link>
            <Link href="/contact" className="hover:text-emerald-600 transition-colors">İletişim</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
              Giriş Yap
            </Link>
            <Link href="/request-demo" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
              Demo İste <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #10b981 0%, transparent 50%), radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)'
        }} />
        <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            SustainHub v2.0 — Sprint 43 | Temmuz 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Türkiye'nin #1<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Sürdürülebilirlik Zeka
            </span><br />
            Platformu
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            TSRS • ISSB • CSRD • UK SRS • GRI • CBAM • EUDR • CDP — 43 modül, tek platform.<br />
            AI + uydu destekli. BİST-100'den KOBİ'ye, bankadan holdinglara.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href="/request-demo"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_60px_-10px_rgba(16,185,129,0.6)] flex items-center justify-center gap-3">
              Ücretsiz Demo Al <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3">
              Platforma Gir
            </Link>
          </div>
          <p className="text-xs text-slate-500 pt-2">
            Kredi kartı gerekmez · 14 gün ücretsiz · Anında kurulum
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-800 border-y border-slate-700 py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: 43, suffix: '+', label: 'Modül & Sayfa' },
            { n: 15, suffix: '+', label: 'Framework (TSRS, ISSB, GRI...)' },
            { n: 33, suffix: '', label: 'KOBİ ESG Soru' },
            { n: 50, suffix: 'K+', label: 'tCO₂e Takip Kapasitesi' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black text-emerald-400">
                <Counter end={s.n} suffix={s.suffix} />
              </div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 mb-4 uppercase tracking-widest">
              Neden Şimdi?
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Uyum Yapmayan Şirket<br />
              <span className="text-red-500">Para Cezasıyla Karşılaşır.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              KGK TSRS 2023 yürürlükte. BİST-100 şirketleri raporlamak zorunda.
              Bankalar Haziran 2025 deadline'ını geçirdi mi?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '❌', title: 'Eskiden', items: ['Excel dosyaları e-posta ile', 'Freelance danışman + aylar', 'Yanlış emisyon faktörleri', 'Bağımsız güvence imkânsız'] },
              { icon: '⚡', title: 'SustainHub ile', items: ['Magic Import: dosyayı yükle, AI eşleştir', '10 dakikada ilk TSRS taslağı', 'Güncel KGK + TEİAŞ faktörleri', 'XBRL + KGK dijital platform entegrasyonu'] },
              { icon: '🏆', title: 'Sonuç', items: ['%90 zaman tasarrufu', 'Bağımsız güvenceye hazır', 'Banka yeşil kredi erişimi', 'İngiliz / AB pazar avantajı'] },
            ].map(col => (
              <div key={col.title}
                className={`rounded-2xl p-6 border ${col.icon === '⚡' ? 'bg-emerald-50 border-emerald-200' : col.icon === '❌' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="text-3xl mb-3">{col.icon}</div>
                <h3 className="font-bold text-slate-900 mb-4">{col.title}</h3>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 shrink-0">{col.icon === '❌' ? '✗' : '✓'}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="platform" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">43 Modül. 1 Platform.</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Her modül birbirine bağlı. Veriyi bir kez gir, tüm framework'lere yansısın.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <BarChart3 size={24} />, color: '#10b981', name: 'CarbonSense', tag: 'Core', desc: 'Kapsam 1-2-3 emisyon takibi. Magic Import ile dosyadan otomatik hesaplama. ISO 14064 & TSRS uyumlu.' },
              { icon: <Landmark size={24} />, color: '#3b82f6', name: 'Bank GAR Suite', tag: 'PCAF', desc: 'BDDK Yeşil Varlık Oranı hesaplama. PCAF DQS 1-5 metodolojisi. KOBİ ESG Kredi Skoru.' },
              { icon: <FileText size={24} />, color: '#8b5cf6', name: 'Report Builder', tag: 'AI', desc: 'TSRS/ISSB/GRI/CSRD/CDP/UK SRS için otomatik rapor taslağı. XBRL / KGK dijital beyan.' },
              { icon: <Satellite size={24} />, color: '#f59e0b', name: 'Earth Intelligence', tag: 'Uydu', desc: 'Copernicus uydu verisi ile fiziksel iklim riski analizi. 5 boyut: Sel, Kuraklık, Yangın, Deniz, Toprak.' },
              { icon: <Building2 size={24} />, color: '#ef4444', name: 'CBAM & EUDR', tag: 'AB', desc: 'AB sınır karbon mekanizması beyanı. EUDR tedarik zinciri uyum denetimi. Otomatik CN kodu eşleştirme.' },
              { icon: <Brain size={24} />, color: '#06b6d4', name: 'AI Copilot', tag: 'GPT', desc: 'Sürdürülebilirlik danışmanı AI. TSRS soru-cevap, MACC strateji, Red Flag tespiti, senaryo analizi.' },
              { icon: <Leaf size={24} />, color: '#84cc16', name: 'ESG Benchmark', tag: 'Analiz', desc: 'Sektör kıyaslama, 8 boyut radar, 13 framework skoru. Arçelik/Migros/Tüpraş ile karşılaştır.' },
              { icon: <Truck size={24} />, color: '#f97316', name: 'Supplier Audit', tag: 'RBA', desc: 'RBA v9.0 + ISO 26000 tedarikçi denetimi. 15 soru, otomatik Red Flag, aksiyon önerisi.' },
              { icon: <GraduationCap size={24} />, color: '#a855f7', name: 'University Portal', tag: 'Akademi', desc: 'Üniversite sürdürülebilirlik ölçümü. Atlas, İTÜ, Sabancı pilot. Araştırma Enstitüsü bağlantısı.' },
            ].map(p => (
              <div key={p.name} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 hover:border-slate-500 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: p.color + '20', color: p.color }}>
                    {p.icon}
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: p.color, borderColor: p.color + '40', background: p.color + '10' }}>
                    {p.tag}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2">{p.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="inline-flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              Tüm ürünleri gör <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* TSRS Compliance Timeline */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">TSRS Zorunluluk Takvimi</h2>
          <p className="text-slate-500 mb-12">Hangi aşamada olduğunuzu öğrenin</p>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 hidden md:block" />
            <div className="space-y-6">
              {[
                { date: '31 Mar 2025', segment: 'BİST-100 Şirketleri', regulator: 'SPK', status: 'done', note: 'Tamamlandı — bağımsız sınırlı güvence zorunluydu' },
                { date: '30 Haz 2025', segment: 'Bankalar & Sigortacılar', regulator: 'BDDK', status: 'now', note: 'Geçti — raporunuz hazır mı?' },
                { date: '31 Mar 2026', segment: 'BİST-Tüm (BİST-100 dışı)', regulator: 'SPK', status: 'upcoming', note: 'Yaklaşıyor — şimdi başlayın' },
                { date: '31 Mar 2027', segment: 'Büyük Şirketler (500M TL aktif)', regulator: 'KGK', status: 'upcoming', note: 'Aktif >500M TL veya çalışan >500' },
                { date: '2027+', segment: 'KOBİ\'ler', regulator: 'Gönüllü', status: 'future', note: 'Ticaret Bakanlığı Sorumlu® programı ile' },
              ].map(row => (
                <div key={row.date} className={`flex items-start gap-4 p-5 rounded-2xl border text-left ${
                  row.status === 'done' ? 'bg-emerald-50 border-emerald-200' :
                  row.status === 'now' ? 'bg-amber-50 border-amber-300' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`w-4 h-4 rounded-full shrink-0 mt-1 ${
                    row.status === 'done' ? 'bg-emerald-500' :
                    row.status === 'now' ? 'bg-amber-500 animate-pulse' :
                    'bg-slate-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-black text-slate-900">{row.date}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        row.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                        row.status === 'now' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>{row.regulator}</span>
                    </div>
                    <div className="font-semibold text-slate-800">{row.segment}</div>
                    <div className="text-sm text-slate-500">{row.note}</div>
                  </div>
                  {row.status === 'now' && (
                    <Link href="/tsrs" className="shrink-0 text-xs font-bold text-amber-600 hover:text-amber-700 underline">
                      Hazırlık skoru al
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ESG Health Check Widget */}
      <section id="health-check" className="py-20 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-900 text-emerald-400 mb-4 uppercase tracking-widest">
            Ücretsiz · E-posta gerekmez · Anında sonuç
          </div>
          <h2 className="text-4xl font-black text-white mb-4">
            ESG Skorunuzu Öğrenin<br />
            <span className="text-emerald-400">Saniyeler İçinde</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Sektörünüzü, çalışan sayınızı ve yıllık enerji tüketiminizi girin —
            AI motorumuz anlık ESG skoru ve hızlı kazanım önerileri oluştursun.
          </p>
        </div>
        <EsgHealthWidget />
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-slate-900 mb-4">10 Dakikada İlk Raporunuz</h2>
            <p className="text-slate-500">Danışman tutmadan, Excel olmadan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📂', title: 'Dosyayı Yükle', desc: 'Mevcut muhasebe veya İK Excel dosyasını olduğu gibi sürükle bırak. Şablon yok, format zorlaması yok.' },
              { step: '02', icon: '🤖', title: 'AI Eşleştirsin', desc: '"Aylık tüketim kWh" → Kapsam 2. "Araç yakıtı litre" → Kapsam 1. AI 8 iş kuralıyla doğrular, hatalar anında görünür.' },
              { step: '03', icon: '📄', title: 'Raporu Al', desc: 'TSRS / GRI / ISSB uyumlu rapor taslağı otomatik üretilir. XBRL etiketli, KGK dijital platforma hazır.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-3xl mx-auto mb-4">
                  {s.icon}
                </div>
                <div className="text-xs font-black text-emerald-600 mb-2 tracking-widest">ADIM {s.step}</div>
                <h3 className="font-black text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Şeffaf Fiyatlandırma</h2>
            <p className="text-slate-400">Yıllık abonelik · KDV dahil değil · Ücretsiz başlatın</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Starter', price_try: '30.000', price_eur: '800',
                for: 'KOBİ ve Early Adopters',
                color: '#64748b',
                features: ['Karbon takibi', 'Temel raporlama', '1 kullanıcı', 'GRI Core'],
                cta: 'Başla',
              },
              {
                name: 'Professional', price_try: '72.000', price_eur: '2.000',
                for: 'Orta Ölçekli Şirketler',
                color: '#10b981', popular: true,
                features: ['Tüm framework\'ler', 'TSRS raporu', '5 kullanıcı', 'AI Copilot', 'XBRL export'],
                cta: 'Hemen Başla',
              },
              {
                name: 'Enterprise', price_try: '180.000+', price_eur: '5.000+',
                for: 'Büyük Şirket & Holding',
                color: '#3b82f6',
                features: ['Tüm platform', 'Bank GAR', 'API erişimi', 'Sınırsız kullanıcı', 'Öncelikli destek'],
                cta: 'Demo İste',
              },
              {
                name: 'KSRU Partner', price_try: '120.000', price_eur: '3.300',
                for: 'Ticaret Bakanlığı Sorumlu®',
                color: '#f59e0b',
                features: ['Sorumlu® skoru', 'KOBİ tedarikçi portalı', 'Sübvansiyon hesaplama', 'BDDK entegrasyonu'],
                cta: 'Bilgi Al',
              },
            ].map(plan => (
              <div key={plan.name}
                className={`rounded-2xl p-6 border relative ${plan.popular ? 'border-emerald-500 bg-emerald-950/40' : 'border-slate-700 bg-slate-800/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full">
                    Popüler
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.for}</p>
                </div>
                <div className="mb-5">
                  <div className="text-2xl font-black" style={{ color: plan.color }}>₺{plan.price_try}</div>
                  <div className="text-xs text-slate-500">€{plan.price_eur} / yıl</div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check size={12} className="text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/request-demo"
                  className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
                    plan.popular
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white'
                  }`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-xs mt-8">
            Tüm planlar 14 gün ücretsiz deneme içerir · İstediğiniz zaman iptal edebilirsiniz ·
            <Link href="/abonelik" className="text-emerald-400 hover:text-emerald-300 ml-1">Detaylı plan karşılaştırması →</Link>
          </p>
        </div>
      </section>

      {/* Logos / Trust */}
      <section className="py-14 px-6 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            Türkiye'nin lider kurumları için tasarlandı
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 opacity-60">
            {['Akbank', 'Ziraat Bankası', 'Arçelik', 'Tüpraş', 'Migros', 'ENKA', 'İTÜ', 'Koç Holding'].map(name => (
              <div key={name} className="text-slate-600 font-black text-sm md:text-base">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <ShieldCheck className="text-emerald-600 mx-auto" size={32} />, label: 'KGK Uyumlu', sub: 'TSRS 1+2 sertifikalı' },
            { icon: <Globe className="text-blue-600 mx-auto" size={32} />, label: 'Çok Yetki Alanı', sub: 'TR + UK + KKTC + AB' },
            { icon: <Zap className="text-amber-500 mx-auto" size={32} />, label: 'AI + Uydu', sub: 'Copernicus entegrasyonu' },
            { icon: <FileText className="text-purple-600 mx-auto" size={32} />, label: 'XBRL Ready', sub: 'KGK dijital platform' },
          ].map(t => (
            <div key={t.label} className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                {t.icon}
              </div>
              <div className="font-bold text-slate-800 text-sm">{t.label}</div>
              <div className="text-xs text-slate-500">{t.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">
            TSRS Raporunuz<br />Hazır mı?
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            10 dakikada başlayın. Danışman tutmadan.<br />
            Türkiye'nin en kapsamlı sürdürülebilirlik platformu.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/request-demo"
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-2">
              Ücretsiz Demo Al <ArrowRight size={20} />
            </Link>
            <Link href="/dashboard"
              className="border-2 border-white/50 hover:border-white text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              Platforma Gir
            </Link>
          </div>
          <p className="text-emerald-200 text-sm mt-6">
            Kredi kartı gerekmez · 14 gün ücretsiz · İstediğiniz zaman iptal
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">🌿</div>
                <span className="font-black text-white text-xl">SustainHub<span className="text-emerald-400">.online</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Türkiye'nin #1 AI + Uydu destekli sürdürülebilirlik raporlama platformu.
                TSRS · ISSB · CSRD · UK SRS · GRI · CBAM · EUDR
              </p>
              <p className="text-xs text-slate-500">
                Istanbul Teknokent · London Hub<br />
                © 2026 SustainHub. Tüm haklar saklıdır.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                {[['Dashboard', '/dashboard'], ['TSRS 1+2', '/tsrs'], ['ISSB S1+S2', '/issb'], ['Bank GAR', '/gar'], ['KOBİ Skoru', '/kobi-credit-score']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Şirket</h4>
              <ul className="space-y-2 text-sm">
                {[['Hakkımızda', '/about'], ['Ürünler', '/products'], ['Haberler', '/news-insights'], ['Kariyer', '/careers'], ['İletişim', '/contact']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm">Kaynaklar</h4>
              <ul className="space-y-2 text-sm">
                {[['Veri Kütüphanesi', '/data-library'], ['COP31 Özel', '/cop31'], ['ESG İçgörüleri', '/sustainability-insights'], ['Demo İste', '/request-demo'], ['Fiyatlandırma', '/abonelik']].map(([l, h]) => (
                  <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-4">
              <span>🇹🇷 Türkiye</span>
              <span>🇬🇧 United Kingdom</span>
              <span>🇨🇾 KKTC</span>
            </div>
            <div className="flex gap-6">
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
              <Link href="/legal/terms" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
              <Link href="/legal/cookies" className="hover:text-white transition-colors">Çerez Politikası</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
