'use client'
import React, { useEffect, useState, use } from 'react'
import Image from 'next/image'
import { Leaf, ShieldCheck, Recycle, ShieldAlert, Send, ExternalLink } from 'lucide-react'
import { API_URL } from '@/lib/constants'
import { api } from '@/lib/api'

type Lang = 'tr' | 'en' | 'de' | 'fr'

type PublicSnapshot = {
  id: string
  version: number
  status: string
  lang: Lang
  labels: Record<string, string>
  product: {
    name: string
    name_tr: string
    name_en: string | null
    description: string | null
    sku: string
    gtin: string | null
    category: string
    subcategory: string | null
    batch_number: string | null
    manufactured_at: string | null
    country_of_origin: string | null
    manufacturing_site: string | null
    weight_kg: number | null
    dimensions: Record<string, number> | null
    ce_marked: boolean
    energy_class: string | null
    warranty_months: number | null
  }
  sustainability: {
    carbon_footprint_kgco2e: number | null
    recycled_content_pct: number | null
    repairability_score: number | null
    green_score: number | null
    green_score_grade: string | null
  }
  recycling_instructions: string | null
  materials: Array<{ name: string; pct: number | null; source: string | null; recycled_pct: number | null; hazardous: boolean }>
  suppliers: Array<{ tier: number; name: string; country: string | null; role: string | null; certifications: string[] }>
  documents: Array<{ type: string; title: string; url: string; issued_by: string | null; valid_until: string | null }>
  metrics: { scan_count: number; ai_query_count: number; return_request_count: number }
  issued_at: string | null
  gs1_digital_link: string | null
  revoked?: boolean
  revoked_at?: string | null
}

const LANGS: Lang[] = ['tr', 'en', 'de', 'fr']
const LANG_LABEL: Record<Lang, string> = { tr: 'TR', en: 'EN', de: 'DE', fr: 'FR' }

export default function PublicProductPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lang, setLang] = useState<Lang>('tr')
  const [data, setData] = useState<PublicSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [askOpen, setAskOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/public/passport/${id}?lang=${lang}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Pasaport bulunamadı' : 'Yüklenemedi')
        return r.json()
      })
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [id, lang])

  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState />

  const L = data.labels
  const s = data.sustainability
  const isRevoked = data.status === 'revoked'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="text-emerald-600" size={20} />
          <span className="font-black text-slate-800 tracking-tight">Sustain<span className="text-emerald-600">.</span></span>
        </div>
        <div className="flex items-center gap-1">
          {LANGS.map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`text-xs font-bold px-2 py-1 rounded ${lang === l ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </nav>

      {isRevoked && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-sm text-rose-800 text-center">
          <ShieldAlert size={14} className="inline mr-1" /> {L.revoked}
          {data.revoked_at && <> · {new Date(data.revoked_at).toLocaleDateString()}</>}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            <ShieldCheck size={12} /> {L.product_passport} · v{data.version}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">{data.product.name}</h1>
          {data.product.description && (
            <p className="text-slate-600 max-w-2xl mx-auto">{data.product.description}</p>
          )}
          <div className="text-sm text-slate-500 font-mono">
            {data.product.sku} {data.product.gtin && <>· GTIN {data.product.gtin}</>}
          </div>
        </div>

        {/* Green Score hero */}
        {s.green_score != null && (
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-white text-center shadow-lg">
            <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">{L.green_score}</div>
            <div className="text-6xl sm:text-7xl font-black">{s.green_score}</div>
            {s.green_score_grade && <div className="text-2xl font-bold mt-1">{s.green_score_grade}</div>}
          </div>
        )}

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label={L.carbon_footprint}
            value={s.carbon_footprint_kgco2e != null ? `${s.carbon_footprint_kgco2e} kg` : L.no_data}
            icon="🌍" />
          <StatCard label={L.recycled_content}
            value={s.recycled_content_pct != null ? `%${s.recycled_content_pct}` : L.no_data}
            icon="♻️" />
          <StatCard label={L.repairability}
            value={s.repairability_score != null ? `${s.repairability_score}/10` : L.no_data}
            icon="🔧" />
          <StatCard label={L.warranty}
            value={data.product.warranty_months ? `${data.product.warranty_months} ay` : L.no_data}
            icon="📅" />
        </div>

        {/* Product details */}
        <Section title={L.manufacturer}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <KV label={L.origin_country} value={data.product.country_of_origin} />
            <KV label={L.manufactured_at} value={data.product.manufactured_at} />
            {data.product.energy_class && <KV label="Enerji Sınıfı" value={data.product.energy_class} />}
            {data.product.ce_marked && <KV label="CE" value="✓" />}
          </div>
        </Section>

        {/* Materials */}
        {data.materials.length > 0 && (
          <Section title={L.materials}>
            <div className="divide-y divide-slate-100">
              {data.materials.map((m, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-800">{m.name}</div>
                    {m.source && <div className="text-xs text-slate-500">{m.source}</div>}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    {m.pct != null && <span>%{m.pct}</span>}
                    {m.recycled_pct != null && (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Recycle size={12} /> %{m.recycled_pct}
                      </span>
                    )}
                    {m.hazardous && <ShieldAlert size={14} className="text-amber-600" />}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Suppliers */}
        {data.suppliers.length > 0 && (
          <Section title="Tedarik Zinciri">
            <div className="space-y-2">
              {data.suppliers.map((sup, i) => (
                <div key={i} className="text-sm border-l-2 border-emerald-500 pl-3">
                  <div className="font-medium">{sup.name} <span className="text-xs text-slate-400">T{sup.tier}</span></div>
                  <div className="text-xs text-slate-500">
                    {sup.country && <>{sup.country} · </>}
                    {sup.role}
                    {sup.certifications.length > 0 && <> · {sup.certifications.join(', ')}</>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Documents */}
        {data.documents.length > 0 && (
          <Section title={L.compliance_documents}>
            <div className="flex flex-wrap gap-2">
              {data.documents.map((d, i) => (
                <a key={i} href={d.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700">
                  {d.type.toUpperCase()} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Recycling instructions */}
        {data.recycling_instructions && (
          <Section title={L.recycling_instructions}>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{data.recycling_instructions}</p>
          </Section>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => setAskOpen(true)}
            className="bg-slate-900 text-white font-semibold py-3 rounded-2xl hover:bg-slate-800 flex items-center justify-center gap-2">
            <Send size={16} /> {L.ask_assistant}
          </button>
          <button onClick={() => setReturnOpen(true)} disabled={isRevoked}
            className="bg-emerald-600 text-white font-semibold py-3 rounded-2xl hover:bg-emerald-500 disabled:opacity-40 flex items-center justify-center gap-2">
            <Recycle size={16} /> {L.return_button}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-6 border-t border-slate-200">
          <div>{data.metrics.scan_count} tarama · SustainHub · AB ESPR</div>
          {data.issued_at && <div className="mt-1">{L.issued_on}: {new Date(data.issued_at).toLocaleDateString()}</div>}
        </div>
      </main>

      {askOpen && <AskModal passportId={data.id} labels={L} onClose={() => setAskOpen(false)} />}
      {returnOpen && <ReturnModal passportId={data.id} labels={L} onClose={() => setReturnOpen(false)} />}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="font-medium text-slate-800">{value || '—'}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Yükleniyor…
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
      <ShieldAlert className="text-rose-500" size={48} />
      <div className="text-slate-800 font-semibold">{message}</div>
      <a href="/" className="text-sm text-emerald-600 font-semibold">SustainHub.online</a>
    </div>
  )
}

function AskModal({ passportId, labels, onClose }: { passportId: string; labels: Record<string, string>; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const send = async () => {
    if (!q.trim()) return
    setBusy(true)
    try {
      const r = await api.dpp.publicAsk(passportId, q)
      setAnswer(r.answer)
    } finally { setBusy(false) }
  }
  return (
    <Modal onClose={onClose}>
      <h2 className="font-bold text-lg mb-3">{labels.ask_assistant}</h2>
      <textarea rows={3} value={q} onChange={e => setQ(e.target.value)}
        placeholder="Bu ürünü nasıl geri dönüştürürüm?"
        className="w-full border rounded-lg p-2 text-sm" />
      <button onClick={send} disabled={!q || busy}
        className="mt-2 w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold disabled:opacity-40">
        {busy ? '…' : 'Gönder'}
      </button>
      {answer && (
        <div className="mt-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700">
          {answer}
        </div>
      )}
    </Modal>
  )
}

function ReturnModal({ passportId, labels, onClose }: { passportId: string; labels: Record<string, string>; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<{ coupon_code: string; discount_pct: number; message: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    try {
      const r = await api.dpp.publicReturn(passportId, { requestor_email: email || null })
      setResult(r)
    } finally { setBusy(false) }
  }
  return (
    <Modal onClose={onClose}>
      <h2 className="font-bold text-lg mb-3">{labels.return_button}</h2>
      {result ? (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">🎁</div>
          <div className="text-sm text-slate-700 mb-3">{result.message}</div>
          <div className="bg-emerald-50 border-2 border-dashed border-emerald-400 p-4 rounded-xl">
            <div className="text-xs text-emerald-700 mb-1">%{result.discount_pct} indirim kuponu</div>
            <div className="text-2xl font-mono font-bold text-emerald-900">{result.coupon_code}</div>
          </div>
        </div>
      ) : (
        <>
          <label className="block text-sm mb-2">
            E-posta (opsiyonel)
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 text-sm" placeholder="siz@ornek.com" />
          </label>
          <button onClick={submit} disabled={busy}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold disabled:opacity-40">
            {busy ? '…' : 'Talep Et'}
          </button>
        </>
      )}
    </Modal>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-end sm:items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700">Kapat</button>
      </div>
    </div>
  )
}
