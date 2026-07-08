import React from 'react'
import { CheckCircle, Globe, Leaf, Download, QrCode, ArrowUpRight, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

// Mock Data Fetching for Public Profile
async function getCompanyProfile(slug: string) {
  // In real life, fetch from backend: GET /api/public/companies/{slug}
  return {
    name: slug === 'koc-holding' ? 'Koç Holding A.Ş.' : slug.toUpperCase(),
    industry: 'Konglomera',
    sustainScore: 'A+',
    sbtiTarget: 'Net-Zero 2050',
    verifiedBy: 'SustainHub.online Satellite Verification',
    emissionsReduced: '1.2M',
    badges: ['TSRS 1&2 Compliant', 'CBAM Ready', '100% Renewable Scope 2']
  }
}

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const profile = await getCompanyProfile(params.slug)

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

      {/* Verified Auditor Banner */}
      <div className="bg-gradient-to-r from-amber-200 to-yellow-400 px-6 py-3 text-center shadow-sm">
        <p className="text-yellow-900 text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle size={18} />
          Bu şirketin {new Date().getFullYear()} yılı ESG verileri PwC Bağımsız Denetim kuruluşu tarafından %100 oranında doğrulanmıştır.
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Header Profile */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-200 mx-auto flex items-center justify-center mb-6 overflow-hidden">
            <span className="text-3xl font-black text-slate-300">{profile.name.charAt(0)}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900">{profile.name}</h1>
          <p className="text-lg text-slate-500 font-medium">Doğrulanmış Sürdürülebilirlik Profili (Digital Twin)</p>
          
          <div className="flex justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
              <Globe size={14} /> Global ESG Passport
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              <CheckCircle size={14} /> Verified Data
            </span>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sustain Grade</p>
            <div className="w-16 h-16 mx-auto bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-2 shadow-inner">
              {profile.sustainScore}
            </div>
            <p className="text-xs text-slate-500">Tier 1 Leader</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Karbon Azaltımı</p>
            <p className="text-3xl font-black text-emerald-600 mb-1">{profile.emissionsReduced} <span className="text-base text-emerald-500 font-semibold">tCO₂e</span></p>
            <p className="text-xs text-slate-500">2023 baz yılına göre</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">SBTi Taahhüdü</p>
            <p className="text-xl font-bold text-slate-800 mb-1">{profile.sbtiTarget}</p>
            <p className="text-xs text-emerald-600 font-semibold">Science Based Targets Onaylı</p>
          </div>
        </div>

        {/* Verification & Trust */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <ShieldAlert size={20} />
              SustainHub.online Onaylı Şeffaflık
            </div>
            <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
              Bu profildeki veriler; bağımsız denetçiler, ERP entegrasyonları ve uydu teknolojileri (ESA Sentinel-2) kullanılarak doğrulanmıştır. Şirketin emisyon beyanları Greenwashing riskine karşı güvence altındadır.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.badges.map(b => (
                <span key={b} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">{b}</span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
            <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Download size={18} /> Raporu İndir
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700">
              <QrCode size={18} /> Doğrula
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium">Powered by SustainHub AI & Satellite Verification</p>
        </div>
      </main>
    </div>
  )
}
