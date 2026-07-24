'use client'
import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Plus, Trash2, ShieldAlert, ShieldCheck,
  Sparkles, Send, FileText, Users, Award,
  Download, ExternalLink, CheckCircle, AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Passport = Awaited<ReturnType<typeof api.dpp.getPassport>>
type Validation = Awaited<ReturnType<typeof api.dpp.validate>>
type Score = Awaited<ReturnType<typeof api.dpp.computeScore>>

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  issued: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  revoked: 'bg-rose-100 text-rose-700 border-rose-200',
  superseded: 'bg-amber-100 text-amber-700 border-amber-200',
}

const DOCUMENT_TYPES = ['reach', 'rohs', 'oekotex', 'gots', 'ce', 'energy_label', 'epd', 'iso14067_pcf', 'other']

export default function PassportEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [passport, setPassport] = useState<Passport | null>(null)
  const [validation, setValidation] = useState<Validation | null>(null)
  const [score, setScore] = useState<Score | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const p = await api.dpp.getPassport(id)
      setPassport(p)
      try {
        const v = await api.dpp.validate(id)
        setValidation(v)
      } catch { /* validation optional */ }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Pasaport alınamadı')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [id])

  const isDraft = passport?.status === 'draft'

  const saveMetrics = async (patch: Record<string, unknown>) => {
    setBusy(true)
    try {
      await api.dpp.patchPassport(id, patch)
      toast.success('Kaydedildi')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kaydedilemedi')
    } finally { setBusy(false) }
  }

  const compute = async () => {
    setBusy(true)
    try {
      const s = await api.dpp.computeScore(id)
      setScore(s)
      toast.success(`Skor: ${s.green_score} (${s.grade})`)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Hesaplanamadı')
    } finally { setBusy(false) }
  }

  const issue = async () => {
    if (!confirm('Pasaport yayınlanacak. Bu işlemden sonra malzeme/belge/tedarikçi eklenemez. Devam edilsin mi?')) return
    setBusy(true)
    try {
      const r = await api.dpp.issuePassport(id)
      toast.success(`Yayınlandı → ${r.public_url}`)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Yayınlanamadı')
    } finally { setBusy(false) }
  }

  const revoke = async () => {
    const reason = prompt('Geri çekme nedeni?')
    if (!reason) return
    setBusy(true)
    try {
      await api.dpp.revokePassport(id, reason)
      toast.success('Geri çekildi')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Geri çekilemedi')
    } finally { setBusy(false) }
  }

  if (loading) return <div className="p-8 text-slate-400">Yükleniyor…</div>
  if (!passport) return <div className="p-8 text-rose-600">Pasaport bulunamadı</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/dpp/urunler/${passport.product.id}`} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">{passport.product.name_tr}</h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[passport.status]}`}>
                v{passport.version} · {passport.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-mono">{passport.product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <button onClick={issue} disabled={busy || !validation?.ready_to_issue}
              title={validation?.ready_to_issue ? '' : 'Doğrulama başarısız — soldaki listeye bak'}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-40 flex items-center gap-2">
              <ShieldCheck size={14} /> Yayınla
            </button>
          )}
          {passport.status === 'issued' && (
            <>
              <a href={passport.public_url} target="_blank" rel="noreferrer"
                className="px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                <ExternalLink size={14} /> Public
              </a>
              <a href={api.dpp.pdfUrl(id)} target="_blank" rel="noreferrer"
                className="px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                <Download size={14} /> PDF
              </a>
              <button onClick={revoke} disabled={busy}
                className="px-3 py-2 text-sm rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-50">
                Geri Çek
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation warnings */}
      {validation && (
        <ValidationBanner v={validation} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MetricsPanel passport={passport} isDraft={isDraft} onSave={saveMetrics} busy={busy} />
          <MaterialsPanel passport={passport} isDraft={isDraft} onChanged={load} />
          <DocumentsPanel passport={passport} isDraft={isDraft} onChanged={load} />
          <SuppliersPanel passport={passport} isDraft={isDraft} onChanged={load} />
        </div>
        <div className="space-y-6">
          <ScorePanel passport={passport} score={score} onCompute={compute} busy={busy} />
          <QrPanel passportId={id} url={passport.public_url} />
          <AskAiPanel passportId={id} />
          <EventsPanel events={passport.events} />
        </div>
      </div>
    </div>
  )
}

function ValidationBanner({ v }: { v: Validation }) {
  const ok = v.ready_to_issue
  return (
    <div className={`rounded-xl border p-4 ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start gap-3">
        {ok ? <CheckCircle className="text-emerald-600 mt-0.5" size={20} /> :
          <AlertCircle className="text-amber-600 mt-0.5" size={20} />}
        <div className="flex-1">
          <div className="font-semibold text-slate-800 flex items-center gap-2">
            Şablon Tamamlanma: {v.completeness_pct}% ({v.template_category})
            {ok && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Yayına hazır</span>}
          </div>
          {v.recommendations.length > 0 && (
            <ul className="text-sm text-slate-700 mt-2 space-y-1">
              {v.recommendations.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricsPanel({ passport, isDraft, onSave, busy }: {
  passport: Passport; isDraft: boolean
  onSave: (patch: Record<string, unknown>) => Promise<void>
  busy: boolean
}) {
  const [carbon, setCarbon] = useState<string>(passport.carbon_footprint_kgco2e?.toString() || '')
  const [recycled, setRecycled] = useState<string>(passport.recycled_content_pct?.toString() || '')
  const [rep, setRep] = useState<string>(passport.repairability_score?.toString() || '')

  return (
    <Card title="Sürdürülebilirlik Metrikleri" icon={<Award size={16} />}>
      <div className="grid grid-cols-3 gap-4">
        <NumField label="Karbon (kgCO₂e)" value={carbon} onChange={setCarbon} disabled={!isDraft} />
        <NumField label="Geri Dönüştürülmüş %" value={recycled} onChange={setRecycled} disabled={!isDraft} />
        <NumField label="Onarılabilirlik (0-10)" value={rep} onChange={setRep} disabled={!isDraft} />
      </div>
      {isDraft && (
        <div className="text-right pt-3">
          <button onClick={() => onSave({
            carbon_footprint_kgco2e: carbon ? parseFloat(carbon) : null,
            recycled_content_pct: recycled ? parseFloat(recycled) : null,
            repairability_score: rep ? parseFloat(rep) : null,
          })} disabled={busy}
            className="px-4 py-1.5 text-sm rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 disabled:opacity-40">
            Kaydet
          </button>
        </div>
      )}
    </Card>
  )
}

function MaterialsPanel({ passport, isDraft, onChanged }: { passport: Passport; isDraft: boolean; onChanged: () => void }) {
  const [form, setForm] = useState({ material_name: '', percentage_by_weight: '', recycled_content_pct: '', source_country: '', is_hazardous: false })
  const add = async () => {
    if (!form.material_name) return
    try {
      await api.dpp.addMaterial(passport.id, {
        material_name: form.material_name,
        percentage_by_weight: form.percentage_by_weight ? parseFloat(form.percentage_by_weight) : null,
        recycled_content_pct: form.recycled_content_pct ? parseFloat(form.recycled_content_pct) : null,
        source_country: form.source_country || null,
        is_hazardous: form.is_hazardous,
      })
      setForm({ material_name: '', percentage_by_weight: '', recycled_content_pct: '', source_country: '', is_hazardous: false })
      toast.success('Malzeme eklendi')
      onChanged()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Eklenmedi') }
  }

  return (
    <Card title={`Malzeme Bileşimi (${passport.materials.length})`} icon={<Users size={16} />}>
      {passport.materials.length > 0 && (
        <table className="w-full text-sm mb-4">
          <thead className="text-xs text-slate-500 uppercase">
            <tr><th className="text-left pb-2">Malzeme</th><th className="text-left pb-2">%</th><th className="text-left pb-2">Geri Dön.</th><th className="text-left pb-2">Menşei</th><th className="text-left pb-2">Tehlike</th></tr>
          </thead>
          <tbody>
            {passport.materials.map(m => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="py-2 font-medium">{m.material_name}</td>
                <td className="py-2">{m.percentage_by_weight != null ? `%${m.percentage_by_weight}` : '—'}</td>
                <td className="py-2">{m.recycled_content_pct != null ? `%${m.recycled_content_pct}` : '—'}</td>
                <td className="py-2">{m.source_country || '—'}</td>
                <td className="py-2">{m.is_hazardous ? <ShieldAlert size={14} className="text-amber-600" /> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isDraft && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="grid grid-cols-5 gap-2">
            <input placeholder="Malzeme" value={form.material_name} onChange={e => setForm({...form, material_name: e.target.value})}
              className="col-span-2 px-2 py-1.5 text-sm border rounded" />
            <input type="number" placeholder="%" value={form.percentage_by_weight} onChange={e => setForm({...form, percentage_by_weight: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded" />
            <input type="number" placeholder="Geri dön. %" value={form.recycled_content_pct} onChange={e => setForm({...form, recycled_content_pct: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded" />
            <input placeholder="TR" value={form.source_country} onChange={e => setForm({...form, source_country: e.target.value})} maxLength={2}
              className="px-2 py-1.5 text-sm border rounded" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_hazardous} onChange={e => setForm({...form, is_hazardous: e.target.checked})} />
              Tehlikeli
            </label>
            <button onClick={add} disabled={!form.material_name}
              className="px-3 py-1 text-sm rounded bg-emerald-600 text-white disabled:opacity-40 flex items-center gap-1">
              <Plus size={12} /> Ekle
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

function DocumentsPanel({ passport, isDraft, onChanged }: { passport: Passport; isDraft: boolean; onChanged: () => void }) {
  const [form, setForm] = useState({ doc_type: 'oekotex', title: '', file_url: '', issued_by: '' })
  const add = async () => {
    if (!form.title || !form.file_url) return
    try {
      await api.dpp.addDocument(passport.id, form)
      setForm({ doc_type: 'oekotex', title: '', file_url: '', issued_by: '' })
      toast.success('Belge eklendi')
      onChanged()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Eklenmedi') }
  }

  return (
    <Card title={`Uygunluk Belgeleri (${passport.documents.length})`} icon={<FileText size={16} />}>
      {passport.documents.length > 0 && (
        <ul className="mb-3 space-y-2 text-sm">
          {passport.documents.map(d => (
            <li key={d.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div>
                <span className="text-xs font-semibold uppercase bg-slate-100 px-2 py-0.5 rounded mr-2">{d.doc_type}</span>
                {d.title}
              </div>
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline">Aç</a>
            </li>
          ))}
        </ul>
      )}
      {isDraft && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <select value={form.doc_type} onChange={e => setForm({...form, doc_type: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded">
              {DOCUMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Başlık" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded" />
            <input placeholder="URL" value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded" />
            <input placeholder="Veren" value={form.issued_by} onChange={e => setForm({...form, issued_by: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded" />
          </div>
          <div className="text-right">
            <button onClick={add} disabled={!form.title || !form.file_url}
              className="px-3 py-1 text-sm rounded bg-emerald-600 text-white disabled:opacity-40 flex items-center gap-1 ml-auto">
              <Plus size={12} /> Ekle
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

function SuppliersPanel({ passport, isDraft, onChanged }: { passport: Passport; isDraft: boolean; onChanged: () => void }) {
  const [form, setForm] = useState({ name: '', country: '', role: '', certifications: '' })
  const suppliers = ((passport as unknown) as { suppliers?: Array<{ id: string; name: string; country: string | null; role: string | null; tier: number; certifications: string[] | null }> }).suppliers || []
  const add = async () => {
    if (!form.name) return
    try {
      await api.dpp.addSupplier(passport.id, {
        name: form.name,
        country: form.country || null,
        role: form.role || null,
        certifications: form.certifications ? form.certifications.split(',').map(s => s.trim()).filter(Boolean) : null,
      })
      setForm({ name: '', country: '', role: '', certifications: '' })
      toast.success('Tedarikçi eklendi')
      onChanged()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Eklenmedi') }
  }

  return (
    <Card title={`Tedarik Zinciri (Tier 1) — ${suppliers.length}`} icon={<Users size={16} />}>
      {suppliers.length > 0 && (
        <ul className="mb-3 space-y-2 text-sm">
          {suppliers.map(s => (
            <li key={s.id} className="border-b border-slate-100 pb-2">
              <div className="font-medium">T{s.tier} · {s.name} <span className="text-slate-400 text-xs">({s.country || '?'})</span></div>
              <div className="text-xs text-slate-500">{s.role} · {(s.certifications || []).join(', ')}</div>
            </li>
          ))}
        </ul>
      )}
      {isDraft && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <input placeholder="Tedarikçi adı" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="col-span-2 px-2 py-1.5 text-sm border rounded" />
            <input placeholder="TR" value={form.country} onChange={e => setForm({...form, country: e.target.value})} maxLength={2}
              className="px-2 py-1.5 text-sm border rounded" />
            <input placeholder="Rol (iplik, boya…)" value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="px-2 py-1.5 text-sm border rounded" />
          </div>
          <input placeholder="Sertifikalar (virgülle: OEKO-TEX, GOTS)" value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})}
            className="w-full px-2 py-1.5 text-sm border rounded" />
          <div className="text-right">
            <button onClick={add} disabled={!form.name}
              className="px-3 py-1 text-sm rounded bg-emerald-600 text-white disabled:opacity-40 flex items-center gap-1 ml-auto">
              <Plus size={12} /> Ekle
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

function ScorePanel({ passport, score, onCompute, busy }: {
  passport: Passport; score: Score | null; onCompute: () => void; busy: boolean
}) {
  const cur = score?.green_score ?? (passport as unknown as { green_score?: number | null }).green_score
  const grade = score?.grade ?? (passport as unknown as { green_score_breakdown?: { grade?: string } }).green_score_breakdown?.grade
  return (
    <Card title="Yeşil Skor" icon={<Award size={16} />}>
      {cur != null ? (
        <div className="text-center mb-4">
          <div className="text-5xl font-black text-emerald-600">{cur}</div>
          <div className="text-lg font-semibold text-emerald-700 mt-1">Sınıf {grade || '—'}</div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">Henüz hesaplanmadı</p>
      )}
      <button onClick={onCompute} disabled={busy}
        className="w-full px-4 py-2 text-sm rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 disabled:opacity-40">
        {busy ? 'Hesaplanıyor…' : 'Yeniden Hesapla'}
      </button>
      {score?.breakdown && (
        <div className="text-xs text-slate-600 mt-4 space-y-2 border-t border-slate-100 pt-3">
          {Object.entries(score.breakdown).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="capitalize">{k}</span>
              <span className="font-semibold">{v.points}/{v.max}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function QrPanel({ passportId, url }: { passportId: string; url: string }) {
  return (
    <Card title="QR Kod" icon={<Sparkles size={16} />}>
      <div className="bg-white rounded-lg p-2 border border-slate-200">
        <Image src={api.dpp.qrUrl(passportId)} alt="QR" width={220} height={220} className="w-full h-auto" unoptimized />
      </div>
      <p className="text-xs text-slate-500 mt-2 break-all">{url}</p>
    </Card>
  )
}

function AskAiPanel({ passportId }: { passportId: string }) {
  const [q, setQ] = useState('')
  const [ans, setAns] = useState<{ answer: string; source: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const send = async () => {
    if (!q.trim()) return
    setBusy(true)
    try {
      const r = await api.dpp.ask(passportId, q)
      setAns(r)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Yanıt alınamadı') }
    finally { setBusy(false) }
  }
  return (
    <Card title="Sürdürülebilirlik Asistanı" icon={<Sparkles size={16} />}>
      <textarea value={q} onChange={e => setQ(e.target.value)} rows={2}
        placeholder="Örn: Bu ürün nasıl geri dönüştürülür?"
        className="w-full px-2 py-1.5 text-sm border rounded resize-none" />
      <button onClick={send} disabled={!q || busy}
        className="w-full mt-2 px-3 py-1.5 text-sm rounded bg-emerald-600 text-white font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
        <Send size={12} /> {busy ? 'Soruluyor…' : 'Sor'}
      </button>
      {ans && (
        <div className="mt-3 text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
          <div className="text-xs text-slate-400 mb-1">Kaynak: {ans.source}</div>
          {ans.answer}
        </div>
      )}
    </Card>
  )
}

function EventsPanel({ events }: { events: Passport['events'] }) {
  return (
    <Card title="Olay Kaydı" icon={<FileText size={16} />}>
      <ul className="space-y-2 text-xs max-h-64 overflow-y-auto">
        {events.slice(0, 15).map(e => (
          <li key={e.id} className="border-b border-slate-100 pb-1">
            <div className="font-semibold text-slate-700">{e.event_type}</div>
            <div className="text-slate-500">{e.actor || '?'} · {new Date(e.timestamp).toLocaleString('tr-TR')}</div>
          </li>
        ))}
        {events.length === 0 && <li className="text-slate-400">Henüz olay yok</li>}
      </ul>
    </Card>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}

function NumField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" />
    </label>
  )
}
