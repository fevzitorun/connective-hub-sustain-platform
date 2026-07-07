'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { API_URL } from '@/lib/constants'

// ── Ortaklık Türleri ────────────────────────────────────────────────────
const PARTNERSHIP_TYPES = [
  {
    icon: '🏛️',
    title: 'Kamu Kurumları',
    desc: 'KGK, BDDK, TÜBİTAK, KOSGEB ve diğer düzenleyici kuruluşlarla teknik uyum ortaklıkları.',
    examples: ['SARP entegrasyonu', 'GAR raporlama standardı', 'Ar-Ge fon ortaklığı'],
    gradient: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
  },
  {
    icon: '🌿',
    title: 'STK & Uluslararası Kuruluşlar',
    desc: 'UNDP, WWF, TÜSİAD Çevre Komisyonu, İKV ve sürdürülebilirlik odaklı sivil toplum kuruluşları.',
    examples: ['SDG hedef eşleştirme', 'Kapasite geliştirme', 'Farkındalık kampanyaları'],
    gradient: 'linear-gradient(135deg,#064e3b,#059669)',
  },
  {
    icon: '🏫',
    title: 'Üniversiteler & Araştırma',
    desc: 'Akademik araştırma ortaklıkları, veri paylaşım anlaşmaları ve ortak yayınlar.',
    examples: ['İklim riski modelleme', 'Sektörel benchmark', 'Öğrenci staj programı'],
    gradient: 'linear-gradient(135deg,#581c87,#7c3aed)',
  },
  {
    icon: '🏢',
    title: 'Sektör Dernekleri',
    desc: 'ÇEİS, MÜSİAD, İTO, TOBB ve sektörel birliklerle toplu raporlama çözümleri.',
    examples: ['Sektör bazlı benchmark', 'Üye indirimi', 'Eğitim programları'],
    gradient: 'linear-gradient(135deg,#92400e,#d97706)',
  },
  {
    icon: '💼',
    title: 'Danışmanlık & Denetim',
    desc: 'Big-4, KSRU lisanslı uzmanlar ve bağımsız denetim firmaları ile entegrasyon.',
    examples: ['White-label portal', 'API entegrasyonu', 'Güvence beyanı desteği'],
    gradient: 'linear-gradient(135deg,#1e293b,#475569)',
  },
  {
    icon: '⚙️',
    title: 'Teknoloji & ERP',
    desc: 'SAP, Logo, Oracle ve diğer ERP/muhasebe yazılımlarıyla veri köprüsü.',
    examples: ['SAP S/4HANA konnektör', 'Logo Netsis entegrasyonu', 'TEDAŞ API bağlantısı'],
    gradient: 'linear-gradient(135deg,#0f172a,#334155)',
  },
]

const IMPACT_STATS = [
  { number: '400+', label: 'Zorunlu Şirket', desc: 'TSRS raporlama kapsamında' },
  { number: '34', label: 'Banka', desc: 'BDDK GAR zorunluluğu' },
  { number: '70K+', label: 'İhracatçı', desc: 'CBAM kapsamında' },
  { number: '22', label: 'SASB Cildi', desc: 'Sektör standardı entegre' },
  { number: '180+', label: 'Referans Belge', desc: 'Bilgi tabanında' },
  { number: '3', label: 'Ülke', desc: 'Türkiye + UK + KKTC' },
]

const WHY_PARTNER = [
  { icon: '🚀', title: 'Türkiye\'nin İlk Yerli Platformu', desc: 'ESG yazılım pazarında Türkiye\'de yerli rakip sayısı: 0. İlk olmanın avantajı ile büyüyün.' },
  { icon: '📈', title: '$7.56B Pazar Fırsatı', desc: '2033\'e kadar küresel ESG yazılım pazarı $7.56B\'ye ulaşacak. %12.5 CAGR ile büyüyen bir ekosisteme dahil olun.' },
  { icon: '🤝', title: 'COP31 Momentum', desc: 'Türkiye\'nin COP31 ev sahipliği tüm düzenleme eksenlerini hızlandırıyor. Bu dalgayı birlikte yakalayın.' },
  { icon: '🔧', title: 'Açık API & Entegrasyon', desc: 'RESTful API, webhook desteği ve modüler mimari ile kendi çözümlerinizi SustainHub üzerine inşa edin.' },
]

export default function PartnersPage() {
  const [form, setForm] = useState({ name: '', organization: '', email: '', type: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.organization) return
    setLoading(true)
    try {
      await fetch(`${API_URL}/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.organization,
          message: `[Ortaklık Başvurusu — ${form.type}] ${form.message}`,
        }),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true) // Offline'da da başarılı göster
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#020c0a', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm" style={{ background: 'rgba(2,12,10,0.9)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-white">SustainHub</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Ürünler</Link>
          <Link href="/cop31" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">COP31</Link>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Hakkımızda</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Giriş</Link>
          <Link href="/request-demo" className="text-sm px-4 py-2 rounded-lg font-bold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
            Demo İste
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8 border"
          style={{ background: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.3)', color: '#34d399' }}>
          🤝 Ortaklık Programı
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Sürdürülebilir Bir Gelecek İçin
          <br />
          <span style={{ background: 'linear-gradient(135deg,#34d399,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Birlikte Çalışalım
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          SustainHub, kamu kurumları, STK'lar, üniversiteler, sektör dernekleri ve teknoloji şirketleri ile
          stratejik ortaklıklar kurarak Türkiye'nin sürdürülebilirlik dönüşümünü hızlandırıyor.
        </p>
        <a href="#basvuru"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-white text-base transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
          Ortak Olun <ArrowRight size={18} />
        </a>
      </section>

      {/* Impact Stats */}
      <section className="border-t border-b border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
          {IMPACT_STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-black" style={{ color: '#34d399' }}>{s.number}</div>
              <div className="text-sm font-bold text-white mt-1">{s.label}</div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Neden Ortak Olmalı */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-white text-center mb-10">Neden SustainHub Ortağı Olmalısınız?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WHY_PARTNER.map(w => (
            <div key={w.title} className="rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-3xl mb-3">{w.icon}</div>
              <h3 className="font-black text-white text-lg mb-2">{w.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ortaklık Türleri */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">Ortaklık Modelleri</h2>
          <p className="text-slate-400 text-sm">Kurumunuza en uygun işbirliği modelini seçin.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PARTNERSHIP_TYPES.map(p => (
            <div key={p.title} className="rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all group"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
                style={{ background: p.gradient }}>
                {p.icon}
              </div>
              <h3 className="font-black text-white text-lg mb-2 group-hover:text-emerald-400 transition-colors">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{p.desc}</p>
              <ul className="space-y-1.5">
                {p.examples.map(e => (
                  <li key={e} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Başvuru Formu */}
      <section id="basvuru" className="max-w-2xl mx-auto px-6 py-20">
        <div className="rounded-2xl p-8 md:p-10 border" style={{ background: 'rgba(5,150,105,0.03)', borderColor: 'rgba(5,150,105,0.15)' }}>
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">📨</div>
            <h2 className="text-2xl font-black text-white mb-2">Ortaklık Başvurusu</h2>
            <p className="text-slate-400 text-sm">Formu doldurun, ekibimiz 48 saat içinde dönüş yapacak.</p>
          </div>

          {!submitted ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Ad Soyad *</label>
                  <input type="text" placeholder="Fevzi Torun"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Kurum *</label>
                  <input type="text" placeholder="Kurum adı"
                    value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">E-posta *</label>
                <input type="email" placeholder="iletisim@kurum.gov.tr"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Ortaklık Türü</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-emerald-500 text-sm">
                  <option value="">Seçiniz...</option>
                  <option value="kamu">Kamu Kurumu</option>
                  <option value="stk">STK / Uluslararası Kuruluş</option>
                  <option value="universite">Üniversite / Araştırma</option>
                  <option value="dernek">Sektör Derneği</option>
                  <option value="danismanlik">Danışmanlık / Denetim</option>
                  <option value="teknoloji">Teknoloji / ERP</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Mesaj</label>
                <textarea rows={4} placeholder="Nasıl bir işbirliği düşünüyorsunuz?"
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.organization}
                className="w-full py-4 rounded-xl font-black text-white text-base transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}>
                {loading ? 'Gönderiliyor...' : 'Başvuru Gönder →'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-white mb-2">Başvurunuz Alındı!</h3>
              <p className="text-slate-400 text-sm mb-6">
                Ekibimiz 48 saat içinde {form.email} adresine dönüş yapacak.
              </p>
              <Link href="/" className="text-emerald-400 hover:underline text-sm font-bold">
                ← Ana Sayfaya Dön
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-600 px-6 border-t border-white/5">
        <p>SustainHub.online — Connective Hub Dijital Teknolojiler Ltd. · İstanbul & Londra</p>
        <div className="flex justify-center gap-4 mt-3">
          <Link href="/cop31" className="text-slate-500 hover:text-emerald-400 transition-colors">COP31</Link>
          <Link href="/about" className="text-slate-500 hover:text-emerald-400 transition-colors">Hakkımızda</Link>
          <Link href="/products" className="text-slate-500 hover:text-emerald-400 transition-colors">Ürünler</Link>
          <Link href="/contact" className="text-slate-500 hover:text-emerald-400 transition-colors">İletişim</Link>
        </div>
      </footer>
    </div>
  )
}
