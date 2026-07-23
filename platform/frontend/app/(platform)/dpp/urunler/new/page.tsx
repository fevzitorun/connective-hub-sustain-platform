'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

const CATEGORIES = [
  ['textile', 'Tekstil'], ['battery', 'Batarya'], ['electronics', 'Elektronik'],
  ['furniture', 'Mobilya'], ['iron_steel', 'Demir-Çelik'], ['tyre', 'Lastik'],
  ['detergent', 'Deterjan'], ['paint', 'Boya'], ['construction', 'İnşaat'],
  ['chemical', 'Kimyasal'], ['other', 'Diğer'],
] as const

const ENERGY_CLASSES = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

export default function NewProductPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    sku: '', gtin: '', name_tr: '', name_en: '', name_de: '', name_fr: '',
    description_tr: '', description_en: '',
    category: 'textile', subcategory: '',
    batch_number: '', serial_number: '',
    weight_kg: '',
    ce_marked: false, energy_class: '',
    warranty_months: '',
    manufacturing_site: '', manufacturing_country: '',
    manufactured_at: '',
  })

  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(prev => ({ ...prev, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload: Record<string, unknown> = {
        sku: f.sku.trim(),
        name_tr: f.name_tr.trim(),
        category: f.category,
        ce_marked: f.ce_marked,
      }
      // Optional fields — only send if filled
      ;([
        'gtin','name_en','name_de','name_fr','description_tr','description_en',
        'subcategory','batch_number','serial_number',
        'manufacturing_site','manufacturing_country',
      ] as const).forEach(k => { if (f[k]) payload[k] = f[k] })
      if (f.weight_kg) payload.weight_kg = parseFloat(f.weight_kg)
      if (f.warranty_months) payload.warranty_months = parseInt(f.warranty_months)
      if (f.energy_class) payload.energy_class = f.energy_class
      if (f.manufactured_at) payload.manufactured_at = f.manufactured_at

      const res = await api.dpp.createProduct(payload)
      toast.success(`Ürün oluşturuldu: ${res.sku}`)
      router.push(`/dpp/urunler/${res.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dpp" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Yeni Ürün</h1>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <Section title="Temel Bilgiler">
          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU *" value={f.sku} onChange={v => set('sku', v)} required />
            <Field label="GTIN (8/12/13/14 hane)" value={f.gtin} onChange={v => set('gtin', v)} placeholder="8690123456789" />
          </div>
          <Field label="Ürün Adı (TR) *" value={f.name_tr} onChange={v => set('name_tr', v)} required />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Ürün Adı (EN)" value={f.name_en} onChange={v => set('name_en', v)} />
            <Field label="Ürün Adı (DE)" value={f.name_de} onChange={v => set('name_de', v)} />
            <Field label="Ürün Adı (FR)" value={f.name_fr} onChange={v => set('name_fr', v)} />
          </div>
          <TextArea label="Açıklama (TR)" value={f.description_tr} onChange={v => set('description_tr', v)} />
          <TextArea label="Açıklama (EN)" value={f.description_en} onChange={v => set('description_en', v)} />
        </Section>

        <Section title="Sınıflandırma">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori *" value={f.category} onChange={v => set('category', v)}
              options={CATEGORIES.map(([v, l]) => ({ value: v, label: l }))} />
            <Field label="Alt Kategori" value={f.subcategory} onChange={v => set('subcategory', v)} placeholder="tişört, dizüstü, vs." />
          </div>
        </Section>

        <Section title="Fiziksel + Ticari">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Parti No" value={f.batch_number} onChange={v => set('batch_number', v)} />
            <Field label="Seri No" value={f.serial_number} onChange={v => set('serial_number', v)} />
            <Field label="Ağırlık (kg)" value={f.weight_kg} onChange={v => set('weight_kg', v)} type="number" step="0.01" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Checkbox label="CE İşareti" checked={f.ce_marked} onChange={v => set('ce_marked', v)} />
            <Select label="Enerji Sınıfı" value={f.energy_class} onChange={v => set('energy_class', v)}
              options={ENERGY_CLASSES.map(v => ({ value: v, label: v || '(seçilmedi)' }))} />
            <Field label="Garanti (ay)" value={f.warranty_months} onChange={v => set('warranty_months', v)} type="number" />
          </div>
        </Section>

        <Section title="Üretim">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Üretim Tesisi" value={f.manufacturing_site} onChange={v => set('manufacturing_site', v)} placeholder="İstanbul-Çorlu" />
            <Field label="Menşei Ülke (ISO)" value={f.manufacturing_country} onChange={v => set('manufacturing_country', v)} placeholder="TR" maxLength={2} />
            <Field label="Üretim Tarihi" value={f.manufactured_at} onChange={v => set('manufactured_at', v)} type="date" />
          </div>
        </Section>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Link href="/dpp" className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100">İptal</Link>
          <button type="submit" disabled={busy || !f.sku || !f.name_tr}
            className="px-6 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2">
            <Save size={14} /> {busy ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false, maxLength, step }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; maxLength?: number; step?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} maxLength={maxLength} step={step}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
    </label>
  )
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none" />
    </label>
  )
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

function Checkbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 mt-6 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}
