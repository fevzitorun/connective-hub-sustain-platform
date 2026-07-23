'use client'
import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, ArrowUpRight, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Product = Awaited<ReturnType<typeof api.dpp.getProduct>>

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  issued: 'bg-emerald-100 text-emerald-700',
  revoked: 'bg-rose-100 text-rose-700',
  superseded: 'bg-amber-100 text-amber-700',
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    try {
      const p = await api.dpp.getProduct(id)
      setProduct(p)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ürün alınamadı')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const createPassport = async () => {
    setCreating(true)
    try {
      const p = await api.dpp.createPassport(id, {})
      toast.success(`Draft pasaport v${p.version} oluşturuldu`)
      window.location.href = `/dpp/pasaport/${p.id}`
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Pasaport oluşturulamadı')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="p-8 text-slate-400">Yükleniyor…</div>
  if (!product) return <div className="p-8 text-rose-600">Ürün bulunamadı</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dpp" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{product.name_tr}</h1>
          <p className="text-sm text-slate-500 font-mono">{product.sku} · {product.category}</p>
        </div>
      </div>

      {/* Ürün özet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Ürün Özeti</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <KV label="GTIN" value={product.gtin} />
          <KV label="Menşei" value={product.manufacturing_country} />
          <KV label="Üretim Tarihi" value={product.manufactured_at} />
          <KV label="Alt Kategori" value={product.subcategory} />
        </div>
      </div>

      {/* Pasaport listesi */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Pasaportlar ({product.passports.length})</h2>
          <button onClick={createPassport} disabled={creating}
            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 flex items-center gap-1 disabled:opacity-50">
            <Plus size={14} /> {creating ? 'Oluşturuluyor…' : 'Yeni Draft'}
          </button>
        </div>

        {product.passports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-600 font-medium mb-1">Henüz pasaport yok</p>
            <p className="text-sm text-slate-400 mb-4">Ürüne ait ilk pasaport draft'ını oluşturun; malzeme, belge, tedarikçi ekleyip yayınlayın.</p>
            <button onClick={createPassport} disabled={creating}
              className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg font-semibold disabled:opacity-50">
              İlk Pasaport Draft'ı
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Versiyon</th>
                <th className="text-left px-6 py-3">Durum</th>
                <th className="text-left px-6 py-3">Yayın</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {product.passports.map(p => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-semibold">v{p.version}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] || 'bg-slate-100 text-slate-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{p.issued_at ? new Date(p.issued_at).toLocaleDateString('tr-TR') : '—'}</td>
                  <td className="px-6 py-3 text-right space-x-3">
                    {p.status === 'issued' && (
                      <a href={`/p/product/${p.id}`} target="_blank" rel="noreferrer"
                        className="text-sm text-slate-600 hover:text-emerald-600 inline-flex items-center gap-1">
                        Public <ExternalLink size={12} />
                      </a>
                    )}
                    <Link href={`/dpp/pasaport/${p.id}`}
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
    </div>
  )
}

function KV({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-medium text-slate-800">{value || '—'}</div>
    </div>
  )
}
