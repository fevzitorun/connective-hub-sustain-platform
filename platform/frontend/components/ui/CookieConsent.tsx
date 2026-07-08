'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('sh_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept(all: boolean) {
    localStorage.setItem('sh_cookie_consent', all ? 'all' : 'essential')
    localStorage.setItem('sh_cookie_consent_date', new Date().toISOString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="max-w-4xl mx-auto rounded-2xl p-5 md:p-6 border"
        style={{ background: '#0f172a', borderColor: '#1e293b' }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🍪</span>
              <span className="font-bold text-white text-sm">Gizlilik Tercihleri / Cookie Preferences</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/20">KVKK · GDPR</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              SustainHub, platform işlevselliği için zorunlu çerezler ve analitik için isteğe bağlı çerezler kullanır.
              Verileriniz Türkiye ve AB mevzuatı (KVKK / GDPR) kapsamında işlenir.{' '}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-emerald-400 underline hover:text-emerald-300 transition-colors"
              >
                {showDetails ? 'Gizle' : 'Detaylar'}
              </button>
              {' · '}
              <Link href="/legal/privacy" className="text-emerald-400 underline hover:text-emerald-300 transition-colors">
                Gizlilik Politikası
              </Link>
            </p>

            {showDetails && (
              <div className="mt-3 space-y-2">
                {[
                  {
                    name: 'Zorunlu Çerezler',
                    desc: 'Oturum yönetimi, güvenlik, KVKK kayıtları. Devre dışı bırakılamaz.',
                    always: true,
                  },
                  {
                    name: 'Analitik (Google Analytics 4)',
                    desc: 'Platform kullanım istatistikleri — anonim, kişisel veri içermez.',
                    always: false,
                  },
                  {
                    name: 'Tercih Çerezleri',
                    desc: 'Dil, para birimi, tema gibi kullanıcı tercihleri.',
                    always: false,
                  },
                ].map(c => (
                  <div key={c.name} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.desc}</div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
                      style={
                        c.always
                          ? { background: '#dcfce7', color: '#166534' }
                          : { background: '#fef3c7', color: '#92400e' }
                      }
                    >
                      {c.always ? 'Zorunlu' : 'İsteğe bağlı'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 md:flex-shrink-0 md:w-44">
            <button
              onClick={() => accept(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Tümünü Kabul Et
            </button>
            <button
              onClick={() => accept(false)}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-slate-300 border border-white/20 hover:border-white/40 transition-colors"
            >
              Sadece Zorunlu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
