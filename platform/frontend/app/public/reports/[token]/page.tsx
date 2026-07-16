'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'

interface PublicReport {
  id: string
  status: string
  content_text: string
  compliance_score: number | null
  compliance_grade: string | null
  created_at: string
  version_number: number
}

// Rapor metni markdown; başlıkları basitçe render et (ağır kütüphane gerekmez)
function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    const t = line.trim()
    if (t.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-2">{t.slice(4)}</h3>
    if (t.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-slate-900 mt-8 mb-3">{t.slice(3)}</h2>
    if (t.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-slate-900 mt-8 mb-4">{t.slice(2)}</h1>
    if (t === '---' || t === '') return <div key={i} className="h-2" />
    if (t.startsWith('|')) return <div key={i} className="font-mono text-xs text-slate-600 whitespace-pre-wrap">{line}</div>
    return <p key={i} className="text-sm text-slate-700 leading-relaxed mb-1">{line}</p>
  })
}

export default function PublicReportPage() {
  const params = useParams()
  const token = (params?.token as string) ?? ''

  const [report, setReport] = useState<PublicReport | null>(null)
  const [password, setPassword] = useState('')
  const [needPassword, setNeedPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (pw?: string) => {
    setLoading(true); setError('')
    try {
      const r = await api.reports.publicView(token, pw)
      setReport(r as PublicReport)
      setNeedPassword(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Rapor yüklenemedi'
      if (/şifre/i.test(msg)) {
        setNeedPassword(true)
        if (pw) setError('Şifre hatalı, tekrar deneyin')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { if (token) load() }, [token, load])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Üst bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-black text-slate-900">SustainHub</span>
          <span className="text-xs text-slate-400 ml-auto">Paylaşılan Rapor · Dijital Doğrulanmış</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent mx-auto animate-spin"
              style={{ borderColor: '#a7f3d0', borderTopColor: '#059669' }} />
            <p className="text-sm text-slate-500 mt-4">Rapor yükleniyor…</p>
          </div>
        )}

        {!loading && needPassword && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 mt-10">
            <div className="text-3xl text-center mb-3">🔒</div>
            <h1 className="text-lg font-bold text-slate-900 text-center mb-1">Şifre Korumalı Rapor</h1>
            <p className="text-sm text-slate-500 text-center mb-5">Bu raporu görüntülemek için paylaşım şifresini girin.</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') load(password) }}
              placeholder="Paylaşım şifresi"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm mb-3 focus:outline-none focus:border-emerald-500"
            />
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <button
              onClick={() => load(password)}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ background: '#059669' }}>
              Raporu Aç
            </button>
          </div>
        )}

        {!loading && !needPassword && error && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-red-200 p-8 mt-10 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && report && (
          <article className="bg-white rounded-2xl border border-slate-200 p-8">
            {report.compliance_score != null && (
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="px-4 py-2 rounded-xl" style={{ background: '#dcfce7' }}>
                  <span className="text-2xl font-black" style={{ color: '#166534' }}>{report.compliance_grade}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Uyum Skoru: {report.compliance_score}/100</div>
                  <div className="text-xs text-slate-500">Versiyon {report.version_number} · SustainHub tarafından üretildi</div>
                </div>
              </div>
            )}
            <div>{renderContent(report.content_text || '')}</div>
          </article>
        )}
      </main>
    </div>
  )
}
