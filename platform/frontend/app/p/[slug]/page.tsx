'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Globe, Leaf, ShieldCheck, ShieldOff } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

type PublicCompanyProfile = {
  name: string
  sector: string | null
  sustainScore: { grade: string | null; score: number | null }
  emissionsReducedTco2e: number | null
  netZeroTargetYear: number | null
  verification: { assuranceFirm: string | null; verified: boolean }
  badges: string[]
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center space-y-3 max-w-md">
        <h1 className="text-2xl font-black text-slate-900">Bu profil bulunamadı</h1>
        <p className="text-sm text-slate-500">
          Bu bağlantı geçersiz olabilir ya da şirket herkese açık profilini henüz etkinleştirmemiş olabilir.
        </p>
        <Link href="/" className="inline-block text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          Ana sayfaya dön →
        </Link>
      </div>
    </div>
  )
}

function LoadingState() {
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm">Yükleniyor…</div>
}

export default function PublicProfilePage() {
  const params = useParams()
  const slug = (params?.slug as string) ?? ''

  const [profile, setProfile] = useState<PublicCompanyProfile | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    api.publicCompany.get(slug)
      .then(data => { if (!cancelled) setProfile(data) })
      .catch(() => { if (!cancelled) setNotFound(true) })
    return () => { cancelled = true }
  }, [slug])

  if (notFound) return <NotFoundState />
  if (!profile) return <LoadingState />

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-600" size={24} />
          <span className="font-black text-slate-800 text-lg tracking-tight">Sustain<span className="text-emerald-600">.</span></span>
        </div>
        <Link href="/" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Platforma Git &rarr;</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Header Profile */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-200 mx-auto flex items-center justify-center mb-6 overflow-hidden">
            <span className="text-3xl font-black text-slate-300">{profile.name.charAt(0)}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900">{profile.name}</h1>
          <p className="text-lg text-slate-500 font-medium">
            Sürdürülebilirlik Profili{profile.sector ? ` · ${profile.sector}` : ''}
          </p>

          <div className="flex justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
              <Globe size={14} /> SustainHub Profili
            </span>
          </div>
        </div>

        {/* Highlight Stats — sadece gerçek veri, veri yoksa dürüst boş durum */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Uyum Notu</p>
            {profile.sustainScore.grade ? (
              <div className="w-16 h-16 mx-auto bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-2 shadow-inner">
                {profile.sustainScore.grade}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4">Henüz raporlanmadı</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Karbon Azaltımı</p>
            {profile.emissionsReducedTco2e !== null ? (
              <p className="text-3xl font-black text-emerald-600 mb-1">
                {profile.emissionsReducedTco2e.toLocaleString('tr-TR')} <span className="text-base text-emerald-500 font-semibold">tCO₂e</span>
              </p>
            ) : (
              <p className="text-sm text-slate-400">Yeterli geçmiş veri yok</p>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net-Zero Hedefi</p>
            {profile.netZeroTargetYear ? (
              <p className="text-xl font-bold text-slate-800 mb-1">{profile.netZeroTargetYear}</p>
            ) : (
              <p className="text-sm text-slate-400">Belirlenmedi</p>
            )}
          </div>
        </div>

        {/* Verification & Trust — gerçek assurance_firm alanı, sabit "PwC" iddiası yok */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold mb-1" style={{ color: profile.verification.verified ? '#34d399' : '#94a3b8' }}>
            {profile.verification.verified ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
            {profile.verification.verified
              ? `${profile.verification.assuranceFirm} tarafından doğrulandı`
              : 'Henüz üçüncü taraf doğrulaması yok'}
          </div>
          {profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {profile.badges.map(b => (
                <span key={b} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">{b}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium">Powered by SustainHub</p>
        </div>
      </main>
    </div>
  )
}
