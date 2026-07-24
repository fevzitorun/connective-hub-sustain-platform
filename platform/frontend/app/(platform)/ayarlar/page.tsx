'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // aksanları kaldır (é→e, ş→s...)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function SettingsPage() {
  const [slug, setSlug] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save() {
    const cleanSlug = slugify(slug)
    if (cleanSlug.length < 3) {
      toast.error('Slug en az 3 karakter olmalı')
      return
    }
    setSaving(true)
    try {
      const res = await api.company.updatePublicProfile({ slug: cleanSlug, enabled })
      setSlug(res.slug)
      setEnabled(res.public_profile_enabled)
      toast.success('Ayarlar kaydedildi')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const previewUrl = slug ? `/p/${slugify(slug)}` : null

  return (
    <>
      <Header title="⚙️ Şirket Ayarları" subtitle="Herkese açık profil" />
      <div className="p-6 max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1">Herkese Açık Sürdürülebilirlik Profili</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Etkinleştirirseniz, şirketinizin gerçek uyum notu, karbon azaltım trendi ve doğrulama
              durumu <code className="px-1 py-0.5 bg-slate-100 rounded">/p/[slug]</code> adresinde
              herkese açık olarak görüntülenebilir hale gelir. Varsayılan olarak kapalıdır — hiçbir
              veri onay vermeden dışarı açılmaz.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Profil Adresi (slug)</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">/p/</span>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="sirketiniz-adi"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-400"
              />
            </div>
            {previewUrl && (
              <p className="text-xs text-slate-400 mt-1.5">Önizleme: <span className="font-mono">{previewUrl}</span></p>
            )}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-sm font-medium text-slate-700">Herkese açık profili etkinleştir</span>
          </label>

          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>
    </>
  )
}
