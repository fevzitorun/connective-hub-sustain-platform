'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Package, QrCode, Upload, ArrowUpRight, ScanLine } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Product = {
  id: string
  sku: string
  gtin: string | null
  name_tr: string
  category: string
  subcategory: string | null
  manufactured_at: string | null
  passport_count: number
  latest_passport_status: string | null
}

type Analytics = {
  products: number
  passports_by_status: Record<string, number>
  avg_green_score: number | null
  total_scans: number
  total_ai_queries: number
  total_return_requests: number
  top_scanned: Array<{ passport_id: string; scans: number; green_score: number | null }>
}

const CATEGORY_LABEL: Record<string, string> = {
  textile: 'Tekstil', battery: 'Batarya', electronics: 'Elektronik',
  furniture: 'Mobilya', iron_steel: 'Demir-Çelik', tyre: 'Lastik',
  detergent: 'Deterjan', paint: 'Boya', construction: 'İnşaat',
  chemical: 'Kimyasal', other: 'Diğer',
}

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  issued: 'bg-emerald-100 text-emerald-700',
  revoked: 'bg-rose-100 text-rose-700',
  superseded: 'bg-amber-100 text-amber-700',
}

export default function DppListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([api.dpp.listProducts(), api.dpp.analytics()])
      setProducts(p.products)
      setAnalytics(a)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Veri alınamadı')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.dpp.bulkImport(file)
      toast.success(`${res.created} ürün oluşturuldu · ${res.failed} hata`)
      if (res.failed) console.warn('Bulk import errors:', res.errors)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Yükleme başarısız')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <span className="text-3xl">📇</span> Dijital Ürün Pasaportu
          </h1>
          <p className="text-slate-500 max-w-2xl">
            AB ESPR (Tüzük 2024/1781) uyumlu ürün pasaportları. QR ile paylaş, tüketiciye şeffaf göster,
            tekstil/batarya/elektronik 2027–2030 zorunluluğuna hazırlan.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={api.dpp.bulkTemplateUrl()} target="_blank" rel="noreferrer"
             className="px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <QrCode size={14} /> CSV Şablon
          </a>
          <label className="px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
            <Upload size={14} /> {uploading ? 'Yükleniyor…' : 'Toplu Yükle'}
            <input type="file" accept=".csv" onChange={onBulkUpload} className="hidden" />
          </label>
          <Link href="/dpp/urunler/new"
             className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 flex items-center gap-2">
            <Plus size={16} /> Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Analitik kartlar */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard label="Ürün" value={analytics.products} icon="📦" />
          <MetricCard label="Yayınlanmış" value={analytics.passports_by_status['issued'] || 0} icon="✓" tone="emerald" />
          <MetricCard label="Ort. Yeşil Skor" value={analytics.avg_green_score ?? '—'} icon="🌿" tone="emerald" />
          <MetricCard label="QR Tarama" value={analytics.total_scans} icon="👁" />
          <MetricCard label="İade Talebi" value={analytics.total_return_requests} icon="♻️" tone="amber" />
        </div>
      )}

      {/* Ürün tablosu */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Ürünler</h2>
          <span className="text-xs text-slate-500">{products.length} kayıt</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Yükleniyor…</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-600 font-medium mb-1">Henüz ürün yok</p>
            <p className="text-sm text-slate-400 mb-4">DPP kapsamında ilk ürününüzü ekleyin veya CSV'yle toplu yükleyin.</p>
            <Link href="/dpp/urunler/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-semibold">
              <Plus size={14} /> Yeni Ürün
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Ürün</th>
                <th className="text-left px-6 py-3">SKU / GTIN</th>
                <th className="text-left px-6 py-3">Kategori</th>
                <th className="text-left px-6 py-3">Pasaport</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-800">{p.name_tr}</div>
                    {p.subcategory && <div className="text-xs text-slate-400">{p.subcategory}</div>}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-600">
                    <div>{p.sku}</div>
                    <div className="text-slate-400">{p.gtin || '—'}</div>
                  </td>
                  <td className="px-6 py-3">{CATEGORY_LABEL[p.category] || p.category}</td>
                  <td className="px-6 py-3">
                    {p.passport_count === 0 ? (
                      <span className="text-xs text-slate-400">Yok</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">v{p.passport_count}</span>
                        {p.latest_passport_status && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.latest_passport_status] || 'bg-slate-100 text-slate-600'}`}>
                            {p.latest_passport_status}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/dpp/urunler/${p.id}`}
                      className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1">
                      Aç <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top scanned */}
      {analytics && analytics.top_scanned.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ScanLine size={18} /> En Çok Taranan Pasaportlar
          </h2>
          <div className="space-y-2">
            {analytics.top_scanned.map(t => (
              <div key={t.passport_id} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                <span className="font-mono text-xs text-slate-500">{t.passport_id.slice(0, 8)}…</span>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">{t.scans} tarama</span>
                  {t.green_score != null && (
                    <span className="text-emerald-600 font-semibold">Skor {t.green_score}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon, tone = 'slate' }: {
  label: string
  value: string | number
  icon: string
  tone?: 'slate' | 'emerald' | 'amber'
}) {
  const toneClass = {
    slate: 'text-slate-800',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }[tone]
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
        <span>{icon}</span> {label}
      </div>
      <div className={`text-2xl font-black ${toneClass}`}>{value}</div>
    </div>
  )
}
