'use client'

import { useState } from 'react'
import Link from 'next/link'
import { API_URL } from '@/lib/constants'

const SECTORS = [
  { value: 'manufacturing', label: 'Üretim / Sanayi' },
  { value: 'banking', label: 'Bankacılık / Finans' },
  { value: 'retail', label: 'Perakende / Ticaret' },
  { value: 'energy', label: 'Enerji' },
  { value: 'construction', label: 'İnşaat / GYO' },
  { value: 'logistics', label: 'Lojistik / Ulaşım' },
  { value: 'textile', label: 'Tekstil / Hazır Giyim' },
  { value: 'food', label: 'Gıda & İçecek' },
  { value: 'tech', label: 'Teknoloji / Yazılım' },
  { value: 'other', label: 'Diğer' },
]

export default function RequestDemoPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '',
    employees: '1-50', sector: 'manufacturing', message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ref, setRef] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.company) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'website' }),
      })
      const data = await res.json() as { success?: boolean; ref?: string; detail?: string }
      if (!res.ok) throw new Error(data.detail || 'Gönderim başarısız')
      setRef(data.ref || '')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu, tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-50 backdrop-blur-sm bg-slate-900/90">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-base">🌿</span>
          <span className="font-black text-white">SustainHub<span className="text-emerald-400">.online</span></span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors hidden md:block">Ürünler</Link>
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors">Giriş Yap</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">Ücretsiz Başla →</Link>
        </div>
      </nav>

      <section className="px-6 pt-16 pb-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left: Info */}
        <div className="space-y-6 pt-8">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Demo Talebi
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            SustainHub'ı<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Canlı Görün
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            ESG mühendislerimizle bire bir demo planlayın. TSRS raporlamasını nasıl otomatikleştireceğinizi, GAR dashboard kurulumunu ve uydu destekli iklim riski analizini görün.
          </p>
          <div className="space-y-3 text-sm">
            {[
              'Hesaplama motoru bire bir walkthrough',
              'Özelleştirilmiş entegrasyon hazırlık taraması (SAP, Logo, Netsis)',
              'Örnek TSRS raporları ve denetim izleri',
              'KOBİ ESG Kredi Skoru canlı demo',
              'Bank GAR Suite canlı hesaplama',
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-slate-300">
                <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>
          <div className="pt-4 space-y-3">
            <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700 text-sm">
              <div className="font-bold text-white mb-1">Yanıt Süresi</div>
              <div className="text-slate-400">En geç 1 iş günü içinde ekibimiz sizinle iletişime geçer.</div>
            </div>
            <div className="rounded-xl p-4 bg-slate-800/60 border border-slate-700 text-sm">
              <div className="font-bold text-white mb-1">Pilot Müşteri Programı</div>
              <div className="text-slate-400">İlk 10 pilot için %40 indirim + ücretsiz onboarding desteği.</div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="rounded-2xl p-7 border border-slate-700 bg-slate-800/40 mt-4">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-black text-white mb-6">Demo Talep Formu</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ad Soyad *</label>
                  <input type="text" required placeholder="Ahmet Yılmaz" value={formData.name} onChange={set('name')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">İş E-postası *</label>
                  <input type="email" required placeholder="ahmet@sirket.com.tr" value={formData.email} onChange={set('email')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Şirket Adı *</label>
                  <input type="text" required placeholder="Örnek A.Ş." value={formData.company} onChange={set('company')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Telefon</label>
                  <input type="tel" placeholder="+90 5XX XXX XX XX" value={formData.phone} onChange={set('phone')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Çalışan Sayısı</label>
                  <select value={formData.employees} onChange={set('employees')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white outline-none focus:border-emerald-500 text-sm">
                    <option value="1-50">1–50</option>
                    <option value="51-250">51–250</option>
                    <option value="251-1000">251–1.000</option>
                    <option value="1000+">1.000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sektör</label>
                  <select value={formData.sector} onChange={set('sector')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white outline-none focus:border-emerald-500 text-sm">
                    {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mesaj / İhtiyaç (İsteğe bağlı)</label>
                <textarea rows={3} placeholder="Örneğin: TSRS ilk raporumuzu hazırlamak istiyoruz, bankamız için GAR hesabı..." value={formData.message} onChange={set('message')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-600 text-white placeholder-slate-500 outline-none focus:border-emerald-500 text-sm transition-colors resize-none" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 shadow-lg shadow-emerald-500/20">
                {loading ? 'Gönderiliyor…' : 'Demo Talep Et →'}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Formu göndererek{' '}
                <Link href="/legal/privacy" className="text-emerald-400 hover:underline">Gizlilik Politikamızı</Link>
                {' '}kabul etmiş olursunuz.
              </p>
            </form>
          ) : (
            <div className="text-center py-12 space-y-5">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-black text-white">Demo Talebiniz Alındı!</h3>
              <div className="text-xs font-mono bg-slate-900 text-emerald-400 px-3 py-1.5 rounded-lg inline-block">
                Ref: {ref}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Teşekkürler <strong className="text-white">{formData.name}</strong>. Ekibimiz
                {' '}<strong className="text-white">{formData.email}</strong> adresinize en geç 1 iş günü içinde ulaşacak.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <Link href="/register"
                  className="w-full block text-center py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all">
                  Hemen Ücretsiz Hesap Oluştur →
                </Link>
                <Link href="/dashboard"
                  className="w-full block text-center py-3 rounded-xl font-bold text-slate-300 border border-slate-700 hover:border-slate-500 transition-all">
                  Platforma Gir
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-slate-600 border-t border-white/5">
        SustainHub.online · Connective Hub Digital Technologies Ltd. · Istanbul Teknokent & London
      </footer>
    </div>
  )
}
