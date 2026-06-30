'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function Countdown() {
  // COP31 — estimated November 2026 (Baku/Turkey handover)
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

const DEADLINES = [
  { date: 'Ağustos 2026', label: 'BDDK TSRS Pilot Raporlama', status: 'urgent', tag: 'BDDK' },
  { date: 'Eylül 2026',   label: 'KGK TSRS 1&2 Sınırlı Güvence Son Tarihi', status: 'urgent', tag: 'KGK' },
  { date: 'Ekim 2026',    label: 'BDDK GAR İlk Dönem Beyanı', status: 'soon', tag: 'GAR' },
  { date: 'Kasım 2026',   label: 'COP31 — Türkiye Ulusal Katkı Beyanı (NDC)', status: 'cop31', tag: 'COP31' },
  { date: 'Aralık 2026',  label: 'CBAM Tam Uygulama Başlangıcı', status: 'soon', tag: 'CBAM' },
  { date: 'Ocak 2027',    label: 'FCA UK SRS Zorunlu Uyum (Listed Companies)', status: 'uk', tag: 'FCA' },
]

const FEATURES = [
  { icon: '🇹🇷', title: 'TSRS Uyum Motoru', desc: 'KGK\'nın TSRS 1&2 standartlarını (IFRS S1/S2 temelli) tam destekler. Sınırlı güvence şablonları dahil.' },
  { icon: '🏦', title: 'BDDK GAR Portalı', desc: 'Yeşil Varlık Oranı hesaplama, PCAF finanse edilen emisyonlar ve EU Taxonomy sınıflandırması tek ekranda.' },
  { icon: '🛰️', title: 'Uydu Doğrulama', desc: 'ESA Sentinel-2 ve NASA verileriyle fiziksel iklim riski. Greenwashing koruması için "Sustain Verified" rozeti.' },
  { icon: '🤖', title: 'AI Copilot', desc: 'Claude AI destekli asistan — "COP31 için ne hazırlamalıyım?" sorusunu anında yanıtlar, aksiyon planı çıkarır.' },
  { icon: '🌡️', title: 'TCFD Senaryo Analizi', desc: 'IEA Net Zero 2050 ve NGFS senaryolarıyla CFO\'ya yönelik CapEx/OpEx iklim finansal etki matrisi.' },
  { icon: '🌍', title: 'Üç Yargı Bölgesi', desc: 'TR (BDDK+KGK) + UK (FCA+UK SRS) + KKTC (Merkez Bankası) — tek lisansla üç regülatörü kapsıyor.' },
]

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
        <div className="flex gap-3">
          <Link href="/urunler" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Ürünler</Link>
          <Link href="/tcsi" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">TCSI 2026</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Giriş</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Demo Talep Et
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8 border"
          style={{ background: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.3)', color: '#fbbf24' }}>
          🇹🇷 COP31 Türkiye Özel Edisyonu
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          COP31 Türkiye'de.
          <br />
          <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sürdürülebilirlik Platformunuz Hazır mı?
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          BDDK zorunlu TSRS raporlaması, GAR beyanı ve PCAF finanse edilen emisyonlar —
          tümü COP31 öncesinde hayata geçiyor. SustainHub, 34 Türk bankası ve 200+ büyük şirket
          için hazır.
        </p>
        <Countdown />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register"
            className="px-8 py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Ücretsiz Demo → 60 Saniyede Başla
          </Link>
          <Link href="/tcsi"
            className="px-8 py-4 rounded-xl font-bold text-emerald-400 text-base border border-emerald-500/30 hover:border-emerald-500 transition-colors">
            TCSI 2026 Raporu İncele
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
            const COLOR_MAP = {
              urgent: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)', tag: '#ef4444', dot: '#ef4444' },
              soon:   { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', tag: '#f59e0b', dot: '#f59e0b' },
              cop31:  { bg: 'rgba(5,150,105,0.1)',  border: 'rgba(5,150,105,0.3)',  tag: '#34d399', dot: '#34d399' },
              uk:     { bg: 'rgba(29,78,216,0.08)', border: 'rgba(29,78,216,0.25)', tag: '#60a5fa', dot: '#60a5fa' },
            } as const
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-black text-white text-center mb-2">
          COP31 İçin İhtiyacınız Olan Her Şey
        </h2>
        <p className="text-slate-500 text-center text-sm mb-10">Tek platform, üç yargı bölgesi, sıfır danışman maliyeti.</p>
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
          <h2 className="text-2xl font-black text-white mb-2">COP31 Hazırlık Rehberini İndir</h2>
          <p className="text-slate-400 text-sm mb-6">
            TSRS uyum takvimi, GAR hesaplama rehberi ve PCAF metodoloji kılavuzunu içeren
            ücretsiz PDF'yi hemen alın.
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
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
              >
                Rehberi Gönder →
              </button>
            </div>
          ) : (
            <div className="py-4">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-emerald-400 font-bold">Teşekkürler! Rehber {email} adresine gönderildi.</p>
              <p className="text-slate-500 text-xs mt-1">Demo talep etmek ister misiniz?{' '}
                <Link href="/register" className="text-emerald-400 hover:underline">Hemen başlayın →</Link>
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
            { n: '200+', l: 'Büyük Şirket', s: 'TSRS Raporlama Yükümlülüğü' },
            { n: '3', l: 'Yargı Bölgesi', s: 'TR + UK + KKTC' },
            { n: '60s', l: 'Demo', s: 'Kayıttan ilk rapora' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-3xl font-black" style={{ color: '#34d399' }}>{s.n}</div>
              <div className="text-sm font-bold text-white mt-1">{s.l}</div>
              <div className="text-xs text-slate-500">{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer mini */}
      <footer className="text-center py-8 text-xs text-slate-600 px-6">
        <p>SustainHub.online — Connective Hub Dijital Teknolojiler Ltd. · İstanbul Teknokent + Londra</p>
        <p className="mt-1">BDDK · KGK · FCA · KKTC Merkez Bankası · ISSB · PCAF · EU Taxonomy uyumlu</p>
      </footer>
    </div>
  )
}
